import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../css/Location.module.css';
import { useAuthContext } from "../hooks/useAuthContext";
import Navbar from "../components/Navbar";

const Location = () => {
  const [locations, setLocations] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [editedLocation, setEditedLocation] = useState({ name: '', markup: '' });
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [newLocation, setNewLocation] = useState({ name: '', markup: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const apiUrl = process.env.REACT_APP_BACKEND_URL;

  // Fetch all locations on component mount
  useEffect(() => {
    if (!user || !user.token) return;

    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/locations`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setLocations(response.data);
      } catch (error) {
        console.error('Error fetching locations:', error.response?.data || error.message);
      }
    };

    fetchLocations();
  }, [user]);

  const handleEdit = (location) => {
    setIsEditing(location._id);
    setEditedLocation({ name: location.name, markup: location.markup });
  };

  const handleSave = async (id) => {
    try {
      const updatedLocation = { ...editedLocation };
      
      // Send the updated location to the API
      await axios.patch(`${process.env.REACT_APP_BACKEND_URL}/api/locations/${id}`, updatedLocation, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // Update the locations state with the new data manually
      setLocations((prevLocations) =>
        prevLocations.map((location) =>
          location._id === id ? { ...location, ...updatedLocation } : location
        )
      );
      setIsEditing(null);
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/locations/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setLocations((prevLocations) => prevLocations.filter((location) => location._id !== id));
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filterLocations = () => {
    if (!searchTerm) return locations;

    return locations.filter(
      (location) =>
        location.name &&
        location.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleCreate = async () => {
    try {
      if (!newLocation.name || !newLocation.markup) {
        console.error('All fields are required.');
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/location`, newLocation, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // Update locations state
      setLocations((prevLocations) => [...prevLocations, response.data]);
      setNewLocation({ name: '', markup: '' });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating location:', error.response?.data || error.message);
    }
  };

  const filteredLocations = filterLocations();

  return (
    <>
      <Navbar />
      <div className={styles.locationsContainer}>
        <h2 className={styles.heading}>Locations</h2>
        <input
          type="text"
          placeholder="Search locations..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
        <p className={styles.locationCount}>Total Locations: {filteredLocations.length}</p>

        <button onClick={() => setIsModalOpen(true)} className={styles.createLocationButton}>
          Create New Location
        </button>

        {isModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <span className={styles.closeButton} onClick={() => setIsModalOpen(false)}>&times;</span>
              <h3>Create New Location</h3>
              <div className={styles.modalForm}>
                <input
                  type="text"
                  placeholder="Location Name"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  className={styles.inputField}
                />
                <input
                  type="number"
                  placeholder="Markup %"
                  value={newLocation.markup}
                  onChange={(e) => setNewLocation({ ...newLocation, markup: e.target.value })}
                  className={styles.inputField}
                />
                <button onClick={handleCreate} className={styles.createButton}>Create Location</button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.scrollableTableContainer}>
          <table className={styles.locationsTable}>
            <thead>
              <tr>
                <th>Location</th>
                <th>Markup %</th>
                <th>Date Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocations.map((location) => (
                <tr key={location._id}>
                  <td>
                    {isEditing === location._id ? (
                      <input
                        type="text"
                        value={editedLocation.name}
                        onChange={(e) => setEditedLocation({ ...editedLocation, name: e.target.value })}
                        className={styles.inputField}
                      />
                    ) : (
                      location.name
                    )}
                  </td>
                  <td>
                    {isEditing === location._id ? (
                      <input
                        type="number"
                        value={editedLocation.markup}
                        onChange={(e) => setEditedLocation({ ...editedLocation, markup: e.target.value })}
                        className={styles.inputField}
                      />
                    ) : (
                      location.markup
                    )}
                  </td>
                  <td>{new Date(location.createdAt).toLocaleDateString()}</td>
                  <td>
                    {isEditing === location._id ? (
                      <button onClick={() => handleSave(location._id)} className={styles.saveButton}>
                        Save
                      </button>
                    ) : (
                      <button onClick={() => handleEdit(location)} className={styles.editButton}>
                        Edit
                      </button>
                    )}
                    <button onClick={() => handleDelete(location._id)} className={styles.deleteButton}>
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

export default Location;
