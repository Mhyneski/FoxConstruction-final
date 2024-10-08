import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import styles from "../css/ProjectProgress.module.css";
import { useAuthContext } from "../hooks/useAuthContext"; 
import Navbar from './Navbar';

const ProjectProgress = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const { user } = useAuthContext();
  const apiUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`https://foxconstruction-backend.onrender.com/api/project/${projectId}`, {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        });
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    if (user?.token) {
      fetchProject();
    }
  }, [projectId, user?.token]);

  const handleFloorClick = (floorId) => {
    setSelectedFloor(selectedFloor === floorId ? null : floorId);
  };

  if (!project) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.header}>
        <h1 className={styles.title}>{project.name.toUpperCase()}</h1>
      </div>
      <h2 className={styles.progressTitle}>PROGRESS</h2>
      <div className={styles.floorsContainer}>
        {project.floors.map(floor => (
          <div key={floor._id} className={styles.floor}>
            <div className={styles.floorHeader} onClick={() => handleFloorClick(floor._id)}>
              <h3 className={styles.floorTitle}>{floor.name}</h3>
              <div className={styles.progressBar}>
                <div
                  className={styles.progress}
                  style={{ width: `${floor.progress}%` }}
                >
                  {floor.progress}% DONE
                </div>
              </div>
            </div>
            {selectedFloor === floor._id && (
              <div className={styles.tasks}>
                <h3 className={styles.tasksTitle}>TASKS:</h3>
                <ul className={styles.taskList}>
                  {floor.tasks.map(task => (
                    <li key={task._id} className={styles.taskItem}>
                      <span className={styles.taskName}>{task.name}</span>
                      <span className={styles.taskProgress}>{task.progress}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className={styles.lastUpdate}>Last Update: {new Date(project.updatedAt).toLocaleDateString()}</p>
    </div>
  );
};

export default ProjectProgress;
