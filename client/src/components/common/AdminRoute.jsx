import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AdminRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
};

export default AdminRoute;
