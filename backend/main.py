from contextlib import asynccontextmanager

from fastapi import FastAPI

from database import init_db
from routers.cafes import router as cafes_router
from routers.orders import router as orders_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Drone Food Delivery API",
    description="Order food from cafes, delivered by drone. Includes NY sales tax calculation.",
    version="2.0.0",
    lifespan=lifespan,
)

app.include_router(orders_router)
app.include_router(cafes_router)


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
