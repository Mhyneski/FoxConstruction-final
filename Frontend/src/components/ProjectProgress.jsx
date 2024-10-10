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

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/project/${projectId}`, {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        });

        const fetchedProject = response.data;
        setProject(fetchedProject);
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
      <p className={styles.progressTitle}>STATUS: {project.status.toUpperCase()}</p>
      
      {/* Scrollable floors container */}
      <div className={styles.floorsContainer}>
        {project.floors.map(floor => (
          <div key={floor._id} className={`${styles.floor} ${selectedFloor === floor._id ? styles.selected : ''}`}>
            <div className={styles.floorHeader} onClick={() => handleFloorClick(floor._id)}>
              <h3 className={styles.floorTitle}>{floor.name}</h3>
              <div className={styles.progressBar}>
                <div
                  className={styles.progress}
                  style={{ width: `${floor.progress}%` }}
                >
                  {floor.progress.toFixed(2)}%  
                </div>
              </div>
            </div>
            {selectedFloor === floor._id && (
              <div className={styles.tasks}>
                <h3 className={styles.tasksTitle}>TASK</h3>
                <ul className={styles.taskList}>
                  {floor.tasks.map(task => (
                    <li key={task._id} className={styles.taskItem}>
                      <span className={styles.taskName}>{task.name}</span>
                      <div className={styles.taskProgressBar}>
                        <div
                          className={styles.taskProgress}
                          style={{ width: `${task.progress}%` }}
                        >
                          {task.progress.toFixed(2)}%
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className={styles.lastUpdate}>LAST UPDATE: {new Date(project.updatedAt).toLocaleDateString()}</p>
    </div>
  );
};

export default ProjectProgress;