import { useLogout } from "../hooks/useLogout";
import styles from "../css/Navbar.module.css";

const Navbar = () => {
  const {logout} = useLogout();

  const handleClick = () => {
    logout()
  }
  return (
    <div className={styles.topSIDE}>
    <p className={styles.name1}>FOX</p>
    <p className={styles.name2}>CONSTRUCTION CO.</p>
    <button className={styles.wowbutton} onClick={handleClick}>LOGOUT</button>
  </div>
  )
}

export default Navbar;