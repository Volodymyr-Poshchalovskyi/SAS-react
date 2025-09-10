// src/Routes/ProtectedRoute.jsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAdmin, loading, isLoggingOut } = useAuth();

  if (loading || isLoggingOut) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Checkin status...</p>
      </div>
    );
  }

  if (isAdmin) {
    return <Outlet />;
  }

  return <Navigate to="/" state={{ message: 'Access denied: You are not an admin.' }} />;
};

export default ProtectedRoute;