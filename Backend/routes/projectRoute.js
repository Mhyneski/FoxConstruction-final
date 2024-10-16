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
  saveBOMToProject // Ensure to import the controller function
} = require('../controllers/projectController');
const { authMiddleware } = require('../middlewares/authMiddleware');


const router = express.Router();

router.use(authMiddleware);

router.patch('/:id/status', updateProjectStatus);

// Get all projects for the contractor
router.get('/contractor', getProjectsByContractor);

// Get all projects for a logged-in user
router.get('/projectuser', getProjectForUser); // This should be above the `:id` route

// Get specific project by ID
router.get('/:id', getProjectById); // This should be after other specific routes

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

module.exports = router;
