// src/context/AuthContext.jsx
import { createContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); // true поки не перевірили сесію
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  // Валідація сесії — повертає true якщо приймаємо, false якщо відкидаємо
  const validateSession = async (sess) => {
    // Якщо немає сесії — просто очищаємо стани
    if (!sess || !sess.user) {
      setSession(null);
      setUser(null);
      setError(null);
      return false;
    }

    // DEBUG: допоможе бачити реальну структуру об'єкту session
    // Видаліть/закоментуйте в production
    console.debug('[Auth] validateSession session:', sess);

    const email = sess.user?.email ?? '';
    const identities = sess.user?.identities ?? sess.user?.user_metadata?.identities;
    const isGoogle =
      // перевіряємо кілька потенційних полів — залежить від версії supabase/supabase-js
      Boolean(
        identities?.some?.((i) => i.provider === 'google') ||
        sess.provider === 'google' ||
        sess.user?.app_metadata?.provider === 'google'
      );

    // Якщо Google-провайдер і email не корпоративний — відкидаємо (і sign out)
    if (isGoogle && !email.endsWith('@sinnersandsaints.la')) {
      try {
        // зробимо sign out, щоб сесія видалилася з Supabase
        await supabase.auth.signOut();
      } catch (e) {
        console.error('[Auth] error during signOut for invalid google user', e);
      }
      setSession(null);
      setUser(null);
      setError('Access denied: This login method is for staff only.');
      return false;
    }

    // Все ок — сетимо session і user
    setSession(sess);
    setUser(sess.user);
    setError(null);
    return true;
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // Початкова перевірка сесії
    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sess = data?.session ?? null;
        await validateSession(sess);
      } catch (e) {
        console.error('[Auth] init session error', e);
        setSession(null);
        setUser(null);
        setError(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();

    // Слухач змін аутентифікації
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, sess) => {
      // Коли приходить подія — ставимо loading, бо йде перевірка
      setLoading(true);
      // Валідуємо сесію (validateSession виконає signOut якщо потрібно)
      await validateSession(sess);
      setLoading(false);
    });

    return () => {
      mounted = false;
      try {
        listener?.subscription?.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    // clearError();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    });
  };

  const signInWithPassword = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setError(null);
    } catch (e) {
      console.error('[Auth] signOut error', e);
    } finally {
      setLoading(false);
    }
  };

  const submitApplication = async ({ email, message }) => {
    const { data, error } = await supabase
      .from('applications')
      .insert({ email: email, message: message });

    if (error) {
      if (error.code === '23505') {
        throw new Error('An application with this email already exists.');
      }
      throw error;
    }
    return data;
  };

  const value = {
    session,
    user,
    loading,
    error,
    clearError,
    signInWithGoogle,
    signInWithPassword,
    signOut,
    submitApplication, 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
