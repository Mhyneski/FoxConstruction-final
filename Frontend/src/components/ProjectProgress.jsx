import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuthContext } from '../hooks/useAuthContext';
import Navbar from './Navbar';
import styles from '../css/ProjectProgress.module.css';

const ProjectProgress = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`https://foxconstruction-final.onrender.com/api/project/${projectId}`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });

        const fetchedProject = response.data.project || response.data;
        setProject(fetchedProject);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.token) {
      fetchProject();
    }
  }, [projectId, user?.token]);

  const handleFloorClick = (floorId) => {
    setSelectedFloor(selectedFloor === floorId ? null : floorId);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingSpinnerContainer}>
        <div className={styles.spinner}></div>
        <p>Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return <div className={styles.loading}>Project not found.</div>;
  }

  const startDate = new Date(project.startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={styles.container}>
      <Navbar />
      <Box p={3}>
        <Typography variant="h4" gutterBottom className={styles.title}>{project.name ? project.name.toUpperCase() : 'Untitled Project'}</Typography>
        <Typography variant="body1" gutterBottom className={styles.dateTitle}>Started on: {startDate}</Typography>
        <Typography variant="body1" gutterBottom className={styles.progressTitle}>STATUS: {project.status ? project.status.toUpperCase() : 'UNKNOWN'}</Typography>

        <Box mt={4} className={styles.floorsContainer}>
          {project.floors && project.floors.map((floor) => (
            <Accordion
              key={floor._id}
              expanded={selectedFloor === floor._id}
              onChange={() => handleFloorClick(floor._id)}
              className={styles.floor}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.floorHeader}>
                <Box width="100%" display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6" className={styles.floorTitle}>{floor.name}</Typography>
                  <Box width="40%">
                    <LinearProgress variant="determinate" value={floor.progress || 0} className={styles.progressBar} />
                    <Typography variant="body2" color="textSecondary" align="center">
                      {Math.round(floor.progress || 0)}%
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails className={styles.tasks}>
                <Typography variant="h6" className={styles.tasksTitle}>Tasks</Typography>
                {floor.tasks && floor.tasks.map((task) => (
                  <Box key={task._id} mb={2} className={styles.taskItem}>
                    <Typography variant="body1" className={styles.taskName}>{task.name}</Typography>
                    <LinearProgress variant="determinate" value={task.progress || 0} className={styles.taskProgressBar} />
                    <Typography variant="body2" color="textSecondary" align="center">
                      {task.progress?.toFixed(2)}%
                    </Typography>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Typography variant="body2" color="textSecondary" mt={4} className={styles.lastUpdate}>
          LAST UPDATE: {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }) : 'No updates available'}
        </Typography>
      </Box>
    </div>
  );
};

export default ProjectProgress;