const { default: mongoose } = require('mongoose');
const Project = require('../models/projectModel');
const User = require('../models/usersModel');

// Distribute task progress based on floor progress
const distributeTaskProgress = (floorProgress, numTasks) => {
  if (numTasks === 0) return []; // If no tasks, return an empty array
  const progressPerTask = floorProgress / numTasks;  // Distribute floor progress across tasks
  let taskProgress = new Array(numTasks).fill(0).map(() => Math.round(progressPerTask));  // Assign progress to each task, rounded
  return taskProgress;
};

// Distribute floor progress with cumulative reduction in progress for later floors
// Distribute floor progress with cumulative reduction in progress for later floors
const distributeFloorProgress = (totalProgress, numFloors, timelineInDays, daysElapsed) => {
  let floorsProgress = new Array(numFloors).fill(0);

  // Check if the project has reached 100% progress (i.e., finished)
  if (daysElapsed >= timelineInDays || totalProgress >= 100) {
    // If finished, set all floor progress to 100%
    floorsProgress = floorsProgress.map(() => 100);
    return floorsProgress;
  }

  for (let i = 0; i < numFloors; i++) {
    const daysForFloor = (timelineInDays / numFloors) * (i + 1);  // Days allocated for each floor

    // Progress reduces by 15% for each floor (custom rule for progressive reduction)
    const floorProgressReduction = 15 * i;

    if (daysElapsed >= daysForFloor) {
      floorsProgress[i] = Math.max(100 - floorProgressReduction, 0);
    } else if (daysElapsed >= (timelineInDays / numFloors) * i) {
      const floorProgress = ((daysElapsed - (timelineInDays / numFloors) * i) / (timelineInDays / numFloors)) * (100 - floorProgressReduction);
      floorsProgress[i] = Math.min(floorProgress, 100 - floorProgressReduction);
    }

    // Round progress to 0 decimal places (integer value)
    floorsProgress[i] = Math.round(floorsProgress[i]);
  }

  return floorsProgress;
};



// Calculate project-level progress and update status if necessary
const calculateProgress = async (project) => {
  const currentDate = new Date();
  const start = new Date(project.createdAt);
  const timelineInDays = project.timeline.unit === 'weeks' ? project.timeline.duration * 7 : project.timeline.duration * 30;

  const daysElapsed = Math.floor((currentDate - start) / (1000 * 60 * 60 * 24));
  const progress = Math.min((daysElapsed / timelineInDays) * 100, 100);

  // Automatically mark project as 'finished' when the timeline is completed
  if (daysElapsed >= timelineInDays && project.status === 'ongoing') {
    project.status = 'finished';
    await project.save();
  }

  return Math.round(progress);
};


// Get projects for a specific contractor
const getProjectsByContractor = async (req, res) => {
  const contractorUsername = req.user.Username;

  if (!contractorUsername) {
    return res.status(401).json({ error: "Contractor information missing in the request" });
  }

  try {
    const projects = await Project.find({ contractor: contractorUsername })
      .populate('location') 
      .sort({ createdAt: -1 });

    // Example usage within getProjectsByContractor or similar routes
projects.forEach(async (project) => {
  const totalProgress = await calculateProgress(project);
  const updatedFloorsProgress = distributeFloorProgress(
    totalProgress,
    project.floors.length,
    project.timeline.duration * (project.timeline.unit === 'weeks' ? 7 : 30),
    Math.floor((new Date() - new Date(project.createdAt)) / (1000 * 60 * 60 * 24))
  );

  project.floors.forEach((floor, index) => {
    floor.progress = updatedFloorsProgress[index];

    // Distribute progress to tasks
    const updatedTaskProgress = distributeTaskProgress(floor.progress, floor.tasks.length);
    floor.tasks.forEach((task, taskIndex) => {
      task.progress = updatedTaskProgress[taskIndex];
    });
  });

  await project.save();
});


    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new project
const createProject = async (req, res) => {
  const { name, contractor: contractorUsername, user: userUsername, floors, template, timeline, status, location, totalArea, avgFloorHeight } = req.body;

  try {
    const contractorObject = await User.findOne({ Username: contractorUsername });
    const userObject = await User.findOne({ Username: userUsername });

    if (!contractorObject || contractorObject.role !== 'contractor') {
      return res.status(403).json({ error: "The provided contractor is invalid or not a contractor." });
    }
    if (!userObject) {
      return res.status(404).json({ error: "The provided user does not exist." });
    }

    if (!["economy", "standard", "premium"].includes(template)) {
      return res.status(400).json({ error: `Invalid template: ${template}. Must be 'economy', 'standard', or 'premium'.` });
    }

    if (!location) {
      return res.status(400).json({ error: "Location is required." });
    }

    if (!totalArea || totalArea <= 0) {
      return res.status(400).json({ error: "Total area is required and must be greater than 0." });
    }

    if (!avgFloorHeight || avgFloorHeight <= 0) {
      return res.status(400).json({ error: "Average floor height is required and must be greater than 0." });
    }

    const formattedFloors = floors ? floors.map(floor => ({
      name: floor.name,
      progress: Math.round(floor.progress) || 0,
      tasks: floor.tasks ? floor.tasks.map(task => ({
        name: task.name,
        progress: Math.round(task.progress) || 0
      })) : []
    })) : [];

    const project = await Project.create({
      name,
      contractor: contractorObject.Username,
      user: userObject.Username,
      floors: formattedFloors,
      template,
      timeline,
      location,  
      totalArea,
      avgFloorHeight,
      status: status || 'ongoing'
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ error: "Failed to create project.", details: error.message });
  }
};


// Get all projects
const getProject = async (req, res) => {
  try {
    const projects = await Project.find({}).sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all projects for the logged-in user
const getProjectForUser = async (req, res) => {
  try {
    if (!req.user || !req.user.Username) {
      return res.status(401).json({ error: "User information is missing" });
    }

    const username = req.user.Username;
    const projects = await Project.find({ user: username }).sort({ createdAt: -1 });

    if (!projects.length) {
      return res.status(404).json({ message: 'No projects found for this user.' });
    }

   // Example usage within getProjectsByContractor or similar routes
projects.forEach(async (project) => {
  const totalProgress = await calculateProgress(project);
  const updatedFloorsProgress = distributeFloorProgress(
    totalProgress,
    project.floors.length,
    project.timeline.duration * (project.timeline.unit === 'weeks' ? 7 : 30),
    Math.floor((new Date() - new Date(project.createdAt)) / (1000 * 60 * 60 * 24))
  );

  project.floors.forEach((floor, index) => {
    floor.progress = updatedFloorsProgress[index];

    // Distribute progress to tasks
    const updatedTaskProgress = distributeTaskProgress(floor.progress, floor.tasks.length);
    floor.tasks.forEach((task, taskIndex) => {
      task.progress = updatedTaskProgress[taskIndex];
    });
  });

  await project.save();
});


    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Update floor progress in a project
const updateFloorProgress = async (req, res) => {
  const { progress } = req.body;
  if (progress < 0 || progress > 100) {
    return res.status(400).json({ message: 'Progress must be between 0 and 100' });
  }

  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const floor = project.floors.id(req.params.floorId);
    if (!floor) {
      return res.status(404).json({ message: 'Floor not found' });
    }

    // Round and update the progress value before saving it
    floor.progress = Math.round(progress);

    // Distribute floor progress to tasks
    const updatedTaskProgress = distributeTaskProgress(floor.progress, floor.tasks.length);
    floor.tasks.forEach((task, index) => {
      task.progress = updatedTaskProgress[index];
    });

    await project.save();

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get project by ID and update progress
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Calculate the overall project progress based on the timeline and creation date
    const currentDate = new Date();
    const start = new Date(project.createdAt);
    const timelineInDays = project.timeline.unit === 'weeks'
      ? project.timeline.duration * 7
      : project.timeline.duration * 30;

    const daysElapsed = Math.floor((currentDate - start) / (1000 * 60 * 60 * 24));
    const totalProgress = Math.min((daysElapsed / timelineInDays) * 100, 100);

    // Automatically update the project status to 'finished' if the timeline has been exceeded
    if (daysElapsed >= timelineInDays && project.status === 'ongoing') {
      project.status = 'finished';
    }

    // Distribute progress across floors based on elapsed time or mark all 100% if finished
    const updatedFloorsProgress = distributeFloorProgress(
      totalProgress,
      project.floors.length,
      timelineInDays,
      daysElapsed
    );

    // Update each floor's progress
    project.floors.forEach((floor, index) => {
      floor.progress = updatedFloorsProgress[index];

      // Distribute progress to tasks based on floor progress
      const updatedTaskProgress = distributeTaskProgress(floor.progress, floor.tasks.length);
      floor.tasks.forEach((task, taskIndex) => {
        task.progress = updatedTaskProgress[taskIndex];
      });
    });

    // Save the updated project with recalculated progress and updated status (if changed)
    await project.save();

    // Return the updated project with the new progress
    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Error fetching project' });
  }
};



// Update project progress and tasks
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the project by ID
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update floors and tasks
    if (updateData.floors) {
      updateData.floors.forEach(newFloor => {
        const existingFloor = project.floors.id(newFloor._id);
        if (existingFloor) {
          existingFloor.name = newFloor.name;
          existingFloor.progress = Math.round(newFloor.progress); // Round progress before saving

          // Update existing tasks or add new ones
          newFloor.tasks.forEach(newTask => {
            const existingTask = existingFloor.tasks.id(newTask._id);
            if (existingTask) {
              existingTask.name = newTask.name;
              existingTask.progress = Math.round(newTask.progress); // Round progress
            } else {
              // If task doesn't exist, push it as a new task
              existingFloor.tasks.push({ name: newTask.name, progress: Math.round(newTask.progress) });
            }
          });
        } else {
          // If the floor does not exist, add a new one
          project.floors.push({
            name: newFloor.name,
            progress: Math.round(newFloor.progress),
            tasks: newFloor.tasks.map(task => ({
              name: task.name,
              progress: Math.round(task.progress)
            }))
          });
        }
      });
      delete updateData.floors;
    }

    
    Object.keys(updateData).forEach(key => {
      project[key] = updateData[key];
    });

    await project.save();
    res.status(200).json(project);
  } catch (error) {
    res.status500.json({ error: "Failed to update project.", details: error.message });
  }
};

// Delete a project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update project status (ongoing/finished)
const updateProjectStatus = async (req, res) => {
  const { status } = req.body;
  if (!["ongoing", "finished"].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value. Must be "ongoing" or "finished".' });
  }

  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.status = status; // Update the project status
    const updatedProject = await project.save();

    res.status(200).json({ project: updatedProject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Save BOM to a project
const saveBOMToProject = async (req, res) => {
  const { id } = req.params;
  const { bom } = req.body;

  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!bom || !bom.categories || !bom.categories.length) {
      return res.status(400).json({ message: 'BOM must include categories and materials data' });
    }

    // Format the materials within each category 
    const formattedCategories = bom.categories.map(category => ({
      category: category.category,
      materials: category.materials.map(material => ({
        item: material.item,
        description: material.description,
        quantity: material.quantity,
        unit: material.unit,
        cost: material.cost,
        totalAmount: material.totalAmount
      }))
    }));

    // Save BOM and ensure categories and materials are correctly structured
    project.bom = {
      projectDetails: bom.projectDetails,
      categories: formattedCategories,
      originalCosts: bom.originalCosts,
      markedUpCosts: bom.markedUpCosts,
    };

    const updatedProject = await project.save();
    res.status(200).json({ project: updatedProject });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save BOM to project', details: error.message });
  }
};


module.exports = {
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
};