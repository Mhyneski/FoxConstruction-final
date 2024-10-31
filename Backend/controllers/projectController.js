const { default: mongoose } = require('mongoose');
const Project = require('../models/projectModel');
const User = require('../models/usersModel');
const Template = require('../models/templatesModel');

const distributeTaskProgress = (floorProgress, numTasks) => {
  if (numTasks === 0) return []; 
  const progressPerTask = floorProgress / numTasks;  
  let taskProgress = new Array(numTasks).fill(0).map(() => Math.round(progressPerTask));  
  return taskProgress;
};

const distributeFloorProgress = (totalProgress, numFloors, timelineInDays, daysElapsed, floors) => {
  let floorsProgress = new Array(numFloors).fill(0);

  if (daysElapsed >= timelineInDays || totalProgress >= 100) {
    floorsProgress = floorsProgress.map((_, index) => {
      return floors[index].isManual ? floors[index].progress : 100;
    });
    return floorsProgress;
  }

  for (let i = 0; i < numFloors; i++) {
    if (floors[i].isManual) {
      floorsProgress[i] = floors[i].progress;
      continue;
    }

    const daysForFloor = (timelineInDays / numFloors) * (i + 1);  
    const floorProgressReduction = 15 * i;

    if (daysElapsed >= daysForFloor) {
      floorsProgress[i] = Math.max(100 - floorProgressReduction, 0);
    } else if (daysElapsed >= (timelineInDays / numFloors) * i) {
      const floorProgress = ((daysElapsed - (timelineInDays / numFloors) * i) / (timelineInDays / numFloors)) * (100 - floorProgressReduction);
      floorsProgress[i] = Math.min(floorProgress, 100 - floorProgressReduction);
    }

    floorsProgress[i] = Math.round(floorsProgress[i]);
  }

  return floorsProgress;
};


const calculateProgress = async (project) => {
  
  if (project.isManualProgress) {
    return project.progress;
  }

  // Do not calculate progress if the project is postponed
  if (project.status === 'postponed') {
    return project.progress;
  }

  const currentDate = new Date();
  const referenceDate = new Date(project.referenceDate);
  const timelineInDays = project.timeline.unit === 'weeks' ? project.timeline.duration * 7 : project.timeline.duration * 30;

  const daysElapsed = Math.floor((currentDate - referenceDate) / (1000 * 60 * 60 * 24));
  let progress = Math.min((daysElapsed / timelineInDays) * 100, 100);

  // Apply progress offset if necessary
  progress += project.progressOffset || 0;
  progress = Math.min(progress, 100); // Ensure it doesn't exceed 100%

  // Automatically mark project as 'finished' when the timeline is completed
  if (daysElapsed >= timelineInDays && project.status === 'ongoing') {
    project.status = 'finished';
    await project.save();
  }

  // Update project-level progress only if not manually set
  if (!project.isManualProgress) {
    project.progress = Math.round(progress);
    // Update referenceDate to current date for next calculation
    project.referenceDate = currentDate;
    await project.save();
  }

  return Math.round(project.progress);
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

    // Process each project sequentially to handle async operations correctly
    for (const project of projects) {
      // Calculate total progress respecting manual flags
      const totalProgress = await calculateProgress(project);

      // Calculate days elapsed based on referenceDate
      const daysElapsed = Math.floor((new Date() - new Date(project.referenceDate)) / (1000 * 60 * 60 * 24));

      const updatedFloorsProgress = distributeFloorProgress(
        totalProgress,
        project.floors.length,
        project.timeline.duration * (project.timeline.unit === 'weeks' ? 7 : 30),
        daysElapsed,
        project.floors
      );

      // Update each floor and its tasks
      project.floors.forEach((floor, index) => {
        if (!floor.isManual) {
          floor.progress = updatedFloorsProgress[index];

          // Distribute progress to tasks, respecting task-level manual flags
          const updatedTaskProgress = distributeTaskProgress(floor.progress, floor.tasks.length);
          floor.tasks.forEach((task, taskIndex) => {
            if (!task.isManual) {
              task.progress = updatedTaskProgress[taskIndex];
            }
          });
        }
      });

      await project.save();
    }

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new project
const createProject = async (req, res) => {
  const { 
    name, 
    contractor: contractorUsername, 
    user: userUsername, 
    floors, 
    template, 
    timeline, 
    status, 
    location, 
    totalArea, 
    avgFloorHeight, 
    roomCount, 
    foundationDepth 
  } = req.body;

  try {
    // Fetch contractor and user by username
    const contractorObject = await User.findOne({ Username: contractorUsername });
    const userObject = await User.findOne({ Username: userUsername });

    // Check contractor role
    if (!contractorObject || contractorObject.role !== 'contractor') {
      return res.status(403).json({ error: "The provided contractor is invalid or not a contractor." });
    }
    if (!userObject) {
      return res.status(404).json({ error: "The provided user does not exist." });
    }

    // Find the template by ID
    const templateObject = await Template.findById(template);
    if (!templateObject) {
      return res.status(404).json({ error: "Template not found." });
    }

    // Validate required fields
    if (!location) {
      return res.status(400).json({ error: "Location is required." });
    }
    if (!totalArea || totalArea <= 0) {
      return res.status(400).json({ error: "Total area is required and must be greater than 0." });
    }
    if (!avgFloorHeight || avgFloorHeight <= 0) {
      return res.status(400).json({ error: "Average floor height is required and must be greater than 0." });
    }
    if (!foundationDepth || foundationDepth <= 0) {
      return res.status(400).json({ error: "Foundation depth is required and must be greater than 0." });
    }
    if (!roomCount || roomCount <= 0) {
      return res.status(400).json({ error: "Room count is required and must be greater than 0." });
    }

    // Format floors with manual flags
    const formattedFloors = floors ? floors.map(floor => ({
      name: floor.name,
      progress: Math.round(floor.progress) || 0,
      isManual: floor.isManual || false, 
      tasks: floor.tasks ? floor.tasks.map(task => ({
        name: task.name,
        progress: Math.round(task.progress) || 0,
        isManual: task.isManual || false
      })) : []
    })) : [];

    // Initialize referenceDate to now
    const referenceDate = new Date();

    const project = await Project.create({
      name,
      contractor: contractorObject.Username,
      user: userObject.Username,
      floors: formattedFloors,
      template: templateObject._id, 
      timeline,
      location,
      totalArea,
      avgFloorHeight,
      roomCount,
      foundationDepth,
      status:'not started',
      referenceDate
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error("Error creating project:", error);
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

    // Process each project sequentially to handle async operations correctly
    for (const project of projects) {
      // Calculate total progress respecting manual flags
      const totalProgress = await calculateProgress(project);

      // Calculate days elapsed based on referenceDate
      const daysElapsed = Math.floor((new Date() - new Date(project.referenceDate)) / (1000 * 60 * 60 * 24));

      const updatedFloorsProgress = distributeFloorProgress(
        totalProgress,
        project.floors.length,
        project.timeline.duration * (project.timeline.unit === 'weeks' ? 7 : 30),
        daysElapsed,
        project.floors
      );

      // Update each floor and its tasks
      project.floors.forEach((floor, index) => {
        if (!floor.isManual) {
          floor.progress = updatedFloorsProgress[index];

          // Distribute progress to tasks, respecting task-level manual flags
          const updatedTaskProgress = distributeTaskProgress(floor.progress, floor.tasks.length);
          floor.tasks.forEach((task, taskIndex) => {
            if (!task.isManual) {
              task.progress = updatedTaskProgress[taskIndex];
            }
          });
        }
      });

      await project.save();
    }

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};


// Update floor progress in a project
const updateFloorProgress = async (req, res) => {
  const { progress, isManual } = req.body; // Accept isManual flag from the request
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

    // Update progress and manual flag
    floor.progress = Math.round(progress);
    floor.isManual = isManual || false;

    if (isManual) {
      // If manually set, set project-level manual flag
      project.isManualProgress = true;
    } else {
      // If switching back to automatic, adjust referenceDate for continuity
      project.referenceDate = new Date();
    }

    // Distribute floor progress to tasks, respecting task-level manual flags
    if (!floor.isManual) {
      const updatedTaskProgress = distributeTaskProgress(floor.progress, floor.tasks.length);
      floor.tasks.forEach((task, taskIndex) => { 
        if (!task.isManual) {
          task.progress = updatedTaskProgress[taskIndex];
        }
      });
    }

    // Mark the floors array as modified
    project.markModified('floors');

    // Save the updated project
    await project.save();

    res.status(200).json(project);
  } catch (error) {
    console.error("Error updating floor progress:", error);
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

    // Calculate the overall project progress based on the timeline and referenceDate
    const totalProgress = await calculateProgress(project);

    // Calculate days elapsed based on referenceDate
    const daysElapsed = Math.floor((new Date() - new Date(project.referenceDate)) / (1000 * 60 * 60 * 24));

    const updatedFloorsProgress = distributeFloorProgress(
      totalProgress,
      project.floors.length,
      project.timeline.duration * (project.timeline.unit === 'weeks' ? 7 : 30),
      daysElapsed,
      project.floors
    );

    // Update each floor and its tasks
    project.floors.forEach((floor, index) => {
      if (!floor.isManual) {
        floor.progress = updatedFloorsProgress[index];

        // Distribute progress to tasks, respecting task-level manual flags
        const updatedTaskProgress = distributeTaskProgress(floor.progress, floor.tasks.length);
        floor.tasks.forEach((task, taskIndex) => {
          if (!task.isManual) {
            task.progress = updatedTaskProgress[taskIndex];
          }
        });
      }
    });

    await project.save();

    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Error fetching project' });
  }
};

// Update project status to "ongoing" when started
const startProject = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Update the start date and status
    project.status = "ongoing";
    project.startDate = new Date(); // Store the start date
    project.referenceDate = new Date(); // Reset referenceDate for progress calculations
    await project.save();

    res.status(200).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update project status to "finished" when ended
const endProject = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Update the end date and status
    project.status = "finished";
    project.endDate = new Date(); // Store the end date
    await project.save();

    res.status(200).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resumeProject = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Add current date to resumedDates
    project.status = "ongoing";
    const resumedDate = new Date();
    project.resumedDates.push(resumedDate);

    // Ensure there's a corresponding postponed date for each resume
    if (project.postponedDates.length > project.resumedDates.length) {
      return res.status(400).json({ error: "Cannot resume: no corresponding postponed date." });
    }

    // Calculate postponed duration in days
    let totalPostponedDays = 0;
    for (let i = 0; i < project.postponedDates.length; i++) {
      const postponedDate = new Date(project.postponedDates[i]);
      const resumeDate = new Date(project.resumedDates[i]);
      const differenceInTime = resumeDate - postponedDate;
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 60 * 60 * 24));
      totalPostponedDays += differenceInDays;
    }

    // Adjust timeline duration (in days) to include postponed time
    const unitMultiplier = project.timeline.unit === 'weeks' ? 7 : 30;
    const durationInDays = project.timeline.duration * unitMultiplier;
    const adjustedDurationInDays = durationInDays + totalPostponedDays;

    // Update timeline duration based on the unit
    project.timeline.duration = Math.ceil(adjustedDurationInDays / unitMultiplier);

    // Adjust referenceDate to account for postponed days
    project.referenceDate = new Date();

    await project.save();

    res.status(200).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Postpone project and log the date
const postponeProject = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    project.status = "postponed";
    project.postponedDates.push(new Date());
    await project.save();

    res.status(200).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reset floor progress to automatic mode (additional endpoint)
const resetFloorProgressToAutomatic = async (req, res) => {
  try {
    const { projectId, floorId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const floor = project.floors.id(floorId);
    if (!floor) {
      return res.status(404).json({ message: 'Floor not found' });
    }

    if (!floor.isManual) {
      return res.status(400).json({ message: 'Floor progress is already in automatic mode.' });
    }

    // Reset the manual flag
    floor.isManual = false;

    // Adjust the referenceDate to now for continuity
    project.referenceDate = new Date();

    // Mark the floors array as modified
    project.markModified('floors');

    // Save the updated project
    await project.save();

    res.status(200).json({ message: 'Floor progress reset to automatic mode.', project });
  } catch (error) {
    res.status(500).json({ error: "Failed to reset floor progress.", details: error.message });
  }
};

const updateProjectStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["ongoing", "finished", "postponed"];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status value. Must be one of ${validStatuses.join(", ")}.` });
  }

  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const previousStatus = project.status;

    // Update the project status
    project.status = status;

    // Handle status-specific logic
    if (status === 'ongoing') {
      project.startDate = project.startDate || new Date(); // Set startDate if not already set
      project.referenceDate = new Date(); // Reset referenceDate for progress calculations
      // Optionally reset manual progress flags if desired
      // project.isManualProgress = false;
    } else if (status === 'finished') {
      project.endDate = new Date();
      // Optionally mark all floors and tasks as complete
      project.floors.forEach(floor => {
        floor.progress = 100;
        floor.isManual = false; // Reset manual flag
        floor.tasks.forEach(task => {
          task.progress = 100;
          task.isManual = false; // Reset manual flag
        });
      });
      project.isManualProgress = false; // Reset project-level manual flag
    } else if (status === 'postponed') {
      project.postponedDates.push(new Date());
      // Optionally pause progress calculations by setting manual flags
      project.isManualProgress = true;
      project.floors.forEach(floor => {
        floor.isManual = true;
        floor.tasks.forEach(task => {
          task.isManual = true;
        });
      });
    }

    await project.save();

    res.status(200).json({ success: true, project });
  } catch (error) {
    console.error("Error updating project status:", error);
    res.status(500).json({ error: "Failed to update project status.", details: error.message });
  }
};

const saveBOMToProject = async (req, res) => {
  const { id } = req.params;
  const { bom } = req.body;

  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (!bom || !bom.categories || !bom.categories.length) {
      return res.status(400).json({ message: 'BOM must include categories and materials data.' });
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

    // Assign the formatted BOM to the project
    project.bom = {
      projectDetails: bom.projectDetails || {},
      categories: formattedCategories,
      originalCosts: bom.originalCosts || {},
      markedUpCosts: bom.markedUpCosts || {},
    };

    await project.save();

    res.status(200).json({ success: true, project });
  } catch (error) {
    console.error("Error saving BOM to project:", error);
    res.status(500).json({ error: 'Failed to save BOM to project.', details: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the project by ID
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Update floors and tasks if provided
    if (updateData.floors) {
      updateData.floors.forEach(newFloor => {
        const existingFloor = project.floors.id(newFloor._id);
        if (existingFloor) {
          // Update floor progress and manual flag
          if (newFloor.progress !== undefined) {
            existingFloor.progress = Math.round(newFloor.progress);
          }

          if (newFloor.isManual !== undefined) {
            existingFloor.isManual = newFloor.isManual;
          }

          // Update tasks within the floor
          if (newFloor.tasks) {
            const updatedTasks = newFloor.tasks.map(newTask => {
              const existingTask = existingFloor.tasks.id(newTask._id);
              if (existingTask) {
                // Update the existing task
                existingTask.progress = newTask.progress !== undefined ? Math.round(newTask.progress) : existingTask.progress;
                existingTask.isManual = newTask.isManual !== undefined ? newTask.isManual : existingTask.isManual;
                existingTask.name = newTask.name !== undefined ? newTask.name : existingTask.name;
              } else {
                // If task doesn't exist, push it to the tasks array
                existingFloor.tasks.push(newTask);
              }
              return existingTask || newTask;
            });

            // Explicitly set the tasks array to ensure Mongoose detects the modification
            existingFloor.tasks = updatedTasks;
            existingFloor.markModified('tasks');
          }

          // Update other floor fields if necessary
          Object.keys(newFloor).forEach(key => {
            if (!['progress', 'tasks', 'isManual'].includes(key)) {
              existingFloor[key] = newFloor[key];
            }
          });
        }
      });

      // Automatically set isManualProgress based on any floor being manual
      project.isManualProgress = project.floors.some(floor => floor.isManual);

      project.markModified('floors'); // Ensure floors are marked as modified
    }

    // Handle project-level manual progress if included
    if (updateData.isManualProgress !== undefined) {
      project.isManualProgress = updateData.isManualProgress;
      if (updateData.isManualProgress) {
        // Optionally, set all floors and tasks to manual
        project.floors.forEach(floor => {
          floor.isManual = true;
          floor.tasks.forEach(task => {
            task.isManual = true;
          });
        });
      } else {
        // Reset referenceDate for automatic calculations
        project.referenceDate = new Date();
      }
    }

    // Update other project fields excluding floors and manual flags
    Object.keys(updateData).forEach(key => {
      if (!['floors', 'isManualProgress'].includes(key)) {
        project[key] = updateData[key];
      }
    });

    await project.save();

    res.status(200).json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project.", details: error.message });
  }
};




const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Optional: Handle cascade deletions for related data
    // For example, delete associated audit logs
    /*
    await AuditLog.deleteMany({ projectId: project._id });
    */

    res.status(200).json({ message: 'Project deleted successfully.' });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project.", details: error.message });
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
  postponeProject,
  resumeProject,
  endProject,
  startProject,
  resetFloorProgressToAutomatic // Export the new reset function
};
