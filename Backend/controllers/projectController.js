const { default: mongoose } = require('mongoose');
const Project = require('../models/projectModel');
const User = require('../models/usersModel');

// Get projects for a specific contractor
// Get projects for a specific contractor
const getProjectsByContractor = async (req, res) => {
  const contractorUsername = req.user.Username;

  if (!contractorUsername) {
    return res.status(401).json({ error: "Contractor information missing in the request" });
  }

  try {
    const projects = await Project.find({ contractor: contractorUsername }).sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const createProject = async (req, res) => {
  const { name, contractor: contractorUsername, user: userUsername, floors, template, timeline, status } = req.body;

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

    const formattedFloors = floors ? floors.map(floor => ({
      name: floor.name,
      progress: floor.progress || 0,
      tasks: floor.tasks ? floor.tasks.map(task => ({
        name: task.name,
        progress: task.progress || 0
      })) : []
    })) : [];

    const project = await Project.create({
      name,
      contractor: contractorObject.Username,
      user: userObject.Username,
      floors: formattedFloors,
      template,
      timeline,
      status: status || 'ongoing' // Use the provided status or default to 'ongoing'
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ error: "Failed to create project.", details: error.message });
  }
};





// get all projects
const getProject = async (req, res) => {
  try {
    const projects = await Project.find({}).sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    floor.progress = progress;
    await project.save();
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Check if projectId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};






// get all projects for the logged-in user
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

    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects for user:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};



const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log("Received update data:", updateData);

    // Find the project by ID
    const project = await Project.findById(id);
    if (!project) {
      console.log("Project not found");
      return res.status(404).json({ message: 'Project not found' });
    }

    // Handle template validation
    if (updateData.template && !["economy", "standard", "premium"].includes(updateData.template)) {
      return res.status(400).json({ error: `Invalid template: ${updateData.template}. Must be 'economy', 'standard', or 'premium'.` });
    }

    // Handle updating floors
    if (updateData.floors) {
      updateData.floors.forEach(newFloor => {
        const existingFloor = project.floors.id(newFloor._id);
        if (existingFloor) {
          // Update existing floor
          console.log("Updating existing floor:", newFloor);
          existingFloor.name = newFloor.name;
          existingFloor.progress = newFloor.progress;

          newFloor.tasks.forEach(newTask => {
            const existingTask = existingFloor.tasks.id(newTask._id);
            if (existingTask) {
              // Update existing task
              console.log(`Updating task ${newTask.name} progress to ${newTask.progress}`);
              existingTask.name = newTask.name;
              existingTask.progress = newTask.progress;
            } else {
              // Add new task
              console.log(`Adding new task ${newTask.name} with progress ${newTask.progress}`);
              existingFloor.tasks.push({ name: newTask.name, progress: newTask.progress });
            }
          });
        } else {
          // Add new floor
          console.log("Adding new floor:", newFloor);
          project.floors.push({
            name: newFloor.name,
            progress: newFloor.progress,
            tasks: newFloor.tasks.map(task => ({
              name: task.name,
              progress: task.progress
            }))
          });
        }
      });
      delete updateData.floors;
    }

    // Update other fields
    for (const key in updateData) {
      console.log(`Updating field ${key} to ${updateData[key]}`);
      project[key] = updateData[key];
    }

    await project.save();
    res.status(200).json(project);
  } catch (error) {
    console.error("Error in updateProject:", error);
    res.status(500).json({ error: "Failed to update project.", details: error.message });
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

const updateProjectStatus = async (req, res) => {
  console.log("Received request to update status for project ID:", req.params.id); // Debug log
  const { status } = req.body;

  if (!["ongoing", "finished"].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value. Must be "ongoing" or "finished".' });
  }

  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      console.log("Project not found"); // Debug log
      return res.status(404).json({ message: 'Project not found' });
    }

    project.status = status; // Update the project status
    const updatedProject = await project.save();

    res.status(200).json({ project: updatedProject });
  } catch (error) {
    console.error("Error updating project status:", error); // Debug log
    res.status(500).json({ error: error.message });
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
  updateProjectStatus
};