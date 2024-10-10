import { useEffect, useState, useContext } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import styles from "../css/Location.module.css";
import { AuthContext } from "../context/AuthContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

// Modal Component for creating/editing project
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <span className={styles.closeButton} onClick={onClose}>
          &times;
        </span>
        <div className={styles.modalScrollableContent}>{children}</div>
      </div>
    </div>
  );
};

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    name: "",
    contractor: "",
    user: "",
    numFloors: 1, // Number of floors input for creation
    template: "low", // Default template value
    floors: [], // Floors in edit mode
    timeline: {
      duration: 0, // Duration of the project timeline
      unit: "months", // Time unit (weeks or months)
    },
  });
  const [users, setUsers] = useState([]); // Store available users for selection
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user || !user.token) return;

    const fetchProjects = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/project/contractor`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [user]);

  const handleDropdownClick = async () => {
    if (users.length === 0) {
      try {
        const response = await axios.get(`http://localhost:4000/api/user/get`, {
          headers: {
            Authorization: `Bearer ${user?.token || ""}`,
          },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
  };

  const handleCreateProject = async () => {
    try {
      if (!["economy", "standard", "premium"].includes(newProject.template)) {
        alert("Please select a valid template.");
        return;
      }
      if (newProject.numFloors < 1 || newProject.numFloors > 5) {
        alert("The number of floors must be between 1 and 5.");
      }
      

      // Generate default floors based on numFloors input
      const defaultFloors = Array.from({ length: newProject.numFloors }, (_, i) => ({
        name: `FLOOR ${i + 1}`,
        progress: 0, // Default progress to 0
        tasks: [], // Empty tasks by default
      }));

      const processedProject = {
        ...newProject,
        floors: defaultFloors, // Use generated floors
      };

      const response = await axios.post(
        `http://localhost:4000/api/project`,
        {
          name: processedProject.name,
          contractor: user.Username,
          user: processedProject.user,
          floors: processedProject.floors,
          template: processedProject.template,
          timeline: processedProject.timeline, // Include timeline
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setProjects([...projects, response.data.data]);
      resetProjectForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleUpdateProject = async () => {
    try {
      if (!["economy", "standard", "premium"].includes(newProject.template)) {
        alert("Please select a valid template.");
        return;
      }
      if (newProject.numFloors < 1 || newProject.numFloors > 5) {
        alert("The number of floors must be between 1 and 5.");
        return;
      }
      
      const processedProject = {
        ...newProject,
      };

      // Send the update request
      const response = await axios.patch(
        `http://localhost:4000/api/project/${editProjectId}`,
        processedProject,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const updatedProjects = projects.map((project) =>
        project._id === editProjectId ? response.data : project
      );

      setProjects(updatedProjects);
      resetProjectForm();
      setIsEditing(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const resetProjectForm = () => {
    setNewProject({
      name: "",
      contractor: "",
      user: "",
      numFloors: 1, // Reset to 1 floor for creation
      template: "low",
      floors: [], // Reset floors for creation
      timeline: {
        duration: 0,
        unit: "months",
      },
    });
  };

  const handleEditProject = (project) => {
    setIsEditing(true);
    setEditProjectId(project._id); // Store the ID of the project being edited
    setNewProject(project); // Load project data into form
    setIsModalOpen(true); // Open the modal for editing
  };

  const handleViewProjectDetails = (project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const handleDeleteClick = (project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/project/${selectedProject._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setProjects(projects.filter((project) => project._id !== selectedProject._id));
      setShowDeleteModal(false);
      setSelectedProject(null);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedProject(null);
  };

  const filterProjects = () => {
    if (!searchTerm) return projects;

    return projects.filter(
      (project) =>
        project.name && project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Function to delete a floor
  const deleteFloor = (index) => {
    const updatedFloors = newProject.floors.filter((_, i) => i !== index);
    setNewProject({ ...newProject, floors: updatedFloors });
  };

  // Function to delete a task from a floor
  const deleteTask = (floorIndex, taskIndex) => {
    const updatedTasks = newProject.floors[floorIndex].tasks.filter((_, i) => i !== taskIndex);
    const updatedFloors = newProject.floors.map((floor, i) =>
      i === floorIndex ? { ...floor, tasks: updatedTasks } : floor
    );
    setNewProject({ ...newProject, floors: updatedFloors });
  };

  const handleFloorChange = (index, key, value) => {
    if (key === "numFloors") {
      value = Math.max(1, Math.min(5, value)); // Ensure number of floors is between 1 and 5
    } else if (value < 0) {
      value = 0; // Ensure no negative values for other fields
    }
    
    const updatedFloors = newProject.floors.map((floor, i) =>
      i === index ? { ...floor, [key]: value } : floor
    );
    setNewProject({ ...newProject, floors: updatedFloors });
  };
  
  

  const handleTaskChange = (floorIndex, taskIndex, key, value) => {
    if (value < 0) value = 0; // Ensure no negative values
    const updatedTasks = newProject.floors[floorIndex].tasks.map((task, i) =>
      i === taskIndex ? { ...task, [key]: value } : task
    );
    const updatedFloors = newProject.floors.map((floor, i) =>
      i === floorIndex ? { ...floor, tasks: updatedTasks } : floor
    );
    setNewProject({ ...newProject, floors: updatedFloors });
  };
  

  const addTaskToFloor = (floorIndex) => {
    const updatedFloors = newProject.floors.map((floor, i) =>
      i === floorIndex ? { ...floor, tasks: [...floor.tasks, { name: "", progress: 0 }] } : floor
    );
    setNewProject({ ...newProject, floors: updatedFloors });
  };

  // Add a floor (only in edit mode)
  const addFloor = () => {
    if (newProject.floors.length >= 5) {
      alert("Cannot add more than 5 floors."); // Display an alert or warning
      return;
    }
    
    const newFloorIndex = newProject.floors.length + 1;
    const updatedFloors = [
      ...newProject.floors,
      { name: `FLOOR ${newFloorIndex}`, progress: 0, tasks: [] },
    ];
    setNewProject({ ...newProject, floors: updatedFloors });
  };
  

  const filteredProjects = filterProjects();

  const handleUpdateStatus = async (projectId, newStatus) => {
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/project/${projectId}/status`, // Ensure this URL matches the backend route
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
  
      const updatedProject = response.data.project;
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project._id === updatedProject._id ? updatedProject : project
        )
      );
    } catch (error) {
      console.error("Error updating project status:", error);
    }
  };
  

  return (
    <>
      <Navbar />
      <div className={styles.locationsContainer}>
        <h2 className={styles.heading}>Projects</h2>
        <div className={styles.searchBarContainer}>
          <input
            type="text"
            placeholder="Search project list"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button
            onClick={() => {
              setIsEditing(false);
              resetProjectForm();
              setIsModalOpen(true);
            }}
            className={styles.createLocationButton}
          >
            +
          </button>
        </div>
        <p className={styles.locationCount}>Total Projects: {filteredProjects.length}</p>

        {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className={styles.modalForm}>
              <h3>{isEditing ? "Edit Project" : "Create New Project"}</h3>
              <input
                type="text"
                placeholder="Project Name"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className={styles.inputField}
              />
              <select
                value={newProject.user}
                onChange={(e) => setNewProject({ ...newProject, user: e.target.value })}
                onClick={handleDropdownClick}
                className={styles.inputField}
              >
                <option value="" disabled>
                  Select Project Owner (User)
                </option>
                {users.length > 0
                  ? users.map((userOption) => (
                      <option key={userOption._id} value={userOption.Username}>
                        {userOption.Username}
                      </option>
                    ))
                  : (
                    <option value="" disabled>
                      No Users Available
                    </option>
                  )}
              </select>
              <select
  value={newProject.template}
  onChange={(e) => setNewProject({ ...newProject, template: e.target.value })}
  className={styles.inputField}
>
  <option value="economy">Economy</option>
  <option value="standard">Standard</option>
  <option value="premium">Premium</option>
</select>


              {!isEditing && (
                <>
                 <h3>Number of Floors</h3>
<input
  type="number"
  placeholder="Number of Floors"
  value={newProject.numFloors}
  onChange={(e) => {
    const value = Math.max(1, Math.min(5, parseInt(e.target.value, 10))); // Ensure value is between 1 and 5
    setNewProject({ ...newProject, numFloors: value });
  }}
  className={styles.inputField}
/>


                </>
              )}

              {/* Timeline fields */}
              <h3>Project Timeline</h3>
<input
  type="number"
  placeholder="Duration"
  value={newProject.timeline.duration}
  onChange={(e) => {
    const value = Math.max(0, parseInt(e.target.value, 10)); // Ensure value is not negative
    setNewProject({
      ...newProject,
      timeline: { ...newProject.timeline, duration: value },
    });
  }}
  className={styles.inputField}
/>

              <select
                value={newProject.timeline.unit}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    timeline: { ...newProject.timeline, unit: e.target.value }
                  })
                }
                className={styles.inputField}
              >
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>

              {newProject.floors.map((floor, index) => (
                <div key={index} className={styles.floorContainer}>
                  <h4>{floor.name}</h4>
                  <input
                    type="number"
                    placeholder="Progress"
                    value={floor.progress}
                    onChange={(e) => handleFloorChange(index, "progress", parseInt(e.target.value))}
                    className={styles.inputField}
                  />

                  <h5>Tasks</h5>
                  {floor.tasks.map((task, taskIndex) => (
                    <div key={taskIndex} className={styles.taskContainer}>
                      <input
                        type="text"
                        placeholder="Task Name"
                        value={task.name}
                        onChange={(e) =>
                          handleTaskChange(index, taskIndex, "name", e.target.value)
                        }
                        className={styles.inputField}
                      />
                      <input
                        type="number"
                        placeholder="Task Progress"
                        value={task.progress}
                        onChange={(e) =>
                          handleTaskChange(index, taskIndex, "progress", parseInt(e.target.value))
                        }
                        className={styles.inputField}
                      />
                      <button
                        className={styles.deleteTaskButton}
                        onClick={() => deleteTask(index, taskIndex)}
                      >
                        Delete Task
                      </button>
                    </div>
                  ))}

                  {isEditing && (
                    <>
                      <button
                        className={styles.addTaskButton}
                        onClick={() => addTaskToFloor(index)}
                      >
                        Add Task
                      </button>
                      <button
                        className={styles.deleteFloorButton}
                        onClick={() => deleteFloor(index)}
                      >
                        Delete Floor
                      </button>
                    </>
                  )}
                </div>
              ))}

              {isEditing && (
                <button className={styles.addFloorButton} onClick={addFloor}>
                  Add Floor
                </button>
              )}

              <button
                className={styles.createButton}
                onClick={isEditing ? handleUpdateProject : handleCreateProject}
              >
                {isEditing ? "Update Project" : "Create Project"}
              </button>
            </div>
          </Modal>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedProject && (
          <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)}>
            <h3>Project Details - {selectedProject.name}</h3>
            <h4>Floors:</h4>
            {selectedProject.floors.map((floor, index) => (
              <div key={index} className={styles.floorDetails}>
                <p>
                  <strong>Floor Name:</strong> {floor.name}
                </p>
                <p>
                  <strong>Progress:</strong> {floor.progress}%
                </p>
              </div>
            ))}
            <h4>Timeline:</h4>
            <p>
              <strong>Duration:</strong> {selectedProject.timeline.duration} {selectedProject.timeline.unit}
            </p>
          </Modal>
        )}

<div className={styles.scrollableTableContainer}>
  <table className={styles.locationsTable}>
    <thead>
      <tr>
        <th>Project Name</th>
        <th>Project Owner</th>
        <th>Project Contractor</th>
        <th>Date Created</th>
        <th>Cost Tier</th> {/* New column for Cost Tier */}
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredProjects.map((project) => (
        <tr key={project._id}>
          <td onClick={() => handleViewProjectDetails(project)}>{project.name}</td>
          <td onClick={() => handleViewProjectDetails(project)}>{project.user}</td>
          <td onClick={() => handleViewProjectDetails(project)}>{project.contractor}</td>
          <td onClick={() => handleViewProjectDetails(project)}>
            {new Date(project.createdAt).toLocaleDateString()}
          </td>
          <td>{project.template.charAt(0).toUpperCase() + project.template.slice(1)}</td> {/* Display the cost tier */}
          <td>{project.status}</td>
          <td>
            <button onClick={() => handleEditProject(project)} className={styles.editButton}>
              Edit
            </button>
            <button
              onClick={() =>
                handleUpdateStatus(
                  project._id,
                  project.status === "ongoing" ? "finished" : "ongoing"
                )
              }
              className={styles.editButton}
            >
              Mark as {project.status === "ongoing" ? "Finished" : "Ongoing"}
            </button>
            <button onClick={() => handleDeleteClick(project)} className={styles.deleteButton}>
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      </div>

      <ConfirmDeleteModal
        show={showDeleteModal}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        project={selectedProject}
      />
    </>
  );
};

export default ProjectList;
