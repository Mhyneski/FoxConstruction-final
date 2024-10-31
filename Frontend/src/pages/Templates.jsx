// src/components/Templates.jsx
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import styles from "../css/Templates.module.css";
import { AuthContext } from "../context/AuthContext";
import ConfirmDeleteTemplate from "../components/ConfirmDeleteTemplate";
import Select from 'react-select'; 
import AlertModal from '../components/AlertModal'; // Import AlertModal

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
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
    <p>Please wait, fetching templates...</p>
  </div>
);

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    type: "",
    tier: "",
    totalArea: "",
    numFloors: "",
    avgFloorHeight: "",
    roomCount: "",
    foundationDepth: "",
  });
  const [materials, setMaterials] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newMaterial, setNewMaterial] = useState({
    materialId: "",
    description: "",
    quantity: "",
    unit: "",
    cost: "",
    scaling: {
      areaFactor: 1,
      heightFactor: 1,
      roomCountFactor: 1,
      foundationDepthFactor: 1,
    },
  });
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTemplateId, setEditTemplateId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useContext(AuthContext);

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

  // Predefined units
  const units = ["pcs", "bags", "kg", "m", "sqm", "cu.m", "liters", "sets"];

  // Fetch all templates
  useEffect(() => {
    if (!user || !user.token) return;

    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`https://foxconstruction-final.onrender.com/api/templates`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTemplates(response.data.templates);
      } catch (error) {
        console.error("Error fetching templates:", error);
        showAlert("Error", "Failed to fetch templates. Please try again later.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
    fetchMaterials(); 
  }, [user]);

  // Fetch details of a specific template
const fetchTemplateDetails = async (templateId) => {
  try {
    const response = await axios.get(`https://foxconstruction-final.onrender.com/api/templates/${templateId}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setSelectedTemplate(response.data.template);
  } catch (error) {
    console.error("Error fetching template details:", error);
    showAlert("Error", "Failed to fetch template details. Please try again later.", "error");
  }
};


const handleRemoveMaterial = async (categoryName, materialId) => {
  try {
    const templateId = selectedTemplate._id;

    await axios.delete(
      `https://foxconstruction-final.onrender.com/api/templates/${templateId}/categories/${categoryName}/materials/${materialId}`,
      {
        headers: { Authorization: `Bearer ${user.token}` },
      }
    );

    // Refresh the template data after removing the material
    fetchTemplateDetails(templateId);
    showAlert("Success", "Material removed successfully.", "success");
  } catch (error) {
    console.error("Error removing material:", error);
    showAlert("Error", error.response?.data?.error || "Failed to remove material. Please try again later.", "error");
  }
};

  

  // Fetch materials
  const fetchMaterials = async () => {
    try {
      const response = await axios.get(`https://foxconstruction-final.onrender.com/api/materials`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMaterials(response.data);
    } catch (error) {
      console.error("Error fetching materials:", error);
      showAlert("Error", "Failed to fetch materials. Please try again later.", "error");
    }
  };

  // Validate template fields
  const isValid = () => {
    const {
      title,
      type,
      tier,
      totalArea,
      numFloors,
      avgFloorHeight,
      roomCount,
      foundationDepth,
    } = newTemplate;

    const errors = [];

    if (title.trim() === "") errors.push("Title is required.");
    if (type.trim() === "") errors.push("Type is required.");
    if (tier.trim() === "") errors.push("Tier is required.");
    if (totalArea === "" || parseFloat(totalArea) <= 0) errors.push("Total Area must be greater than 0.");
    if (numFloors === "" || parseInt(numFloors, 10) <= 0) errors.push("Number of Floors must be greater than 0.");
    if (numFloors > 6) errors.push("Number of Floors cannot exceed 6.");
    if (avgFloorHeight === "" || parseFloat(avgFloorHeight) <= 0) errors.push("Average Floor Height must be greater than 0.");
    if (avgFloorHeight > 15) errors.push("Average Floor Height cannot exceed 15 meters.");
    if (roomCount === "" || parseInt(roomCount, 10) <= 0) errors.push("Room Count must be greater than 0.");
    if (foundationDepth === "" || parseFloat(foundationDepth) <= 0) errors.push("Foundation Depth must be greater than 0.");

    if (errors.length > 0) {
      showAlert("Validation Error", errors.join(" "), "error");
      return false;
    }

    return true;
  };

  // Handle creating a new template
  const handleCreateTemplate = async () => {
    // Validation is handled in isValid()
    if (!isValid()) {
      return;
    }
    try {
      const response = await axios.post(
        `https://foxconstruction-final.onrender.com/api/templates`,
        newTemplate,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      setTemplates([...templates, response.data.template]);
      resetTemplateForm();
      setIsModalOpen(false);
      showAlert("Success", "Template created successfully.", "success");
    } catch (error) {
      console.error("Error creating template:", error);
      showAlert("Error", "Failed to create template. Please try again later.", "error");
    }
  };

  // Handle updating an existing template
  const handleUpdateTemplate = async () => {
    // Validation is handled in isValid()
    if (!isValid()) {
      return;
    }
    try {
      const response = await axios.patch(
        `https://foxconstruction-final.onrender.com/api/templates/${editTemplateId}`,
        newTemplate,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      const updatedTemplates = templates.map((template) =>
        template._id === editTemplateId ? response.data.template : template
      );

      setTemplates(updatedTemplates);
      resetTemplateForm();
      setIsEditing(false);
      setIsModalOpen(false);
      showAlert("Success", "Template updated successfully.", "success");
    } catch (error) {
      console.error("Error updating template:", error);
      showAlert("Error", "Failed to update template. Please try again later.", "error");
    }
  };

  // Handle deleting a template
  const handleDeleteTemplate = async () => {
    try {
      await axios.delete(`https://foxconstruction-final.onrender.com/api/templates/${selectedTemplate._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setTemplates(templates.filter((template) => template._id !== selectedTemplate._id));
      setShowDeleteModal(false);
      setSelectedTemplate(null);
      showAlert("Success", "Template deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting template:", error);
      showAlert("Error", "Failed to delete template. Please try again later.", "error");
    }
  };

  // Reset the template form
  const resetTemplateForm = () => {
    setNewTemplate({
      title: "",
      type: "",
      tier: "",
      totalArea: "",
      numFloors: "",
      avgFloorHeight: "",
      roomCount: "",
      foundationDepth: "",
    });
  };

  // Handle editing a template
  const handleEditTemplate = (template) => {
    setIsEditing(true);
    setEditTemplateId(template._id);
    setNewTemplate({
      title: template.title,
      type: template.type,
      tier: template.tier,
      totalArea: template.totalArea || "",
      numFloors: template.numFloors || "",
      avgFloorHeight: template.avgFloorHeight || "",
      roomCount: template.roomCount || "",
      foundationDepth: template.foundationDepth || "",
    });
    setIsModalOpen(true);
  };

  // View template details in the modal
  const handleViewTemplateDetails = (template) => {
    setSelectedTemplate(template);
    setShowDetailsModal(true);
  };

  // Handle delete confirmation
  const handleDeleteClick = (template) => {
    setSelectedTemplate(template);
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (selectedTemplate) {
      handleDeleteTemplate();
    } else {
      console.error("No template selected for deletion.");
      showAlert("Error", "No template selected for deletion.", "error");
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedTemplate(null);
  };

  // Filter templates based on search term
  const filterTemplates = () => {
    if (!searchTerm) return templates;
    return templates.filter(
      (template) =>
        template.title && template.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleAddMaterialClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setShowAddMaterialModal(true);
    // Reset newMaterial
    setNewMaterial({
      materialId: "",
      description: "",
      quantity: "",
      unit: "",
      cost: "",
      scaling: {
        areaFactor: 1,
        heightFactor: 1,
        roomCountFactor: 1,
        foundationDepthFactor: 1,
      },
    });
  };

  const handleAddMaterial = async () => {
    // Validate material fields
    const {
      materialId,
      description,
      quantity,
      unit,
      cost,
      scaling: { areaFactor, heightFactor, roomCountFactor, foundationDepthFactor },
    } = newMaterial;

    const materialErrors = [];

    if (!materialId && description.trim() === "") {
      materialErrors.push("Description is required for new materials.");
    }

    if (quantity === "" || parseFloat(quantity) <= 0) {
      materialErrors.push("Quantity must be greater than 0.");
    }

    if (!materialId && unit.trim() === "") {
      materialErrors.push("Unit is required for new materials.");
    }

    if (!materialId && (cost === "" || parseFloat(cost) <= 0)) {
      materialErrors.push("Cost must be greater than 0 for new materials.");
    }

    if (materialErrors.length > 0) {
      showAlert("Validation Error", materialErrors.join(" "), "error");
      return;
    }

    try {
      const templateId = selectedTemplate._id;
      const categoryName = selectedCategory;

      // Prepare the data to send
      const data = {
        materialId: materialId || undefined,
        description: materialId ? undefined : description || undefined,
        unit: materialId ? undefined : unit || undefined,
        cost: materialId ? undefined : cost || undefined,
        quantity: parseFloat(quantity),
        scaling: {
          areaFactor: parseFloat(areaFactor),
          heightFactor: parseFloat(heightFactor),
          roomCountFactor: parseFloat(roomCountFactor),
          foundationDepthFactor: parseFloat(foundationDepthFactor),
        },
      };

      // Remove undefined fields
      Object.keys(data).forEach(
        (key) => data[key] === undefined && delete data[key]
      );

      const response = await axios.post(
        `https://foxconstruction-final.onrender.com/api/templates/${templateId}/categories/${categoryName}/materials`,
        data,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      // Update the selectedTemplate with the new data
      setSelectedTemplate(response.data.template);

      // Reset the form
      setNewMaterial({
        materialId: "",
        description: "",
        quantity: "",
        unit: "",
        cost: "",
        scaling: {
          areaFactor: 1,
          heightFactor: 1,
          roomCountFactor: 1,
          foundationDepthFactor: 1,
        },
      });
        // Refresh the template data after adding the material
        fetchTemplateDetails(templateId);
  
      setShowAddMaterialModal(false);
      showAlert("Success", "Material added successfully.", "success");
    } catch (error) {
      console.error("Error adding material:", error);
      showAlert("Error", "Failed to add material. Please try again later.", "error");
    }
  };

  const closeAddMaterialModal = () => {
    setShowAddMaterialModal(false);
    setNewMaterial({
      materialId: "",
      description: "",
      quantity: "",
      unit: "",
      cost: "",
      scaling: {
        areaFactor: 1,
        heightFactor: 1,
        roomCountFactor: 1,
        foundationDepthFactor: 1,
      },
    });
  };

  const filteredTemplates = filterTemplates();

  // Prepare options for React Select
  const materialOptions = materials.map((material) => ({
    value: material._id,
    label: material.description,
    material, // Include the full material object for later use
  }));

  return (
    <>
      <Navbar />
      <div className={styles.templatesContainer}>
        <h2 className={styles.heading}>Templates</h2>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className={styles.searchBarContainer}>
              <input
                type="text"
                placeholder="Search templates"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <button
                onClick={() => {
                  setIsEditing(false);
                  resetTemplateForm();
                  setIsModalOpen(true);
                }}
                className={styles.createButton}
              >
                + Create Template
              </button>
            </div>
            <p className={styles.templateCount}>
              Total Templates: {filteredTemplates.length}
            </p>

            <div className={styles.scrollableTableContainer}>
              <table className={styles.templatesTable}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Tier</th>
                    <th>Date Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTemplates.map((template) => (
                    <tr key={template._id}>
                      <td onClick={() => handleViewTemplateDetails(template)}>
                        {template.title}
                      </td>
                      <td onClick={() => handleViewTemplateDetails(template)}>
                        {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                      </td>
                      <td onClick={() => handleViewTemplateDetails(template)}>
                        {template.tier.charAt(0).toUpperCase() + template.tier.slice(1)}
                      </td>
                      <td onClick={() => handleViewTemplateDetails(template)}>
                        {new Date(template.createdAt).toLocaleDateString()}
                      </td>
                      <td>
  {template.createdBy && (
    <>
      <button
        onClick={() => handleEditTemplate(template)}
        className={styles.editButton}
      >
        Edit
      </button>
      <button
        onClick={() => handleDeleteClick(template)}
        className={styles.deleteButton}
      >
        Delete
      </button>
    </>
  )}
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {showDetailsModal && selectedTemplate && (
          <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)}>
            <h3>Template Details - {selectedTemplate.title}</h3>
            <span
              className={styles.modalCloseButton}
              onClick={() => setShowDetailsModal(false)}
            >
              &times;
            </span>
            <p>
              <strong>Type:</strong>{" "}
              {selectedTemplate.type.charAt(0).toUpperCase() +
                selectedTemplate.type.slice(1)}
            </p>
            <p>
              <strong>Tier:</strong>{" "}
              {selectedTemplate.tier.charAt(0).toUpperCase() +
                selectedTemplate.tier.slice(1)}
            </p>
            <p>
              <strong>Date Created:</strong>{" "}
              {new Date(selectedTemplate.createdAt).toLocaleDateString()}
            </p>

            {/* New Fields */}
            <p>
              <strong>Total Area:</strong> {selectedTemplate.bom.totalArea} sqm
            </p>
            <p>
              <strong>Number of Floors:</strong> {selectedTemplate.bom.numFloors}
            </p>
            <p>
              <strong>Average Floor Height:</strong> {selectedTemplate.bom.avgFloorHeight} m
            </p>
            <p>
              <strong>Number of Rooms:</strong> {selectedTemplate.bom.roomCount}
            </p>
            <p>
              <strong>Foundation Depth:</strong> {selectedTemplate.bom.foundationDepth} m
            </p>

            {/* Categories and Materials */}
<h4>Categories and Materials</h4>
{selectedTemplate.bom.categories.map((category) => (
  <div key={category.category} className={styles.categorySection}>
    <h5>{category.category}</h5>

    {/* Conditionally show Add Material button only if template is not default */}
    {selectedTemplate.createdBy && (
      <button
        className={styles.addMaterialButton}
        onClick={() => handleAddMaterialClick(category.category)}
      >
        Add Material
      </button>
    )}

    {category.materials.length > 0 ? (
      <ul>
        {category.materials.map((material, index) => (
          <li key={index}>
            <p>
              <strong>{material.description}</strong> - {material.quantity}{" "}
              {material.unit} @ ₱{material.cost} each
            </p>

            {/* Remove Material Button */}
            {selectedTemplate.createdBy && (
              <button
                className={styles.removeMaterialButton}
                onClick={() => handleRemoveMaterial(category.category, material._id)}
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
    ) : (
      <p>No materials in this category.</p>
    )}
  </div>
))}


          </Modal>
        )}

        {showAddMaterialModal && (
          <Modal isOpen={showAddMaterialModal} onClose={closeAddMaterialModal}>
            <div className={styles.modalForm}>
              <h3>Add Material to {selectedCategory}</h3>
              <span
                className={styles.modalCloseButton}
                onClick={closeAddMaterialModal}
              >
                &times;
              </span>

              {/* React Select for Existing Materials */}
              <h4>Select Existing Material</h4>
              <Select
                options={materialOptions}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    const { material } = selectedOption;
                    setNewMaterial({
                      ...newMaterial,
                      materialId: material._id,
                      description: material.description,
                      unit: material.unit,
                      cost: material.cost,
                    });
                  } else {
                    // If selection is cleared
                    setNewMaterial({
                      ...newMaterial,
                      materialId: "",
                      description: "",
                      unit: "",
                      cost: "",
                    });
                  }
                }}
                placeholder="Search and select material"
                isClearable
              />

              {/* Option to input new material */}
              <h4>Or Input New Material</h4>
              {/* Only show these fields if no materialId is selected */}
              {!newMaterial.materialId && (
                <>
                  <input
                    type="text"
                    placeholder="Description"
                    value={newMaterial.description}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        description: e.target.value,
                        materialId: "", // Clear materialId
                      })
                    }
                    className={styles.inputField}
                  />
                  <select
                    value={newMaterial.unit}
                    onChange={(e) =>
                      setNewMaterial({ ...newMaterial, unit: e.target.value })
                    }
                    className={styles.inputField}
                  >
                    <option value="">Select Unit</option>
                    {units.map((unit, index) => (
                      <option key={index} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Cost"
                    value={newMaterial.cost}
                    onChange={(e) =>
                      setNewMaterial({ ...newMaterial, cost: e.target.value })
                    }
                    className={styles.inputField}
                    min="0"
                  />
                </>
              )}

              {/* Common Fields */}
              <h4>Quantity</h4>
              <input
                type="number"
                placeholder="Quantity"
                value={newMaterial.quantity}
                onChange={(e) =>
                  setNewMaterial({ ...newMaterial, quantity: e.target.value })
                }
                className={styles.inputField}
                min="0"
              />

              {/* Scaling Factors */}
              <h4>Scaling Factors</h4>
              <label>
                <input
                  type="checkbox"
                  checked={newMaterial.scaling.areaFactor === 1}
                  onChange={(e) =>
                    setNewMaterial({
                      ...newMaterial,
                      scaling: {
                        ...newMaterial.scaling,
                        areaFactor: e.target.checked ? 1 : 0,
                      },
                    })
                  }
                />
                Area Factor
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={newMaterial.scaling.heightFactor === 1}
                  onChange={(e) =>
                    setNewMaterial({
                      ...newMaterial,
                      scaling: {
                        ...newMaterial.scaling,
                        heightFactor: e.target.checked ? 1 : 0,
                      },
                    })
                  }
                />
                Height Factor
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={newMaterial.scaling.roomCountFactor === 1}
                  onChange={(e) =>
                    setNewMaterial({
                      ...newMaterial,
                      scaling: {
                        ...newMaterial.scaling,
                        roomCountFactor: e.target.checked ? 1 : 0,
                      },
                    })
                  }
                />
                Room Count Factor
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={newMaterial.scaling.foundationDepthFactor === 1}
                  onChange={(e) =>
                    setNewMaterial({
                      ...newMaterial,
                      scaling: {
                        ...newMaterial.scaling,
                        foundationDepthFactor: e.target.checked ? 1 : 0,
                      },
                    })
                  }
                />
                Foundation Depth Factor
              </label>

              <button className={styles.createButton} onClick={handleAddMaterial}>
                Add Material
              </button>
            </div>
          </Modal>
        )}

        {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className={styles.modalForm}>
              <h3>{isEditing ? "Edit Template" : "Create New Template"}</h3>
              <span
                className={styles.modalCloseButton}
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </span>
              <input
                type="text"
                placeholder="Template Title"
                value={newTemplate.title}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, title: e.target.value })
                }
                className={styles.inputField}
              />
              <select
                value={newTemplate.type}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, type: e.target.value })
                }
                className={styles.inputField}
              >
                <option value="" disabled>
                  Select Type
                </option>
                <option value="residential">Residential</option>
              </select>
              <select
                value={newTemplate.tier}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, tier: e.target.value })
                }
                className={styles.inputField}
              >
                <option value="" disabled>
                  Select Tier
                </option>
                <option value="economy">Economy</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>

              {/* New Fields */}
              <input
                type="number"
                placeholder="Total Area (sqm)"
                value={newTemplate.totalArea}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, totalArea: e.target.value })
                }
                className={styles.inputField}
                min="0"
              />
              <input
                type="number"
                placeholder="Number of Floors"
                value={newTemplate.numFloors}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, numFloors: e.target.value })
                }
                className={styles.inputField}
                min="1"
                max="6"
              />
              <input
                type="number"
                placeholder="Average Floor Height (m)"
                value={newTemplate.avgFloorHeight}
                onChange={(e) =>
                  setNewTemplate({
                    ...newTemplate,
                    avgFloorHeight: e.target.value,
                  })
                }
                className={styles.inputField}
                min="0"
                max="15"
              />
              <input
                type="number"
                placeholder="Number of Rooms"
                value={newTemplate.roomCount}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, roomCount: e.target.value })
                }
                className={styles.inputField}
                min="1"
              />
              <input
                type="number"
                placeholder="Foundation Depth (m)"
                value={newTemplate.foundationDepth}
                onChange={(e) =>
                  setNewTemplate({
                    ...newTemplate,
                    foundationDepth: e.target.value,
                  })
                }
                className={styles.inputField}
                min="0"
              />

              <button
                className={styles.createButton}
                onClick={isEditing ? handleUpdateTemplate : handleCreateTemplate}
              >
                {isEditing ? "Update Template" : "Create Template"}
              </button>
            </div>
          </Modal>
        )}

        <ConfirmDeleteTemplate
          show={showDeleteModal}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          itemName={selectedTemplate?.title || "this template"}
        />

        {/* Alert Modal */}
        <AlertModal
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

export default Templates;
