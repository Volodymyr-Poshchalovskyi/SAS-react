// src/Routes/AdminRoute.jsx

import { useAuth } from '../hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * AdminRoute
 * Protects admin-only routes by checking if the user is a staff member.
 * If the user is not an admin, redirects to the user panel.
 */
const AdminRoute = () => {
  const { user } = useAuth(); // Get current user from Auth context

  // Determine if the user is an admin based on email domain
  const isAdmin = user && user.email.endsWith('@sinnersandsaints.la');

  // Redirect non-admin users to the user panel
  if (!isAdmin) {
    return <Navigate to="/userpanel" />;
  }

  // Render nested routes for admin users
  return <Outlet />;
};

export default AdminRoute;
