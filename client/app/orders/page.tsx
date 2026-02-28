"use client";

import { useEffect, useState } from "react";
import { getOrders, ApiOrder, importOrdersCsv, type ApiOrderResponse } from "@/lib/api"; 
import Map from "../[components]/map/mape";
import Link from "next/link";
import dynamic from "next/dynamic";
import styles from "./style.module.css";

const Map = dynamic(() => import("../[components]/map/mape"), { ssr: false });

export default function OrdersPage() {
  const [orders, setOrders] = useState<ApiOrderResponse[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrderResponse | null>(null);
  const [number, setNumber] = useState(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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

    const handleImport = async () => {
      if (!selectedFile && number == 0) return;
      setUploading(true);
      try {
        await importOrdersCsv(number, selectedFile);
        setIsImportModalOpen(false);
        setSelectedFile(null);
      } catch (err) {
        console.log(err);
        
      } finally {
        setUploading(false);
      }
    };

  return (
    <div className={styles.container}>
      <div className={styles.tableCard}>
        <div className={styles.header}>
            <h1 className={styles.title}>Order History</h1>
            <button 
                className={styles.importBtn} 
                onClick={() => setIsImportModalOpen(true)}
            >
                + Import CSV
            </button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Destination</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <div className={styles.productName}>Order #{order.id}</div>
                  <div className={styles.category}>
                    {new Date(order.timestamp).toLocaleString()}
                  </div>
                </td>
                <td>
                  <div className={styles.droneId}>
                    📍 {order.end_lat.toFixed(4)}, {order.end_lon.toFixed(4)}
                  </div>
                  <div className={styles.category}>{order.distance_km.toFixed(2)} km away</div>
                </td>
                <td>
                  <div className={styles.productName}>${order.total_amount.toFixed(2)}</div>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <button 
                    className={styles.mapButton}
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Route
                  </button>
                </td>
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


      {isImportModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalImport}>
            <h2 className={styles.title}>Import Orders</h2>
            <p className={styles.category}>Choose a CSV file to upload orders to the database and write cafe id.</p>

            <input
                className={styles.cafeInput}
                type="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
            />
            <input 
              type="file" 
              accept=".csv"
              className={styles.fileInput}
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />

            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setIsImportModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.submitBtn}
                onClick={handleImport}
                disabled={!selectedFile || number <= 0 || uploading}
              >
                {uploading ? "Processing..." : "Upload CSV"}
              </button>
            </div>
          </div>
        </div>
      )}

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