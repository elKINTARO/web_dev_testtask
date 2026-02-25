"""
Seed script: populates the database with sample cafes and dishes for testing.

Usage (from backend/ directory):
    python seed.py               # insert seed data
    python seed.py --clear       # drop all rows first, then insert
"""

import asyncio
import sys

from sqlalchemy import text

from database import AsyncSessionLocal, init_db
from models import Cafe, Dish


CAFES = [
    {
        "id": 1,
        "name": "Pizza Palace",
        "image": "https://picsum.photos/seed/1/400/300",
        "rating": 4.3,
        "category": "Italian",
        "delivery_time": "25-35 min",
        "lat": 40.7580,
        "lon": -73.9855,  # Midtown Manhattan
        "dishes": [
            {"id": 1,  "name": "Margherita",        "price": 12.0},
            {"id": 2,  "name": "Pepperoni",          "price": 14.0},
            {"id": 3,  "name": "BBQ Chicken Pizza",  "price": 15.0},
        ],
    },
    {
        "id": 2,
        "name": "Sushi World",
        "image": "https://picsum.photos/seed/2/400/300",
        "rating": 4.7,
        "category": "Japanese",
        "delivery_time": "30-45 min",
        "lat": 40.7282,
        "lon": -73.7949,  # Jamaica, Queens
        "dishes": [
            {"id": 4,  "name": "Salmon Roll",        "price": 11.0},
            {"id": 5,  "name": "Tuna Sashimi",       "price": 16.0},
            {"id": 6,  "name": "Dragon Roll",         "price": 18.0},
        ],
    },
    {
        "id": 3,
        "name": "Burger House 3",
        "image": "https://picsum.photos/seed/3/400/300",
        "rating": 4.6,
        "category": "Fast Food",
        "delivery_time": "20-30 min",
        "lat": 40.6892,
        "lon": -74.0445,
        "dishes": [
            {"id": 7,  "name": "Classic Cheeseburger", "price": 9.0},
            {"id": 8,  "name": "Bacon Burger",          "price": 10.0},
            {"id": 9,  "name": "Mushroom Swiss Burger", "price": 11.0},
            {"id": 10, "name": "Crispy Chicken Burger", "price": 10.5},
            {"id": 11, "name": "Veggie Burger",         "price": 8.5},
        ],
    },
]


async def clear_tables(session) -> None:
    await session.execute(text("DELETE FROM order_items"))
    await session.execute(text("DELETE FROM orders"))
    await session.execute(text("DELETE FROM dishes"))
    await session.execute(text("DELETE FROM cafes"))
    await session.commit()
    print("  Cleared: order_items, orders, dishes, cafes")


async def seed(clear: bool = False) -> None:
    await init_db()

    async with AsyncSessionLocal() as session:
        if clear:
            print("Clearing existing data...")
            await clear_tables(session)

        print("Inserting seed data...")
        for cafe_data in CAFES:
            dishes_data = cafe_data.pop("dishes")

            cafe = Cafe(**cafe_data)
            session.add(cafe)
            await session.flush()

            for dish_data in dishes_data:
                session.add(Dish(**dish_data, cafe_id=cafe.id))

            print(f"  + Cafe [{cafe.id}] {cafe.name} with {len(dishes_data)} dishes")

        await session.commit()
        print("Done! Database seeded successfully.")


if __name__ == "__main__":
    clear = "--clear" in sys.argv
    asyncio.run(seed(clear=clear))
