import { useEffect, useState } from 'react';
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import styles from "../css/AdminDashboard.module.css"; // Import the CSS file
import Picture from "../assets/IMAGE1.jpg";
import ChangePasswordModal from "../components/ChangePasswordModal"; // Import the modal component
import { useAuthContext } from "../hooks/useAuthContext";
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuthContext();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    // Check if the password is still the default one
    const checkDefaultPassword = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/user/is-default-password`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        // Show the modal if the password is the default one
        if (response.data.isDefault) {
          setShowPasswordModal(true);
        }
      } catch (error) {
        console.error('Error checking default password:', error);
      }
    };

    checkDefaultPassword();
  }, [user]);

  const handlePasswordChange = async (newPassword) => {
    try {
      await axios.patch(`http://localhost:4000/api/user/change-password`, { newPassword }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      alert("Password changed successfully.");
      setShowPasswordModal(false); // Close the modal after successful change
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password.");
    }
  };

  return (
    <>
      <Navbar />
      <ChangePasswordModal 
        show={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
        onSubmit={handlePasswordChange} 
      />
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
