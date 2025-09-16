// src/context/AuthContext.js

import { createContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// ---------- Create Auth Context ----------
export const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  // ---------- State ----------
  const [user, setUser] = useState(null); // Current user object
  const [session, setSession] = useState(null); // Supabase session
  const [loading, setLoading] = useState(true); // Loading state for auth
  const [error, setError] = useState(null); // Error messages
  const [invitationToken, setInvitationToken] = useState(null); // Token from invite links

  const clearError = () => setError(null); // Helper to clear errors

  // ---------- Initialize Session and Auth Listener ----------
  useEffect(() => {
    setLoading(true);

    // Fetch current session
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };
    getSession();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // ---------- Google Staff Restriction ----------
        if (
          event === 'SIGNED_IN' &&
          session?.user.app_metadata.provider === 'google'
        ) {
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

    // Cleanup listener on unmount
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // ---------- Extract Invitation Token from URL Hash ----------
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=invite') && hash.includes('token_hash')) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('token_hash');
      if (token) setInvitationToken(token);
    }
  }, []);

  // ---------- Authentication Methods ----------

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    });
  };

  // Sign in with email & password
  const signInWithPassword = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // ---------- Application Methods ----------

  // Submit a new application
  const submitApplication = async ({ email, message }) => {
    const { data, error } = await supabase
      .from('applications')
      .insert({ email, message });
    if (error) {
      if (error.code === '23505')
        throw new Error('An application with this email already exists.');
      throw error;
    }
    return data;
  };

  // Complete user registration
  const completeRegistration = async ({
    password,
    firstName,
    lastName,
    location,
    state,
    phone,
  }) => {
    const { data, error } = await supabase.auth.updateUser({
      password: password,
      data: {
        full_name: `${firstName} ${lastName}`.trim(),
        location,
        state,
        phone,
      },
    });
    if (error) throw error;

    // Sign out after registration
    await supabase.auth.signOut();
    return data;
  };

  // Fetch all applications
  const getApplications = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  };

  // Update application status (approve or deny)
  const updateApplicationStatus = async (applicationId, newStatus, email) => {
    if (newStatus === 'approved') {
      // Invoke function to send invite email
      const { data: inviteData, error: inviteError } =
        await supabase.functions.invoke('invite-user', { body: { email } });

      if (inviteError) {
        throw new Error(`Failed to invite user: ${inviteError.message}`);
      }

      // Update application status to approved
      const { data, error } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', applicationId);
      if (error) {
        throw new Error(
          `Failed to update application status: ${error.message}`
        );
      }
      return data;
    } else if (newStatus === 'denied') {
      // Update application status to denied
      const { data, error } = await supabase
        .from('applications')
        .update({ status: 'denied' })
        .eq('id', applicationId);
      if (error) throw error;

      console.log(
        `Application for ${email} denied. Email sending is currently disabled.`
      );
      return data;
    }
  };

  // ---------- User Management Methods ----------

  // Fetch all non-staff users
  const getUsers = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .neq('role', 'staff')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  };

  // Update user status (active/deactivated)
  const updateUserStatus = async (userId, newStatus) => {
    const shouldDeactivate = newStatus === 'deactivated';

    // Call Supabase function to deactivate auth user if necessary
    const { error: funcError } = await supabase.functions.invoke(
      'deactivate-auth-user',
      {
        body: { userId, shouldDeactivate },
      }
    );
    if (funcError) throw funcError;

    // Update user profile status
    const { data, error: updateError } = await supabase
      .from('user_profiles')
      .update({ status: newStatus })
      .eq('id', userId);
    if (updateError) throw updateError;
    return data;
  };

  // ---------- Context Value ----------
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
    getUsers,
    updateUserStatus,
  };

  // ---------- Render Provider ----------
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
