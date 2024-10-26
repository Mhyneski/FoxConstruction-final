import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import styles from '../css/Accounts.module.css';
import axios from 'axios';
import { useSignup } from "../hooks/useSignup";
import ConfirmModal from '../components/ConfirmModal';
import { useAuthContext } from '../hooks/useAuthContext'; // Import the useAuthContext hook

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
  const [loading, setLoading] = useState(true); 
  const { user } = useAuthContext(); // Get the logged-in user from AuthContext

  // Fetch users on initial mount
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !user.token) return;
      setLoading(true); 
      try {
        const response = await axios.get(`http://localhost:4000/api/user`, {
          headers: { Authorization: `Bearer ${user.token}` },  // Include Authorization header
        });

        setUsers(response.data);
        setFilteredUsers(response.data); 
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false); 
      }
    };
    fetchUsers();
  }, [user]);

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
    
    try {
      const result = await signup(formData.Username, "12345678", formData.role);
      
      if (result && result.user) {
        
        const updatedUsers = [...users, result.user];
        setUsers(updatedUsers);
  
       
        setFilteredUsers(updatedUsers.filter(user =>
          user.Username.toLowerCase().includes(searchQuery.toLowerCase())
        ));
  
       
        setShowCreateModal(false);
        
        
        setFormData({ Username: '', role: '' });
      }
    } catch (err) {
      console.error("Error creating user: ", err);
    }
  };

  // Filter users by role
  const filterByRole = (role) => {
    setFilterRole(role); 
    const filtered = role === 'All' ? users : users.filter(user => user.role === role);
    setFilteredUsers(filtered);
  };
  
  // Handle password reset confirmation
  const handleResetPasswordClick = (userId) => {
    setSelectedUserId(userId);
    setShowConfirmModal(true); 
  };

  const handleConfirmReset = async () => {
    if (!user || !user.token) {
      console.error("Authorization token is missing.");
      return;
    }
  
    try {
      await axios.patch(
        `http://localhost:4000/api/user/reset-password/${selectedUserId}`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` }, // Include the token in headers
        }
      );
  
      // Update the user list after successful reset
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
          onChange={(e) => setSearchQuery(e.target.value)} 
          className={styles.searchBar}
        />
        <button onClick={() => setShowCreateModal(true)} className={styles.openModalButton}>Create Account</button>
      </div>

      {/* Filter Buttons */}
      <div className={styles.filterButtons}>
        <button onClick={() => filterByRole('admin')} className={styles.filterButton}>Show Admins</button>
        <button onClick={() => filterByRole('user')} className={styles.filterButton}>Show Users</button>
        <button onClick={() => filterByRole('contractor')} className={styles.filterButton}>Show Contractors</button>
        <button onClick={() => filterByRole('All')} className={styles.filterButton}>Show All</button>
      </div>

      {/* Display loading spinner or user list based on loading state */}
      {loading ? (
        <div className={styles.loadingSpinnerContainer}>
          <div className={styles.spinner}></div>
          <p>Loading accounts...</p>
        </div>
      ) : (
        <>
          {/* User List */}
          <div className={styles.userList}>
            <h2 className={styles.centeredTitle}>{filteredUsers.length} {filterRole === 'All' ? 'Accounts' : `${filterRole}s`}</h2>
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
      </td>
      <td>
        <button
          onClick={() => handleResetPasswordClick(user._id)}
          className={styles.resetButton}
          disabled={!user.forgotPassword} // Disable button if forgotPassword is false
          style={{
            backgroundColor: user.forgotPassword ? '#657354' : '#ccc', // Optional: styling for disabled button
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
