// src/Routes/UserProtectedRoute.jsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserProtectedRoute = () => {
  const { isAuthenticated, loading, isLoggingOut } = useAuth();

  if (loading || isLoggingOut) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Checking access...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Outlet />;
  }

  return <Navigate to="/login" state={{ message: 'Please log in to view this page.' }} />;
};

export default UserProtectedRoute;