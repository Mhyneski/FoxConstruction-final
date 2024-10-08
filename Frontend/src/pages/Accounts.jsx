import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import styles from '../css/Accounts.module.css';
import axios from 'axios';
import { useSignup } from "../hooks/useSignup";
import ConfirmModal from '../components/ConfirmModal';

const Accounts = () => {
  const [formData, setFormData] = useState({ Username: '', password: '', role: '' });
  const [users, setUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signup, isLoading, error, success } = useSignup();
  const apiUrl = process.env.REACT_APP_BACKEND_URL;

  // Fetch users on initial mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/user`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteClick = (userId) => {
    setSelectedUserId(userId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${apiUrl}/api/user/${selectedUserId}`);
      setUsers(users.filter(user => user._id !== selectedUserId));
      setShowDeleteModal(false);
      setSelectedUserId(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedUserId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Call signup function
    const result = await signup(formData.Username, formData.password, formData.role);

    // If signup is successful, add the new user to the users state and close the modal
    if (result && result.user) {
      setUsers(prevUsers => [...prevUsers, result.user]);
      setShowCreateModal(false);
      setFormData({ Username: '', password: '', role: '' }); // Reset form fields
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.headerContainer}>
        <h2>Accounts Management</h2>
        <button onClick={() => setShowCreateModal(true)} className={styles.openModalButton}>Create Account</button>
      </div>

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="Username">Username:</label>
                <input
                  type="text"
                  id="Username"
                  value={formData.Username}
                  onChange={(e) => setFormData({ ...formData, Username: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="password">Password:</label>
                <div className={styles.passwordInputContainer}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className={styles.togglePasswordButton}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="role">Role:</label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="contractor">Contractor</option>
                </select>
              </div>
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create'}
              </button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}
            <button onClick={() => setShowCreateModal(false)} className={styles.closeModalButton}>Close</button>
          </div>
        </div>
      )}

      {/* User List */}
      <div className={styles.userList}>
        <h2>All Users</h2>
        <div className={styles.scrollableTableContainer}>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.Username}</td>
                  <td>{user.role}</td>
                  <td>
                    <button onClick={() => handleDeleteClick(user._id)} className={styles.deleteButton}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal 
        show={showDeleteModal} 
        onConfirm={handleConfirmDelete} 
        onCancel={handleCancelDelete}
        user={users.find(user => user._id === selectedUserId)}
      />
    </>
  );
};

export default Accounts;
