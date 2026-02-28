import type { ApiCafe, ApiCafeDetail, ApiDish } from "./api";

export interface Dish {
  id: number;
  name: string;
  price: number;
  image: string;
  cafe_id?: number;
}

export interface Restaurant {
  id: number;
  name: string;
  image: string;
  rating: number;
  category: string;
  deliveryTime: string;
  lat?: number;
  lon?: number;
  dishes: Dish[];
}

function dishImage(cafeId: number, dishId: number): string {
  return `https://picsum.photos/seed/c${cafeId}d${dishId}/400/300`;
}

export function apiCafeToRestaurant(cafe: ApiCafe, dishes?: ApiDish[]): Restaurant {
  return {
    id: cafe.id,
    name: cafe.name,
    image: cafe.image ?? `https://picsum.photos/seed/cafe${cafe.id}/400/300`,
    rating: cafe.rating,
    category: cafe.category,
    deliveryTime: cafe.delivery_time,
    lat: cafe.lat,
    lon: cafe.lon,
    dishes: (dishes ?? []).map((d) => ({
      id: d.id,
      name: d.name,
      price: d.price,
      image: dishImage(cafe.id, d.id),
      cafe_id: d.cafe_id,
    })),
  };
}

export function apiCafeDetailToRestaurant(detail: ApiCafeDetail): Restaurant {
  return apiCafeToRestaurant(detail, detail.dishes);
}
