import { useState, useContext } from 'react';
import Axios from 'axios';
import Navbar from "../components/Navbar";
import styles from '../css/Generator.module.css';
import { AuthContext } from "../context/AuthContext";

// Modal component for inputting template details
const Modal = ({ isOpen, onClose, onSubmit, formData, handleChange, errors }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Enter Base Template Details</h2>
                <form onSubmit={onSubmit}>
                    <div className={styles.formGroup}>
                        <label>Total Area (sqm)</label>
                        <input type="number" name="totalArea" value={formData.totalArea} onChange={handleChange} required />
                        {errors.totalArea && <span className={styles.error}>{errors.totalArea}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label>Number of Floors</label>
                        <input type="number" name="numFloors" value={formData.numFloors} onChange={handleChange} required />
                        {errors.numFloors && <span className={styles.error}>{errors.numFloors}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label>Average Floor Height (meters)</label>
                        <input type="number" name="avgFloorHeight" value={formData.avgFloorHeight} onChange={handleChange} required />
                        {errors.avgFloorHeight && <span className={styles.error}>{errors.avgFloorHeight}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label>Template Tier</label>
                        <select name="templateTier" value={formData.templateTier} onChange={handleChange} required>
                            <option value="low">Low</option>
                            <option value="mid">Mid</option>
                            <option value="high">High</option>
                        </select>
                        {errors.templateTier && <span className={styles.error}>{errors.templateTier}</span>}
                    </div>
                    <button type="submit" className={styles.submitButton}>Generate BOM</button>
                    <button type="button" onClick={onClose} className={styles.closeButton}>Close</button>
                </form>
            </div>
        </div>
    );
};

const Generator = () => {
    const [formData, setFormData] = useState({
        totalArea: '',
        numFloors: '',
        avgFloorHeight: '',
        templateTier: ''
    });

    const [errors, setErrors] = useState({});
    const [bom, setBom] = useState(null); 
    const [serverError, setServerError] = useState(null); 
    const { user } = useContext(AuthContext);
    const [modalOpen, setModalOpen] = useState(false); // State to control modal visibility

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = ['totalArea', 'numFloors', 'avgFloorHeight', 'templateTier'];

        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = 'This field is required';
            }
        });

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
            };
    
            console.log('Base Template Details:', payload);
    
            Axios.post('http://localhost:4000/api/bom/generate', payload, {
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
        setBom(null); // Clear BOM data on modal close
    };

    // Function to group materials by category
    const groupMaterialsByCategory = (materials) => {
        return materials.reduce((acc, material) => {
            const category = material.category && material.category.trim() !== '' ? material.category : 'UNCATEGORIZED';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(material);
            return acc;
        }, {});
    };

    return (
        <>
  <Navbar />
  <div className={styles.headerContainer}>
    <h2>Generated BOM</h2>
    <button onClick={() => setModalOpen(true)} className={styles.openModalButton}>
      Generate BOM
    </button>
  </div>

  <Modal
    isOpen={modalOpen}
    onClose={closeModal}
    onSubmit={handleSubmit}
    formData={formData}
    handleChange={handleChange}
    errors={errors}
  />

  {serverError && <div className={styles.serverError}>{serverError}</div>}

  {bom && (
    <div className={styles.bomContainer}>
      <div className={styles.detailsContainer}>
        <div className={styles.projectDetails}>
          <h3>Project Details</h3>
          <p><strong>Total Area:</strong> {bom.projectDetails.totalArea} sqm</p>
          <p><strong>Number of Floors:</strong> {bom.projectDetails.numFloors}</p>
          <p><strong>Average Floor Height:</strong> {bom.projectDetails.avgFloorHeight} meters</p>
        </div>

        <div className={styles.costDetails}>
          <h3>Cost Details</h3>
          <p><strong>Labor Cost:</strong> ₱{bom.laborCost ? bom.laborCost.toFixed(2) : 'N/A'}</p>
          <p><strong>Total Project Cost:</strong> ₱{bom.totalProjectCost ? bom.totalProjectCost.toFixed(2) : 'N/A'}</p>
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
            </tr>
          </thead>
          <tbody>
            {Object.entries(bom.materials).map(([category, materials]) =>
              materials.map((material, index) => {
                const mat = material._doc || material;
                return (
                  <tr key={`${category}-${index}`}>
                    <td>{category.toUpperCase()}</td>
                    <td>{mat.item || 'N/A'}</td>
                    <td>{mat.description || 'N/A'}</td>
                    <td>{material.quantity ? material.quantity.toFixed(2) : 'N/A'}</td>
                    <td>{mat.unitCost ? mat.unitCost.toFixed(2) : 'N/A'}</td>
                    <td>{material.totalAmount ? material.totalAmount.toFixed(2) : 'N/A'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )}
</>

    );
};

export default Generator;
