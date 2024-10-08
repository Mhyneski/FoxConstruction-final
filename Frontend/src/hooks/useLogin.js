import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_BACKEND_URL;

  const login = async (Username, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${apiUrl}/api/user/login`, { Username, password });
      const json = response.data;

      // save the user to local storage
      localStorage.setItem('user', JSON.stringify(json));

      // update the auth context
      dispatch({ type: 'LOGIN', payload: json });

      const { role } = json;
      if (role === 'admin') {
        navigate('/AdminDashboard');
      } else if (role === 'user') {
        navigate('/UserDashboard');
      } else if (role === 'contractor') {
        navigate('/ContractorDashboard');
      } else {
        // Handle unknown role
        navigate('/UnknownRole');
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setError(error.response ? error.response.data.error : 'Login failed. Please try again.');
    }
  }

  return { login, isLoading, error };
}
