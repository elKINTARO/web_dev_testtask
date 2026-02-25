import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db
from models import Cafe, Dish, Order, OrderItem, OrderStatus
from schemas import OrderCreate, OrderListResponse, OrderResponse, OrderItemResponse
from services.tax import calculate_order_tax
from utils.routing import estimate_flight_time, haversine_distance

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orders", tags=["orders"])


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


@router.get("", response_model=OrderListResponse)
async def list_orders(
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = Query(default=settings.DEFAULT_LIMIT, ge=1, le=settings.MAX_LIMIT),
    offset: int = Query(default=0, ge=0),
):
    total_result = await db.execute(select(func.count()).select_from(Order))
    total = total_result.scalar_one()

    result = await db.execute(
        select(Order).order_by(Order.timestamp.desc()).limit(limit).offset(offset)
    )
    orders = result.scalars().all()

    items = [await _build_order_response(o, db) for o in orders]
    return OrderListResponse(total=total, limit=limit, offset=offset, items=items)


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

