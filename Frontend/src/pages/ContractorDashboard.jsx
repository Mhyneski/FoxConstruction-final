import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import styles from "../css/ContractorDashboard.module.css";
import Picture from "../assets/IMAGE1.jpg";


const ContractorDashboard = () => {
  return (
    <>
      <Navbar />
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
