import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function PrivateRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  return admin ? children : <Navigate to="/admin/login" replace />;
}