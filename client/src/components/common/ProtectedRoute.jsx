import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
