from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field

from models import OrderStatus


class DishResponse(BaseModel):
    id: int
    name: str
    price: float
    cafe_id: int

    model_config = {"from_attributes": True}


class CafeResponse(BaseModel):
    id: int
    name: str
    image: Optional[str]
    rating: float
    category: str
    delivery_time: str
    lat: float
    lon: float

    model_config = {"from_attributes": True}


class CafeDetailResponse(CafeResponse):
    """Cafe with its full dish list."""
    dishes: list[DishResponse] = []


class OrderItemCreate(BaseModel):
    dish_id: int
    quantity: int = Field(..., ge=1, description="Must be at least 1")


class OrderCreate(BaseModel):
    cafe_id: int = Field(..., description="Cafe to order from")
    end_lat: float = Field(..., ge=-90, le=90, description="Delivery latitude")
    end_lon: float = Field(..., ge=-180, le=180, description="Delivery longitude")
    items: list[OrderItemCreate] = Field(..., min_length=1, description="At least one dish required")


class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    dish_id: int
    quantity: int

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    cafe_id: int
    end_lat: float
    end_lon: float
    subtotal: float
    tax_amount: float
    total_amount: float
    breakdown: dict[str, Any]
    distance_km: float
    estimated_flight_time: float
    status: OrderStatus
    timestamp: datetime
    items: list[OrderItemResponse] = []

    model_config = {"from_attributes": False}


class OrderListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[OrderResponse]
