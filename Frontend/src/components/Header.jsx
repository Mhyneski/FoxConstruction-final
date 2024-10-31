import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from "../css/Homepage.module.css"; 

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSide}>
        <Link to="/" className={styles.logoLink}> 
          <p className={styles.name1}>FOX</p>
          <p className={styles.name2}>CONSTRUCTION CO.</p>
        </Link>
      </div>

      <nav className={`${styles.rightSide} ${menuOpen ? styles.open : ''}`}>
        <Link to="/AboutUs">ABOUT US</Link>
        <Link to="/Collection">COLLECTIONS</Link>
        <Link to="/Services">SERVICES</Link>
        <Link to="/Contacts">CONTACT US</Link>
        <Link to="/Login" className={styles.loginBtn}>LOGIN</Link>
      </nav>

      <div className={styles.hamburger} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </header>
  );
};

export default Header;
