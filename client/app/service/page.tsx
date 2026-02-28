"use client";
import { useLastURL } from "../[cash]/LastURL";
import styles from "./style.module.css";

export default function Service() {
  const { changeURL } = useLastURL();

  return (
    <main className={styles.mainContainer}>
      <div className={styles.header}>
        <h1>Service</h1>
      </div>

      <div className={styles.servicesMain}>
        <h1>Go anywhere, get anything</h1>
        <div className={styles.changType}>
            <a onClick={() => changeURL("delivery")} href="/delivery" className={styles.typeBox}>
                <img src="/service/salat.png" alt="" />
                <samp>food</samp>
            </a>
            <a onClick={() => changeURL("place")} href="/place" className={styles.typeBox}>
                <img src="/service/box.png" alt="" />
                <samp>Package</samp>
            </a>
        </div>
      </div>
    </main>
  );
}