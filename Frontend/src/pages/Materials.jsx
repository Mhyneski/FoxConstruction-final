import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../css/Materials.module.css';
import { useAuthContext } from "../hooks/useAuthContext";
import Navbar from "../components/Navbar";
import ConfirmDeleteMaterialModal from "../components/ConfirmDeleteMaterialModal"; 

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [editedMaterial, setEditedMaterial] = useState({ description: '', unit: '', cost: '' });
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [newMaterial, setNewMaterial] = useState({ description: '', unit: '', cost: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); 
  
  
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);

  useEffect(() => {
    if (!user || !user.token) return;

    const fetchMaterials = async () => {
      setLoading(true); 
      try {
        const response = await axios.get(`http://localhost:4000/api/materials`, {
          headers: {
            Authorization: `Bearer ${user.token}`, 
          },
        });
        setMaterials(response.data);
      } catch (error) {
        console.error('Error fetching materials:', error.response?.data || error.message);
      } finally {
        setLoading(false); 
      }
    };

    fetchMaterials();
  }, [user]);

  const handleEdit = (material) => {
    setIsEditing(material._id);
    setEditedMaterial({ description: material.description, unit: material.unit, cost: material.cost });
  };

  const handleSave = async (id) => {
    try {
      const updatedMaterial = { ...editedMaterial };
      
      
      await axios.patch(`http://localhost:4000/api/materials/${id}`, updatedMaterial, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      
      setMaterials((prevMaterials) =>
        prevMaterials.map((material) =>
          material._id === id ? { ...material, ...updatedMaterial } : material
        )
      );
      setIsEditing(null);
    } catch (error) {
      console.error('Error updating material:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/materials/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setMaterials((prevMaterials) => prevMaterials.filter((material) => material._id !== id));
      setIsConfirmDeleteOpen(false); 
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filterMaterials = () => {
    if (!searchTerm) return materials;

    return materials.filter(
      (material) =>
        material.description &&
        material.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleCreate = async () => {
    try {
      
      if (!newMaterial.description || !newMaterial.unit || !newMaterial.cost) {
        console.error('All fields are required.');
        return;
      }
  
      const response = await axios.post(`http://localhost:4000/api/materials`, newMaterial, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
  
      
      setMaterials((prevMaterials) => [...prevMaterials, response.data]);
      setNewMaterial({ description: '', unit: '', cost: '' }); 
      setIsModalOpen(false); 
    } catch (error) {
      console.error('Error creating material:', error.response?.data || error.message);
    }
  };

  const filteredMaterials = filterMaterials();

  
  const openConfirmDeleteModal = (material) => {
    setMaterialToDelete(material);
    setIsConfirmDeleteOpen(true);
  };

  
  const confirmDelete = () => {
    if (materialToDelete) {
      handleDelete(materialToDelete._id);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.materialsContainer}>
        <h2 className={styles.heading}>Materials</h2>
        <input
          type="text"
          placeholder="Search materials..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
        <p className={styles.materialCount}>Total Materials: {filteredMaterials.length}</p>

        <button onClick={() => setIsModalOpen(true)} className={styles.createMaterialButton}>
          Create New Material
        </button>

        {isModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <span className={styles.closeButton} onClick={() => setIsModalOpen(false)}>&times;</span>
              <h3>Create New Material</h3>
              <div className={styles.modalForm}>
                <input
                  type="text"
                  placeholder="Material Description"
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                  className={styles.inputField}
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={newMaterial.unit}
                  onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                  className={styles.inputField}
                />
                <input
                  type="number"
                  placeholder="Cost"
                  value={newMaterial.cost}
                  onChange={(e) => setNewMaterial({ ...newMaterial, cost: e.target.value })}
                  className={styles.inputField}
                />
                <button onClick={handleCreate} className={styles.createButton}>Create Material</button>
              </div>
            </div>
          </div>
        )}

       
        {loading ? (
          <div className={styles.loadingSpinnerContainer}>
            <div className={styles.spinner}></div>
            <p>Loading materials...</p>
          </div>
        ) : (
          <div className={styles.scrollableTableContainer}>
            <table className={styles.materialsTable}>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Unit</th>
                  <th>Unit Cost</th>
                  <th>Date Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((material) => (
                  <tr key={material._id}>
                    <td>
                      {isEditing === material._id ? (
                        <input
                          type="text"
                          value={editedMaterial.description}
                          onChange={(e) => setEditedMaterial({ ...editedMaterial, description: e.target.value })}
                          className={styles.inputField}
                        />
                      ) : (
                        material.description
                      )}
                    </td>
                    <td>
                      {isEditing === material._id ? (
                        <input
                          type="text"
                          value={editedMaterial.unit}
                          onChange={(e) => setEditedMaterial({ ...editedMaterial, unit: e.target.value })}
                          className={styles.inputField}
                        />
                      ) : (
                        material.unit
                      )}
                    </td>
                    <td>
                      {isEditing === material._id ? (
                        <input
                          type="number"
                          value={editedMaterial.cost}
                          onChange={(e) => setEditedMaterial({ ...editedMaterial, cost: e.target.value })}
                          className={styles.inputField}
                        />
                      ) : (
                        `₱${material.cost}`
                      )}
                    </td>
                    <td>{new Date(material.createdAt).toLocaleDateString()}</td>
                    <td>
                      {isEditing === material._id ? (
                        <button onClick={() => handleSave(material._id)} className={styles.saveButton}>
                          Save
                        </button>
                      ) : (
                        <button onClick={() => handleEdit(material)} className={styles.editButton}>
                          Edit
                        </button>
                      )}
                      <button onClick={() => openConfirmDeleteModal(material)} className={styles.deleteButton}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Confirm Delete Modal */}
        <ConfirmDeleteMaterialModal
          isOpen={isConfirmDeleteOpen}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirm={confirmDelete}
          materialDescription={materialToDelete?.description}
        />
      </div>
    </>
  );
};

export default Materials;
