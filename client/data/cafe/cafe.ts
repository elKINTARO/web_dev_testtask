export interface Dish {
  id: number;
  name: string;
  price: number;
  image: string; // Додано поле для фото
}

export interface Restaurant {
  id: number;
  name: string;
  image: string;
  rating: number;
  category: string;
  deliveryTime: string;
  dishes: Dish[];
}

export const restaurantsData: Restaurant[] = [
  {
    "id": 1,
    "name": "Italiano Restaurant 1",
    "image": "https://picsum.photos/seed/res1/400/300",
    "rating": 4.8,
    "category": "Italian Cuisine",
    "deliveryTime": "25-35 min",
    "dishes": [
      { "id": 1, "name": "Margherita Pizza", "price": 12.5, "image": "https://picsum.photos/seed/dish1_1/400/300" },
      { "id": 2, "name": "Spaghetti Carbonara", "price": 14, "image": "https://picsum.photos/seed/dish1_2/400/300" },
      { "id": 3, "name": "Lasagna", "price": 15, "image": "https://picsum.photos/seed/dish1_3/400/300" },
      { "id": 4, "name": "Risotto Funghi", "price": 13, "image": "https://picsum.photos/seed/dish1_4/400/300" },
      { "id": 5, "name": "Focaccia Bread", "price": 5, "image": "https://picsum.photos/seed/dish1_5/400/300" },
      { "id": 6, "name": "Bruschetta", "price": 6, "image": "https://picsum.photos/seed/dish1_6/400/300" },
      { "id": 7, "name": "Tiramisu", "price": 7, "image": "https://picsum.photos/seed/dish1_7/400/300" },
      { "id": 8, "name": "Caprese Salad", "price": 8, "image": "https://picsum.photos/seed/dish1_8/400/300" },
      { "id": 9, "name": "Gnocchi", "price": 11, "image": "https://picsum.photos/seed/dish1_9/400/300" },
      { "id": 10, "name": "Panna Cotta", "price": 6.5, "image": "https://picsum.photos/seed/dish1_10/400/300" }
    ]
  },
  {
    "id": 2,
    "name": "Sushi Master 2",
    "image": "https://picsum.photos/seed/res2/400/300",
    "rating": 4.7,
    "category": "Japanese Cuisine",
    "deliveryTime": "30-40 min",
    "dishes": [
      { "id": 1, "name": "Salmon Nigiri", "price": 5, "image": "https://picsum.photos/seed/dish2_1/400/300" },
      { "id": 2, "name": "Tuna Roll", "price": 6, "image": "https://picsum.photos/seed/dish2_2/400/300" },
      { "id": 3, "name": "Dragon Roll", "price": 12, "image": "https://picsum.photos/seed/dish2_3/400/300" },
      { "id": 4, "name": "California Roll", "price": 8, "image": "https://picsum.photos/seed/dish2_4/400/300" },
      { "id": 5, "name": "Tempura Shrimp Roll", "price": 10, "image": "https://picsum.photos/seed/dish2_5/400/300" },
      { "id": 6, "name": "Miso Soup", "price": 3, "image": "https://picsum.photos/seed/dish2_6/400/300" },
      { "id": 7, "name": "Edamame", "price": 4, "image": "https://picsum.photos/seed/dish2_7/400/300" },
      { "id": 8, "name": "Unagi Don", "price": 14, "image": "https://picsum.photos/seed/dish2_8/400/300" },
      { "id": 9, "name": "Seaweed Salad", "price": 5, "image": "https://picsum.photos/seed/dish2_9/400/300" },
      { "id": 10, "name": "Matcha Ice Cream", "price": 4.5, "image": "https://picsum.photos/seed/dish2_10/400/300" }
    ]
  },
  {
    "id": 3,
    "name": "Burger House 3",
    "image": "https://picsum.photos/seed/res3/400/300",
    "rating": 4.6,
    "category": "Fast Food",
    "deliveryTime": "20-30 min",
    "dishes": [
      { "id": 1, "name": "Classic Cheeseburger", "price": 9, "image": "https://picsum.photos/seed/dish3_1/400/300" },
      { "id": 2, "name": "Bacon Burger", "price": 10, "image": "https://picsum.photos/seed/dish3_2/400/300" },
      { "id": 3, "name": "Veggie Burger", "price": 8, "image": "https://picsum.photos/seed/dish3_3/400/300" },
      { "id": 4, "name": "Chicken Burger", "price": 9.5, "image": "https://picsum.photos/seed/dish3_4/400/300" },
      { "id": 5, "name": "Fries", "price": 3, "image": "https://picsum.photos/seed/dish3_5/400/300" },
      { "id": 6, "name": "Onion Rings", "price": 4, "image": "https://picsum.photos/seed/dish3_6/400/300" },
      { "id": 7, "name": "Coleslaw", "price": 3.5, "image": "https://picsum.photos/seed/dish3_7/400/300" },
      { "id": 8, "name": "Milkshake", "price": 5, "image": "https://picsum.photos/seed/dish3_8/400/300" },
      { "id": 9, "name": "BBQ Burger", "price": 10.5, "image": "https://picsum.photos/seed/dish3_9/400/300" },
      { "id": 10, "name": "Double Cheeseburger", "price": 11, "image": "https://picsum.photos/seed/dish3_10/400/300" }
    ]
  },
  {
    "id": 4,
    "name": "Taco Fiesta 4",
    "image": "https://picsum.photos/seed/res4/400/300",
    "rating": 4.5,
    "category": "Mexican Cuisine",
    "deliveryTime": "25-35 min",
    "dishes": [
      { "id": 1, "name": "Chicken Taco", "price": 6, "image": "https://picsum.photos/seed/dish4_1/400/300" },
      { "id": 2, "name": "Beef Taco", "price": 6.5, "image": "https://picsum.photos/seed/dish4_2/400/300" },
      { "id": 3, "name": "Fish Taco", "price": 7, "image": "https://picsum.photos/seed/dish4_3/400/300" },
      { "id": 4, "name": "Veggie Taco", "price": 5.5, "image": "https://picsum.photos/seed/dish4_4/400/300" },
      { "id": 5, "name": "Burrito", "price": 8, "image": "https://picsum.photos/seed/dish4_5/400/300" },
      { "id": 6, "name": "Quesadilla", "price": 7, "image": "https://picsum.photos/seed/dish4_6/400/300" },
      { "id": 7, "name": "Nachos", "price": 6, "image": "https://picsum.photos/seed/dish4_7/400/300" },
      { "id": 8, "name": "Guacamole", "price": 4, "image": "https://picsum.photos/seed/dish4_8/400/300" },
      { "id": 9, "name": "Churros", "price": 5, "image": "https://picsum.photos/seed/dish4_9/400/300" },
      { "id": 10, "name": "Salsa Dip", "price": 3.5, "image": "https://picsum.photos/seed/dish4_10/400/300" }
    ]
  },
  {
    "id": 5,
    "name": "Curry House 5",
    "image": "https://picsum.photos/seed/res5/400/300",
    "rating": 4.7,
    "category": "Indian Cuisine",
    "deliveryTime": "30-40 min",
    "dishes": [
      { "id": 1, "name": "Chicken Tikka Masala", "price": 12, "image": "https://picsum.photos/seed/dish5_1/400/300" },
      { "id": 2, "name": "Paneer Butter Masala", "price": 11, "image": "https://picsum.photos/seed/dish5_2/400/300" },
      { "id": 3, "name": "Lamb Curry", "price": 13, "image": "https://picsum.photos/seed/dish5_3/400/300" },
      { "id": 4, "name": "Chana Masala", "price": 9, "image": "https://picsum.photos/seed/dish5_4/400/300" },
      { "id": 5, "name": "Naan Bread", "price": 3, "image": "https://picsum.photos/seed/dish5_5/400/300" },
      { "id": 6, "name": "Garlic Naan", "price": 3.5, "image": "https://picsum.photos/seed/dish5_6/400/300" },
      { "id": 7, "name": "Basmati Rice", "price": 4, "image": "https://picsum.photos/seed/dish5_7/400/300" },
      { "id": 8, "name": "Samosa", "price": 2.5, "image": "https://picsum.photos/seed/dish5_8/400/300" },
      { "id": 9, "name": "Gulab Jamun", "price": 5, "image": "https://picsum.photos/seed/dish5_9/400/300" },
      { "id": 10, "name": "Raita", "price": 2, "image": "https://picsum.photos/seed/dish5_10/400/300" }
    ]
  },
  {
    "id": 6,
    "name": "Pizza Paradise 6",
    "image": "https://picsum.photos/seed/res6/400/300",
    "rating": 4.6,
    "category": "Italian Cuisine",
    "deliveryTime": "20-30 min",
    "dishes": [
      { "id": 1, "name": "Pepperoni Pizza", "price": 13, "image": "https://picsum.photos/seed/dish6_1/400/300" },
      { "id": 2, "name": "Four Cheese Pizza", "price": 14, "image": "https://picsum.photos/seed/dish6_2/400/300" },
      { "id": 3, "name": "Veggie Pizza", "price": 12, "image": "https://picsum.photos/seed/dish6_3/400/300" },
      { "id": 4, "name": "BBQ Chicken Pizza", "price": 15, "image": "https://picsum.photos/seed/dish6_4/400/300" },
      { "id": 5, "name": "Garlic Bread", "price": 5, "image": "https://picsum.photos/seed/dish6_5/400/300" },
      { "id": 6, "name": "Caesar Salad", "price": 6, "image": "https://picsum.photos/seed/dish6_6/400/300" },
      { "id": 7, "name": "Pasta Alfredo", "price": 13, "image": "https://picsum.photos/seed/dish6_7/400/300" },
      { "id": 8, "name": "Pasta Arrabiata", "price": 12, "image": "https://picsum.photos/seed/dish6_8/400/300" },
      { "id": 9, "name": "Gelato", "price": 6, "image": "https://picsum.photos/seed/dish6_9/400/300" },
      { "id": 10, "name": "Tiramisu", "price": 7, "image": "https://picsum.photos/seed/dish6_10/400/300" }
    ]
  },
  {
    "id": 7,
    "name": "Sushi World 7",
    "image": "https://picsum.photos/seed/res7/400/300",
    "rating": 4.8,
    "category": "Japanese Cuisine",
    "deliveryTime": "25-35 min",
    "dishes": [
      { "id": 1, "name": "Salmon Sashimi", "price": 8, "image": "https://picsum.photos/seed/dish7_1/400/300" },
      { "id": 2, "name": "Tuna Sashimi", "price": 9, "image": "https://picsum.photos/seed/dish7_2/400/300" },
      { "id": 3, "name": "Ebi Nigiri", "price": 6, "image": "https://picsum.photos/seed/dish7_3/400/300" },
      { "id": 4, "name": "Avocado Roll", "price": 7, "image": "https://picsum.photos/seed/dish7_4/400/300" },
      { "id": 5, "name": "Rainbow Roll", "price": 12, "image": "https://picsum.photos/seed/dish7_5/400/300" },
      { "id": 6, "name": "Tempura Roll", "price": 10, "image": "https://picsum.photos/seed/dish7_6/400/300" },
      { "id": 7, "name": "Miso Soup", "price": 3, "image": "https://picsum.photos/seed/dish7_7/400/300" },
      { "id": 8, "name": "Edamame", "price": 4, "image": "https://picsum.photos/seed/dish7_8/400/300" },
      { "id": 9, "name": "Seaweed Salad", "price": 5, "image": "https://picsum.photos/seed/dish7_9/400/300" },
      { "id": 10, "name": "Green Tea Ice Cream", "price": 4.5, "image": "https://picsum.photos/seed/dish7_10/400/300" }
    ]
  },
  {
    "id": 8,
    "name": "Burger King 8",
    "image": "https://picsum.photos/seed/res8/400/300",
    "rating": 4.5,
    "category": "Fast Food",
    "deliveryTime": "20-30 min",
    "dishes": [
      { "id": 1, "name": "Cheeseburger", "price": 9, "image": "https://picsum.photos/seed/dish8_1/400/300" },
      { "id": 2, "name": "Double Burger", "price": 11, "image": "https://picsum.photos/seed/dish8_2/400/300" },
      { "id": 3, "name": "Veggie Burger", "price": 8, "image": "https://picsum.photos/seed/dish8_3/400/300" },
      { "id": 4, "name": "Fries", "price": 3, "image": "https://picsum.photos/seed/dish8_4/400/300" },
      { "id": 5, "name": "Onion Rings", "price": 4, "image": "https://picsum.photos/seed/dish8_5/400/300" },
      { "id": 6, "name": "BBQ Burger", "price": 10, "image": "https://picsum.photos/seed/dish8_6/400/300" },
      { "id": 7, "name": "Milkshake", "price": 5, "image": "https://picsum.photos/seed/dish8_7/400/300" },
      { "id": 8, "name": "Chicken Burger", "price": 9.5, "image": "https://picsum.photos/seed/dish8_8/400/300" },
      { "id": 9, "name": "Coleslaw", "price": 3.5, "image": "https://picsum.photos/seed/dish8_9/400/300" },
      { "id": 10, "name": "Bacon Burger", "price": 10, "image": "https://picsum.photos/seed/dish8_10/400/300" }
    ]
  },
  {
    "id": 9,
    "name": "Taco Express 9",
    "image": "https://picsum.photos/seed/res9/400/300",
    "rating": 4.6,
    "category": "Mexican Cuisine",
    "deliveryTime": "25-35 min",
    "dishes": [
      { "id": 1, "name": "Beef Taco", "price": 6, "image": "https://picsum.photos/seed/dish9_1/400/300" },
      { "id": 2, "name": "Chicken Taco", "price": 6, "image": "https://picsum.photos/seed/dish9_2/400/300" },
      { "id": 3, "name": "Veggie Taco", "price": 5.5, "image": "https://picsum.photos/seed/dish9_3/400/300" },
      { "id": 4, "name": "Fish Taco", "price": 7, "image": "https://picsum.photos/seed/dish9_4/400/300" },
      { "id": 5, "name": "Burrito", "price": 8, "image": "https://picsum.photos/seed/dish9_5/400/300" },
      { "id": 6, "name": "Quesadilla", "price": 7, "image": "https://picsum.photos/seed/dish9_6/400/300" },
      { "id": 7, "name": "Nachos", "price": 6, "image": "https://picsum.photos/seed/dish9_7/400/300" },
      { "id": 8, "name": "Guacamole", "price": 4, "image": "https://picsum.photos/seed/dish9_8/400/300" },
      { "id": 9, "name": "Churros", "price": 5, "image": "https://picsum.photos/seed/dish9_9/400/300" },
      { "id": 10, "name": "Salsa Dip", "price": 3.5, "image": "https://picsum.photos/seed/dish9_10/400/300" }
    ]
  },
  {
    "id": 10,
    "name": "Curry Palace 10",
    "image": "https://picsum.photos/seed/res10/400/300",
    "rating": 4.7,
    "category": "Indian Cuisine",
    "deliveryTime": "30-40 min",
    "dishes": [
      { "id": 1, "name": "Chicken Curry", "price": 12, "image": "https://picsum.photos/seed/dish10_1/400/300" },
      { "id": 2, "name": "Paneer Curry", "price": 11, "image": "https://picsum.photos/seed/dish10_2/400/300" },
      { "id": 3, "name": "Lamb Curry", "price": 13, "image": "https://picsum.photos/seed/dish10_3/400/300" },
      { "id": 4, "name": "Dal Tadka", "price": 8, "image": "https://picsum.photos/seed/dish10_4/400/300" },
      { "id": 5, "name": "Basmati Rice", "price": 4, "image": "https://picsum.photos/seed/dish10_5/400/300" },
      { "id": 6, "name": "Naan Bread", "price": 3, "image": "https://picsum.photos/seed/dish10_6/400/300" },
      { "id": 7, "name": "Garlic Naan", "price": 3.5, "image": "https://picsum.photos/seed/dish10_7/400/300" },
      { "id": 8, "name": "Raita", "price": 2, "image": "https://picsum.photos/seed/dish10_8/400/300" },
      { "id": 9, "name": "Samosa", "price": 2.5, "image": "https://picsum.photos/seed/dish10_9/400/300" },
      { "id": 10, "name": "Gulab Jamun", "price": 5, "image": "https://picsum.photos/seed/dish10_10/400/300" }
    ]
  }
];