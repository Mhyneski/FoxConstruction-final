import React from "react";
import styles from "../css/Collection.module.css";
import Picture from "../assets/IMAGE1.jpg";

const Collection = () => {
  const collections = [
    { title: "Residential", image: Picture },
    { title: "Residential", image: Picture },
    { title: "Residential", image: Picture },
    { title: "Residential", image: Picture },
    { title: "Residential", image: Picture },
    { title: "Residential", image: Picture },
    { title: "Residential", image: Picture },
    { title: "Residential", image: Picture },
    { title: "Residential", image: Picture },
    { title: "Residential", image: Picture },
  ];

  return (
    <div className={styles.collectionContainer}>
      <h2 className={styles.header}>Our Collections</h2>
      <div className={styles.gridContainer}>
        {collections.map((collection, index) => (
          <div className={styles.collectionItem} key={index}>
            <img
              src={collection.image}
              alt={collection.title}
              className={styles.collectionImage}
            />
            <div className={styles.overlay}>
              <div className={styles.text}>{collection.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Collection;
