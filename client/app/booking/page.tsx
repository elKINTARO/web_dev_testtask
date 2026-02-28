"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./style.module.css";
import { useCart } from "@/app/context/CartContext";
import { usePackageRoute } from "@/app/context/PackageRouteContext";
import { createOrder } from "@/lib/api";

const DEFAULT_LAT = 40.7128;
const DEFAULT_LON = -74.006;

export default function Booking() {
  const { items, total, clearCart, removeItem, updateQuantity } = useCart();
  const { route: packageRoute, clearRoute } = usePackageRoute();
  const router = useRouter();
  const [endLat, setEndLat] = useState(DEFAULT_LAT);
  const [endLon, setEndLon] = useState(DEFAULT_LON);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPackageMode = !!packageRoute && items.length === 0;

  const handleBack = () => {
    if (isPackageMode) {
      clearRoute();
      router.replace("/place");
    } else {
      router.replace("/delivery");
    }
  };

  const handleConfirm = async () => {
    if (isPackageMode) {
      setSubmitting(true);
      setError(null);
      try {
        clearRoute();
        router.replace("/place");
      } catch {
        setError("Something went wrong");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (items.length === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const byCafe = items.reduce<Map<number, typeof items>>((acc, item) => {
        const cafeId = item.restaurant.id;
        if (!acc.has(cafeId)) acc.set(cafeId, []);
        acc.get(cafeId)!.push(item);
        return acc;
      }, new Map());

      for (const [, cafeItems] of byCafe) {
        await createOrder({
          cafe_id: cafeItems[0].restaurant.id,
          end_lat: endLat,
          end_lon: endLon,
          items: cafeItems.map((i) => ({
            dish_id: i.dish.id,
            quantity: i.quantity,
          })),
        });
      }

      clearCart();
      router.replace("/delivery");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create order");
    } finally {
      setSubmitting(false);
    }
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
        <h2 className={styles.title}>
          {isPackageMode ? "Package delivery" : "Choose a trip"}
        </h2>

        {isPackageMode && packageRoute && (
          <div className={styles.packageRoute}>
            <h3>Route</h3>
            <p>
              From: {packageRoute.from[0].toFixed(4)}, {packageRoute.from[1].toFixed(4)}
            </p>
            <p>
              To: {packageRoute.to[0].toFixed(4)}, {packageRoute.to[1].toFixed(4)}
            </p>
          </div>
        )}

        <div className={styles.subtotalHeader}>
          <span>Subtotal</span>
          <span className={styles.totalPrice}>
            ${isPackageMode ? "10.00" : total.toFixed(2)}
          </span>
        </div>

        {!isPackageMode && (
        <div className={styles.deliveryAddress}>
          <h3>Delivery address</h3>
          <div className={styles.coordInputs}>
            <label>
              <span>Lat</span>
              <input
                type="number"
                value={endLat}
                onChange={(e) => setEndLat(parseFloat(e.target.value) || 0)}
                step="any"
              />
            </label>
            <label>
              <span>Lon</span>
              <input
                type="number"
                value={endLon}
                onChange={(e) => setEndLon(parseFloat(e.target.value) || 0)}
                step="any"
              />
            </label>
          </div>
        </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.foodList}>
          {items.length === 0 && !isPackageMode ? (
            <p className={styles.emptyMessage}>
              No items. Add dishes from Delivery or plan a package from Place.
            </p>
          ) : items.length === 0 && isPackageMode ? (
            <p className={styles.emptyMessage}>
              Package delivery from Point A to Point B.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={`${item.restaurant.id}-${item.dish.id}`}
                className={styles.foodItem}
              >
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
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          disabled={(!isPackageMode && items.length === 0) || submitting}
        >
          {submitting
            ? "Processing..."
            : isPackageMode
              ? "Confirm Package Delivery"
              : "Choose Drone Go"}
        </button>
      </div>
    </div>
  );
}