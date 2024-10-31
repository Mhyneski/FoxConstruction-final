import { useEffect, useState, useContext } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import styles from "../css/ProjectList.module.css";
import { AuthContext } from "../context/AuthContext";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import foxconrights from '../assets/foxconrights.jpg';
import Nigma from '../components/AlertModal'
import { FaPlay, FaEdit, FaTrash, FaPause, FaRedo, FaStop } from 'react-icons/fa';
import Tooltips from "../components/Tooltip";


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

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className={styles.loadingSpinnerContainer}>
    <div className={styles.spinner}></div>
    <p>Please wait, fetching projects...</p>
  </div>
);

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [newProject, setNewProject] = useState({
    name: "",
    user: "",
    contractor: "",
    numFloors: 1, // Assuming minimum 1 floor
    floors: [],
    template: "",
    timeline: { duration: 0, unit: "months" },
    location: "",
    totalArea: 0,  
    avgFloorHeight: 0,  
    roomCount: 1, 
    foundationDepth: 0, 
  });
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);
const [alertTitle, setAlertTitle] = useState("");
const [alertMessage, setAlertMessage] = useState("");
const [alertType, setAlertType] = useState("info"); // Default type
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false); 
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useContext(AuthContext);
  const [heightError, setHeightError] = useState(""); 
  const [floorError, setFloorError] = useState(""); 
  const [roomCountError, setRoomCountError] = useState(""); 
  const [foundationDepthError, setFoundationDepthError] = useState(""); 
  const [templates, setTemplates] = useState([]);
  const [totalAreaError, setTotalAreaError] = useState("");
  

  const showAlert = (title, message, type = "info") => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setIsAlertOpen(true);
  };

   // Fetch project details for the modal
   const fetchProjectDetails = async (projectId) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setSelectedProject(response.data); 
      setShowDetailsModal(true); 
    } catch (error) {
      console.error('Error fetching project details:', error);
      showAlert("Error","Failed to fetch project details. Please try again.", "error");
    }
  };

  // Fetch all projects, locations, and templates
  useEffect(() => {
    if (!user || !user.token) return;
  
    const fetchProjectsAndLocationsAndTemplates = async () => {
      try {
        setIsLoading(true);
  
        const [projectsResponse, locationsResponse, templatesResponse] = await Promise.all([
          axios.get(`http://localhost:4000/api/project/contractor`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.get(`http://localhost:4000/api/locations`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.get(`http://localhost:4000/api/templates`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);
  
        setProjects(projectsResponse.data);
        setLocations(locationsResponse.data); // Assuming /api/locations returns an array
        setTemplates(templatesResponse.data.templates); // Assuming /api/templates returns { templates: [...] }

        // **Debugging Logs**
        console.log("Fetched Templates:", templatesResponse.data.templates);
        console.log("Fetched Locations:", locationsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        showAlert("Error","Failed to fetch projects, locations, or templates. Please try again later.", "error");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchProjectsAndLocationsAndTemplates();
  }, [user]);

  const handleFloorHeightChange = (e) => {
    const value = parseFloat(e.target.value);
    
   
  
    if (value > 15) {
      setHeightError("The floor height cannot exceed 15 meters.");
      showAlert("Validation Error", "The floor height cannot exceed 15 meters.", "error");
    } else if (value < 0) {
      setHeightError("The floor height cannot be negative.");
      showAlert("Validation Error", "The floor height cannot be negative.", "error");
    } else {
      setHeightError(""); 
      setNewProject({ ...newProject, avgFloorHeight: value });
    }
  };
  

  const handleTotalAreaChange = (e) => {
    const value = parseFloat(e.target.value);
    
    if (isNaN(value)) {
      setTotalAreaError("Please enter a valid number.");
      showAlert("Validation Error", "Please enter a valid number for total area.", "error");
      return;
    }
  
    if (value <= 0) {
      setTotalAreaError("Total area must be greater than 0.");
      showAlert("Validation Error", "Total area must be greater than 0.", "error");
    } else {
      setTotalAreaError("");
      setNewProject({ ...newProject, totalArea: value });
    }
  };
  
  
  // Handle input change for numFloors with validation
  const handleNumFloorsChange = (e) => {
  const value = parseInt(e.target.value, 10);
  
  if (isNaN(value)) {
    setFloorError("Please enter a valid number.");
    showAlert("Validation Error", "Please enter a valid number for the number of floors.", "error");
    return;
  }

  if (value > 5) {
    setFloorError("The number of floors cannot exceed 5.");
    showAlert("Validation Error", "The number of floors cannot exceed 5.", "error");
  } else if (value < 1) {
    setFloorError("The number of floors cannot be less than 1.");
    showAlert("Validation Error", "The number of floors cannot be less than 1.", "error");
  } else {
    setFloorError(""); 
    setNewProject({ ...newProject, numFloors: value });
  }
};


  // Fetch users when dropdown is clicked
  const handleDropdownClick = async () => {
    if (users.length === 0) {
      try {
        const response = await axios.get(`http://localhost:4000/api/user/get`, {
          headers: { Authorization: `Bearer ${user?.token || ""}` },
        });
        setUsers(response.data);
        console.log("Fetched Users:", response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        showAlert("Error","Failed to fetch users. Please try again later.", "error");
      }
    }
  };

  // Function to handle project deletion after confirmation
  const handleConfirmDelete = () => {
    if (selectedProject) {
      handleDeleteProject();
    } else {
      console.error("No project selected for deletion.");
      showAlert("Error","No project selected for deletion.", "error");
    }
  };

  // Function to handle when the user cancels the delete operation
  const handleCancelDelete = () => {
    setShowDeleteModal(false); 
    setSelectedProject(null);  
  };

  // Handle creating a new project
  const handleCreateProject = async () => {
    try {
      if (!newProject.template) {
        showAlert("Error", "Please select a template.", "error");
        return;
      }
      if (newProject.totalArea <= 0) {
        showAlert("Error", "Total area must be greater than 0.", "error");
        return;
      }
  
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
      showAlert("Success", "Project created successfully!", "success");
    } catch (error) {
      if (error.response && error.response.status === 404) {
        showAlert("Error", "The selected template was not found. Please select a valid template.", "error");
      } else {
        console.error("Error creating project:", error);
        showAlert("Error", "Failed to create project. Please try again.", "error");
      }
    }
  };
  
  // Handle updating an existing project
  const handleUpdateProject = async () => {
    try {
      if (!newProject.template) {
        showAlert("Error", "Please select a template.", "error");
        return;
      }
      if (newProject.totalArea <= 0) {
        showAlert("Error", "Total area must be greater than 0.", "error");
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
  
      console.log("Processed Project:", processedProject);
  
      if (!response || !response.data) {
        console.error("Update failed: No response data received.");
        showAlert("Error", "Update failed. No data received from the server.", "error");
        return;
      }
  
      const updatedProjects = projects.map((project) =>
        project._id === editProjectId ? response.data : project
      );
  
      setProjects(updatedProjects);
      resetProjectForm();
      setIsEditing(false);
      setIsModalOpen(false);
      showAlert("Success", "Project updated successfully!", "success");
    } catch (error) {
      console.error("Error updating project:", error);
      showAlert("Error", "Failed to update project. Please try again.", "error");
    }
  };
  
  // Handle deleting a project
  const handleDeleteProject = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/project/${selectedProject._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setProjects(projects.filter((project) => project._id !== selectedProject._id));
      setShowDeleteModal(false);
      setSelectedProject(null);
      showAlert("Success","Project deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting project:", error);
      showAlert("Error","Failed to delete project. Please try again.", "error");
    }
  };

  // Reset the project form
  const resetProjectForm = () => {
    setNewProject({
      name: "",
      contractor: "",
      user: "",
      numFloors: "",
      template: "",
      floors: [],
      timeline: {
        duration: "",
        unit: "months",
      },
      location: "", 
      totalArea: "",
      avgFloorHeight: "",
      roomCount: "",
      foundationDepth: "",
    });
    // Reset validation errors
    setHeightError("");
    setFloorError("");
    setRoomCountError("");
    setFoundationDepthError("");
  };
  
  const handleStartProject = async (projectId) => {
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/project/${projectId}/start`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const updatedProject = response.data.project;
  
      // Update the projects state with the updated project
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project._id === updatedProject._id ? updatedProject : project
        )
      );
      showAlert("Success","Project started successfully!", "success");
    } catch (error) {
      console.error("Error starting project:", error);
      showAlert("Error","Failed to start project. Please try again.", "error");
    }
  };

  const handlePostponeProject = async (projectId) => {
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/project/${projectId}/postpone`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const updatedProject = response.data.project;

      // Update projects state directly with the new status
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project._id === updatedProject._id ? updatedProject : project
        )
      );
      showAlert("Success","Project postponed successfully!", "success");
    } catch (error) {
      console.error("Error postponing project:", error);
      showAlert("Error","Failed to postpone project. Please try again.", "error");
    }
  };

  const handleResumeProject = async (projectId) => {
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/project/${projectId}/resume`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const updatedProject = response.data.project;

      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project._id === updatedProject._id ? updatedProject : project
        )
      );
      showAlert("Success","Project resumed successfully!", "success");
    } catch (error) {
      console.error("Error resuming project:", error);
      showAlert("Error","Failed to resume project. Please try again.", "error");
    }
  };

  const handleEndProject = async (projectId) => {
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/project/${projectId}/end`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const updatedProject = response.data.project;

      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project._id === updatedProject._id ? updatedProject : project
        )
      );
      showAlert("Success","Project ended successfully!", "success");
    } catch (error) {
      console.error("Error ending project:", error);
      showAlert("Error","Failed to end project. Please try again.", "error");
    }
  };

  // Handle editing a project
  const handleEditProject = (project) => {
    setIsEditing(true);
    setEditProjectId(project._id);
  
    const floorsWithProgress = project.floors.map((floor) => ({
      ...floor,
      progress: floor.progress || 0,
      tasks: floor.tasks.map((task) => ({
        ...task,
        progress: task.progress || 0,
      })),
    }));
  
    // Check if project.template is a valid ObjectId
    const isValidTemplateId = /^[0-9a-fA-F]{24}$/.test(project.template);
  
    setNewProject({
      ...project,
      floors: floorsWithProgress,
      location: project.location || "",
      totalArea: project.totalArea || 0,
      avgFloorHeight: project.avgFloorHeight || 0,
      template: isValidTemplateId ? project.template : "", 
    });
  
    setIsModalOpen(true);
  };

  // Handle updating project status
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
      showAlert("Success","Project status updated successfully!", "success");
    } catch (error) {
      console.error("Error updating project status:", error);
      showAlert("Error","Failed to update project status. Please try again.", "error");
    }
  };

  // Helper functions for floors and tasks
  const handleFloorChange = (floorIndex, key, value) => {
    const updatedFloors = newProject.floors.map((floor, index) => {
      if (index === floorIndex) {
        return { ...floor, [key]: value };
      }
      return floor;
    });
    setNewProject({ ...newProject, floors: updatedFloors });
  };

  const handleTaskChange = (floorIndex, taskIndex, key, value) => {
    const updatedTasks = newProject.floors[floorIndex].tasks.map((task, index) => {
      if (index === taskIndex) {
        return { ...task, [key]: value };
      }
      return task;
    });
    const updatedFloors = newProject.floors.map((floor, index) => {
      if (index === floorIndex) {
        return { ...floor, tasks: updatedTasks };
      }
      return floor;
    });
    setNewProject({ ...newProject, floors: updatedFloors });
  };

  const addTaskToFloor = (floorIndex) => {
    const updatedFloors = newProject.floors.map((floor, i) =>
      i === floorIndex
        ? { ...floor, tasks: [...floor.tasks, { name: "", progress: 0, isManual: false }] }
        : floor
    );
    setNewProject({ ...newProject, floors: updatedFloors });
  };

  const addFloor = () => {
    if (newProject.floors.length >= 5) {
      showAlert("Error","Cannot add more than 5 floors.", "error");
      return;
    }

    const newFloorIndex = newProject.floors.length + 1;
    const updatedFloors = [
      ...newProject.floors,
      { name: `FLOOR ${newFloorIndex}`, progress: 0, tasks: [], isManual: false },
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

  // View project details in the modal
  const handleViewProjectDetails = (project) => {
    setSelectedProject(project); 
    setShowDetailsModal(true);  
  };

  // Generate BOM PDF
  const handleGenerateBOMPDF = (version = 'client') => {
    if (!selectedProject || !selectedProject.bom) {
      showAlert("Error","BOM data is not available for this project.", "error");
      return;
    }
  
    const { bom, name } = selectedProject;
  
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20; // Starting y position for details
  
    // Add the logo at the top
    const imgWidth = pageWidth - 40; // Adjust width to make it centered and smaller than page width
    const imgHeight = imgWidth * 0.2; // Maintain aspect ratio
    doc.addImage(foxconrights, 'JPEG', 20, 10, imgWidth, imgHeight);
    yPosition += imgHeight + 10; // Adjust y position below the logo
  
    doc.setFontSize(18);
    doc.text("Generated BOM: Custom Generation", pageWidth / 2, yPosition, { align: 'center' });
    doc.setFontSize(12);
    yPosition += 10;
  
    // Project details
    doc.text(`Total Area: ${bom.projectDetails.totalArea || 'N/A'} sqm`, 10, yPosition);
    yPosition += 10;
    doc.text(`Number of Floors: ${bom.projectDetails.numFloors || 'N/A'}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Floor Height: ${bom.projectDetails.avgFloorHeight || 'N/A'} meters`, 10, yPosition);
    yPosition += 10;
  
    doc.text(`Project Owner: ${selectedProject.user || 'N/A'}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Project Contractor: ${selectedProject.contractor || 'N/A'}`, 10, yPosition);
    yPosition += 10;
  
    if (version === 'client') {
      const formattedGrandTotal = `PHP ${new Intl.NumberFormat('en-PH', { style: 'decimal', minimumFractionDigits: 2 }).format(bom.markedUpCosts.totalProjectCost || 0)}`;
      doc.setFontSize(14);
      doc.text(`Grand Total: ${formattedGrandTotal}`, 10, yPosition);
      yPosition += 15;
  
      // Add the summary table for high-level categories
      doc.autoTable({
        head: [['#', 'Category', 'Total Amount (PHP)']],
        body: bom.categories.map((category, index) => [
          index + 1,
          category.category.toUpperCase(),
          `PHP ${new Intl.NumberFormat('en-PH', { style: 'decimal', minimumFractionDigits: 2 }).format(
            category.materials.reduce((sum, material) => sum + material.totalAmount, 0)
          )}`
        ]),
        startY: yPosition,
        headStyles: { fillColor: [41, 128, 185] },
        bodyStyles: { textColor: [44, 62, 80] },
      });
    } else if (version === 'contractor') {
      // Contractor-specific details
      const originalProjectCost = `PHP ${new Intl.NumberFormat('en-PH', { style: 'decimal', minimumFractionDigits: 2 }).format(bom.originalCosts.totalProjectCost || 0)}`;
      const originalLaborCost = `PHP ${new Intl.NumberFormat('en-PH', { style: 'decimal', minimumFractionDigits: 2 }).format(bom.originalCosts.laborCost || 0)}`;
      const markup = bom.projectDetails.location.markup || 0;
      const markedUpProjectCost = `PHP ${new Intl.NumberFormat('en-PH', { style: 'decimal', minimumFractionDigits: 2 }).format(bom.markedUpCosts.totalProjectCost || 0)}`;
      const markedUpLaborCost = `PHP ${new Intl.NumberFormat('en-PH', { style: 'decimal', minimumFractionDigits: 2 }).format(bom.markedUpCosts.laborCost || 0)}`;
  
      doc.setFontSize(14);
      doc.text("Contractor Cost Breakdown", 10, yPosition);
      yPosition += 10;
  
      doc.setFontSize(12);
      doc.text(`Original Project Cost (without markup): ${originalProjectCost}`, 10, yPosition);
      yPosition += 10;
      doc.text(`Original Labor Cost (without markup): ${originalLaborCost}`, 10, yPosition);
      yPosition += 10;
      doc.text(`Location: ${bom.projectDetails.location.name || 'N/A'} (Markup: ${markup}%)`, 10, yPosition);
      yPosition += 10;
      doc.text(`Marked-Up Project Cost: ${markedUpProjectCost}`, 10, yPosition);
      yPosition += 10;
      doc.text(`Marked-Up Labor Cost: ${markedUpLaborCost}`, 10, yPosition);
      yPosition += 20;
  
      // Detailed table with totals for each category
      bom.categories.forEach((category, categoryIndex) => {
        doc.setFontSize(12);
        doc.text(category.category.toUpperCase(), 10, yPosition);
        yPosition += 5;
  
        doc.autoTable({
          head: [['Item', 'Description', 'Quantity','Unit', 'Unit Cost (PHP)', 'Total Amount (PHP)']],
          body: category.materials.map((material, index) => [
            `${categoryIndex + 1}.${index + 1}`,
            material.description || 'N/A',
            material.quantity ? material.quantity.toFixed(2) : 'N/A',
            material.unit || 'N/A',
            `PHP ${new Intl.NumberFormat('en-PH', { style: 'decimal', minimumFractionDigits: 2 }).format(material.cost || 0)}`,
            `PHP ${new Intl.NumberFormat('en-PH', { style: 'decimal', minimumFractionDigits: 2 }).format(material.totalAmount || 0)}`
          ]),
          startY: yPosition,
          headStyles: { fillColor: [41, 128, 185] },
          bodyStyles: { textColor: [44, 62, 80] },
        });
  
        yPosition = doc.lastAutoTable.finalY + 5;
  
        // Add total for each category
        const categoryTotal = `PHP ${new Intl.NumberFormat('en-PH', { style: 'decimal', minimumFractionDigits: 2 }).format(
          category.materials.reduce((sum, material) => sum + material.totalAmount, 0)
        )}`;
        doc.text(`Total for ${category.category.toUpperCase()}: ${categoryTotal}`, 10, yPosition);
        yPosition += 15;
      });
    }
  
    // Save the PDF with the selected version and project name
    doc.save(`BOM_${name}_${version}.pdf`);
  };

  // Handle changes and validation for roomCount
  const handleRoomCountChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value < 1) {
      setRoomCountError("Room count must be at least 1.");
      showAlert("Validation Error", "Room count must be at least 1.", "error");
    } else {
      setRoomCountError("");
      setNewProject({ ...newProject, roomCount: value });
    }
  };

  // Handle changes and validation for foundationDepth
  const handleFoundationDepthChange = (e) => {
    const value = parseFloat(e.target.value);
    
    if (isNaN(value)) {
      setFoundationDepthError("Please enter a valid number.");
      showAlert("Validation Error", "Please enter a valid number for foundation depth.", "error");
      return;
    }
  
    if (value <= 0) {
      setFoundationDepthError("Foundation depth must be greater than 0.");
      showAlert("Validation Error", "Foundation depth must be greater than 0.", "error");
    } else {
      setFoundationDepthError("");
      setNewProject({ ...newProject, foundationDepth: value });
    }
  };
  

  // Define handleDeleteClick function
  const handleDeleteClick = (project) => {
    setSelectedProject(project); 
    setShowDeleteModal(true); 
  };

  // Filter projects based on search term
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

        {isLoading ? (
          <LoadingSpinner /> 
        ) : (
          <>
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
      <td onClick={() => handleViewProjectDetails(project)}>{new Date(project.createdAt).toLocaleDateString()}</td>
      <td>{templates.find((template) => template._id === project.template)?.title || "N/A"}</td>
      
      {/* Status Column */}
      <td>
        <span className={project.status === 'finished' ? styles.finishedStatus : styles.ongoingStatus}>
          {project.status }
        </span>
      </td>

      {/* Actions Column */}
      <td className={styles.actionsContainer}>
        {project.status === "not started" || project.status === "finished" ? (
          <Tooltips message="Start Project">
            <button onClick={() => handleStartProject(project._id)} className={styles.startButton}>
              <FaPlay /> Start
            </button>
          </Tooltips>
        ) : project.status === "ongoing" ? (
          <>
            <Tooltips message="Postpone Project">
              <button onClick={() => handlePostponeProject(project._id)} className={styles.postponeButton}>
                <FaPause /> Postpone
              </button>
            </Tooltips>
            <Tooltips message="End Project">
              <button onClick={() => handleEndProject(project._id)} className={styles.endButton}>
                <FaStop /> End
              </button>
            </Tooltips>
          </>
        ) : project.status === "postponed" && (
          <Tooltips message="Resume Project">
            <button onClick={() => handleResumeProject(project._id)} className={styles.resumeButton}>
              <FaRedo /> Resume
            </button>
          </Tooltips>
        )}
        <Tooltips message="Edit Project">
          <button onClick={() => handleEditProject(project)} className={styles.editButton}>
            <FaEdit /> Edit
          </button>
        </Tooltips>
        <Tooltips message="Delete Project">
          <button onClick={() => handleDeleteClick(project)} className={styles.deleteButton}>
            <FaTrash /> Delete
          </button>
        </Tooltips>
      </td>
    </tr>
  ))}
</tbody>


              </table>
            </div>
          </>
        )}

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
                <option value="" disabled>
                  Select Template
                </option>
                {templates && templates.length > 0 ? (
                  templates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.title}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No Templates Available
                  </option>
                )}
              </select>


              <select
                value={newProject.location}
                onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                className={styles.inputField}
              >
                <option value="" disabled>
                  Select Project Location
                </option>
                {locations && locations.length > 0 ? (
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

              <h3>Total Area</h3>
<input
  type="number"
  placeholder="Total Area (sqm)"
  value={newProject.totalArea}
  onChange={handleTotalAreaChange}
  className={styles.inputField}
/>
{totalAreaError && <p style={{ color: "red" }}>{totalAreaError}</p>}


              <h3>Floor Height</h3>
              <input
                type="number"
                placeholder="Floor Height (m)"
                value={newProject.avgFloorHeight}
                onChange={handleFloorHeightChange}
                className={styles.inputField}
              />
               {heightError && <p style={{ color: "red" }}>{heightError}</p>} 

               <h3>Room Count</h3>
            <input
              type="number"
              placeholder="Number of Rooms"
              value={newProject.roomCount}
              onChange={handleRoomCountChange}
              className={styles.inputField}
            />
            {roomCountError && <p style={{ color: "red" }}>{roomCountError}</p>}

            {/* Foundation Depth Input */}
            <h3>Foundation Depth</h3>
            <input
              type="number"
              placeholder="Foundation Depth (m)"
              value={newProject.foundationDepth}
              onChange={handleFoundationDepthChange}
              className={styles.inputField}
            />
            {foundationDepthError && <p style={{ color: "red" }}>{foundationDepthError}</p>}


              {!isEditing && (
                <>
                  <h3>Number of Floors</h3>
                  <input
                    type="number"
                    placeholder="Number of Floors"
                    value={newProject.numFloors}
                    onChange={handleNumFloorsChange}
                    className={styles.inputField}
                  />
                    {floorError && <p style={{ color: "red" }}>{floorError}</p>} 
                </>
              )}

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
    
    {/* Progress Input */}
    <input
      type="number"
      placeholder="Progress"
      value={floor.progress}
      onChange={(e) =>
        handleFloorChange(index, "progress", parseInt(e.target.value, 10))
      }
      className={styles.inputField}
    />

    {/* Manual Progress Checkbox for Floor */}
    <label className={styles.manualCheckboxLabel}>
      <input
        type="checkbox"
        checked={floor.isManual}
        onChange={(e) =>
          handleFloorChange(index, "isManual", e.target.checked)
        }
        className={styles.manualCheckbox}
      />
      Manual Progress
    </label>

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
              parseInt(e.target.value, 10)
            )
          }
          className={styles.inputField}
        />
        
        {/* Manual Progress Checkbox for Task */}
        <label className={styles.manualCheckboxLabel}>
          <input
            type="checkbox"
            checked={task.isManual}
            onChange={(e) =>
              handleTaskChange(index, taskIndex, "isManual", e.target.checked)
            }
            className={styles.manualCheckbox}
          />
          Manual Progress
        </label>
        
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

  {showDetailsModal && selectedProject && (
    <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)}>
      <h3>Project Details - {selectedProject.name}</h3>
      <div className={styles.detailsSection}>
        {/* Project Basic Details */}
        <h4>Basic Information</h4>
        <p><strong>Project Owner:</strong> {selectedProject.user || 'N/A'}</p>
        <p><strong>Project Contractor:</strong> {selectedProject.contractor || 'N/A'}</p>
        <p>
          <strong>Template:</strong>{" "}
          {templates.find((template) => template._id === selectedProject.template)?.title || "N/A"}
        </p>
        <p><strong>Status:</strong> {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}</p>

        {/* Location and Markup Details */}
        <h4>Location</h4>
        <p><strong>Location Name:</strong> {selectedProject.location || 'N/A'}</p>
        <p><strong>Markup:</strong> {locations.find(loc => loc.name === selectedProject.location)?.markup || 'N/A'}%</p>

        {/* Project Specifications */}
        <h4>Specifications</h4>
        <p><strong>Total Area:</strong> {selectedProject.totalArea} sqm</p>
        <p><strong>Floor Height:</strong> {selectedProject.avgFloorHeight} meters</p>
        <p><strong>Number of Rooms:</strong> {selectedProject.roomCount}</p>
        <p><strong>Foundation Depth:</strong> {selectedProject.foundationDepth} meters</p>

        {/* Timeline */}
        <h4>Timeline</h4>
        <p><strong>Duration:</strong> {selectedProject.timeline.duration} {selectedProject.timeline.unit}</p>

        {/* Project Status Dates */}
        <h4>Project Dates</h4>
        <p><strong>Start Date:</strong> {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : 'N/A'}</p>
        
        {selectedProject.postponedDates && selectedProject.postponedDates.length > 0 && (
          <div>
            <strong>Postponed Dates:</strong>
            <ul>
              {selectedProject.postponedDates.map((date, index) => (
                <li key={index}>{new Date(date).toLocaleDateString()}</li>
              ))}
            </ul>
          </div>
        )}

        {selectedProject.resumedDates && selectedProject.resumedDates.length > 0 && (
          <div>
            <strong>Resumed Dates:</strong>
            <ul>
              {selectedProject.resumedDates.map((date, index) => (
                <li key={index}>{new Date(date).toLocaleDateString()}</li>
              ))}
            </ul>
          </div>
        )}

        <p><strong>End Date:</strong> {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : 'N/A'}</p>

        {/* Floor and Task Details */}
        <h4>Floors and Tasks</h4>
        {selectedProject.floors.map((floor, index) => (
          <div key={index} className={styles.floorDetails}>
            <p><strong>Floor Name:</strong> {floor.name}</p>
            <p><strong>Progress:</strong> {floor.progress}%</p>
            {floor.tasks.length > 0 && (
              <>
                <h5>Tasks:</h5>
                <ul>
                  {floor.tasks.map((task, taskIndex) => (
                    <li key={taskIndex}>
                      <p><strong>Task Name:</strong> {task.name}</p>
                      <p><strong>Task Progress:</strong> {task.progress}%</p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}

        {/* BOM Section */}
        {selectedProject.bom && selectedProject.bom.categories.length > 0 ? (
    <>
      <h4>Bill of Materials (BOM)</h4>
      <p><strong>Total Project Cost:</strong> ₱{selectedProject.bom.markedUpCosts?.totalProjectCost?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
      <p><strong>Labor Cost:</strong> ₱{selectedProject.bom.markedUpCosts?.laborCost?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
      <button className={styles.downloadButton} onClick={() => handleGenerateBOMPDF('client')}>Download BOM for Client</button>
      <button className={styles.downloadButton} onClick={() => handleGenerateBOMPDF('contractor')}>Download BOM for Contractor</button>
    </>
  ) : (
    <p><strong>BOM data is not available for this project.</strong></p>
  )}


      </div>
    </Modal>
  )}

        <ConfirmDeleteModal
          show={showDeleteModal}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          project={selectedProject}
        />
        <Nigma
          isOpen={isAlertOpen}
          onClose={() => setIsAlertOpen(false)}
          title={alertTitle}
          message={alertMessage}
          type={alertType}
        />
      </div>
      
    </>
  );
};

export default ProjectList;
