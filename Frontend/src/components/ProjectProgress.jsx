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

        const fetchedProject = response.data.project || response.data; // Depending on API response format
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

  // Format the start date (createdAt) in the desired format
  const startDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.header}>
        {/* Ensure project.name and project.status exist before rendering */}
        <h1 className={styles.title}>{project.name ? project.name.toUpperCase() : 'Untitled Project'}</h1>
      </div>
      <p className={styles.dateTitle}>Started on: {startDate}</p>
      <p className={styles.progressTitle}>STATUS: {project.status ? project.status.toUpperCase() : 'UNKNOWN'}</p>
      
      {/* Scrollable floors container */}
      <div className={styles.floorsContainer}>
        {project.floors && project.floors.map((floor, index) => {
          // Use the stored progress from the database for floors and tasks
          const floorProgress = floor.progress || 0;
          const taskProgress = floor.tasks.map(task => task.progress || 0);

          return (
            <div key={floor._id} className={`${styles.floor} ${selectedFloor === floor._id ? styles.selected : ''}`}>
              <div className={styles.floorHeader} onClick={() => handleFloorClick(floor._id)}>
                <h3 className={styles.floorTitle}>{floor.name}</h3>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progress}
                    style={{ width: `${floorProgress}%` }}
                  >
                    {floorProgress.toFixed(2)}%  
                  </div>
                </div>
              </div>
              {selectedFloor === floor._id && (
                <div className={styles.tasks}>
                  <h3 className={styles.tasksTitle}>TASK</h3>
                  <ul className={styles.taskList}>
                    {floor.tasks && floor.tasks.map((task, taskIndex) => (
                      <li key={task._id} className={styles.taskItem}>
                        <span className={styles.taskName}>{task.name}</span>
                        <div className={styles.taskProgressBar}>
                          <div
                            className={styles.taskProgress}
                            style={{ width: `${taskProgress[taskIndex]}%` }}
                          >
                            {taskProgress[taskIndex].toFixed(2)}%
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className={styles.lastUpdate}>LAST UPDATE: {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'N/A'}</p>
    </div>
  );
};

export default ProjectProgress;
