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
    floors: [{ name: "", progress: "", tasks: [{ name: "", progress: "" }] }],
    template: "low", // Default template value
  });
  const [users, setUsers] = useState([]); // Store available users for selection
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const apiUrl = process.env.REACT_APP_BACKEND_URL;

  const { user } = useContext(AuthContext);

  // Fetch projects related to the contractor on component mount
  useEffect(() => {
    if (!user || !user.token) return; // Ensure user is authenticated before making the request

    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/project/contractor`, {
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

  // Function to fetch users on dropdown click
  const handleDropdownClick = async () => {
    if (users.length === 0) {
      try {
        const response = await axios.get(`${apiUrl}/api/user/get`, {
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
      if (!["low", "mid", "high"].includes(newProject.template)) {
        alert("Please select a valid template.");
        return;
      }

      const processedProject = processProjectData(newProject);
      const response = await axios.post(
        `${apiUrl}/api/project`,
        {
          name: processedProject.name,
          contractor: user.Username,
          user: processedProject.user,
          floors: processedProject.floors,
          template: processedProject.template,
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

  const handleEditProject = (project) => {
    setIsEditing(true);
    setEditProjectId(project._id);
    const projectWithStringProgress = {
      ...project,
      floors: project.floors.map((floor) => ({
        ...floor,
        progress: floor.progress.toString(),
        tasks: floor.tasks.map((task) => ({
          ...task,
          progress: task.progress.toString(),
        })),
      })),
    };
    setNewProject(projectWithStringProgress);
    setIsModalOpen(true);
  };

  const handleUpdateProject = async () => {
    try {
      const processedProject = processProjectData(newProject);
      const response = await axios.patch(
        `${apiUrl}/api/project/${editProjectId}`,
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
      floors: [{ name: "", progress: "", tasks: [{ name: "", progress: "" }] }],
      template: "low",
    });
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
      await axios.delete(`${apiUrl}/api/project/${selectedProject._id}`, {
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

  const processProjectData = (projectData) => {
    const processedFloors = projectData.floors.map((floor) => ({
      ...floor,
      progress: floor.progress === "" ? 0 : floor.progress,
      tasks: floor.tasks.map((task) => ({
        ...task,
        progress: task.progress === "" ? 0 : task.progress,
      })),
    }));
    return {
      ...projectData,
      floors: processedFloors,
    };
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
            className={styles.createLocationButton}
          >
            +
          </button>
        </div>
        <p className={styles.locationCount}>Total Projects: {filteredProjects.length}</p>

        {/* Create or Edit Modal */}
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
                <option value="low">Low</option>
                <option value="mid">Mid</option>
                <option value="high">High</option>
              </select>

              <h3>Floors</h3>
              {newProject.floors.map((floor, floorIndex) => (
                <div key={floorIndex} className={styles.floorContainer}>
                  <h4>Floor {floorIndex + 1}</h4>
                  <input
                    type="text"
                    placeholder="Floor Name"
                    value={floor.name}
                    onChange={(e) => {
                      const updatedFloors = newProject.floors.map((f, i) =>
                        i === floorIndex ? { ...f, name: e.target.value } : f
                      );
                      setNewProject({ ...newProject, floors: updatedFloors });
                    }}
                    className={styles.inputField}
                  />
                  <input
                    type="number"
                    placeholder="Floor Progress"
                    value={floor.progress}
                    onChange={(e) => {
                      const progressValue = e.target.value === "" ? "" : parseInt(e.target.value, 10);
                      const updatedFloors = newProject.floors.map((f, i) =>
                        i === floorIndex ? { ...f, progress: progressValue } : f
                      );
                      setNewProject({ ...newProject, floors: updatedFloors });
                    }}
                    className={styles.inputField}
                  />
                  <h5>Tasks</h5>
                  {floor.tasks.map((task, taskIndex) => (
                    <div key={taskIndex} className={styles.taskContainer}>
                      <input
                        type="text"
                        placeholder="Task Name"
                        value={task.name}
                        onChange={(e) => {
                          const updatedTasks = floor.tasks.map((t, i) =>
                            i === taskIndex ? { ...t, name: e.target.value } : t
                          );
                          const updatedFloors = newProject.floors.map((f, i) =>
                            i === floorIndex ? { ...f, tasks: updatedTasks } : f
                          );
                          setNewProject({ ...newProject, floors: updatedFloors });
                        }}
                        className={styles.inputField}
                      />
                      <input
                        type="number"
                        placeholder="Task Progress"
                        value={task.progress}
                        onChange={(e) => {
                          const progressValue = e.target.value === "" ? "" : parseInt(e.target.value, 10);
                          const updatedTasks = floor.tasks.map((t, i) =>
                            i === taskIndex ? { ...t, progress: progressValue } : t
                          );
                          const updatedFloors = newProject.floors.map((f, i) =>
                            i === floorIndex ? { ...f, tasks: updatedTasks } : f
                          );
                          setNewProject({ ...newProject, floors: updatedFloors });
                        }}
                        className={styles.inputField}
                      />
                      <button
                        className={styles.deleteTaskButton}
                        onClick={() => {
                          const updatedTasks = floor.tasks.filter((_, i) => i !== taskIndex);
                          const updatedFloors = newProject.floors.map((f, i) =>
                            i === floorIndex ? { ...f, tasks: updatedTasks } : f
                          );
                          setNewProject({ ...newProject, floors: updatedFloors });
                        }}
                      >
                        Delete Task
                      </button>
                    </div>
                  ))}

                  <button
                    className={styles.addTaskButton}
                    onClick={() => {
                      const updatedTasks = [...floor.tasks, { name: "", progress: "" }];
                      const updatedFloors = newProject.floors.map((f, i) =>
                        i === floorIndex ? { ...f, tasks: updatedTasks } : f
                      );
                      setNewProject({ ...newProject, floors: updatedFloors });
                    }}
                  >
                    Add Task
                  </button>
                  <button
                    className={styles.deleteFloorButton}
                    onClick={() => {
                      const updatedFloors = newProject.floors.filter((_, i) => i !== floorIndex);
                      setNewProject({ ...newProject, floors: updatedFloors });
                    }}
                  >
                    Delete Floor
                  </button>
                </div>
              ))}

              <button
                className={styles.addFloorButton}
                onClick={() =>
                  setNewProject({
                    ...newProject,
                    floors: [
                      ...newProject.floors,
                      { name: "", progress: "", tasks: [{ name: "", progress: "" }] },
                    ],
                  })
                }
              >
                Add Floor
              </button>

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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project._id}>
                  <td onClick={() => handleViewProjectDetails(project)}>{project.name}</td>
                  <td onClick={() => handleViewProjectDetails(project)}>
                    {project.user || "No user Username"}
                  </td>
                  <td onClick={() => handleViewProjectDetails(project)}>
                    {project.contractor || "No contractor Username"}
                  </td>
                  <td onClick={() => handleViewProjectDetails(project)}>
                    {new Date(project.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProject(project);
                      }}
                      className={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(project);
                      }}
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
