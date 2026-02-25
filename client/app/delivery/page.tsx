import styles from "./style.module.css";

export default function Place() {
  const restaurants = [
    {
      id: 1,
      name: "Italiano Restaurant",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
      rating: 4.8,
      category: "Italian Cuisine",
      deliveryTime: "25-35 min",
    },
    {
      id: 2,
      name: "Sushi Master",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      rating: 4.7,
      category: "Japanese Cuisine",
      deliveryTime: "30-40 min",
    },
    {
      id: 3,
      name: "Burger House",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
      rating: 4.6,
      category: "Fast Food",
      deliveryTime: "20-30 min",
    },
  ];

  return (
    <div className={styles.place}>
      <div className={styles.header}>
        <a href="#" aria-label="Back">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6.9375 13.5L13.5 21L10.5103 21L2.63527 12L10.5103 3L13.5 3L6.9375 10.5L21 10.5L21 13.5L6.9375 13.5Z" fill="black"/>
          </svg>
        </a>
        <div className={styles.search}>
          <input type="text" placeholder="Find your mood" />
          <svg
            className={styles.icon}
            viewBox="0 0 32 32"
          >
            <path d="M10.437,19.442l-7.498,7.497c-0.585,0.586 -0.585,1.536 0,2.122c0.586,0.585 1.536,0.585 2.122,-0l7.649,-7.65c1.544,0.976 3.373,1.542 5.333,1.542c5.52,-0 10,-4.481 10,-10c0,-5.52 -4.48,-10 -10,-10c-5.519,-0 -10,4.48 -10,10c0,2.475 0.902,4.741 2.394,6.489Z"/>
          </svg>
        </div>
        <a href="" className={styles.basket}>
          <svg  xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 24 24" fill="none">
            <path d="M20 10L18.5145 17.4276C18.3312 18.3439 18.2396 18.8021 18.0004 19.1448C17.7894 19.447 17.499 19.685 17.1613 19.8326C16.7783 20 16.3111 20 15.3766 20H8.62337C7.6889 20 7.22166 20 6.83869 19.8326C6.50097 19.685 6.2106 19.447 5.99964 19.1448C5.76041 18.8021 5.66878 18.3439 5.48551 17.4276L4 10M20 10H18M20 10H21M4 10H3M4 10H6M6 10H18M6 10L9 4M18 10L15 4M9 13V16M12 13V16M15 13V16" stroke="#3D4043" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>     
      </div>
      <div className={styles.categories}>
        <button>All</button>
        <button>Italian</button>
        <button>Japanese</button>
        <button>Fast Food</button>
      </div>

      <div className={styles.grid}>
        {restaurants.map((item) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.image}>
              <img src={item.image} alt={item.name} />
            </div>

            <div className={styles.content}>
              <h3>{item.name}</h3>
              <p className={styles.category}>{item.category}</p>

              <div className={styles.info}>
                <span>⭐ {item.rating}</span>
                <span>{item.deliveryTime}</span>
              </div>

              <button className={styles.viewBtn}>View Menu</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}