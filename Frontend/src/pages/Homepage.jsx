import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from "../css/Homepage.module.css";
import HeroVideo from "../assets/Hevabi.mp4";

const Homepage = () => {
  const [isTextLoaded, setIsTextLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start with muted video

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTextLoaded(true);
    }, 100);

    const handleUserInteraction = () => {
      setIsMuted(false); // Unmute when user interacts
      document.removeEventListener("click", handleUserInteraction); // Remove listener after first interaction
    };

    document.addEventListener("click", handleUserInteraction);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleUserInteraction);
    };
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.leftSide}>
          <p className={styles.name1}>FOX</p>
          <p className={styles.name2}>CONSTRUCTION CO.</p>
        </div>
        <nav className={styles.rightSide}>
          <Link to="/AboutUs">ABOUT US</Link>
          <Link to="/Collection">COLLECTIONS</Link>
          <Link to="/Services">SERVICES</Link>
          <Link to="/Contacts">CONTACT US</Link>
          <Link to="/Login" className={styles.loginBtn}>LOGIN</Link>
        </nav>
      </header>

      <section className={styles.heroSection}>
        <video
          src={HeroVideo}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className={styles.heroVideo}
        ></video>
        <div className={`${styles.heroText} ${isTextLoaded ? styles.loaded : ''}`}>
          <h1>BUILDING YOUR DREAMS.</h1>
          <h2>CREATING REALITY.</h2>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
