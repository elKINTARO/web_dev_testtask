const API_BASE =
  typeof window !== "undefined"
    ? "/api"
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const msg = Array.isArray(err.detail) ? err.detail.map((e: { msg?: string }) => e.msg ?? e).join(", ") : err.detail;
    throw new Error(msg ?? `API error: ${res.status}`);
  }

  return res.json();
}

export interface ApiCafe {
  id: number;
  name: string;
  image: string | null;
  rating: number;
  category: string;
  delivery_time: string;
  lat: number;
  lon: number;
}

export interface ApiDish {
  id: number;
  image: string
  name: string;
  price: number;
  cafe_id: number;
}

export interface ApiCafeDetail extends ApiCafe {
  dishes: ApiDish[];
}

export interface OrderItemCreate {
  dish_id: number;
  quantity: number;
}

export interface OrderCreate {
  cafe_id: number;
  end_lat: number;
  end_lon: number;
  items: OrderItemCreate[];
}

export async function getCafes(category?: string): Promise<ApiCafe[]> {
  const params = category ? `?category=${encodeURIComponent(category)}` : "";
  return fetchApi<ApiCafe[]>(`/cafes${params}`);
}

export async function getCafe(id: number): Promise<ApiCafeDetail> {
  return fetchApi<ApiCafeDetail>(`/cafes/${id}`);
}

export async function createOrder(payload: OrderCreate) {
  return fetchApi<unknown>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
