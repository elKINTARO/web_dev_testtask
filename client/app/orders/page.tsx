"use client";

import { useEffect, useState } from "react";
import { getOrders } from "@/lib/api"; 
import Map from "../[components]/map/mape";
import styles from "./style.module.css";

export default function OrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);

  useEffect(() => {
    getOrders().then(setOrders).catch(console.error);
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Accepted": return styles.statusAccepted;
      case "Completed": return styles.statusCompleted;
      case "Rejected": return styles.statusRejected;
      default: return styles.statusPending;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Order History</h1>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product Details</th>
              <th>Drone ID</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <div className={styles.productName}>{order.cafe_name}</div>
                  <div className={styles.category}>
                    {order.items.map(i => `${i.name} (x${i.quantity})`).join(", ")}
                  </div>
                </td>
                <td>
                  <span className={styles.droneId}>🛸 {order.drone_id}</span>
                </td>
                <td>
                  <div className={styles.category}>
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
      </div>

      {selectedOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.header}>
              <h2 className={styles.title}>Live Tracking - Drone {selectedOrder.drone_id}</h2>
              <button onClick={() => setSelectedOrder(null)} className={styles.mapButton}>Close</button>
            </div>
            <Map fromPos={selectedOrder.start_pos} toPos={selectedOrder.end_pos} />
          </div>
        </div>
      )}
    </div>
  );
}