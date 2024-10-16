import { useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext"; // Import the user context
import { useLogout } from "../hooks/useLogout";
import styles from "../css/Navbar.module.css";
import { FaUserCircle } from 'react-icons/fa'; // You can use a profile icon from react-icons or any other library

const Navbar = () => {
  const { logout } = useLogout();
  const { user } = useAuthContext(); // Get the logged-in user
  const [dropdownOpen, setDropdownOpen] = useState(false); // State to toggle the dropdown

  const handleClick = () => {
    logout();
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className={styles.topSIDE}>
      <div className={styles.companyInfo}>
        <p className={styles.name1}>FOX</p>
        <p className={styles.name2}>CONSTRUCTION CO.</p>
      </div>
      
      <div className={styles.userInfo}>
        <p className={styles.username}>Hi, {user && user.Username}</p>
        <FaUserCircle className={styles.profileIcon} onClick={toggleDropdown} />
        {dropdownOpen && (
          <div className={styles.dropdownMenu}>
            <button className={styles.logoutButton} onClick={handleClick}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
