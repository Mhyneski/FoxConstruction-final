import React from 'react';
import styles from '../css/Services.module.css';
import Header from '../components/Header'

const Services = () => {
  return (
    <>
    <Header/>
    <div className={styles.servicesContainer}>
      <h1 className={styles.title}>COMPREHENSIVE SERVICES</h1>
      <h2 className={styles.subtitle}>Design and Build</h2>
      <p className={styles.description}>
        CARPENTRY, MASONRY, METAL WORKS, PAINTING, PLUMBING, ELECTRICAL, AIRCONDITIONING, LANDSCAPING
      </p>
    </div>
    </>
  );
};

export default Services;
