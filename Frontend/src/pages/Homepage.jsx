import { useState, useEffect } from 'react';
import styles from "../css/Homepage.module.css";
import HeroVideo from "../assets/Hevabi.mp4";
import Header from '../components/Header'

const Homepage = () => {
  const [isTextLoaded, setIsTextLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTextLoaded(true);
    }, 100);

    const handleUserInteraction = () => {
      setIsMuted(false);
      document.removeEventListener("click", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleUserInteraction);
    };
  }, []);

  return (
    <div className={styles.container}>
      <Header />
      
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
