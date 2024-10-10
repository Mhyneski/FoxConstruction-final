import React from 'react';
import styles from '../css/aboutUs.module.css';
import personImage from '../assets/contractor.jpg'; // Replace with your actual image path

const AboutUs = () => {
  return (
    <div className={styles.aboutUsContainer}>
      <div className={styles.header}>
        <h2>About Us</h2>
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.textContainer}>
          <h1>Welcome To Fox Construction Company</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa.
            Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo
            magna eros quis urna. Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus. Pellentesque
            habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin pharetra
            nonummy pede. Mauris et orci. Aenean nec lorem. In porttitor.
          </p>
          <div className={styles.signature}>
            <p>Hector Manalo</p>
          </div>
        </div>
        <div className={styles.imageContainer}>
          <img src={personImage} alt="Hector Manalo" />
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
