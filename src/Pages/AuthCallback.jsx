// src/Pages/AuthCallback.jsx

// ! React & Router Imports
import React, { useEffect } from 'react'; // * useEffect is imported but not used directly, implied by React's hook usage. Kept for clarity.
import { useNavigate } from 'react-router-dom';

// ! Local Imports (Hooks)
import { useAuth } from '../hooks/useAuth'; // * Custom hook to get authentication state

// ========================================================================== //
// ! COMPONENT DEFINITION: AuthCallback
// ========================================================================== //

/**
 * ? AuthCallback Component
 * This component acts as a temporary landing page after an OAuth redirect (e.g., Google Sign-In).
 * It uses the `useAuth` hook to determine the user's authentication status and redirects
 * them to the appropriate dashboard (admin/user) or back to the login page if authentication fails.
 */
const AuthCallback = () => {
  // ! Hooks
  const { user, loading, error } = useAuth(); // * Get user state, loading status, and potential errors from context
  const navigate = useNavigate(); // * Hook for programmatic navigation

  // ! Effect: Handle Redirection based on Auth State
  // * This effect runs when the component mounts or when auth state (user, loading, error) changes.
  useEffect(() => {
    // * Wait until the initial authentication check is complete
    if (loading) {
      return; // * Do nothing while loading
    }

    // * Handle Authentication Error
    if (error) {
      console.error('AuthCallback Error:', error); // * Log the error for debugging
      // * Redirect back to login page, passing the error message as state
      navigate('/login', {
        state: { message: error.message || 'Authentication failed.' },
      });
      return;
    }

    // * Handle Successful Authentication
    if (user) {
      // * Redirect based on user email domain (simple role check)
      if (user.email && user.email.endsWith('@sinnersandsaints.la')) {
        // * Staff/Admin user
        navigate('/adminpanel');
      } else {
        // * Regular user
        navigate('/userpanel');
      }
      return; // * Stop further execution after successful redirection
    }

    // * Default Case: No user, no error (e.g., initial load incomplete, unexpected state)
    // * Redirect back to login as a fallback
    console.warn(
      'AuthCallback: No user found after loading, redirecting to login.'
    );
    navigate('/login');
  }, [user, loading, error, navigate]); // * Dependencies for the effect

  // ! Render Logic: Loading Indicator
  // * Display a simple loading message while authentication is being processed.
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      {/* // ? Consider adding a spinner icon here */}
      <h1 className="text-white text-xl animate-pulse">Authenticating...</h1>
    </div>
  );
};

export default AuthCallback;
