import asyncio
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db
from models import Drone, DroneStatus
from schemas import DroneCreate, DroneLocationResponse, DroneLocationUpdate, DroneResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/drones", tags=["drones"])

_POLL_INTERVAL = 1.0
_MAX_TIMEOUT   = 60


@router.get("", response_model=list[DroneResponse])
async def list_drones(
    db: Annotated[AsyncSession, Depends(get_db)],
    drone_status: DroneStatus | None = Query(
        default=None,
        alias="status",
        description="Filter drones by status",
    ),
    limit: int = Query(default=settings.DEFAULT_LIMIT, ge=1, le=settings.MAX_LIMIT),
    offset: int = Query(default=0, ge=0),
):
    stmt = select(Drone)
    if drone_status is not None:
        stmt = stmt.where(Drone.status == drone_status)
    stmt = stmt.order_by(Drone.id).limit(limit).offset(offset)

    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("", response_model=DroneResponse, status_code=status.HTTP_201_CREATED)
async def create_drone(
    payload: DroneCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    drone = Drone(
        battery_level=payload.battery_level,
        status=DroneStatus.available,
        current_lat=payload.current_lat,
        current_lon=payload.current_lon,
        max_radius=payload.max_radius,
        max_weight=payload.max_weight,
    )
    db.add(drone)
    await db.commit()
    await db.refresh(drone)
    logger.info("Created drone id=%s at (%.4f, %.4f)", drone.id, drone.current_lat, drone.current_lon)
    return drone


@router.get("/{drone_id}", response_model=DroneResponse)
async def get_drone(
    drone_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(Drone).where(Drone.id == drone_id))
    drone = result.scalars().first()
    if not drone:
        raise HTTPException(status_code=404, detail=f"Drone {drone_id} not found.")
    return drone


@router.patch("/{drone_id}/location", response_model=DroneLocationResponse)
async def update_drone_location(
    drone_id: int,
    payload: DroneLocationUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Update drone GPS coordinates (and optionally battery level)."""
    result = await db.execute(select(Drone).where(Drone.id == drone_id))
    drone = result.scalars().first()
    if not drone:
        raise HTTPException(status_code=404, detail=f"Drone {drone_id} not found.")

    drone.current_lat = payload.current_lat
    drone.current_lon = payload.current_lon
    if payload.battery_level is not None:
        drone.battery_level = payload.battery_level

    await db.commit()
    await db.refresh(drone)
    logger.info(
        "Drone %s location updated → (%.5f, %.5f), battery=%.1f%%",
        drone.id, drone.current_lat, drone.current_lon, drone.battery_level,
    )
    return drone


@router.get("/{drone_id}/location", response_model=DroneLocationResponse)
async def poll_drone_location(
    drone_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    last_lat: float | None = Query(
        default=None,
        ge=-90, le=90,
        description="Last known latitude. Omit to get current location immediately.",
    ),
    last_lon: float | None = Query(
        default=None,
        ge=-180, le=180,
        description="Last known longitude.",
    ),
    timeout: int = Query(
        default=30,
        ge=1,
        le=_MAX_TIMEOUT,
        description="Max seconds to wait for a location change (long poll).",
    ),
):
    """
    Long-polling endpoint for drone location updates.

    - If `last_lat`/`last_lon` are omitted → returns current location immediately.
    - If `last_lat`/`last_lon` match the current DB values → waits up to `timeout`
      seconds, checking every second, and returns as soon as coordinates change.
    - If timeout expires without change → returns current location with HTTP 200.

    The client should immediately re-issue the request after receiving a response
    to achieve a continuous real-time location stream.
    """
    if last_lat is None or last_lon is None:
        result = await db.execute(select(Drone).where(Drone.id == drone_id))
        drone = result.scalars().first()
        if not drone:
            raise HTTPException(status_code=404, detail=f"Drone {drone_id} not found.")
        return drone

    elapsed = 0
    while elapsed < timeout:
        result = await db.execute(select(Drone).where(Drone.id == drone_id))
        drone = result.scalars().first()
        if not drone:
            raise HTTPException(status_code=404, detail=f"Drone {drone_id} not found.")

        if abs(drone.current_lat - last_lat) > 0.0001 or abs(drone.current_lon - last_lon) > 0.0001:
            return drone

        await asyncio.sleep(_POLL_INTERVAL)
        elapsed += _POLL_INTERVAL
        db.expire_all()

    return drone
