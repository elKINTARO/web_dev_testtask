"use client";

import type { Dish, Restaurant } from "@/lib/types";
import styles from "./style.module.css";

interface DishModalProps {
  restaurant: Restaurant | null;
  loading?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (dish: Dish) => void;
}

export default function DishModal({
  restaurant,
  loading = false,
  isOpen,
  onClose,
  onSelect,
}: DishModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <button type="button" onClick={onClose} aria-label="Back">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6.9375 13.5L13.5 21L10.5103 21L2.63527 12L10.5103 3L13.5 3L6.9375 10.5L21 10.5L21 13.5L6.9375 13.5Z" fill="black"/>
            </svg>
          </button>
          <h1>
            {loading ? "Loading..." : restaurant ? `Виберіть страву з ${restaurant.name}` : "Menu"}
          </h1>
        </div>
        <div className={styles.dishListWrapper}>
        {loading ? (
          <p className={styles.loading}>Loading menu...</p>
        ) : restaurant ? (
        <ul className={styles.dishList}>
          {restaurant.dishes.map((dish) => (
            <li
              key={dish.id}
              className={styles.dishItem}
              onClick={() => onSelect(dish)}
            >
              <img src={dish.image} alt={dish.name} className={styles.dishImage} />
              <div className={styles.dishInfo}>
                <span>{dish.name}</span>
                <span>${dish.price.toFixed(2)}</span>
              </div>
            </li>
          ))}
        </ul>
        ) : null}
        </div>
      </div>
    </div>
  );
}