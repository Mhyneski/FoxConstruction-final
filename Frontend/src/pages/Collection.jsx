import React, { useState, useEffect } from "react";
import styles from "../css/Collection.module.css";
import Image1 from "../assets/IMAGE1.jpg";
import Image2 from "../assets/IMAGE2.jpg";
import Image3 from "../assets/IMAGE3.jpg";
import Image4 from "../assets/IMAGE4.jpg";
import Image5 from "../assets/IMAGE5.jpg";
import Image6 from "../assets/IMAGE6.jpg";
import Header from '../components/Header'

const Collection = () => {
  const collections = [
    { title: "Residential 1", image: Image1 },
    { title: "Residential 2", image: Image2 },
    { title: "Residential 3", image: Image3 },
    { title: "Residential 4", image: Image4 },
    { title: "Residential 5", image: Image5 },
    { title: "Residential 6", image: Image6 },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % collections.length);
    }, 2000); // 1 second

    return () => clearInterval(interval); // Clean up interval on unmount
  }, [collections.length]);

  // Handler for when a dot is clicked
  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className={styles.collectionContainer}>
      <Header/>
      <h2 className={styles.header}>Our Collections</h2>
      <div className={styles.carousel}>
        <div className={styles.carouselInner} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
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
      <div className={styles.dots}>
        {collections.map((_, index) => (
          <span
            key={index}
            className={`${styles.dot} ${currentIndex === index ? styles.active : ""}`}
            onClick={() => handleDotClick(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Collection;
