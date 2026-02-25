import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db
from models import Cafe, Dish
from schemas import CafeDetailResponse, CafeResponse, DishResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cafes", tags=["cafes"])


@router.get("", response_model=list[CafeResponse])
async def list_cafes(
    db: Annotated[AsyncSession, Depends(get_db)],
    category: str | None = Query(default=None, description="Filter by category"),
    limit: int = Query(default=settings.DEFAULT_LIMIT, ge=1, le=settings.MAX_LIMIT),
    offset: int = Query(default=0, ge=0),
):
    stmt = select(Cafe)
    if category:
        stmt = stmt.where(Cafe.category == category)
    stmt = stmt.order_by(Cafe.id).limit(limit).offset(offset)

    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{cafe_id}", response_model=CafeDetailResponse)
async def get_cafe(
    cafe_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    cafe_result = await db.execute(select(Cafe).where(Cafe.id == cafe_id))
    cafe = cafe_result.scalars().first()
    if not cafe:
        raise HTTPException(status_code=404, detail=f"Cafe {cafe_id} not found.")

    dishes_result = await db.execute(select(Dish).where(Dish.cafe_id == cafe_id))
    dishes = dishes_result.scalars().all()

    return CafeDetailResponse(
        id=cafe.id,
        name=cafe.name,
        image=cafe.image,
        rating=cafe.rating,
        category=cafe.category,
        delivery_time=cafe.delivery_time,
        lat=cafe.lat,
        lon=cafe.lon,
        dishes=[DishResponse.model_validate(d) for d in dishes],
    )
