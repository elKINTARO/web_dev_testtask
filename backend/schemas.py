from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field

from models import DroneStatus, OrderStatus


class OrderCreate(BaseModel):
    start_lat: float = Field(..., ge=-90, le=90, description="Pickup latitude")
    start_lon: float = Field(..., ge=-180, le=180, description="Pickup longitude")
    end_lat: float = Field(..., ge=-90, le=90, description="Delivery latitude")
    end_lon: float = Field(..., ge=-180, le=180, description="Delivery longitude")
    subtotal: float = Field(..., gt=0, description="Order subtotal in USD")


class OrderResponse(BaseModel):
    id: int
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float
    subtotal: float
    tax_amount: float
    total_amount: float
    breakdown: dict[str, Any]
    distance_km: float
    estimated_flight_time: float
    status: OrderStatus
    drone_id: Optional[int]
    timestamp: datetime

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: list[OrderResponse]


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class DroneCreate(BaseModel):
    battery_level: float = Field(..., ge=0, le=100, description="Battery level (%)")
    current_lat: float = Field(..., ge=-90, le=90)
    current_lon: float = Field(..., ge=-180, le=180)
    max_radius: float = Field(..., gt=0, description="Max delivery radius (km)")
    max_weight: float = Field(..., gt=0, description="Max payload weight (kg)")


class DroneLocationUpdate(BaseModel):
    current_lat: float = Field(..., ge=-90, le=90, description="New latitude")
    current_lon: float = Field(..., ge=-180, le=180, description="New longitude")
    battery_level: Optional[float] = Field(None, ge=0, le=100, description="Updated battery level (%)")


class DroneLocationResponse(BaseModel):
    id: int
    current_lat: float
    current_lon: float
    battery_level: float
    status: DroneStatus

    model_config = {"from_attributes": True}


class DroneResponse(BaseModel):
    id: int
    battery_level: float
    status: DroneStatus
    current_lat: float
    current_lon: float
    max_radius: float
    max_weight: float

    model_config = {"from_attributes": True}

