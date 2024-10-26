import React, { useEffect, useState } from 'react';
import styles from '../css/AboutUs.module.css';
import personImage from '../assets/HECTOR.jpeg';

const AboutUs = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true); // Set visible for content only after component mounts
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.aboutUsContainer}>
      <div className={styles.header}>
        <h2>About Us</h2>
      </div>
      <div className={styles.contentContainer}>
        <div className={`${styles.textContainer} ${isVisible ? styles.visible : ''}`}>
          <h1>Welcome To Fox Construction Company</h1>
          <p>
            Since 1999, Fox Construction has been quietly building a reputation in Pateros—literally.
            We don’t say much; we let the hammer do the talking. Founded by Hector Manalo, we bring
            expert craftsmanship to every project, covering all bases: carpentry, masonry, metal works,
            painting, plumbing, electrical, air conditioning, and landscaping. Whether you’re renovating
            or building from the ground up, we’re here to turn your vision into rock-solid reality.
            Quality, reliability, and precision—that’s the Fox Construction promise.
          </p>
          <div className={styles.signature}>
            <p>Hector Manalo</p>
          </div>
        </div>
        <div className={`${styles.imageContainer} ${isVisible ? styles.visible : ''}`}>
          <img src={personImage} alt="Hector Manalo" />
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
