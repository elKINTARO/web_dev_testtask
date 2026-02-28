"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getOrders, type ApiOrderResponse } from "@/lib/api";
import styles from "./style.module.css";

const Map = dynamic(() => import("../[components]/map/mape"), { ssr: false });

export default function OrdersPage() {
  const [orders, setOrders] = useState<ApiOrderResponse[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrderResponse | null>(null);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "delivered":
        return styles.statusCompleted;
      case "flying":
        return styles.statusAccepted;
      case "lost":
      case "damaged":
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableCard}>
        <div className={styles.header}>
          <Link href="/service" className={styles.backLink}>← Back</Link>
          <h1 className={styles.title}>Order History</h1>
        </div>

        {orders.length === 0 ? (
          <div className={styles.emptyState}>No orders yet</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Route</th>
                <th>Items</th>
                <th>Total</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div className={styles.productName}>#{order.id}</div>
                    <div className={styles.category}>Cafe {order.cafe_id}</div>
                  </td>
                  <td>
                    <div className={styles.routeCell}>
                      <span>From: {order.from_lat.toFixed(2)}, {order.from_lon.toFixed(2)}</span>
                      <span>To: {order.to_lat.toFixed(2)}, {order.to_lon.toFixed(2)}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.category}>
                      {order.order_summary.flatMap((c) =>
                        c.items.map((i) => `Dish ${i.dish_id}×${i.quantity}`)
                      ).join(", ")}
                    </div>
                  </td>
                  <td>
                    <span className={styles.totalCell}>${order.total_amount.toFixed(2)}</span>
                  </td>
                  <td>
                    <div className={styles.category}>
                      {new Date(order.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.mapButton}
                      onClick={() => setSelectedOrder(order)}
                    >
                      Track Map
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.header}>
              <h2 className={styles.title}>
                Order #{selectedOrder.id} — Route
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className={styles.mapButton}
              >
                Close
              </button>
            </div>
            <div className={styles.modalRoute}>
              <p>
                <strong>From:</strong> {selectedOrder.from_lat.toFixed(4)}, {selectedOrder.from_lon.toFixed(4)}
              </p>
              <p>
                <strong>To:</strong> {selectedOrder.to_lat.toFixed(4)}, {selectedOrder.to_lon.toFixed(4)}
              </p>
            </div>
            <div className={styles.modalOrderSummary}>
              {selectedOrder.order_summary.map((c) => (
                <div key={c.cafe_id}>
                  <strong>Cafe {c.cafe_id}:</strong>{" "}
                  {c.items.map((i) => `Dish ${i.dish_id}×${i.quantity}`).join(", ")}
                </div>
              ))}
            </div>
            <div className={styles.modalMap}>
              <Map
                fromPos={[selectedOrder.from_lat, selectedOrder.from_lon]}
                toPos={[selectedOrder.to_lat, selectedOrder.to_lon]}
                height={350}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}