"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Dish, Restaurant } from "@/lib/types";

export interface CartItem {
  restaurant: Restaurant;
  dish: Dish;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (restaurant: Restaurant, dish: Dish, quantity?: number) => void;
  removeItem: (restaurantId: number, dishId: number) => void;
  updateQuantity: (restaurantId: number, dishId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback(
    (restaurant: Restaurant, dish: Dish, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find(
          (i) =>
            i.restaurant.id === restaurant.id &&
            i.dish.id === dish.id
        );

        if (existing) {
          return prev.map((i) =>
            i === existing
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }

        return [...prev, { restaurant, dish, quantity }];
      });
    },
    []
  );

  const removeItem = useCallback(
    (restaurantId: number, dishId: number) => {
      setItems((prev) =>
        prev.filter(
          (i) =>
            !(
              i.restaurant.id === restaurantId &&
              i.dish.id === dishId
            )
        )
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (restaurantId: number, dishId: number, quantity: number) => {
      if (quantity <= 0) {
        removeItem(restaurantId, dishId);
        return;
      }

      setItems((prev) =>
        prev.map((i) =>
          i.restaurant.id === restaurantId &&
          i.dish.id === dishId
            ? { ...i, quantity }
            : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.dish.price * item.quantity,
        0
      ),
    [items]
  );
  
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      total,
      itemCount,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, total, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
