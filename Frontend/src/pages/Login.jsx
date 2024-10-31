// src/components/Login.jsx
import { useState, useEffect } from "react";
import styles from "../css/Login.module.css";
import { useLogin } from "../hooks/useLogin";
import axios from "axios";
import Header from '../components/Header';
import AlertModal from '../components/AlertModal'; // Import AlertModal

const Login = () => {
  const [Username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const { login, error, isLoading } = useLogin();

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

  // Handle login errors via AlertModal
  useEffect(() => {
    if (error) {
      showAlert("Login Error", error, "error");
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(Username, password);
    // Assuming 'login' function handles setting 'error' state
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!Username) {
      // Show validation error in modal
      showAlert("Validation Error", "Please enter your Username to reset the password.", "error");
      return;
    }
    
    try {
      await axios.patch(`https://foxconstruction-final.onrender.com/api/user/forgot-password/${Username}`);
      // Show success message in modal
      showAlert("Success", "Password reset request has been sent.", "success");
    } catch (error) {
      console.error("Error sending password reset request", error);
      // Show error message in modal
      showAlert("Error", "Failed to send password reset request. Please try again.", "error");
    }
  };

  return (
    <>
      <Header/>
      <div className={styles.Container}>
        <div className={styles.TopSide}>
          <h5>Get Ready.</h5>
          <h5>We&#39;re Finishing!</h5>
          <p>Please enter your details.</p>
        </div>

        <div className={styles.form1}>
          {isLoading ? (
            <div className={styles.loadingSpinnerContainer}>
              <div className={styles.spinner}></div>
              <p>Logging in, please wait...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className={styles.baller}>Username</label>
              <input
                type="text"
                onChange={(e) => setUsername(e.target.value)}
                value={Username}
                placeholder="Enter your username"
                required
              />
              <label className={styles.baller}>Password</label>
              <input
                type={showPassword ? "text" : "password"} 
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                placeholder="Enter your password"
                required
              />

              <div className={styles.passwordOptions}>
                <label className={styles.baller}>
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                  />{" "}
                  Show Password
                </label>
                {/* Update the onClick handler to pass the event */}
                <a href="#" onClick={handleForgotPassword}>Forgot password</a>
              </div>

              <button type="submit" disabled={isLoading}>LOG IN</button>
            </form>
          )}
          {/* Removed the error <p> as errors are now handled by AlertModal */}
        </div>
      </div>

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

export default Login;
