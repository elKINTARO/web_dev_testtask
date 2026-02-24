from contextlib import asynccontextmanager

from fastapi import FastAPI

from database import init_db
from routers.orders import router as orders_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Drone Delivery Tax API",
    description="Calculates and stores composite NY sales tax for drone delivery orders.",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(orders_router)


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
