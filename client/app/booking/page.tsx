import styles from "./style.module.css";
import Map from "../[components]/map/mape";

export default function Booking() {
  return (
    <div className={styles.container}>
        <div className={styles.mapSection}>
            <div className={styles.mapOverlay}>
            <a href="#" aria-label="Back">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M6.9375 13.5L13.5 21L10.5103 21L2.63527 12L10.5103 3L13.5 3L6.9375 10.5L21 10.5L21 13.5L6.9375 13.5Z" fill="black"/>
                </svg>
            </a>
            <div className={styles.topButtons}>
                <button className={styles.helpBtn}>Help</button>
                <button className={styles.moreBtn}>•••</button>
            </div>
            </div>
            <div className={styles.mapPlaceholder}></div>
        </div>
        <div className={styles.content}>
            <div className={styles.dragHandle}></div>
            <h2 className={styles.title}>Choose a trip</h2>

            <div className={styles.subtotalHeader}>
            <span>Subtotal</span>
            <span className={styles.totalPrice}>$37</span>
            </div>

            <div className={styles.foodList}>
            <div className={styles.foodItem}>
                <img src="food/Rectangle 5.png" alt="Churros" />
                <div>
                <p>Churros</p>
                <small>$6.99</small>
                </div>
            </div>
            <div className={styles.moreItems}>•••</div>
            </div>

            <div className={styles.droneCard}>
            <div className={styles.droneInfo}>
                <div className={styles.droneText}>
                <img src="drone/drone.png" alt="Drone" className={styles.droneIcon} />
                <h3>Drone Go</h3>
                <p>9:03pm • will arrive at 17 min</p>
                </div>
                <div className={styles.dronePrice}>
                <span className={styles.mainPrice}>$10</span>
                <span className={styles.taxText}>Tax: 7$</span>
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

            <button className={styles.mainButton}>Choose Dron Go</button>
        </div>
    </div>
  );
}