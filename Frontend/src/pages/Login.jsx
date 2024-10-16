import { useState } from "react";
import styles from "../css/Login.module.css";
import { useLogin } from "../hooks/useLogin";
import axios from "axios";

const Login = () => {
  const [Username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
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
      await axios.patch(`http://localhost:4000/api/user/forgot-password/${Username}`);
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
        {isLoading ? (
          <div className={styles.loadingSpinnerContainer}>
            <div className={styles.spinner}></div>
            <p>Logging in, please wait...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>Username</label>
            <input
              type="text"
              onChange={(e) => setUsername(e.target.value)}
              value={Username}
              placeholder="enter your username"
              required
            />
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"} // Toggles between text and password
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="enter your password"
              required
            />
            <label>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />{" "}
              Show Password
            </label>
            <a href="#" onClick={handleForgotPassword}>Forgot password</a>
            <button type="submit" disabled={isLoading}>LOG IN</button>
          </form>
        )}
        {error && <p className={styles.error1}>{error}</p>}
      </div>
    </div>
  );
};

export default Login;
