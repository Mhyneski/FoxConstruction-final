import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuthContext();
    const navigate = useNavigate();
    console.log('User in ProtectedRoute:', user); // Log the user
    console.log('Allowed roles:', allowedRoles);  // Log allowed roles
    

    if (!user) {
        // If user is not authenticated, redirect to login
        console.log('User not authenticated, redirecting to login'); // Log the redirect
        return navigate('/Login');
      }
    
      if (!allowedRoles.includes(user.role)) {
        // If user's role is not allowed, redirect to unauthorized
        console.log('User role not allowed:', user.role); // Log the unauthorized role
        return navigate('/Unauthorized');
      }
    
      // If the role matches, render the child component
      return children;
    };
    
    export default ProtectedRoute;
