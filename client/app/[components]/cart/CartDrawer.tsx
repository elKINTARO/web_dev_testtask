"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import styles from "./style.module.css";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { items, removeItem, updateQuantity, total } = useCart();

  const handleGet = () => {
    onClose();
    router.push("/booking");
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Cart"
      >
        <div className={styles.header}>
          <h2>Cart</h2>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {items.length === 0 && items[0].restaurant.name !== "Box" ? (
            <p className={styles.empty}>Your cart is empty</p>
          ) : (
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={`${item.restaurant.id}-${item.dish!.id}`} className={styles.item}>
                  <img
                    src={item.dish!.image}
                    alt={item.dish!.name}
                    className={styles.itemImage}
                  />
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.dish!.name}</span>
                    <span className={styles.itemRestaurant}>
                      {item.restaurant.name}
                    </span>
                    <div className={styles.itemActions}>
                      <div className={styles.quantity}>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.restaurant.id,
                              item.dish!.id,
                              item.quantity - 1
                            )
                          }
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.restaurant.id,
                              item.dish!.id,
                              item.quantity + 1
                            )
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className={styles.itemPrice}>
                        ${(item.dish!.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item.restaurant.id, item.dish!.id)
                        }
                        className={styles.removeBtn}
                        aria-label="Remove item"
                        title="Remove from cart"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span>Total</span>
              <span className={styles.totalPrice}>${total.toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={handleGet}
              className={styles.getBtn}
            >
              Get
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
