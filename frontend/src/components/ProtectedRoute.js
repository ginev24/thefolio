import { Navigate } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();

  // Not logged in at all → send to login page
  if (!user) return <Navigate to='/login' replace />;

  // Logged in but wrong role (e.g. a member trying to reach /admin)
  if (role && user.role !== role) return <Navigate to='/home' replace />;

  // All checks passed → render the protected page
  return children;
};

export default ProtectedRoute;
