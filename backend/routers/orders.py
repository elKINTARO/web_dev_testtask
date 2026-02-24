import io
import logging
from typing import Annotated

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db
from models import Order
from schemas import OrderCreate, OrderListResponse, OrderResponse
from services.tax import calculate_order_tax

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        data = await calculate_order_tax(payload.lat, payload.lon, payload.subtotal)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.exception("Geocoding failed for lat=%s lon=%s", payload.lat, payload.lon)
        raise HTTPException(status_code=502, detail=f"Geocoding service error: {e}")

    order = Order(**data)
    db.add(order)
    await db.commit()
    await db.refresh(order)
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

    required_cols = {"lat", "lon", "subtotal"}
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
            lat = float(row["lat"])
            lon = float(row["lon"])
            subtotal = float(row["subtotal"])
            data = await calculate_order_tax(lat, lon, subtotal)
            orders.append(Order(**data))
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
