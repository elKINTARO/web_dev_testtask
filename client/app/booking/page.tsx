"use client";

import { useRouter } from "next/navigation";
import styles from "./style.module.css";
import { useCart } from "@/app/context/CartContext";

export default function Booking() {
  const { items, total, clearCart, removeItem, updateQuantity } = useCart();
  const router = useRouter();

  const handleBack = () => {
    router.replace("/delivery");
  };

  const handleConfirm = () => {
    clearCart();
    router.replace("/delivery");
  };

  return (
    <div className={styles.container}>
      <div className={styles.mapSection}>
        <div className={styles.mapOverlay}>
          <button type="button" onClick={handleBack} aria-label="Back">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6.9375 13.5L13.5 21L10.5103 21L2.63527 12L10.5103 3L13.5 3L6.9375 10.5L21 10.5L21 13.5L6.9375 13.5Z" fill="black"/>
            </svg>
          </button>
          <div className={styles.topButtons}>
            <button type="button" className={styles.helpBtn}>Help</button>
            <button type="button" className={styles.moreBtn}>•••</button>
          </div>
        </div>
        <div className={styles.mapPlaceholder}></div>
      </div>
      <div className={styles.content}>
        <div className={styles.dragHandle}></div>
        <h2 className={styles.title}>Choose a trip</h2>

        <div className={styles.subtotalHeader}>
          <span>Subtotal</span>
          <span className={styles.totalPrice}>${total.toFixed(2)}</span>
        </div>

        <div className={styles.foodList}>
          {items.length === 0 ? (
            <p className={styles.emptyMessage}>No items. Add dishes from Delivery.</p>
          ) : (
            items.map((item) => (
              <div key={`${item.restaurant.id}-${item.dish.id}`} className={styles.foodItem}>
                <img src={item.dish.image} alt={item.dish.name} />
                <div className={styles.foodItemInfo}>
                  <p>{item.dish.name}</p>
                  <small>
                    ${item.dish.price.toFixed(2)} × {item.quantity} = $
                    {(item.dish.price * item.quantity).toFixed(2)}
                  </small>
                  <div className={styles.foodItemActions}>
                    <div className={styles.quantity}>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.restaurant.id,
                            item.dish.id,
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
                            item.dish.id,
                            item.quantity + 1
                          )
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        removeItem(item.restaurant.id, item.dish.id)
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
              </div>
            ))
          )}
        </div>

        <div className={styles.droneCard}>
          <div className={styles.droneInfo}>
            <div className={styles.droneText}>
              <img src="/drone/drone.png" alt="Drone" className={styles.droneIcon} />
              <h3>Drone Go</h3>
              <p>Estimated arrival: 15–25 min</p>
            </div>
            <div className={styles.dronePrice}>
              <span className={styles.mainPrice}>$10</span>
              <span className={styles.taxText}>Delivery fee</span>
            </div>
          </div>
        </div>

        <div className={styles.paymentRow}>
          <div className={styles.gPay}>
            <span className={styles.gPayLogo}>G Pay</span>
            <span className={styles.userEmail}>user.name@okhdfcbank</span>
          </div>
          <span className={styles.arrow}>❯</span>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          className={styles.mainButton}
          disabled={items.length === 0}
        >
          Choose Drone Go
        </button>
      </div>
    </div>
  );
}