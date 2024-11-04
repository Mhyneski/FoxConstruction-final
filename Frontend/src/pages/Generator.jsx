// src/components/Generator.jsx
import React from 'react';
import { useState, useContext, useEffect } from 'react';
import Axios from 'axios';
import Navbar from "../components/Navbar";
import styles from '../css/Generator.module.css';
import { AuthContext } from "../context/AuthContext";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import foxconrights from '../assets/foxconrights.jpg';
import AlertModal from '../components/AlertModal'; // Import AlertModal

const MaterialSearchModal = ({ isOpen, onClose, onMaterialSelect, materialToReplace, user }) => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen && user && user.token) {
      Axios.get('https://foxconstruction-final.onrender.com/api/materials', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
        .then((response) => {
          setMaterials(response.data);
          setFilteredMaterials(response.data);
        })
        .catch((error) => {
          console.error('Error fetching materials:', error);
          // Optionally, you can show an alert here if needed
        });
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredMaterials(materials);
    } else {
      const filtered = materials.filter((material) =>
        (material.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMaterials(filtered);
    }
  }, [searchTerm, materials]);

  return isOpen ? (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <button onClick={onClose} className={styles.closeButton}>Close</button>
        <h2>Replace Material: {materialToReplace?.description || ''}</h2>
        <input
          type="text"
          placeholder="Search materials"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.materialList}>
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map((material) => (
              <div
                key={material._id}
                className={styles.materialItem}
                style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #ccc' }}
                onClick={() => onMaterialSelect(material)}
              >
                <p><strong>{material.description || 'No Description Available'}</strong></p>
                <p>Cost: ₱{material.cost.toFixed(2)}</p>
              </div>
            ))
          ) : (
            <p>No materials found</p>
          )}
        </div>
      </div>
    </div>
  ) : null;
};

const Modal = ({
  isOpen, onClose, onSubmit, formData, handleChange, errors, projects,
  handleProjectSelect, selectedProject, isProjectBased, locations,
  handleLocationSelect, selectedLocation, isLoadingProjects, isLoadingBOM,
  templates, 
}) => {

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{isProjectBased ? "Enter Base Template Details for Project" : "Enter Base Template Details"}</h2>
        <form onSubmit={onSubmit}>
          {isProjectBased && (
            <div className={styles.formGroup}>
              <label>Select Project:</label>
              {isLoadingProjects ? (
                <div className={styles.loadingSpinnerContainer}>
                  <div className={styles.spinner}></div>
                  <p>Please wait, fetching projects...</p>
                </div>
              ) : (
                <select onChange={(e) => handleProjectSelect(e.target.value)} value={selectedProject?._id || ''}>
                  <option value="" disabled>Select a project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              )}
              {projects.length === 0 && <p>No projects available</p>}
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Total Area (sqm)</label>
            <input
              type="number"
              name="totalArea"
              value={formData.totalArea}
              onChange={handleChange}
              required
              min="0" 
            />
            {errors.totalArea && (
              <span className={styles.error}>{errors.totalArea}</span>
            )}
          </div>
          <div className={styles.formGroup}>
            <label>Floor Height (meters)</label>
            <input
              type="number"
              name="avgFloorHeight"
              value={formData.avgFloorHeight}
              onChange={handleChange}
              required
              min="0" 
              max="15" 
            />
            {errors.avgFloorHeight && (
              <span className={styles.error}>{errors.avgFloorHeight}</span>
            )}
          </div>

          {/* New Room Count and Foundation Depth fields */}
          <div className={styles.formGroup}>
            <label>Room Count</label>
            <input
              type="number"
              name="roomCount"
              value={formData.roomCount}
              onChange={handleChange}
              required
              min="1"
            />
            {errors.roomCount && (
              <span className={styles.error}>{errors.roomCount}</span>
            )}
          </div>
          <div className={styles.formGroup}>
            <label>Foundation Depth (meters)</label>
            <input
              type="number"
              name="foundationDepth"
              value={formData.foundationDepth}
              onChange={handleChange}
              required
              min="0"
              step="0.1"
            />
            {errors.foundationDepth && (
              <span className={styles.error}>{errors.foundationDepth}</span>
            )}
          </div>

          {/* Select Location */}
          <div className={styles.formGroup}>
            <label>Select Location:</label>
            <select
              onChange={(e) => handleLocationSelect(e.target.value)}
              value={selectedLocation}
            >
              <option value="" disabled>Select a location</option>
              {locations.map(location => (
                <option key={location._id} value={location.name}>
                  {location.name} - {location.markup}% markup
                </option>
              ))}
            </select>
            {errors.location && (
              <span className={styles.error}>{errors.location}</span>
            )}
          </div>

         
{isProjectBased ? (
  <>
    <div className={styles.formGroup}>
      <label>Number of Floors (from project):</label>
      <input
        type="number"
        name="numFloors"
        value={formData.numFloors || ''}
        readOnly
      />
    </div>
    <div className={styles.formGroup}>
      <label>Template (from project):</label>
      <input
        type="text"
        name="selectedTemplateId"
        value={templates.find((t) => t._id === formData.selectedTemplateId)?.title || ''}
        readOnly
      />
    </div>
  </>
) : (
  <>
    <div className={styles.formGroup}>
      <label>Number of Floors</label>
      <input
        type="number"
        name="numFloors"
        value={formData.numFloors}
        onChange={handleChange}
        required
        min="1"
        max="5"
      />
      {errors.numFloors && (
        <span className={styles.error}>{errors.numFloors}</span>
      )}
    </div>
    <div className={styles.formGroup}>
      <label>Select Template</label>
      <select
        name="selectedTemplateId"
        value={formData.selectedTemplateId}
        onChange={handleChange}
        required
      >
        <option value="" disabled>Select a template</option>
        {templates.map((template) => (
          <option key={template._id} value={template._id}>
            {template.title} ({template.tier.charAt(0).toUpperCase() + template.tier.slice(1)})
          </option>
        ))}
      </select>
      {errors.selectedTemplateId && (
        <span className={styles.error}>{errors.selectedTemplateId}</span>
      )}
    </div>
  </>
)}


          {/* Submit and Close Buttons */}
          <button type="submit" className={styles.submitButton} disabled={isLoadingBOM}>
            {isLoadingBOM ? 'Generating BOM...' : 'Generate BOM'}
          </button>
          <button type="button" onClick={onClose} className={styles.closeButton}>
            Close
          </button>
        </form>
      </div>
    </div>
  );
};

const Generator = () => {
  const [formData, setFormData] = useState({
    totalArea: '',
    avgFloorHeight: '',
    selectedTemplateId: '', // Replaced templateTier with selectedTemplateId
    numFloors: '',
    roomCount: '',
    foundationDepth: '',
  });
  const [errors, setErrors] = useState({});
  const [bom, setBom] = useState(null);
  const [serverError, setServerError] = useState(null);
  const { user } = useContext(AuthContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectBased, setIsProjectBased] = useState(false);
  const [materialToReplace, setMaterialToReplace] = useState(null);
  const [locations, setLocations] = useState([]); 
  const [selectedLocation, setSelectedLocation] = useState(""); 
  const [isLoadingProjects, setIsLoadingProjects] = useState(false); 
  const [isLoadingBOM, setIsLoadingBOM] = useState(false); 

  // Alert Modal States
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info"); // Default type

  // Function to show alerts
  const showAlert = (title, message, type = "info") => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setIsAlertOpen(true);
  };

    
  
  useEffect(() => {
    // Check if the user and user.token exist
    if (user && user.token) {
      setIsLoadingProjects(true);

      // Fetch projects for the contractor
      Axios.get(`https://foxconstruction-final.onrender.com/api/project/contractor`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
        .then(response => {
          setProjects(response.data);
        })
        .catch(error => {
          console.error("Error fetching projects:", error);
          showAlert("Error", "Failed to fetch projects. Please try again later.", "error");
        })
        .finally(() => {
          setIsLoadingProjects(false);
        });

      // Fetch locations
      Axios.get('https://foxconstruction-final.onrender.com/api/locations', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
        .then(response => {
          setLocations(response.data);
        })
        .catch(error => {
          console.error("Error fetching locations:", error);
          showAlert("Error", "Failed to fetch locations. Please try again later.", "error");
        });

      // Fetch templates
      Axios.get('https://foxconstruction-final.onrender.com/api/templates', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
        .then(response => {
          setTemplates(response.data.templates);
        })
        .catch(error => {
          console.error("Error fetching templates:", error);
          showAlert("Error", "Failed to fetch templates. Please try again later.", "error");
        });

    } else {
      console.error("User is not authenticated or token is missing");
      showAlert("Authentication Error", "User is not authenticated. Please log in again.", "error");
    }
  }, [user]);

  const handleProjectSelect = (projectId) => {
    const project = projects.find((p) => p._id === projectId);
    if (project) {
      setSelectedProject(project);
      setFormData({
        totalArea: project.totalArea || '',
        avgFloorHeight: project.avgFloorHeight || '',
        selectedTemplateId: project.template || '', // Set selectedTemplateId to project template ID
        numFloors: project.floors.length.toString(),
        roomCount: project.roomCount || '',        // Auto-populate roomCount
        foundationDepth: project.foundationDepth || '' // Auto-populate foundationDepth
      });
      setSelectedLocation(project.location);
    }
  };

  const handleGenerateBOMPDF = (version = 'client') => {
    if (!bom) return;

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
    doc.text(`Total Area: ${bom.projectDetails.totalArea} sqm`, 10, yPosition);
    yPosition += 10;
    doc.text(`Number of Floors: ${bom.projectDetails.numFloors}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Floor Height: ${bom.projectDetails.avgFloorHeight} meters`, 10, yPosition);
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
        const markup = bom.projectDetails.location.markup;
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
        doc.text(`Location: ${bom.projectDetails.location.name} (Markup: ${markup}%)`, 10, yPosition);
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
                head: [['Item', 'Description', 'Quantity', 'Unit', 'Unit Cost (PHP)','Total Amount (PHP)']],
                body: category.materials.map((material, index) => [
                    `${categoryIndex + 1}.${index + 1}`,
                    material.description || 'N/A',
                    material.quantity ? material.quantity.toFixed(2) : 'N/A',
                    material.unit || 'N/A',
                    `PHP ${new Intl.NumberFormat('en-PH', { style: 'decimal', minimumFractionDigits: 2 }).format(material.cost)}`,
                    `PHP ${new Intl.NumberFormat('en-PH', { style: 'decimal', minimumFractionDigits: 2 }).format(material.totalAmount)}`
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

    // Save the PDF with the selected version
    doc.save(`BOM_${version}.pdf`);
  };

  const handleLocationSelect = (locationName) => {
    setSelectedLocation(locationName);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedFormData = { ...formData };

    if (name === 'numFloors') {
      if (value > 5) {
        updatedFormData[name] = 5;
        setErrors({ ...errors, numFloors: 'Maximum allowed floors is 5. Resetting to 5.' });
        showAlert("Validation Error", "Maximum allowed floors is 5. Resetting to 5.", "error");
      } else {
        updatedFormData[name] = value;
        setErrors({ ...errors, numFloors: '' });
      }
    } else if (name === 'avgFloorHeight') {
      if (value > 15) {
        updatedFormData[name] = 15;
        setErrors({ ...errors, avgFloorHeight: 'Maximum floor height is 15 meters. Resetting to 15.' });
        showAlert("Validation Error", "Maximum floor height is 15 meters. Resetting to 15.", "error");
      } else if (value < 0) {
        updatedFormData[name] = 0;
        setErrors({ ...errors, avgFloorHeight: 'Floor height cannot be negative. Resetting to 0.' });
        showAlert("Validation Error", "Floor height cannot be negative. Resetting to 0.", "error");
      } else {
        updatedFormData[name] = value;
        setErrors({ ...errors, avgFloorHeight: '' });
      }
    } else {
      updatedFormData[name] = value;
    }

    setFormData(updatedFormData);
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['totalArea', 'avgFloorHeight', 'roomCount', 'foundationDepth'];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    if (!selectedLocation) {
      newErrors.location = 'Please select a location';
      showAlert("Validation Error", "Please select a location.", "error");
    }

    if (isProjectBased) {
      if (!selectedProject || !formData.numFloors || !formData.selectedTemplateId) {
        newErrors.project = 'Please select a project and ensure it has the necessary details.';
        showAlert("Validation Error", "Please select a project and ensure it has the necessary details.", "error");
      }
    } else {
      if (!formData.numFloors) {
        newErrors.numFloors = 'This field is required';
        showAlert("Validation Error", "Number of floors is required.", "error");
      }
      if (!formData.selectedTemplateId) {
        newErrors.selectedTemplateId = 'Please select a template';
        showAlert("Validation Error", "Please select a template.", "error");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError(null);

    if (validateForm()) {
      setIsLoadingBOM(true);
      const payload = {
        totalArea: parseFloat(formData.totalArea),
        numFloors: parseInt(formData.numFloors, 10),
        avgFloorHeight: parseFloat(formData.avgFloorHeight),
        templateId: formData.selectedTemplateId, // Updated field
        locationName: selectedLocation,
        roomCount: parseInt(formData.roomCount, 10),
        foundationDepth: parseFloat(formData.foundationDepth)
      };

      Axios.post(`https://foxconstruction-final.onrender.com/api/bom/generate`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      })
        .then((response) => {
          setBom(response.data.bom);
          setModalOpen(false);

          // Show success alert
          showAlert("Success", "BOM generated successfully.", "success");
        })
        .catch((error) => {
          console.error('Error generating BOM:', error);
          if (error.response && error.response.data && error.response.data.error) {
            setServerError(error.response.data.error);
            showAlert("Error", error.response.data.error, "error");
          } else {
            setServerError('An unexpected error occurred.');
            showAlert("Error", "An unexpected error occurred.", "error");
          }
        })
        .finally(() => {
          setIsLoadingBOM(false);
        });
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setBom(null);
    setFormData({
      totalArea: '',
      avgFloorHeight: '',
      selectedTemplateId: '', // Reset this field
      numFloors: '',
      roomCount: '',
      foundationDepth: '',
    });
    setSelectedProject(null);
    setSelectedLocation("");
    setErrors({});
  };

  const handleReplaceClick = (material) => {
    setMaterialToReplace(material);
    setMaterialModalOpen(true);
  };

  const handleMaterialSelect = (newMaterial) => {
    if (materialToReplace && bom) {
      const updatedCategories = bom.categories.map((category) => {
        const updatedMaterials = category.materials.map((material) => {
          if (material._id === materialToReplace._id) {
            return {
              ...material,
              description: newMaterial.description,
              cost: newMaterial.cost,
              totalAmount: material.quantity * newMaterial.cost, // Update totalAmount
            };
          }
          return material;
        });
        return { ...category, materials: updatedMaterials };
      });

      const updatedBom = {
        ...bom,
        categories: updatedCategories,
      };

      const { originalTotalProjectCost, markedUpTotalProjectCost } = calculateUpdatedCosts(updatedBom);

      setBom({
        ...updatedBom,
        originalCosts: {
          ...bom.originalCosts,
          totalProjectCost: originalTotalProjectCost,
        },
        markedUpCosts: {
          ...bom.markedUpCosts,
          totalProjectCost: markedUpTotalProjectCost,
        },
      });

      setMaterialModalOpen(false);

      // Show success alert
      showAlert("Success", "Material replaced successfully.", "success");
    }
  };

  
  const calculateUpdatedCosts = (bom) => {
    
    const totalMaterialsCost = bom.categories.reduce((sum, category) => {
      return sum + category.materials.reduce((subSum, material) => subSum + material.totalAmount, 0);
    }, 0);

    
    const originalLaborCost = bom.originalCosts.laborCost;

    
    const originalTotalProjectCost = totalMaterialsCost + originalLaborCost;

    
    const markupPercentage = bom.projectDetails.location.markup / 100;
    const markedUpTotalProjectCost = originalTotalProjectCost + (originalTotalProjectCost * markupPercentage);

    return {
      originalTotalProjectCost,
      markedUpTotalProjectCost,
    };
  };

  const handleSaveBOM = () => {
    const payload = {
      bom: {
        projectDetails: bom.projectDetails,
        categories: bom.categories, 
        originalCosts: bom.originalCosts,
        markedUpCosts: bom.markedUpCosts,
      },
    };
    
    Axios.post(`https://foxconstruction-final.onrender.com/api/project/${selectedProject._id}/bom`, payload, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((response) => {
        // Replace alert with showAlert
        showAlert("Success", "BOM saved to the project!", "success");
      })
      .catch((error) => {
        console.error('Failed to save BOM to project:', error);
        // Replace alert with showAlert
        showAlert("Error", "Failed to save BOM to the project.", "error");
      });
  };

  return (
    <>
      <Navbar />
      <div className={styles.headerContainer}>
        <h2>Generate BOM</h2>
        <div className={styles.buttonContainer}>
          <button onClick={() => { setIsProjectBased(true); setModalOpen(true); }} className={styles.openModalButton}>
            Generate BOM with Project
          </button>
          <button onClick={() => { setIsProjectBased(false); setModalOpen(true); }} className={styles.openModalButton}>
            Custom Generate BOM
          </button>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        handleChange={handleChange}
        errors={errors}
        projects={projects}
        handleProjectSelect={handleProjectSelect}
        selectedProject={selectedProject}
        isProjectBased={isProjectBased}
        locations={locations}
        handleLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
        isLoadingProjects={isLoadingProjects}
        isLoadingBOM={isLoadingBOM}
        templates={templates} // Pass templates to Modal
      />

      {serverError && (
        // Remove this div as alerts are handled via AlertModal
        null
      )}

      {bom && (
        <div className={styles.bomContainer}>
          <div className={styles.detailsContainer}>
            <div className={styles.projectDetails}>
              <h3>Project Details</h3>
              {isProjectBased && selectedProject && (
                <>
                  <p><strong>Project Name:</strong> {selectedProject.name}</p>
                  <p><strong>Project Owner:</strong> {selectedProject.user}</p>
                </>
              )}
              <p><strong>Total Area:</strong> {bom.projectDetails.totalArea} sqm</p>
              <p><strong>Number of Floors:</strong> {bom.projectDetails.numFloors}</p>
              <p><strong>Room count:</strong> {bom.projectDetails.roomCount} meters</p> 
              <p><strong>Floor Height:</strong> {bom.projectDetails.avgFloorHeight} meters</p>
              <p><strong>Foundation depth:</strong> {bom.projectDetails.foundationDepth} meters</p>
              <p><strong>Location:</strong> {bom.projectDetails.location.name}</p>
              <p><strong>Markup:</strong> {bom.projectDetails.location.markup}%</p>
            </div>

            <div className={styles.costDetails}>
              <h3>Original Costs</h3>
              <p><strong>Original Labor Cost:</strong>
                {bom.originalCosts.laborCost ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(bom.originalCosts.laborCost) : 'N/A'}
              </p>
              <p><strong>Original Total Project Cost:</strong>
                {bom.originalCosts.totalProjectCost ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(bom.originalCosts.totalProjectCost) : 'N/A'}
              </p>

              <h3>Marked-Up Costs</h3>
              <p><strong>Marked-Up Labor Cost:</strong>
                {bom.markedUpCosts.laborCost ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(bom.markedUpCosts.laborCost) : 'N/A'}
              </p>
              <p><strong>Marked-Up Total Project Cost:</strong>
                {bom.markedUpCosts.totalProjectCost ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(bom.markedUpCosts.totalProjectCost) : 'N/A'}
              </p>
            </div>
          </div>

          <h3>Materials</h3>
          {bom && bom.categories && bom.categories.length > 0 ? (
            <div className={styles.scrollableTableContainer}>
              <table className={styles.materialsTable}>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Item</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Unit Cost (₱)</th>
                    <th>Total Amount (₱)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bom.categories.map((categoryData, categoryIndex) => (
                    <React.Fragment key={categoryIndex}> {/* Ensure unique key for each category */}
                      {categoryData.materials.map((material, index) => (
                        <tr key={`${categoryData.category}-${material._id || index}`}> {/* Ensure unique key for each material */}
                          <td>{categoryData.category ? categoryData.category.toUpperCase() : 'UNCATEGORIZED'}</td>
                          <td>{material.item || 'N/A'}</td>
                          <td>{material.description || 'N/A'}</td>
                          <td>{material.quantity ? Math.round(material.quantity) : 'N/A'}</td>
                          <td>{material.unit || 'N/A'}</td>
                          <td>{material.cost ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(material.cost) : 'N/A'}</td>
                          <td>{typeof material.totalAmount === 'number' ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(material.totalAmount) : 'N/A'}</td>
                          <td><button className={styles.replaceButton} onClick={() => handleReplaceClick(material)}>Replace</button></td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'right' }}><strong>Total for {categoryData.category ? categoryData.category.toUpperCase() : 'UNCATEGORIZED'}:</strong></td>
                        <td><strong>{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(categoryData.categoryTotal)}</strong></td>
                        <td></td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No materials found</p>
          )}
          {isProjectBased && ( 
            <button onClick={handleSaveBOM} className={styles.saveBOMButton}>
              Save BOM to Project
            </button>
          )}

{bom && (
  <div className={styles.downloadButtonContainer}>
    <button onClick={() => handleGenerateBOMPDF('client')} className={styles.downloadButton}>
      Download BOM for Client
    </button>
    <button onClick={() => handleGenerateBOMPDF('contractor')} className={styles.downloadButton}>
      Download BOM for Contractor
    </button>
  </div>
)}
        </div>
      )}

      <MaterialSearchModal
        isOpen={materialModalOpen}
        onClose={() => setMaterialModalOpen(false)}
        onMaterialSelect={handleMaterialSelect}
        materialToReplace={materialToReplace}
        user={user} 
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
      />
    </>
  );
};

export default Generator;
