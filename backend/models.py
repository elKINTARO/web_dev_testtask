import enum
from datetime import datetime, timezone
from typing import Any, Optional
import enum

from sqlalchemy import DateTime, Float, Integer, JSON, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class OrderStatus(str, enum.Enum):
    pending = "pending"
    flying = "flying"
    delivered = "delivered"
    lost = "lost"
    damaged = "damaged"


class Cafe(Base):
    __tablename__ = "cafes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    image: Mapped[str] = mapped_column(String, nullable=True)
    rating: Mapped[float] = mapped_column(Float, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)
    delivery_time: Mapped[str] = mapped_column(String, nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lon: Mapped[float] = mapped_column(Float, nullable=False)


class Dish(Base):
    __tablename__ = "dishes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    cafe_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("cafes.id"), nullable=False, index=True
    )


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    cafe_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("cafes.id"), nullable=False, index=True
    )
    end_lat: Mapped[float] = mapped_column(Float, nullable=False)
    end_lon: Mapped[float] = mapped_column(Float, nullable=False)
    subtotal: Mapped[float] = mapped_column(Float, nullable=False)
    tax_amount: Mapped[float] = mapped_column(Float, nullable=False)
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    breakdown: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    distance_km: Mapped[float] = mapped_column(Float, nullable=False)
    estimated_flight_time: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus), default=OrderStatus.pending, nullable=False
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("orders.id"), nullable=False, index=True
    )
    dish_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("dishes.id"), nullable=False, index=True
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
