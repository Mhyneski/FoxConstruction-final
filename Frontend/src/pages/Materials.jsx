import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../css/Materials.module.css';
import { useAuthContext } from "../hooks/useAuthContext";
import Navbar from "../components/Navbar";

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [editedMaterial, setEditedMaterial] = useState({ Description: '', unit: '', cost: '' });
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [newMaterial, setNewMaterial] = useState({ Description: '', unit: '', cost: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user || !user.token) return;

    const fetchMaterials = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/materials', {
          headers: {
            Authorization: `Bearer ${user.token}`, // Corrected this part
          },
        });
        setMaterials(response.data);
      } catch (error) {
        console.error('Error fetching materials:', error.response?.data || error.message);
      }
    };

    fetchMaterials();
  }, [user]);

  const handleEdit = (material) => {
    setIsEditing(material._id);
    setEditedMaterial({ Description: material.Description, unit: material.unit, cost: material.cost });
  };

  const handleSave = async (id) => {
    try {
      const updatedMaterial = { ...editedMaterial };
      
      // Send the updated material to the API
      await axios.patch(`http://localhost:4000/api/materials/${id}`, updatedMaterial, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // Update the materials state with the new data manually
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
        material.Description &&
        material.Description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleCreate = async () => {
    try {
      // Make sure all fields are filled
      if (!newMaterial.Description || !newMaterial.unit || !newMaterial.cost) {
        console.error('All fields are required.');
        return;
      }
  
      const response = await axios.post('http://localhost:4000/api/materials', newMaterial, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
  
      // Update materials state
      setMaterials((prevMaterials) => [...prevMaterials, response.data]);
      setNewMaterial({ Description: '', unit: '', cost: '' }); // Reset the form fields
      setIsModalOpen(false); // Close modal after successful creation
    } catch (error) {
      console.error('Error creating material:', error.response?.data || error.message);
    }
  };

  const filteredMaterials = filterMaterials();

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
                  value={newMaterial.Description}
                  onChange={(e) => setNewMaterial({ ...newMaterial, Description: e.target.value })}
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
                value={editedMaterial.Description}
                onChange={(e) => setEditedMaterial({ ...editedMaterial, Description: e.target.value })}
                className={styles.inputField}
              />
            ) : (
              material.Description
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
            <button onClick={() => handleDelete(material._id)} className={styles.deleteButton}>
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
      </div>
    </>
  );
};

export default Materials;
