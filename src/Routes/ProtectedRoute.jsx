// src/Routes/ProtectedRoute.jsx

// ! React & Router Imports
import React, { useEffect, useState } from 'react'; // * Added React for clarity, useState & useEffect are used
import { Navigate, Outlet } from 'react-router-dom';

// ! Hook & Library Imports
import { useAuth } from '../hooks/useAuth'; // * Custom hook for authentication state
import { supabase } from '../lib/supabaseClient'; // * Supabase client for direct DB checks

// ========================================================================== //
// ! COMPONENT DEFINITION: ProtectedRoute
// ========================================================================== //

/**
 * ? ProtectedRoute Component
 * A route guard component ensuring that only authenticated and active users
 * can access the nested routes it protects.
 *
 * Checks performed:
 * 1.  Authentication Status: Verifies if a user session exists via `useAuth`.
 * 2.  Account Status (DB Check): Performs an additional check against the `user_profiles`
 * table to ensure the user's status is not 'deactivated'. This acts as a fallback
 * in case the realtime listener in `AuthContext` fails or hasn't updated yet.
 * 3.  Registration Completion (Non-Admins): For non-admin users, verifies if their
 * registration process is complete (checks for `full_name` in metadata).
 *
 * Redirects:
 * - Unauthenticated users to `/login`.
 * - Deactivated users to `/login` (after signing them out).
 * - Non-admin users with incomplete registration to `/login`.
 *
 * Loading State:
 * - Displays a simple "Loading..." message while initial auth check (`loading` from `useAuth`)
 * or the secondary profile check (`checking`) is in progress.
 *
 * @returns {JSX.Element} Either the nested routes via `<Outlet />`, a `<Navigate>` component for redirection, or a loading indicator.
 */
const ProtectedRoute = () => {
  // ! Hooks & State
  const { user, loading: authLoading } = useAuth(); // * Get user and initial loading state from context
  const [checkingProfile, setCheckingProfile] = useState(true); // * Local state for the secondary profile check
  const [isActiveUser, setIsActiveUser] = useState(true); // * Local state reflecting DB status check result

  // ! Effect: Secondary Profile Status Check
  // * This effect performs an explicit check against the database for the user's status.
  // * It serves as a safety net if the realtime subscription in AuthContext missed an update
  // * or if the component loads before the realtime update is processed.
  useEffect(() => {
    let isMounted = true; // * Prevent state updates if component unmounts during async check

    const checkProfileStatus = async () => {
      // * Only run the check if there's a user ID available from the initial auth load
      if (user?.id) {
        try {
          // * Fetch the 'status' column from the user_profiles table for the current user
          const { data, error } = await supabase
            .from('user_profiles')
            .select('status')
            .eq('id', user.id)
            .single(); // * Expecting only one row

          if (error) {
            // * Handle potential DB errors (e.g., profile not found yet, network issue)
            console.error("Error checking user profile status:", error);
            // * Decide on behavior: Assume active, or deny access? Denying access might be safer.
            // * For now, let's assume active but log the error. Could set isActiveUser to false here.
            // setIsActiveUser(false);
          } else if (data?.status === 'deactivated') {
             // * If the database confirms the user is deactivated
             if (isMounted) {
                console.warn("ProtectedRoute: User status is 'deactivated' in DB. Forcing sign out.");
                setIsActiveUser(false); // * Update local state
                await supabase.auth.signOut(); // * Force sign out
                // * The AuthContext's onAuthStateChange listener should handle the redirect after sign out.
             }
          } else {
             // * User is active or status is something else (e.g., pending, active)
             if (isMounted) setIsActiveUser(true);
          }
        } catch (dbError) {
           console.error("Exception during profile status check:", dbError);
           // * Handle unexpected errors during the check
           // if (isMounted) setIsActiveUser(false); // Optionally deny access on unexpected errors
        }
      }
      // * Mark the profile check as complete
      if (isMounted) setCheckingProfile(false);
    };

    // * Don't start the DB check until the initial auth loading is done
    if (!authLoading) {
      setCheckingProfile(true); // Ensure checking state is true before async call
      checkProfileStatus();
    } else {
       // If auth is still loading, we are definitely still checking profile equivalent
       setCheckingProfile(true);
    }

    // * Cleanup function
    return () => { isMounted = false; };

  }, [user?.id, authLoading]); // * Re-run if user ID changes or initial auth loading finishes

  // ! Loading State Render
  // * Show loading indicator if either the initial auth check or the profile check is ongoing.
  if (authLoading || checkingProfile) {
    // ? Replace with a more sophisticated loading component (e.g., spinner) if desired
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
             <h1 className="text-white text-xl animate-pulse">Loading Access...</h1>
        </div>
    );
  }

  // ! Authentication & Activation Check
  // * Redirect to login if no user is authenticated OR if the profile check found the user is deactivated.
  if (!user || !isActiveUser) {
    console.log(`ProtectedRoute: Access denied. User: ${!!user}, Active: ${isActiveUser}. Redirecting to /login.`);
    return <Navigate to="/login" replace />; // * Use 'replace' to prevent back navigation
  }

  // ! Registration Completion Check (for Non-Admins)
  // * Check if registration is complete (assumes 'full_name' is set upon completion)
  const isRegistrationComplete = !!user.user_metadata?.full_name;
  // * Determine if the user is an admin
  const isAdmin = user.email?.endsWith('@sinnersandsaints.la');

  // * If the user is NOT an admin AND their registration is NOT complete, redirect to login.
  // * This forces users who accepted invites but haven't finished setup back to the login/registration flow.
  if (!isAdmin && !isRegistrationComplete) {
     console.log("ProtectedRoute: Non-admin user with incomplete registration. Redirecting to /login.");
     // * Pass state to potentially show a message on the login page
     return <Navigate to="/login" state={{ message: "Please complete your registration." }} replace />;
  }

  // ! Access Granted: Render Child Routes
  // * If all checks pass, render the nested routes defined within this ProtectedRoute.
  return <Outlet />;
};

export default ProtectedRoute;