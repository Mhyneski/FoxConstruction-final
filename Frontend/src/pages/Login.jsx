import { useState } from "react";
import styles from "../css/Login.module.css";
import { useLogin } from "../hooks/useLogin";
import axios from "axios"; // Add axios to make API calls

const Login = () => {
  const [Username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoading } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(Username, password);
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!Username) {
      alert("Please enter your Username to reset the password.");
      return;
    }
    
    try {
      await axios.patch(`http://localhost:4000/api/user/forgot-password/${Username}`); // API call to mark forgot password
      alert("Password reset request has been sent.");
    } catch (error) {
      console.error("Error sending password reset request", error);
    }
  };

  return (
    <div className={styles.Container}>
      <div className={styles.TopSide}>
        <h5>Get Ready.</h5>
        <h5>We&#39;re Finishing!</h5>
        <p>Please enter your details.</p>
      </div>

      <div className={styles.form1}>
        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text" // Changed input type to "text"
            onChange={(e) => setUsername(e.target.value)}
            value={Username}
            placeholder="enter your Username"
            required
          />
          <label>Password</label>
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="enter your password"
            required
          />
          <a href="#" onClick={handleForgotPassword}>Forgot password</a> {/* Call forgot password function */}
          <button type="submit" disabled={isLoading}>LOG IN</button>
        </form>
        {error && <p className={styles.error1}>{error}</p>}
      </div>
    </div>
  );
};

export default Login;
