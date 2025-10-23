// src/Routes/AdminRoute.jsx

// ! React & Router Imports
import React from 'react'; // * React import might not be strictly necessary with modern JSX transform, but good practice
import { Navigate, Outlet } from 'react-router-dom';

// ! Hook Imports
import { useAuth } from '../hooks/useAuth'; // * Custom hook to access authentication state

// ========================================================================== //
// ! COMPONENT DEFINITION: AdminRoute
// ========================================================================== //

/**
 * ? AdminRoute Component
 * A protected route component specifically for administrators (staff).
 * It verifies if the currently logged-in user meets the admin criteria
 * (in this case, having an email ending with '@sinnersandsaints.la').
 * If the user is an admin, it renders the nested child routes (`<Outlet />`).
 * If the user is logged in but not an admin, it redirects them to the standard user dashboard (`/userpanel`).
 * Assumes that authentication status (whether a user is logged in at all) is handled by a higher-level guard.
 *
 * @returns {JSX.Element} Either the nested routes via `<Outlet />` or a `<Navigate>` component.
 */
const AdminRoute = () => {
  // * Retrieve the current user object from the authentication context.
  const { user } = useAuth();

  // * Determine admin status based on the user's email domain.
  // * Includes a check for the existence of the user and their email.
  const isAdmin = user && user.email?.endsWith('@sinnersandsaints.la'); // * Using optional chaining for safety

  // * Check if the user meets the admin criteria.
  if (!isAdmin) {
    // * If the user is not an admin (or not logged in, though that should be caught earlier),
    // * redirect them to the standard user panel.
    // ? Consider adding the `replace` prop to `<Navigate>` (`replace={true}`)
    // ? to prevent the user from using the back button to return to the admin route they were denied access to.
    console.warn("AdminRoute: Access denied. Redirecting non-admin user to /userpanel."); // * Log for debugging
    return <Navigate to="/userpanel" />;
  }

  // * If the user is authenticated and meets admin criteria, render the child routes
  // * specified within this route in the application's routing configuration.
  return <Outlet />;
};

export default AdminRoute;