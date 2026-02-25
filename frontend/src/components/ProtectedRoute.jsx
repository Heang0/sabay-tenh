import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from './admin/AdminLayout';

const ProtectedRoute = ({ children, useAdminLayout = true }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (useAdminLayout) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return children;
};

export default ProtectedRoute;