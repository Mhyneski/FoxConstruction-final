import { Link } from 'react-router-dom';
import styles from "../css/Homepage.module.css";
import Picture from "../assets/IMAGE1.jpg";
import Hero from "../assets/Heropicture.jpg";

const Homepage = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.leftSide}>
          <p className={styles.name1}>FOX</p>
          <p className={styles.name2}>CONSTRUCTION CO.</p>
        </div>
        <nav className={styles.rightSide}>
          <a href="#about">ABOUT US</a>
          <a href="#collection">COLLECTION</a>
          <a href="#services">SERVICES</a>
          <a href="#contacts">CONTACTS</a>
          <Link to="/Login" className={styles.loginBtn}>LOGIN</Link>
        </nav>
      </header>

      <section className={styles.heroSection}>
        <img src={Hero} alt="Hero Image" className={styles.heroImage} />
        <div className={styles.heroText}>
          <h1>BUILDING YOUR DREAMS.</h1>
          <h2>CREATING REALITY.</h2>
        </div>
      </section>

      <section className={styles.gallerySection}>
        <div className={styles.galleryWrapper}>
          <button className={styles.arrowButton}>&#8249;</button>
          <div className={styles.gallery}>
            <img src={Picture} alt="House 1" className={styles.galleryImage} />
            <img src={Picture} alt="House 2" className={styles.galleryImage} />
            <img src={Picture} alt="House 3" className={styles.galleryImage} />
          </div>
          <button className={styles.arrowButton}>&#8250;</button>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
