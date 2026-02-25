from contextlib import asynccontextmanager

from fastapi import FastAPI

from database import init_db
from routers.drones import router as drones_router
from routers.orders import router as orders_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Drone Delivery API",
    description="Logistics, routing, and NY sales tax calculation for drone delivery orders.",
    version="2.0.0",
    lifespan=lifespan,
)

app.include_router(orders_router)
app.include_router(drones_router)


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
