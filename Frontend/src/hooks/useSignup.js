import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import axios from 'axios';

export const useSignup = () => {
  const [isLoading, setIsLoading] = useState(null);
  const [error, setError] = useState(null);
  const { dispatch } = useAuthContext();
  const apiUrl = process.env.REACT_APP_BACKEND_URL;

  const signup = async (Username, password, role) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/user/signup`, {
        Username,
        password,
        role
      });

      // Response data is available directly through response.data
      const json = response.data;

      if (response.status >= 400) {
        setError(json.error);
      } else {
        // Save the user to local storage
        localStorage.setItem('user', JSON.stringify(json));

        // Update the auth context
        dispatch({ type: 'LOGIN', payload: json });

        setError(null);
      }
    } catch (error) {
      // Handle any unexpected errors
      setError(error.response?.data?.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return { signup, isLoading, error };
};
