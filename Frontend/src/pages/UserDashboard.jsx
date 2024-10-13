import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import image from "../assets/IMAGE1.jpg";
import styles from "../css/UserDashboard.module.css";
import { useAuthContext } from "../hooks/useAuthContext";
import Navbar from "../components/Navbar";
import ChangePasswordModal from "../components/ChangePasswordModal"; // Import the modal component
import axios from 'axios';

// Progress calculation function
const calculateProgress = (createdAt, timeline) => {
  const currentDate = new Date();
  const start = new Date(createdAt); // Use createdAt as the start date
  const timelineInDays = timeline.unit === 'weeks'
    ? timeline.duration * 7
    : timeline.duration * 30; // Approximate months as 30 days

  const daysElapsed = Math.floor((currentDate - start) / (1000 * 60 * 60 * 24)); // Difference in days
  const progress = Math.min((daysElapsed / timelineInDays) * 100, 100); // Cap at 100%

  return progress.toFixed(2); // Return progress as a percentage
};

const UserDashboard = () => {
  const { user } = useAuthContext();
  const [projects, setProjects] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false); // Initially hide the modal

  useEffect(() => {
    // Fetch projects when component loads
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/project/projectuser`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        const projectsWithProgress = response.data.map(project => ({
          ...project,
          progress: calculateProgress(project.createdAt, project.timeline)
        }));
        setProjects(projectsWithProgress);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();

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
      <div className={styles.NameBanner}>
        {user && <p>WELCOME BACK, {user.Username}!</p>}
      </div>
      <div className={styles.cardContainer}>
        {projects.length > 0 ? (
          projects.map(project => (
            <Link to={`/project/${project._id}`} key={project._id} className={styles.card}>
              <img src={image} alt={project.name} />
              <div className={styles.cardContent}>
                <h1>{project.name}</h1>
                <div className={styles.projectInfo}>
                  <p>{project.status === 'finished' ? 'Finished' : 'Ongoing'}</p>
                </div>
                {/* Display overall progress below the status */}
                <div className={styles.projectProgress}>
                  <p>Overall Progress: {project.progress}%</p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p>No projects available for this user.</p>
        )}
      </div>
    </>
  );
};

export default UserDashboard;
