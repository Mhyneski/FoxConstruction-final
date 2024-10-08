import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import image from "../assets/IMAGE1.jpg";
import styles from "../css/UserDashboard.module.css";
import { useAuthContext } from "../hooks/useAuthContext";
import Navbar from "../components/Navbar";
import axios from 'axios';

const UserDashboard = () => {
  const { user } = useAuthContext(); // Updated to destructure user properly
  const [projects, setProjects] = useState([]);
  const apiUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`https://foxconstruction-backend.onrender.com/api/project/projectuser`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, [user]);

  return (
    <>
      <Navbar />
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
