"use client";

import { useEffect, useState } from "react";
import { getOrders, ApiOrder, importOrdersCsv } from "@/lib/api"; 
import Map from "../[components]/map/mape";
import styles from "./style.module.css";

export default function OrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [number, setNumber] = useState(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getOrders().then(setOrders).catch(console.error);
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "delivered": return styles.statusAccepted;
      case "flying": return styles.statusCompleted;
      case "lost":
      case "damaged": return styles.statusRejected;
      default: return styles.statusPending;
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
              </tr>
            ))}
          </tbody>
        </table>
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
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.header}>
              <h2 className={styles.title}>Route Tracking - Order #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} className={styles.mapButton}>Close</button>
            </div>
            <Map 
              fromPos={[40.7128, -74.0060]}
              toPos={[selectedOrder.end_lat, selectedOrder.end_lon]} 
            />
          </div>
        </div>
      )}
    </div>
  );
}