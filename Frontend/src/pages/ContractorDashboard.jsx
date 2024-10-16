import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from "../components/Navbar";
import styles from "../css/ContractorDashboard.module.css";
import Picture from "../assets/IMAGE1.jpg";
import ChangePasswordModal from "../components/ChangePasswordModal"; 
import { useAuthContext } from "../hooks/useAuthContext";
import axios from 'axios';

const ContractorDashboard = () => {
  const { user } = useAuthContext();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    
    const checkDefaultPassword = async () => {
      try {
        const response = await axios.get(`https://foxconstruction-final.onrender.com/api/user/is-default-password`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        
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
      await axios.patch(`https://foxconstruction-final.onrender.com/api/user/change-password`, { newPassword }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      alert("Password changed successfully.");
      setShowPasswordModal(false); 
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
        <Link to="/ProjectList" className={styles.dashboardCard}>
          <img
            src={Picture}
            alt="Project List"
            className={styles.dashboardImage}
          />
          <div className={styles.cardText}>PROJECT LISTS</div>
        </Link>
        <Link to="/Generator" className={styles.dashboardCard}>
          <img
            src={Picture}
            alt="Generate BOM"
            className={styles.dashboardImage}
          />
          <div className={styles.cardText}>GENERATE A BOM</div>
        </Link>
      </div>
    </>
  );
};

export default ContractorDashboard;
