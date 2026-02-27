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
            <p className={styles.emptyMessage}>
              No items. Add dishes from Delivery.
            </p>
          ) : (
            items.map((item) => {
              const isBox = item.dish === null;

              return (
                <div
                  key={`${item.restaurant.id}-${item.dish?.id ?? "box"}`}
                  className={styles.foodItem}
                >
                  <img
                    src={isBox ? item.restaurant.image : item.dish!.image}
                    alt={isBox ? "Box" : item.dish!.name}
                  />

                  <div className={styles.foodItemInfo}>
                    <p>{isBox ? "Box" : item.dish!.name}</p>

                    {!isBox && (
                      <small>
                        ${item.dish!.price.toFixed(2)} × {item.quantity} = $
                        {(item.dish!.price * item.quantity).toFixed(2)}
                      </small>
                    )}

                    {isBox && (
                      <small>
                        Special delivery × {item.quantity}
                      </small>
                    )}

                    <div className={styles.foodItemActions}>
                      <div className={styles.quantity}>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.restaurant.id,
                              item.dish?.id ?? null,
                              item.quantity - 1
                            )
                          }
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.restaurant.id,
                              item.dish?.id ?? null,
                              item.quantity + 1
                            )
                          }
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(
                            item.restaurant.id,
                            item.dish?.id ?? null
                          )
                        }
                        className={styles.removeBtn}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
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