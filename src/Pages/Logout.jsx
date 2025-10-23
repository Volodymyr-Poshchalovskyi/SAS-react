// src/Pages/Logout.jsx

// ! React & Router Imports
import React, { useEffect } from 'react'; // * useEffect is imported but not used directly, implied by React's hook usage. Kept for clarity.
import { useNavigate } from 'react-router-dom';

// ! Local Imports (Hooks)
import { useAuth } from '../hooks/useAuth'; // * Custom hook to access authentication state and actions

// ========================================================================== //
// ! COMPONENT DEFINITION: Logout
// ========================================================================== //

/**
 * ? Logout Component
 * This component handles the user logout process.
 * It calls the `signOut` function from the `useAuth` hook if a user is currently logged in,
 * and then redirects the user to the login page once logout is complete (or if no user was logged in initially).
 * Displays a simple "Logging out..." message while the process occurs.
 */
const Logout = () => {
  // ! Hooks
  const { user, signOut } = useAuth(); // * Get current user and signOut function from context
  const navigate = useNavigate(); // * Hook for programmatic navigation

  // ! Effect: Trigger Sign Out
  // * This effect runs when the component mounts or if the `user` or `signOut` function changes.
  // * If a user is currently logged in, it calls the `signOut` function.
  useEffect(() => {
    if (user) {
      console.log("Logout component: User found, calling signOut...");
      signOut().catch(error => {
         // * Handle potential errors during sign out (e.g., network issues)
         console.error("Error during sign out:", error);
         // * Still attempt to navigate to login even if signOut fails,
         // * as the session might be invalid anyway.
         if (!user) { // Check again if signOut might have cleared user despite error
             navigate('/login');
         }
      });
    } else {
        console.log("Logout component: No user found, proceeding to redirect.");
    }
  }, [user, signOut, navigate]); // * Added navigate to dependency array

  // ! Effect: Redirect After Logout
  // * This effect runs when the component mounts or if the `user` or `Maps` function changes.
  // * Once the `user` state becomes null (either initially or after `signOut` completes
  // * and the onAuthStateChange listener updates the context), it redirects to the login page.
  useEffect(() => {
    // * Redirect only when loading is complete and no user is present
    if (!user) {
        console.log("Logout component: User is null, navigating to /login.");
        // * Use replace to prevent user from navigating back to the logout page
        navigate('/login', { replace: true });
    }
  }, [user, navigate]); // * Dependencies ensure redirection happens after state updates

  // ! Render Logic: Loading Indicator
  // * Display a simple message while logout is in progress or redirection is pending.
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      {/* // ? Consider adding a spinner icon here for better visual feedback */}
      <h1 className="text-white text-xl animate-pulse">Logging out...</h1>
    </div>
  );
};

export default Logout;