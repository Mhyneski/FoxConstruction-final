import { useState } from "react";
import axios from 'axios';

export const useSignup = () => {
  const [isLoading, setIsLoading] = useState(null);
  const [error, setError] = useState(null);

  // Removed the `dispatch` call because we no longer want to update the auth context
  const signup = async (Username, password, role) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`https://foxconstruction-final.onrender.com/api/user/signup`, {
        Username,
        password,
        role
      });

      // Response data is available directly through response.data
      const json = response.data;

      if (response.status >= 400) {
        setError(json.error);
      } else {
        // We're not saving the new user to local storage or updating auth context
        // Just returning the created user object
        return { user: json };
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
