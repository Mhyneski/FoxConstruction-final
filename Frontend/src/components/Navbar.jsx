import { useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";
import { useNavigate } from "react-router-dom";
import styles from "../css/Navbar.module.css";
import { FaUserCircle, FaHome } from 'react-icons/fa';

const Navbar = () => {
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    logout();
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleDashboardNavigation = () => {
    if (user.role === "contractor") {
      navigate("/ContractorDashboard");
    } else if (user.role === "user") {
      navigate("/UserDashboard");
    } else if (user.role === "admin") {
      navigate("/AdminDashboard");
    }
  };

  return (
    <div className={styles.topSIDE}>
      <div className={styles.companyInfo}>
        <p className={styles.name1}>FOX</p>
        <p className={styles.name2}>CONSTRUCTION CO.</p>
      </div>

      {/* Center Content */}
      <div className={styles.centerContent} onClick={handleDashboardNavigation}>
        <FaHome className={styles.homeIcon} />
        <span className={styles.goToHomeText}>Dashboard</span>
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
