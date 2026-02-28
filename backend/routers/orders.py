import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db
from models import Cafe, Dish, Order, OrderItem, OrderStatus
from schemas import OrderCreate, OrderImportResponse, OrderResponse, OrderItemResponse, OrderStatusUpdate
from services.tax import calculate_order_tax
from utils.routing import estimate_flight_time, haversine_distance
import csv
import io

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orders", tags=["orders"])

VALID_TRANSITIONS: dict[OrderStatus, set[OrderStatus]] = {
    OrderStatus.pending: {OrderStatus.flying},
    OrderStatus.flying: {OrderStatus.delivered, OrderStatus.lost, OrderStatus.damaged},
    OrderStatus.delivered: set(),
    OrderStatus.lost: set(),
    OrderStatus.damaged: set(),
}


async def _build_order_response(order: Order, db: AsyncSession) -> OrderResponse:
    """Load OrderItems for an order and build the response schema."""
    items_result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == order.id)
    )
    items = items_result.scalars().all()
    return OrderResponse(
        id=order.id,
        cafe_id=order.cafe_id,
        end_lat=order.end_lat,
        end_lon=order.end_lon,
        subtotal=order.subtotal,
        tax_amount=order.tax_amount,
        total_amount=order.total_amount,
        breakdown=order.breakdown,
        distance_km=order.distance_km,
        estimated_flight_time=order.estimated_flight_time,
        status=order.status,
        timestamp=order.timestamp,
        items=[OrderItemResponse.model_validate(i) for i in items],
    )


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    cafe_result = await db.execute(select(Cafe).where(Cafe.id == payload.cafe_id))
    cafe = cafe_result.scalars().first()
    if not cafe:
        raise HTTPException(status_code=404, detail=f"Cafe {payload.cafe_id} not found.")

    dish_ids = [item.dish_id for item in payload.items]
    dishes_result = await db.execute(
        select(Dish).where(Dish.id.in_(dish_ids), Dish.cafe_id == payload.cafe_id)
    )
    dishes = {d.id: d for d in dishes_result.scalars().all()}

    missing_dishes = set(dish_ids) - set(dishes.keys())
    if missing_dishes:
        raise HTTPException(
            status_code=422,
            detail=f"Dishes not found in cafe {payload.cafe_id}: {sorted(missing_dishes)}",
        )

    subtotal = round(
        sum(dishes[item.dish_id].price * item.quantity for item in payload.items), 2
    )

    distance_km = haversine_distance(cafe.lat, cafe.lon, payload.end_lat, payload.end_lon)
    flight_time = estimate_flight_time(distance_km)

    try:
        tax_data = await calculate_order_tax(
            cafe.lat, cafe.lon,
            payload.end_lat, payload.end_lon,
            subtotal,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.exception("Geocoding failed for end_lat=%s end_lon=%s", payload.end_lat, payload.end_lon)
        raise HTTPException(status_code=502, detail=f"Geocoding service error: {e}")

    order = Order(
        cafe_id=cafe.id,
        end_lat=payload.end_lat,
        end_lon=payload.end_lon,
        subtotal=tax_data["subtotal"],
        tax_amount=tax_data["tax_amount"],
        total_amount=tax_data["total_amount"],
        breakdown=tax_data["breakdown"],
        distance_km=distance_km,
        estimated_flight_time=flight_time,
        status=OrderStatus.pending,
    )
    db.add(order)
    await db.flush()

    order_items = [
        OrderItem(order_id=order.id, dish_id=item.dish_id, quantity=item.quantity)
        for item in payload.items
    ]
    db.add_all(order_items)
    await db.commit()

    logger.info(
        "Order %s created: cafe=%s, %.2f km, subtotal=$%.2f, total=$%.2f",
        order.id, cafe.name, distance_km, subtotal, order.total_amount,
    )
    return await _build_order_response(order, db)


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found.")

    allowed = VALID_TRANSITIONS.get(order.status, set())
    if payload.status not in allowed:
        allowed_values = [s.value for s in allowed]
        raise HTTPException(
            status_code=422,
            detail=(
                f"Cannot transition order from '{order.status.value}' "
                f"to '{payload.status.value}'. "
                f"Allowed: {allowed_values if allowed_values else 'none (terminal state)'}."
            ),
        )

    order.status = payload.status
    await db.commit()
    await db.refresh(order)
    return await _build_order_response(order, db)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found.")
    return await _build_order_response(order, db)

@router.get("", response_model=list[OrderResponse])
async def get_all_orders(db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(Order))
    orders = result.scalars().all()
    if not orders:
        raise HTTPException(status_code=404, detail="No orders found.")
    return [await _build_order_response(order, db) for order in orders]

@router.post("/import-csv", response_model=OrderImportResponse)
async def import_orders_from_csv( cafe_id: int, file: UploadFile = File(...),db: AsyncSession = Depends(get_db)):
    cafe_result = await db.execute(select(Cafe).where(Cafe.id == cafe_id))
    cafe = cafe_result.scalars().first()
    if not cafe:
        raise HTTPException(status_code=404, detail="Cafe not found")

    contents = await file.read()
    buffer = io.StringIO(contents.decode('utf-8'))
    reader = csv.DictReader(buffer)
    
    created_count = 0
    errors = []
    rows = list(reader)

    for idx, row in enumerate(rows):
        try:
            lat = float(row['latitude'])
            lon = float(row['longitude'])
            subtotal = float(row['subtotal'])
            
            distance_km = haversine_distance(cafe.lat, cafe.lon, lat, lon)
            flight_time = estimate_flight_time(distance_km)
            
            tax_data = await calculate_order_tax(
                cafe.lat, cafe.lon,
                lat, lon,
                subtotal
            )

            new_order = Order(
                cafe_id=cafe.id,
                end_lat=lat,
                end_lon=lon,
                subtotal=tax_data["subtotal"],
                tax_amount=tax_data["tax_amount"],
                total_amount=tax_data["total_amount"],
                breakdown=tax_data["breakdown"],
                distance_km=distance_km,
                estimated_flight_time=flight_time,
                status=OrderStatus.pending,
            )
            
            db.add(new_order)
            created_count += 1
            
            if created_count % 100 == 0:
                await db.flush()

        except Exception as e:
            errors.append(f"Row {idx+1}: {str(e)}")
            continue

    await db.commit()

    return OrderImportResponse(
        total_received=len(rows),
        successfully_created=created_count,
        errors=errors[:10]
    )