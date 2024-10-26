import React from 'react';
  import { useState, useContext, useEffect } from 'react';
  import Axios from 'axios';
  import Navbar from "../components/Navbar";
  import styles from '../css/Generator.module.css';
  import { AuthContext } from "../context/AuthContext";


  const MaterialSearchModal = ({ isOpen, onClose, onMaterialSelect, materialToReplace, user }) => {
    const [materials, setMaterials] = useState([]);
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
  
    useEffect(() => {
      if (isOpen && user && user.token) {
        Axios.get('http://localhost:4000/api/materials', {
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
    handleLocationSelect, selectedLocation, isLoadingProjects, isLoadingBOM }) => {

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
              <label>Average Floor Height (meters)</label>
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
                  <label>Template Tier (from project):</label>
                  <input
                    type="text"
                    name="templateTier"
                    value={formData.templateTier || ''}  
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
      templateTier: 'economy',  
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
    const [locations, setLocations] = useState([]); 
    const [selectedLocation, setSelectedLocation] = useState(""); 
    const [isLoadingProjects, setIsLoadingProjects] = useState(false); 
    const [isLoadingBOM, setIsLoadingBOM] = useState(false); 

    useEffect(() => {
      // Check if the user and user.token exist
      if (user && user.token) {
        setIsLoadingProjects(true);
        
        // Fetch projects for the contractor
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
        })
        .finally(() => {
          setIsLoadingProjects(false);
        });
    
        // Fetch locations
        Axios.get('http://localhost:4000/api/locations', {
          headers: {
            Authorization: `Bearer ${user.token}`,  // Include Authorization header here
          },
        })
        .then(response => {
          setLocations(response.data);
        })
        .catch(error => {
          console.error("Error fetching locations:", error);
        });
      } else {
        console.error("User is not authenticated or token is missing");
      }
    }, [user]);
    
    

    const handleProjectSelect = (projectId) => {
      const project = projects.find(p => p._id === projectId);
      if (project) {
        setSelectedProject(project);
        setFormData({
          totalArea: project.totalArea || '',
          avgFloorHeight: project.avgFloorHeight || '',
          templateTier: project.template || '',
          numFloors: project.floors.length.toString(),
        });
        setSelectedLocation(project.location);
      }
    };
    

    const handleLocationSelect = (locationName) => {
      setSelectedLocation(locationName);
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
    
      
      if (name === 'numFloors') {
        if (value > 5) {
          setFormData({ ...formData, numFloors: 5 });
          setErrors({ ...errors, numFloors: 'Maximum allowed floors is 5. Resetting to 5.' });
        } else {
          setFormData({ ...formData, numFloors: value });
          setErrors({ ...errors, numFloors: '' });
        }
      } else if (name === 'avgFloorHeight') {
        if (value > 15) {
          setFormData({ ...formData, avgFloorHeight: 15 });
          setErrors({ ...errors, avgFloorHeight: 'Maximum floor height is 15 meters. Resetting to 15.' });
        } else if (value < 0) {
          setFormData({ ...formData, avgFloorHeight: 0 });
          setErrors({ ...errors, avgFloorHeight: 'Floor height cannot be negative. Resetting to 0.' });
        } else {
          setFormData({ ...formData, avgFloorHeight: value });
          setErrors({ ...errors, avgFloorHeight: '' });
        }
      } else {
        setFormData({ ...formData, [name]: value });
      }
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

      if (validateForm()) {  // Ensure validation is successful
        setIsLoadingBOM(true);
        const payload = {
          totalArea: parseFloat(formData.totalArea),
          numFloors: parseInt(formData.numFloors, 10),
          avgFloorHeight: parseFloat(formData.avgFloorHeight),
          templateTier: formData.templateTier,
          locationName: selectedLocation,
        };

        // Log the payload before sending it to inspect the data
        console.log('Payload to generate BOM:', payload);

        // Make the POST request to generate the BOM
        Axios.post(`http://localhost:4000/api/bom/generate`, payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        })
          .then((response) => {
            console.log('Generated BOM:', response.data.bom); // Log the generated BOM to inspect
            setBom(response.data.bom); // Set the BOM data for rendering
            setModalOpen(false);  // Close the modal after successful generation
          })
          .catch((error) => {
            console.error('Error generating BOM:', error);
            if (error.response && error.response.data && error.response.data.error) {
              setServerError(error.response.data.error);
            } else {
              setServerError('An unexpected error occurred.');
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
      }
    };

    // Function to calculate updated costs after replacing materials
    const calculateUpdatedCosts = (bom) => {
      // Calculate the total materials cost based on the new BOM structure
      const totalMaterialsCost = bom.categories.reduce((sum, category) => {
        return sum + category.materials.reduce((subSum, material) => subSum + material.totalAmount, 0);
      }, 0);

      // Get the original labor cost 
      const originalLaborCost = bom.originalCosts.laborCost;

      // Total project cost = total materials cost + labor cost
      const originalTotalProjectCost = totalMaterialsCost + originalLaborCost;

      // Apply markup based on location
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
      
      Axios.post(`http://localhost:4000/api/project/${selectedProject._id}/bom`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
        .then((response) => {
          alert('BOM saved to the project!');
        })
        .catch((error) => {
          console.error('Failed to save BOM to project:', error);
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
          locations={locations}
          handleLocationSelect={handleLocationSelect}
          selectedLocation={selectedLocation}
          isLoadingProjects={isLoadingProjects}  
          isLoadingBOM={isLoadingBOM}  
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
{bom && bom.categories && bom.categories.length > 0 ? (
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
  {bom.categories.map((categoryData, categoryIndex) => (
    <React.Fragment key={categoryIndex}> {/* Ensure unique key for each category */}
      {categoryData.materials.map((material, index) => (
        <tr key={`${categoryData.category}-${material._id || index}`}> {/* Ensure unique key for each material */}
          <td>{categoryData.category ? categoryData.category.toUpperCase() : 'UNCATEGORIZED'}</td>
          <td>{material.item || 'N/A'}</td>
          <td>{material.description || 'N/A'}</td>
          <td>{material.quantity ? Math.round(material.quantity) : 'N/A'}</td>
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
          </div>
        )}

<MaterialSearchModal
  isOpen={materialModalOpen}
  onClose={() => setMaterialModalOpen(false)}
  onMaterialSelect={handleMaterialSelect}
  materialToReplace={materialToReplace}
  user={user} // Pass the user object here
/>

      </>
    );
  };

  export default Generator;
