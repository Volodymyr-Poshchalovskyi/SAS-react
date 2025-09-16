// src/Routes/ProtectedRoute.jsx

import { useAuth } from '../hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute
 * Protects routes that require authentication.
 * - Redirects unauthenticated users to login.
 * - Handles loading state while checking authentication.
 * - Redirects non-admin users with incomplete registration to login.
 */
const ProtectedRoute = () => {
  const { user, loading } = useAuth(); // Get current user and loading state from Auth context

  // Show loading indicator while auth state is being determined
  if (loading) {
    return <h1>Loading...</h1>;
  }

  // Redirect unauthenticated users to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if registration is complete (full_name exists in metadata)
  const isRegistrationComplete = !!user.user_metadata?.full_name;

  // Check if user is an admin based on email domain
  const isAdmin = user.email.endsWith('@sinnersandsaints.la');

  // Non-admin users with incomplete registration are redirected to login
  if (!isAdmin && !isRegistrationComplete) {
    return <Navigate to="/login" />;
  }

  // Render nested routes for authenticated users
  return <Outlet />;
};

export default ProtectedRoute;
