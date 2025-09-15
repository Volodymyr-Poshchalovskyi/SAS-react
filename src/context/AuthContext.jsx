import { createContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitationToken, setInvitationToken] = useState(null);
  
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
        if (event === 'SIGNED_IN' && session?.user.app_metadata.provider === 'google') {
          const userEmail = session.user.email;
          if (!userEmail.endsWith('@sinnersandsaints.la')) {
            await supabase.auth.signOut();
            setError('Access denied: This login method is for staff only.');
            setUser(null);
            setSession(null);
          } else {
            setSession(session);
            setUser(session.user);
          }
        } else {
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
  
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=invite') && hash.includes('token_hash')) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('token_hash');
      if (token) {
        setInvitationToken(token);
      }
    }
  }, []);

  const signInWithGoogle = async () => {
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
    await supabase.auth.signOut();
  };

  const submitApplication = async ({ email, message }) => {
    const { data, error } = await supabase
      .from('applications')
      .insert({ email: email, message: message });
    if (error) {
      if (error.code === '23505') throw new Error('An application with this email already exists.');
      throw error;
    }
    return data;
  };
  
  const completeRegistration = async ({ password, firstName, lastName, location, state, phone }) => {
    const { data, error } = await supabase.auth.updateUser({
      password: password,
      data: { 
        full_name: `${firstName} ${lastName}`.trim(),
        location: location,
        state: state,
        phone: phone
      }
    });
    if (error) throw error;
    return data;
  };

  const getApplications = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  };

  const updateApplicationStatus = async (applicationId, newStatus, email) => {
    if (newStatus === 'approved') {
      // 1. Викликаємо нашу безпечну Edge Function
      const { data: inviteData, error: inviteError } = await supabase.functions.invoke('invite-user', {
        body: { email: email },
      });
      
      // Edge Function поверне помилку, якщо щось піде не так (напр. юзер вже існує)
      if (inviteError) throw inviteError;
      if (inviteData?.error) throw new Error(inviteData.error);
      
      // 2. Якщо запрошення успішне, оновлюємо статус заявки в нашій таблиці
      const { data, error } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', applicationId);
      if (error) throw error;
      return data;

    } else if (newStatus === 'denied') {
      const { data, error: updateError } = await supabase
        .from('applications')
        .update({ status: 'denied' })
        .eq('id', applicationId);
      if (updateError) throw updateError;
      
      // Викликаємо функцію для відправки листа про відмову
      await supabase.functions.invoke('rejection-email', { body: { email: email } });
      
      return data;
    }
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
    invitationToken,
    completeRegistration,
    getApplications,
    updateApplicationStatus,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export default AuthProvider;