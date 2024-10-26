import React from 'react';
import styles from '../css/Contacts.module.css';
import { FaPhoneAlt, FaEnvelope, FaFacebookF } from 'react-icons/fa';

const Contacts = () => {
  return (
    <div className={styles.contactsContainer}>
      <div className={styles.header}>
        <h1>FOX CONSTRUCTION</h1>
      </div>
      <div className={styles.contactDetails}>
        <p className={styles.subHeading}>Have a project in mind?</p>
        <h2 className={styles.heading}>CONTACT US</h2>
        <p className={styles.address}>37 G. MANALO STREET, PATEROS, METRO MANILA</p>
        <div className={styles.contactInfo}>
          <div className={styles.phone}>
            <FaPhoneAlt /> 642-5310 <br /> 09192134577
          </div>
          <div className={styles.email}>
            <FaEnvelope /> foxcondesignandbuild@gmail.com
          </div>
          <div className={styles.social}>
            <FaFacebookF /> <a href="https://www.facebook.com/foxconst" target="_blank" className={styles.facebook}>Fox Construction</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
