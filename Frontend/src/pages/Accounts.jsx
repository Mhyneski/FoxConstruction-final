// src/components/Accounts.jsx
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import styles from '../css/Accounts.module.css';
import axios from 'axios';
import { useSignup } from "../hooks/useSignup";
import ConfirmModal from '../components/ConfirmModal';
import { useAuthContext } from '../hooks/useAuthContext'; // Import the useAuthContext hook
import AlertModal from '../components/AlertModal'; // Import AlertModal

const Accounts = () => {
  const [formData, setFormData] = useState({ Username: '', role: '' });
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { signup, isLoading, error, success } = useSignup();
  const [filterRole, setFilterRole] = useState("All"); 
  const [filterResetPassword, setFilterResetPassword] = useState(false); // NEW: State for password reset filter
  const [loading, setLoading] = useState(true); 
  const { user } = useAuthContext(); 

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

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !user.token) return;
      setLoading(true); 
      try {
        const response = await axios.get(`http://localhost:4000/api/user`, {
          headers: { Authorization: `Bearer ${user.token}` },  
        });

        setUsers(response.data);
        setFilteredUsers(response.data); 
      } catch (error) {
        console.error('Error fetching users:', error);
        showAlert("Error", "Failed to fetch users. Please try again later.", "error");
      } finally {
        setLoading(false); 
      }
    };
    fetchUsers();
  }, [user]);

  // Fetch users function
  const fetchUsers = async () => {
    if (!user || !user.token) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:4000/api/user`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUsers(response.data);
      setFilteredUsers(response.data); 
    } catch (error) {
      console.error('Error fetching users:', error);
      showAlert("Error", "Failed to fetch users. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users initially
  useEffect(() => {
    fetchUsers();
  }, [user]);

  // Handle search and filters
  useEffect(() => {
    let tempUsers = [...users];

    // Filter by search query
    if (searchQuery) {
      tempUsers = tempUsers.filter(user =>
        user.Username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by role
    if (filterRole !== 'All') {
      tempUsers = tempUsers.filter(user => user.role === filterRole);
    }

    // Filter by password reset request
    if (filterResetPassword) {
      tempUsers = tempUsers.filter(user => user.forgotPassword);
    }

    setFilteredUsers(tempUsers);
  }, [searchQuery, filterRole, filterResetPassword, users]); 

  // Handle form submission for creating a new user
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const result = await signup(formData.Username, "12345678", formData.role);
  
      if (result && result.user) {
        // Close the modal and reset the form data
        setShowCreateModal(false);
        setFormData({ Username: '', role: '' });
  
        // Re-fetch users to update the list with the newly created account
        await fetchUsers();
  
        // Show success alert
        showAlert("Success", "User account created successfully.", "success");
      }
    } catch (err) {
      console.error("Error creating user: ", err);
      showAlert("Error", "Failed to create user account. Please try again.", "error");
    }
  };
  

  // Filter users by role
  const filterByRole = (role) => {
    setFilterRole(role); 
  };

  // Handle password reset confirmation
  const handleResetPasswordClick = (userId) => {
    setSelectedUserId(userId);
    setShowConfirmModal(true); 
  };

  const handleConfirmReset = async () => {
    if (!user || !user.token) {
      console.error("Authorization token is missing.");
      showAlert("Error", "Authorization token is missing. Please log in again.", "error");
      return;
    }
  
    try {
      await axios.patch(
        `http://localhost:4000/api/user/reset-password/${selectedUserId}`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` }, 
        }
      );
  
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === selectedUserId ? { ...user, forgotPassword: false } : user
        )
      );
      setShowConfirmModal(false);
      setSelectedUserId(null);
      
      // Show success alert
      showAlert("Success", "Password has been reset to the default value.", "success");
    } catch (error) {
      console.error("Error resetting password:", error);
      // Show error alert
      showAlert("Error", "Failed to reset password. Please try again.", "error");
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
          onChange={(e) => setSearchQuery(e.target.value)} 
          className={styles.searchBar}
        />
        <button onClick={() => setShowCreateModal(true)} className={styles.openModalButton}>Create Account</button>
      </div>

      <div className={styles.filterButtons}>
        <button onClick={() => filterByRole('admin')} className={`${styles.filterButton} ${filterRole === 'admin' ? styles.activeFilter : ''}`}>Show Admins</button>
        <button onClick={() => filterByRole('user')} className={`${styles.filterButton} ${filterRole === 'user' ? styles.activeFilter : ''}`}>Show Users</button>
        <button onClick={() => filterByRole('contractor')} className={`${styles.filterButton} ${filterRole === 'contractor' ? styles.activeFilter : ''}`}>Show Contractors</button>
        <button onClick={() => filterByRole('All')} className={`${styles.filterButton} ${filterRole === 'All' ? styles.activeFilter : ''}`}>Show All</button>
        <button 
          onClick={() => setFilterResetPassword(!filterResetPassword)} // NEW: Toggle password reset filter
          className={`${styles.filterButton} ${filterResetPassword ? styles.activeFilter : ''}`}
        >
          {filterResetPassword ? 'Hide Password Resets' : 'Show Password Resets'}
        </button>
      </div>

     
      {loading ? (
        <div className={styles.loadingSpinnerContainer}>
          <div className={styles.spinner}></div>
          <p>Loading accounts...</p>
        </div>
      ) : (
        <>
          
          <div className={styles.userList}>
            <h2 className={styles.centeredTitle}>{filteredUsers.length} {filterRole === 'All' && !filterResetPassword ? 'Accounts' : filterRole !== 'All' && !filterResetPassword ? `${filterRole}s` : filterResetPassword && filterRole === 'All' ? 'Password Reset Accounts' : filterResetPassword && filterRole !== 'All' ? `${filterRole} Password Resets` : ''}</h2>
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
      <td>{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}</td>
      <td
        style={{
          backgroundColor: user.forgotPassword ? '#e74c3c' : 'transparent',
          color: user.forgotPassword ? 'white' : 'black',
          
        }}
      >
        {user.forgotPassword ? 'Requested' : 'No'}
      </td>
      <td>
        <button
          onClick={() => handleResetPasswordClick(user._id)}
          className={styles.resetButton}
          disabled={!user.forgotPassword}
          style={{
            backgroundColor: user.forgotPassword ? '#3498db' : '#ccc',
            cursor: user.forgotPassword ? 'pointer' : 'not-allowed',
          }}
        >
          Reset Password
        </button>
      </td>
    </tr>
  ))}
</tbody>

              </table>
            </div>
          </div>
        </>
      )}

      
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
            {/* Removed inline error/success messages and handle via AlertModal */}
            <button onClick={() => setShowCreateModal(false)} className={styles.closeModalButton}>Close</button>
          </div>
        </div>
      )}

      {/* Confirm Reset Password Modal */}
      <ConfirmModal 
        show={showConfirmModal} 
        onConfirm={handleConfirmReset} 
        onCancel={handleCancelReset}
        user={users.find(user => user._id === selectedUserId)}
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

export default Accounts;
