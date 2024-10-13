import { useState, useContext, useEffect } from 'react';
import Axios from 'axios';
import Navbar from "../components/Navbar";
import styles from '../css/Generator.module.css';
import { AuthContext } from "../context/AuthContext";

// Modal component definition for material selection
const MaterialSearchModal = ({ isOpen, onClose, onMaterialSelect, materialToReplace }) => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Fetch all materials when the modal is opened
      Axios.get('http://localhost:4000/api/materials')
        .then((response) => {
          setMaterials(response.data); // Load all materials into state
          setFilteredMaterials(response.data); // Initially show all materials
        })
        .catch((error) => {
          console.error('Error fetching materials:', error);
        });
    }
  }, [isOpen]);

  // Update the filtered materials based on the search term
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
        {/* Set max height and scroll */}
        <h2>Replace Material: {materialToReplace?.description || ''}</h2> {/* Note 'description' lowercase */}
        <input
          type="text"
          placeholder="Search materials"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Update the search term
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
                <p><strong>{material.description}</strong></p> {/* Ensure 'description' lowercase */}
                <p>Cost: ₱{material.cost.toFixed(2)}</p> {/* Show price */}
              </div>
            ))
          ) : (
            <p>No materials found</p>
          )}
        </div>
        <button onClick={onClose} className={styles.closeButton}>Close</button>
      </div>
    </div>
  ) : null;
};

// Main Modal component definition for project or template input
const Modal = ({ isOpen, onClose, onSubmit, formData, handleChange, errors, projects, handleProjectSelect, selectedProject, isProjectBased, locations, handleLocationSelect, selectedLocation }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{isProjectBased ? "Enter Base Template Details for Project" : "Enter Base Template Details"}</h2>
        <form onSubmit={onSubmit}>
          {isProjectBased && (
            <div className={styles.formGroup}>
              <label>Select Project:</label>
              <select onChange={(e) => handleProjectSelect(e.target.value)} value={selectedProject?._id || ''}>
                <option value="" disabled>Select a project</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
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
            />
            {errors.totalArea && (
              <span className={styles.error}>{errors.totalArea}</span>
            )}
          </div>
          <div className={styles.formGroup}>
            <label>Average Floor Height (meters)</label>
            <input
              type="number"
              name="avgFloorHeight"
              value={formData.avgFloorHeight}
              onChange={handleChange}
              required
            />
            {errors.avgFloorHeight && (
              <span className={styles.error}>{errors.avgFloorHeight}</span>
            )}
          </div>

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
                  value={formData.numFloors || ''}  // Use the formData for numFloors
                  readOnly  // Read-only as it's derived from the selected project
                />
              </div>
              <div className={styles.formGroup}>
                <label>Template Tier (from project):</label>
                <input
                  type="text"
                  name="templateTier"
                  value={formData.templateTier || ''}  // Use the formData for templateTier
                  readOnly  // Read-only as it's derived from the selected project
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
                />
                {errors.numFloors && (
                  <span className={styles.error}>{errors.numFloors}</span>
                )}
              </div>
              <div className={styles.formGroup}>
                <label>Template Tier</label>
                <select
                  name="templateTier"
                  value={formData.templateTier}
                  onChange={handleChange}
                  required
                >
                  <option value="economy">Economy</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
                {errors.templateTier && (
                  <span className={styles.error}>{errors.templateTier}</span>
                )}
              </div>
            </>
          )}

          <button type="submit" className={styles.submitButton}>
            Generate BOM
          </button>
          <button type="button" onClick={onClose} className={styles.closeButton}>
            Close
          </button>
        </form>
      </div>
    </div>
  );
};

// Generator component to handle BOM generation and material replacement
const Generator = () => {
  const [formData, setFormData] = useState({
    totalArea: '',
    avgFloorHeight: '',
    templateTier: '',
    numFloors: ''
  });
  const [errors, setErrors] = useState({});
  const [bom, setBom] = useState(null);
  const [serverError, setServerError] = useState(null);
  const { user } = useContext(AuthContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectBased, setIsProjectBased] = useState(false);
  const [materialToReplace, setMaterialToReplace] = useState(null);
  const [locations, setLocations] = useState([]); // Locations state
  const [selectedLocation, setSelectedLocation] = useState(""); // Selected location

  // Fetch all projects and locations
  useEffect(() => {
    Axios.get(`http://localhost:4000/api/project/contractor`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
    .then(response => {
      setProjects(response.data);
    })
    .catch(error => {
      console.error("Error fetching projects:", error);
    });

    // Fetch locations for markup
    Axios.get('http://localhost:4000/api/locations')
      .then(response => {
        setLocations(response.data);
      })
      .catch(error => {
        console.error("Error fetching locations:", error);
      });

  }, [user]);

  // Handle project selection
  const handleProjectSelect = (projectId) => {
    const project = projects.find(p => p._id === projectId);
    if (project) {
      setSelectedProject(project);
      setFormData({
        totalArea: '',
        avgFloorHeight: '',
        templateTier: project.template || '',
        numFloors: project.floors.length.toString(),  // Update the number of floors
      });
      setSelectedLocation(project.location); // Set the location from the project
    }
  };

  const handleLocationSelect = (locationName) => {
    setSelectedLocation(locationName);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['totalArea', 'avgFloorHeight'];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    if (!selectedLocation) {
      newErrors.location = 'Please select a location';
    }

    if (isProjectBased) {
      if (!selectedProject || !formData.numFloors || !formData.templateTier) {
        newErrors.project = 'Please select a project and ensure it has the necessary details.';
      }
    } else {
      if (!formData.numFloors) {
        newErrors.numFloors = 'This field is required';
      }
      if (!formData.templateTier) {
        newErrors.templateTier = 'This field is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError(null);

    if (validateForm()) {
      const payload = {
        totalArea: parseFloat(formData.totalArea),
        numFloors: parseInt(formData.numFloors, 10),
        avgFloorHeight: parseFloat(formData.avgFloorHeight),
        templateTier: formData.templateTier,
        locationName: selectedLocation,  // Use selected location
      };

      Axios.post(`http://localhost:4000/api/bom/generate`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      })
      .then(response => {
        setBom(response.data.bom);
        setModalOpen(false); // Close modal after submission
      })
      .catch(error => {
        console.error('Error generating BOM:', error);
        if (error.response && error.response.data && error.response.data.error) {
          setServerError(error.response.data.error);
        } else {
          setServerError('An unexpected error occurred.');
        }
      });
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setBom(null);
    setFormData({
      totalArea: '',
      avgFloorHeight: '',
      templateTier: '',
      numFloors: ''
    });
    setSelectedProject(null);
    setSelectedLocation("");
  };

  const handleReplaceClick = (material) => {
    setMaterialToReplace(material);
    setMaterialModalOpen(true);
  };

  const handleMaterialSelect = (newMaterial) => {
    if (materialToReplace && bom) {
      const updatedMaterials = bom.materials.UNCATEGORIZED.map((material) => {
        if (material._id === materialToReplace._id) {
          const newTotalAmount = material.quantity * newMaterial.cost;
          return {
            ...material,
            description: newMaterial.description,
            unitCost: newMaterial.cost,
            totalAmount: newTotalAmount ? newTotalAmount.toFixed(2) : 'N/A',  // Ensure total amount is recalculated
          };
        }
        return material;
      });

      const updatedBom = {
        ...bom,
        materials: { ...bom.materials, UNCATEGORIZED: updatedMaterials },
        totalProjectCost: calculateUpdatedCost(updatedMaterials),
      };

      setBom(updatedBom);
      setMaterialModalOpen(false);
    }
  };

  const calculateUpdatedCost = (materials) => {
    return materials.reduce((total, material) => {
      const materialCost = material.quantity * material.unitCost;
      return total + (materialCost || 0);
    }, bom.laborCost || 0); // Include labor cost
  };

  const handleSaveBOM = () => {
    // Ensure BOM contains original and marked-up costs when saving to the project
    const payload = {
      bom: {
        projectDetails: bom.projectDetails,
        materials: bom.materials,
        originalCosts: bom.originalCosts,  // Include original costs
        markedUpCosts: bom.markedUpCosts   // Include marked-up costs
      }
    };
  
    Axios.post(`http://localhost:4000/api/project/${selectedProject._id}/bom`, payload, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(response => {
        alert('BOM saved to the project!');
      })
      .catch(error => {
        alert('Failed to save BOM to the project.');
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
            Normal Generate BOM
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
        locations={locations} // Pass locations
        handleLocationSelect={handleLocationSelect} // Handle location select
        selectedLocation={selectedLocation} // Pass selected location
      />

      {serverError && <div className={styles.serverError}>{serverError}</div>}

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
        <p><strong>Average Floor Height:</strong> {bom.projectDetails.avgFloorHeight} meters</p>
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
          <div className={styles.scrollableTableContainer}>
            <table className={styles.materialsTable}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Item</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Cost (₱)</th>
                  <th>Total Amount (₱)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
              {Object.entries(bom.materials).map(([category, materials]) =>
                materials.map((material, index) => {
                  const mat = material._doc || material;
                  return (
                    <tr key={`${category}-${index}`}>
                      <td>{category ? category.toUpperCase() : 'UNCATEGORIZED'}</td>
                      <td>{mat.item || 'N/A'}</td>
                      <td>{mat.description || 'N/A'}</td>
                      <td>{material.quantity ? Math.round(material.quantity) : 'N/A'}</td>
                      <td>{mat.unitCost ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(mat.unitCost) : 'N/A'}</td>
                      <td>{typeof material.totalAmount === 'number' ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(material.totalAmount) : 'N/A'}</td>
                      <td><button onClick={() => handleReplaceClick(material)}>Replace</button></td>
                    </tr>
                  );
                })
              )}

              </tbody>
            </table>
          </div>
          <button onClick={handleSaveBOM} className={styles.saveBOMButton}>
            Save BOM to Project
          </button>
        </div>
      )}

      <MaterialSearchModal
        isOpen={materialModalOpen}
        onClose={() => setMaterialModalOpen(false)}
        onMaterialSelect={handleMaterialSelect}
        materialToReplace={materialToReplace}
      />
    </>
  );
};

export default Generator;
