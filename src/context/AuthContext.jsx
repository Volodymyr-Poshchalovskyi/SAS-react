import { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Стан для глобальної помилки

  // Функція для очищення помилки
  const clearError = () => setError(null);

  useEffect(() => {
    setLoading(true);
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Логіка перевірки домену для Google Sign In
        if (event === 'SIGNED_IN' && session?.user.app_metadata.provider === 'google') {
          const userEmail = session.user.email;
          if (!userEmail.endsWith('@sinnersandsaints.la')) {
            // Якщо домен неправильний - одразу виходимо з системи
            await supabase.auth.signOut(); 
            // Встановлюємо повідомлення про помилку
            setError('Access denied: This login method is for staff only.');
            setUser(null);
            setSession(null);
          } else {
            // Якщо домен правильний - продовжуємо як зазвичай
            setSession(session);
            setUser(session.user);
          }
        } else {
          // Для всіх інших подій (вихід, вхід за паролем) працюємо як раніше
          setSession(session);
          setUser(session?.user ?? null);
        }
        setLoading(false);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/adminpanel',
      },
    });
  };

  const signInWithPassword = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };
  
  const value = {
    session,
    user,
    loading,
    error, // Експортуємо помилку
    clearError, // і функцію для її очищення
    signInWithGoogle,
    signInWithPassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export default AuthProvider;