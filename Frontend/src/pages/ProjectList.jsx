import { useEffect, useState, useContext } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import styles from "../css/ProjectList.module.css";
import { AuthContext } from "../context/AuthContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Modal Component for creating/editing/viewing project details
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
    user: "",
    contractor: "",
    numFloors: 1,
    floors: [],
    template: "economy",
    timeline: { duration: 0, unit: "months" },
    location: "", // Added location field for selecting project location
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false); // For viewing project details
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]); // For fetching locations
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useContext(AuthContext);

  // Function to fetch project details
  const fetchProjectDetails = async (projectId) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setSelectedProject(response.data); // This should now contain the updated progress
      setShowDetailsModal(true); // Show modal
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };

  // Fetch Projects and Locations
  useEffect(() => {
    if (!user || !user.token) return;

    const fetchProjectsAndLocations = async () => {
      try {
        const [projectsResponse, locationsResponse] = await Promise.all([
          axios.get(`http://localhost:4000/api/project/contractor`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.get(`http://localhost:4000/api/locations`), // Fetch locations
        ]);

        setProjects(projectsResponse.data);
        setLocations(locationsResponse.data); // Store locations
      } catch (error) {
        console.error("Error fetching projects or locations:", error);
      }
    };

    fetchProjectsAndLocations();
  }, [user]);

  // Fetch Users for assigning project owners
  const handleDropdownClick = async () => {
    if (users.length === 0) {
      try {
        const response = await axios.get(`http://localhost:4000/api/user/get`, {
          headers: { Authorization: `Bearer ${user?.token || ""}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
  };

  // Handle Project Creation
  const handleCreateProject = async () => {
    try {
      if (!["economy", "standard", "premium"].includes(newProject.template)) {
        alert("Please select a valid template.");
        return;
      }
      if (newProject.numFloors < 1 || newProject.numFloors > 5) {
        alert("The number of floors must be between 1 and 5.");
        return;
      }

      // Generate default floors based on numFloors input
      const defaultFloors = Array.from({ length: newProject.numFloors }, (_, i) => ({
        name: `FLOOR ${i + 1}`,
        progress: 0,
        tasks: [],
      }));

      const processedProject = {
        ...newProject,
        contractor: user.Username,
        floors: defaultFloors,
      };

      const response = await axios.post(
        `http://localhost:4000/api/project`,
        processedProject,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      setProjects([...projects, response.data.data]);
      resetProjectForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // Handle Project Update
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

      const processedProject = { ...newProject };

      const response = await axios.patch(
        `http://localhost:4000/api/project/${editProjectId}`,
        processedProject,
        {
          headers: { Authorization: `Bearer ${user.token}` },
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

  // Handle Project Delete
  const handleDeleteProject = async () => {
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

  const resetProjectForm = () => {
    setNewProject({
      name: "",
      contractor: "",
      user: "",
      numFloors: 1,
      template: "economy",
      floors: [],
      timeline: {
        duration: 0,
        unit: "months",
      },
      location: "", // Reset location field
    });
  };

  const handleEditProject = (project) => {
    setIsEditing(true);
    setEditProjectId(project._id);
  
    // Ensure floors and tasks progress is properly set
    const floorsWithProgress = project.floors.map((floor) => ({
      ...floor,
      progress: floor.progress || 0, // Ensure progress is set
      tasks: floor.tasks.map((task) => ({
        ...task,
        progress: task.progress || 0, // Ensure task progress is set
      })),
    }));
  
    // Set the project location as well
    setNewProject({ 
      ...project, 
      floors: floorsWithProgress, 
      location: project.location || "" // Set location from the project data
    });
    setIsModalOpen(true);
  };
  

  const handleDeleteClick = (project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    handleDeleteProject();
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedProject(null);
  };

  const handleUpdateStatus = async (projectId, newStatus) => {
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/project/${projectId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${user.token}` },
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

  // Handle Floor and Task Management
  const handleFloorChange = (index, key, value) => {
    if (key === "numFloors") {
      value = Math.max(1, Math.min(5, value));
    } else if (value < 0) {
      value = 0;
    }

    const updatedFloors = newProject.floors.map((floor, i) =>
      i === index ? { ...floor, [key]: value } : floor
    );
    setNewProject({ ...newProject, floors: updatedFloors });
  };

  const handleTaskChange = (floorIndex, taskIndex, key, value) => {
    if (value < 0) value = 0;
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
      i === floorIndex
        ? { ...floor, tasks: [...floor.tasks, { name: "", progress: 0 }] }
        : floor
    );
    setNewProject({ ...newProject, floors: updatedFloors });
  };

  const addFloor = () => {
    if (newProject.floors.length >= 5) {
      alert("Cannot add more than 5 floors.");
      return;
    }

    const newFloorIndex = newProject.floors.length + 1;
    const updatedFloors = [
      ...newProject.floors,
      { name: `FLOOR ${newFloorIndex}`, progress: 0, tasks: [] },
    ];
    setNewProject({ ...newProject, floors: updatedFloors });
  };

  const deleteFloor = (index) => {
    const updatedFloors = newProject.floors.filter((_, i) => i !== index);
    setNewProject({ ...newProject, floors: updatedFloors });
  };

  const deleteTask = (floorIndex, taskIndex) => {
    const updatedTasks = newProject.floors[floorIndex].tasks.filter((_, i) => i !== taskIndex);
    const updatedFloors = newProject.floors.map((floor, i) =>
      i === floorIndex ? { ...floor, tasks: updatedTasks } : floor
    );
    setNewProject({ ...newProject, floors: updatedFloors });
  };

  // Function to handle viewing project details
  const handleViewProjectDetails = (project) => {
    setSelectedProject(project); // Set the project for which details will be shown
    setShowDetailsModal(true);   // Show the modal with details
  };

  // Function to generate PDF for the selected project's BOM (client or contractor version)
  const handleGenerateBOMPDF = (version = 'client') => {
    if (!selectedProject || !selectedProject.bom) return;
  
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Project BOM: ${selectedProject.name}`, 10, 10);
  
    const bomDetails = selectedProject.bom.projectDetails || {};
  
    doc.setFontSize(12);
    doc.text(`Total Area: ${bomDetails.totalArea || 'N/A'} sqm`, 10, 20);
    doc.text(`Number of Floors: ${bomDetails.numFloors || 'N/A'}`, 10, 30);
    doc.text(`Average Floor Height: ${bomDetails.avgFloorHeight || 'N/A'} meters`, 10, 40);
  
    doc.text(`Project Owner: ${selectedProject.user || 'N/A'}`, 10, 50);
    doc.text(`Project Contractor: ${selectedProject.contractor || 'N/A'}`, 10, 60);
  
    if (version === 'client') {
      const formattedProjectCost = `${(selectedProject.bom.markedUpCosts.totalProjectCost || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
      const formattedLaborCost = `${(selectedProject.bom.markedUpCosts.laborCost || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  
      doc.text(`Project Cost: ${formattedProjectCost}`, 10, 70);
      doc.text(`Labor Cost: ${formattedLaborCost}`, 10, 80);
  
      // Show high-level material categories for simplicity (e.g., Earthworks, Concrete, Finishing)
      const categories = selectedProject.bom.categories.map(category => ({
        category: category.category.toUpperCase(),
        totalAmount: category.materials.reduce((sum, material) => sum + material.totalAmount, 0),
      }));
  
      const materials = categories.map((material, index) => [
        index + 1,
        material.category,
        `${material.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
      ]);
  
      doc.autoTable({
        head: [['#', 'Category', 'Total Amount (₱)']],
        body: materials,
        startY: 90,
      });
    } else if (version === 'contractor') {
      // Add both original and marked-up costs for contractors
      const formattedOriginalProjectCost = `${(selectedProject.bom.originalCosts.totalProjectCost || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
      const formattedOriginalLaborCost = `${(selectedProject.bom.originalCosts.laborCost || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
      const formattedMarkedUpProjectCost = `${(selectedProject.bom.markedUpCosts.totalProjectCost || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
      const formattedMarkedUpLaborCost = `${(selectedProject.bom.markedUpCosts.laborCost || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  
      doc.text(`Original Total Project Cost: ${formattedOriginalProjectCost}`, 10, 70);
      doc.text(`Original Labor Cost: ${formattedOriginalLaborCost}`, 10, 80);
      doc.text(`Marked-Up Total Project Cost: ${formattedMarkedUpProjectCost}`, 10, 90);
      doc.text(`Marked-Up Labor Cost: ${formattedMarkedUpLaborCost}`, 10, 100);
  
      // Show detailed material list for the contractor version
      const allMaterials = selectedProject.bom.categories.reduce((acc, category) => {
        return acc.concat(category.materials);
      }, []);
  
      if (allMaterials.length > 0) {
        const materials = allMaterials.map((material, index) => [
          index + 1,
          material.item || 'N/A',
          material.description || 'N/A',
          Math.round(material.quantity || 0),
          material.unit || 'N/A',
          `${(material.cost || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
          `${(material.totalAmount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
        ]);
  
        doc.autoTable({
          head: [['#', 'Item', 'Description', 'Quantity', 'Unit', 'Unit Cost', 'Total Amount']],
          body: materials,
          startY: 110,
        });
      } else {
        doc.text("No materials found for this project.", 10, 110);
      }
    }
  
    doc.save(`BOM_${selectedProject.name}_${version}.pdf`);
  };
  
  

  const filterProjects = () => {
    if (!searchTerm) return projects;

    return projects.filter(
      (project) =>
        project.name && project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredProjects = filterProjects();

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
            className={styles.createButton}
          >
            + Create Project
          </button>
        </div>
        <p className={styles.locationCount}>
          Total Projects: {filteredProjects.length}
        </p>

        {/* Projects Table */}
        <div className={styles.scrollableTableContainer}>
          <table className={styles.locationsTable}>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Project Owner</th>
                <th>Project Contractor</th>
                <th>Date Created</th>
                <th>Cost Tier</th>
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
                  <td>
                    {project.template.charAt(0).toUpperCase() +
                      project.template.slice(1)}
                  </td>
                  <td>{project.status}</td>
                  <td>
                    <button
                      onClick={() => handleEditProject(project)}
                      className={styles.editButton}
                    >
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
                    <button
                      onClick={() => handleDeleteClick(project)}
                      className={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal for Create/Edit Project */}
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
                {users.length > 0 ? (
                  users.map((userOption) => (
                    <option key={userOption._id} value={userOption.Username}>
                      {userOption.Username}
                    </option>
                  ))
                ) : (
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

              {/* Added location dropdown for selecting project location */}
              <select
                value={newProject.location}
                onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                className={styles.inputField}
              >
                <option value="" disabled>
                  Select Project Location
                </option>
                {locations.length > 0 ? (
                  locations.map((locationOption) => (
                    <option key={locationOption._id} value={locationOption.name}>
                      {locationOption.name} - {locationOption.markup}% markup
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No Locations Available
                  </option>
                )}
              </select>

              {!isEditing && (
                <>
                  <h3>Number of Floors</h3>
                  <input
                    type="number"
                    placeholder="Number of Floors"
                    value={newProject.numFloors}
                    onChange={(e) => {
                      const value = Math.max(
                        1,
                        Math.min(5, parseInt(e.target.value, 10))
                      );
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
                  const value = Math.max(0, parseInt(e.target.value, 10));
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
                    timeline: { ...newProject.timeline, unit: e.target.value },
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
                    onChange={(e) =>
                      handleFloorChange(index, "progress", parseInt(e.target.value))
                    }
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
                          handleTaskChange(
                            index,
                            taskIndex,
                            "progress",
                            parseInt(e.target.value)
                          )
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

        {/* Modal to View Project Details */}
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
            <p><strong>Location:</strong> {selectedProject.location || 'N/A'}</p>
            <p><strong>Markup:</strong> {locations.find(loc => loc.name === selectedProject.location)?.markup || 'N/A'}%</p>

            {/* Conditionally render the BOM download buttons */}
            {selectedProject.bom && (
              <>
                <button className={styles.downloadButton} onClick={() => handleGenerateBOMPDF('client')}>
                  Download BOM for Client
                </button>
                <button className={styles.downloadButton} onClick={() => handleGenerateBOMPDF('contractor')}>
                  Download BOM for Contractor
                </button>
              </>
            )}
          </Modal>
        )}

        {/* Confirm Delete Modal */}
        <ConfirmDeleteModal
          show={showDeleteModal}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          project={selectedProject}
        />
      </div>
    </>
  );
};

export default ProjectList;
