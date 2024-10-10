import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import styles from '../css/Accounts.module.css';
import axios from 'axios';
import { useSignup } from "../hooks/useSignup";
import ConfirmModal from '../components/ConfirmModal';

const Accounts = () => {
  const [formData, setFormData] = useState({ Username: '', role: '' });
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // State for filtered users
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { signup, isLoading, error, success } = useSignup();

  // Fetch users on initial mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/user`);
        setUsers(response.data);
        setFilteredUsers(response.data); // Initialize filtered users
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    setFilteredUsers(
      users.filter(user =>
        user.Username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, users]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await signup(formData.Username, "12345678", formData.role);
  
    if (result && result.user) {
      setUsers(prevUsers => [...prevUsers, result.user]);
      setShowCreateModal(false);
      setFormData({ Username: '', role: '' });
    }
  };

  // Handle password reset confirmation
  const handleResetPasswordClick = (userId) => {
    setSelectedUserId(userId);
    setShowConfirmModal(true); 
  };

  const handleConfirmReset = async () => {
    try {
      await axios.patch(`http://localhost:4000/api/user/reset-password/${selectedUserId}`);
      // Update the user's forgotPassword status to false after resetting the password
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === selectedUserId ? { ...user, forgotPassword: false } : user
        )
      );
      alert("Password has been reset to the default value.");
      setShowConfirmModal(false);
      setSelectedUserId(null);
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  const handleCancelReset = () => {
    setShowConfirmModal(false);
    setSelectedUserId(null);
  };

  return (
    <>
      <Navbar />
      <div className={styles.headerContainer}>
        <h2>Accounts Management</h2>
        <input 
          type="text" 
          placeholder="Search by Username..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query on input change
          className={styles.searchBar}
        />
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
                <label htmlFor="role">Role:</label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="user">Client</option>
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
                <th>Forgot Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>{user.Username}</td>
                  <td>{user.role}</td>
                  <td
                    style={{
                      backgroundColor: user.forgotPassword ? 'red' : 'transparent',
                      color: user.forgotPassword ? 'white' : 'black',
                    }}
                  >
                    {user.forgotPassword ? 'Requested' : 'No'}
                  </td> {/* Show forgot password status with red background */}
                  <td>
                    <button onClick={() => handleResetPasswordClick(user._id)} className={styles.resetButton}>
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Reset Password Modal */}
      <ConfirmModal 
        show={showConfirmModal} 
        onConfirm={handleConfirmReset} 
        onCancel={handleCancelReset}
        user={users.find(user => user._id === selectedUserId)}
      />
    </>
  );
};

export default Accounts;
