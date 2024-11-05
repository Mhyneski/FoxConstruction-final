// src/components/ProjectProgress.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
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
        const response = await axios.get(`http://localhost:4000/api/project/${projectId}`, {
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
      <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
        <CircularProgress />
        <Typography variant="body1" mt={2}>
          Loading project details...
        </Typography>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography variant="h6">Project not found.</Typography>
      </Box>
    );
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
        <Typography variant="h4" gutterBottom className={styles.title}>
          {project.name ? project.name.toUpperCase() : 'Untitled Project'}
        </Typography>
        <Typography className={styles.dateTitle} variant="body1" gutterBottom>
          Started on: {startDate}
        </Typography>
        <Typography variant="body1" gutterBottom className={styles.progressTitle}>
          STATUS: {project.status ? project.status.toUpperCase() : 'UNKNOWN'}
        </Typography>

        <Box mt={8}>
          {project.floors &&
            project.floors.map((floor) => (
              <Accordion
                key={floor._id}
                expanded={selectedFloor === floor._id}
                onChange={() => handleFloorClick(floor._id)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box width="100%" display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">{floor.name}</Typography>
                    <Box width="40%">
                      <LinearProgress
                        variant="determinate"
                        value={floor.progress || 0}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          [`& .MuiLinearProgress-bar`]: {
                            backgroundColor: '#a7b194',
                          },
                          backgroundColor: '#e0e0e0',
                        }}
                      />
                      <Typography variant="body2" color="textSecondary" align="center">
                        {Math.round(floor.progress || 0)}%
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="h6">Tasks</Typography>
                  {floor.tasks &&
                    floor.tasks.map((task) => (
                      <Box key={task._id} mb={2}>
                        <Typography variant="body1">{task.name}</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={task.progress || 0}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            [`& .MuiLinearProgress-bar`]: {
                              backgroundColor: '#a7b194',
                            },
                            backgroundColor: '#e0e0e0',
                          }}
                        />
                        <Typography variant="body2" align="center">
                          {task.progress?.toFixed(2)}%
                        </Typography>
                      </Box>
                    ))}
                </AccordionDetails>
              </Accordion>
            ))}
        </Box>

        <Typography variant="body2" color="textSecondary" mt={4}>
          LAST UPDATE:{' '}
          {project.updatedAt
            ? new Date(project.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : 'No updates available'}
        </Typography>
      </Box>
    </div>
  );
};

export default ProjectProgress;
