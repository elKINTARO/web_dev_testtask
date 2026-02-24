from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class OrderCreate(BaseModel):
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lon: float = Field(..., ge=-180, le=180, description="Longitude")
    subtotal: float = Field(..., gt=0, description="Order subtotal in USD")


class OrderResponse(BaseModel):
    id: int
    lat: float
    lon: float
    subtotal: float
    tax_amount: float
    total_amount: float
    breakdown: dict[str, Any]
    timestamp: datetime

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[OrderResponse]
