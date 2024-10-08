import { useState } from "react";
import styles from "../css/Login.module.css";
import { useLogin } from "../hooks/useLogin";

const Login = () => {
  const [Username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoading } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(Username, password);
  }

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
          <input type="Username" onChange={(e) => setUsername(e.target.value)} value={Username} placeholder="enter your Username" />
          <label>Password</label>
          <input type="password" onChange={(e) => setPassword(e.target.value)} value={password} placeholder="enter your password" />
          <a href="">Forgot password</a>
          <button type="submit" disabled={isLoading}>LOG IN</button>
        </form>
        {error && <p className={styles.error1}>{error}</p>}
      </div>
    </div>
  );
}

export default Login;
