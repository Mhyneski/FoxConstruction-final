const express = require('express');
const {
  getProjectsByContractor,
  createProject,
  getProject,
  getProjectById,
  updateProject,
  deleteProject,
  updateFloorProgress,
  getProjectForUser,
  updateProjectStatus,
  saveBOMToProject,
  postponeProject,
  resumeProject,
  endProject,
  startProject,
  resetFloorProgressToAutomatic
} = require('../controllers/projectController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.use(authMiddleware);

router.patch('/:id/status', updateProjectStatus);

// Get all projects for the contractor
router.get('/contractor', getProjectsByContractor);

// Get all projects for a logged-in user
router.get('/projectuser', getProjectForUser); 

// Get specific project by ID
router.get('/:id', getProjectById); 

// Get all projects
router.get('/', getProject);

// Create a new project
router.post('/', createProject);

// Delete a project
router.delete('/:id', deleteProject);

// Update a project   
router.patch('/:id', updateProject);

// Update floor progress
router.patch('/:projectId/floors/:floorId', updateFloorProgress);

router.post('/:id/bom', saveBOMToProject);

router.post('/projects/:projectId/floors/:floorId/reset', resetFloorProgressToAutomatic);

// New routes for project management actions
router.patch('/:id/start', startProject);
router.patch('/:id/postpone', postponeProject);
router.patch('/:id/resume', resumeProject);
router.patch('/:id/end', endProject);


module.exports = router;
