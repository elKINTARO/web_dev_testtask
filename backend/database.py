from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import select

from config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=settings.DB_ECHO)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    async with engine.begin() as conn:
        from models import Cafe, Dish, Drone, Order, OrderItem
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Cafe))
        existing_cafe = result.scalars().first()

        if not existing_cafe:
            cafes = [
                Cafe(
                    name="Sky High Bistro", 
                    image="https://assets.hldycdn.com/cdn-cgi/image/format=webp,width=600,quality=75/9c415f64-b481-4c4f-8da1-d37588f0f54d.jpeg", 
                    rating=4.9, 
                    category="Gourmet", 
                    delivery_time="15-20 min", 
                    lat=50.4501, lon=30.5234
                ),
                Cafe(
                    name="Drone Pizza Hub", 
                    image="https://townsquare.media/site/942/files/2021/01/GettyImages-1022645494.jpg?w=780&q=75", 
                    rating=4.7, 
                    category="Italian", 
                    delivery_time="10-15 min", 
                    lat=50.4547, lon=30.5290
                ),
                Cafe(
                    name="Velocity Burgers", 
                    image="https://images.squarespace-cdn.com/content/v1/67a3bb594e50e94902c11706/1738783604330-A6LPK3VUKU09464I4COE/VW_Home1.jpg", 
                    rating=4.5, 
                    category="Fast Food", 
                    delivery_time="20-25 min", 
                    lat=50.4480, lon=30.5180
                )
            ]

            session.add_all(cafes)
            await session.flush()

            from models import Dish
            all_dishes = [
                Dish(name="Truffle Pasta", price=350.0, image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZ0OIK5W7oVwj89N2vhGNKsNQW_RZ2EVlJxw&s", cafe_id=cafes[0].id),
                Dish(name="Roasted Duck", price=420.0, image="https://assets.epicurious.com/photos/5c93f15d7903444d883ded50/1:1/w_2560%2Cc_limit/Crisp-Roast-Duck-19032019.jpg", cafe_id=cafes[0].id),
                Dish(name="Wine Plate", price=290.0, image="https://myfoodstory.com/wp-content/uploads/2017/12/How-to-make-the-Ultimate-Wine-and-Cheese-Board-on-a-budget-11.jpg", cafe_id=cafes[0].id),

                Dish(name="Pepperoni Max", price=280.0, image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNfYzNfZJ26fwVnsR8elm-ChHeHobR6FpkVA&s", cafe_id=cafes[1].id),
                Dish(name="Four Cheese Pizza", price=310.0, image="https://uk.ooni.com/cdn/shop/articles/FourCheese_Resized.jpg?crop=center&height=800&v=1598453116&width=800", cafe_id=cafes[1].id),
                Dish(name="Garlic Knots", price=120.0, image="https://www.sipandfeast.com/wp-content/uploads/2021/08/garlic-knots-recipe-snippet.jpg", cafe_id=cafes[1].id),
                
                Dish(name="Turbo Cheeseburger", price=190.0, image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlcyXnkIaHFXXIledJniFrYoa64wV85zHoyg&s", cafe_id=cafes[2].id),
                Dish(name="Mega Fries", price=85.0, image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwW_vFVf_P8x9ttAoJvb3OYAsO7fUM0jdUbQ&s", cafe_id=cafes[2].id),
                Dish(name="Vanilla Shake", price=110.0, image="https://homebodyeats.com/wp-content/uploads/2021/05/vanilla-milkshake-recipe.jpg", cafe_id=cafes[2].id)
            ]

            session.add_all(all_dishes)
            await session.commit()
        else:
            print("--- Database already contains data, skipping seed ---")
