import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import styles from "../css/AdminDashboard.module.css"; // Import the CSS file
import Picture from "../assets/IMAGE1.jpg";

const AdminDashboard = () => {
  return (
    <>
      <Navbar />
      <div className={styles.dashboardContainer}>
        <Link to="/Accounts" className={styles.dashboardLink}>
          <img
            src={Picture}
            alt="Account Management"
            className={styles.dashboardImage}
          />
          <div className={styles.dashboardOverlay}>
            <div className={styles.dashboardText}>Account List</div>
          </div>
        </Link>
        <Link to="/Materials" className={styles.dashboardLink}>
          <img
            src={Picture}
            alt="Materials"
            className={styles.dashboardImage}
          />
          <div className={styles.dashboardOverlay}>
            <div className={styles.dashboardText}>Edit Material Prices</div>
          </div>
        </Link>
        <Link to="/Location" className={styles.dashboardLink}>
          <img
            src={Picture}
            alt="Locations"
            className={styles.dashboardImage}
          />
          <div className={styles.dashboardOverlay}>
            <div className={styles.dashboardText}>Edit Location Markups</div>
          </div>
        </Link>
      </div>
    </>
  );
};

export default AdminDashboard;
