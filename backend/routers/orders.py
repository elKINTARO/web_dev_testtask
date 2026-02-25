import io
import logging
from typing import Annotated

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db
from models import Drone, DroneStatus, Order, OrderStatus
from schemas import OrderCreate, OrderListResponse, OrderResponse, OrderStatusUpdate
from services.tax import calculate_order_tax
from utils.routing import estimate_flight_time, haversine_distance

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orders", tags=["orders"])

VALID_TRANSITIONS: dict[OrderStatus, set[OrderStatus]] = {
    OrderStatus.pending: {OrderStatus.flying},
    OrderStatus.flying: {OrderStatus.delivered, OrderStatus.lost, OrderStatus.damaged},
    OrderStatus.delivered: set(),
    OrderStatus.lost: set(),
    OrderStatus.damaged: set(),
}

TERMINAL_DRONE_STATUS: dict[OrderStatus, DroneStatus] = {
    OrderStatus.delivered: DroneStatus.available,
    OrderStatus.lost: DroneStatus.available,
    OrderStatus.damaged: DroneStatus.maintenance,
}


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    distance_km = haversine_distance(
        payload.start_lat, payload.start_lon,
        payload.end_lat, payload.end_lon,
    )
    flight_time = estimate_flight_time(distance_km)

    drone_result = await db.execute(
        select(Drone)
        .where(
            Drone.status == DroneStatus.available,
            Drone.max_radius >= distance_km,
        )
        .limit(1)
    )
    drone = drone_result.scalars().first()

    try:
        tax_data = await calculate_order_tax(
            payload.start_lat, payload.start_lon,
            payload.end_lat, payload.end_lon,
            payload.subtotal,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.exception(
            "Geocoding failed for end_lat=%s end_lon=%s",
            payload.end_lat, payload.end_lon,
        )
        raise HTTPException(status_code=502, detail=f"Geocoding service error: {e}")

    order = Order(
        **tax_data,
        distance_km=distance_km,
        estimated_flight_time=flight_time,
        status=OrderStatus.pending,
        drone_id=drone.id if drone else None,
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order


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
    items = result.scalars().all()

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
    return order


@router.post(
    "/import",
    response_model=list[OrderResponse],
    status_code=status.HTTP_201_CREATED,
)
async def import_orders(
    db: Annotated[AsyncSession, Depends(get_db)],
    file: UploadFile = File(...),
):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are supported.")

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    contents = await file.read(max_bytes + 1)
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE_MB} MB.",
        )

    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {e}")

    required_cols = {"start_lat", "start_lon", "end_lat", "end_lon", "subtotal"}
    missing = required_cols - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"CSV is missing required columns: {sorted(missing)}",
        )

    orders: list[Order] = []
    errors: list[dict] = []
    for idx, row in df.iterrows():
        try:
            start_lat = float(row["start_lat"])
            start_lon = float(row["start_lon"])
            end_lat = float(row["end_lat"])
            end_lon = float(row["end_lon"])
            subtotal = float(row["subtotal"])

            distance_km = haversine_distance(start_lat, start_lon, end_lat, end_lon)
            flight_time = estimate_flight_time(distance_km)
            tax_data = await calculate_order_tax(
                start_lat, start_lon, end_lat, end_lon, subtotal
            )
            orders.append(Order(
                **tax_data,
                distance_km=distance_km,
                estimated_flight_time=flight_time,
                status=OrderStatus.pending,
            ))
        except Exception as e:
            errors.append({"row": int(idx) + 2, "error": str(e)})
            logger.warning("Row %s import failed: %s", int(idx) + 2, e)

    if not orders:
        raise HTTPException(
            status_code=422,
            detail={"message": "All rows failed to process.", "errors": errors},
        )

    db.add_all(orders)
    await db.flush()
    await db.commit()

    if errors:
        logger.warning("%s row(s) skipped during import.", len(errors))

    return orders


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

    if order.drone_id is not None:
        drone_result = await db.execute(select(Drone).where(Drone.id == order.drone_id))
        drone = drone_result.scalars().first()
        if drone:
            if payload.status == OrderStatus.flying:
                drone.status = DroneStatus.flying
            elif payload.status in TERMINAL_DRONE_STATUS:
                drone.status = TERMINAL_DRONE_STATUS[payload.status]

    await db.commit()
    await db.refresh(order)
    return order
