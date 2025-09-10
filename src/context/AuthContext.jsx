// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // <-- Новий стан

  useEffect(() => {
    // ... (решта useEffect залишається без змін) ...
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
      setIsAdmin(!error && data);
    };

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      await checkAdminStatus(session?.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        // Не встановлюємо isLoggingOut тут, щоб уникнути зациклення
        if (_event !== 'SIGNED_OUT') {
            await checkAdminStatus(session?.user);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // <-- Нова функція виходу
  const logout = async () => {
    setIsLoggingOut(true); // Повідомляємо, що почався вихід
    const { error } = await supabase.auth.signOut();
    // Після виходу onAuthStateChange автоматично оновить isAdmin і session
    setIsLoggingOut(false); // Завершуємо процес
    return { error };
  };


  const value = {
    session,
    isAdmin,
    loading,
    isLoggingOut, // <-- Передаємо новий стан
    logout,        // <-- Передаємо функцію виходу
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