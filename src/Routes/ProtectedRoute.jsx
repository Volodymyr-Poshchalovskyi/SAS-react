import { useAuth } from '../hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * ProtectedRoute
 * Protects routes that require authentication.
 * - Redirects unauthenticated users to login.
 * - Handles loading state while checking authentication.
 * - Redirects deactivated users.
 * - Redirects non-admin users with incomplete registration to login.
 */
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [active, setActive] = useState(true);

  // Extra check against DB in case realtime failed
  useEffect(() => {
    const checkProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('user_profiles')
          .select('status')
          .eq('id', user.id)
          .single();
        if (data?.status === 'deactivated') {
          setActive(false);
          await supabase.auth.signOut();
        }
      }
      setChecking(false);
    };
    checkProfile();
  }, [user?.id]);

  if (loading || checking) {
    return <h1>Loading...</h1>;
  }

  if (!user || !active) {
    return <Navigate to="/login" />;
  }

  const isRegistrationComplete = !!user.user_metadata?.full_name;
  const isAdmin = user.email.endsWith('@sinnersandsaints.la');

  if (!isAdmin && !isRegistrationComplete) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
