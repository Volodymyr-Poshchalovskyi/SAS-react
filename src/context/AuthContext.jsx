// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async (user) => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('id', user.id)
        .single();
      setIsAdmin(!error && !!data);
    };

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      await checkAdminStatus(session?.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (_event !== 'SIGNED_OUT') {
            await checkAdminStatus(session?.user);
        } else {
            // Ensure admin status is cleared on logout
            setIsAdmin(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    setIsLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    setIsLoggingOut(false);
    return { error };
  };

  const isAuthenticated = !!session;

  const value = {
    session,
    isAdmin,
    loading,
    isLoggingOut,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}