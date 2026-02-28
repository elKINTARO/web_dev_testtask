"use client";

import { useEffect } from "react";
import styles from "./style.module.css";

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export default function Toast({
  message,
  visible,
  onHide,
  duration = 2500,
}: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(onHide, duration);
    return () => clearTimeout(id);
  }, [visible, onHide, duration]);

  if (!visible) return null;

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span className={styles.check}>✓</span>
      {message}
    </div>
  );
}
