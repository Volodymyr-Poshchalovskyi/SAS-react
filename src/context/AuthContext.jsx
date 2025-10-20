import { createContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// ---------- Create Auth Context ----------
export const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  // ---------- State ----------
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

    return () => listener?.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=invite') && hash.includes('token_hash')) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('token_hash');
      if (token) setInvitationToken(token);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`realtime_user_status_check:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new?.status === 'deactivated') {
            supabase.auth.signOut();
            setUser(null);
            setSession(null);
            window.location.href = '/login';
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const signInWithGoogle = async () =>
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

  const signInWithPassword = async (email, password) => {
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });
    if (signInError) throw signInError;
    if (!signInData.user) throw new Error('Could not sign in.');

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('status')
      .eq('id', signInData.user.id)
      .single();

    if (profileError) {
      await supabase.auth.signOut();
      throw new Error('User profile not found.');
    }

    if (profile.status === 'deactivated') {
      await supabase.auth.signOut();
      throw new Error('Your account has been deactivated.');
    }

    return signInData;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };
  const resetPassword = async (email) => {
    // Ми беремо поточний URL (localhost або production) і додаємо шлях
    const redirectURL = window.location.origin + '/update-password';
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectURL,
    });

    if (error) throw error;
    return data;
  };

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

  const completeRegistration = async ({
    password,
    firstName,
    lastName,
    location,
    state,
    phone,
  }) => {
    const { data: authData, error: authError } = await supabase.auth.updateUser(
      {
        password: password,
        data: {
          full_name: `${firstName} ${lastName}`.trim(),
          location,
          state,
          phone,
        },
      }
    );

    if (authError) {
      console.error('Supabase Auth Update Error:', authError);
      throw authError;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .update({
        first_name: firstName,
        last_name: lastName,

        location,
        state,
        phone,
        status: 'active',
      })
      .eq('id', authData.user.id)
      .select();

    if (profileError) {
      console.error('Supabase Profile Update Error:', profileError);
      throw profileError;
    }

    console.log('Profile updated successfully:', profileData);

    // 3. Вилогінюємо користувача, щоб він увійшов з новим паролем
    await supabase.auth.signOut();

    return authData;
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
      console.log('🚀 Sending invite to:', email);

      const { data, error: inviteError } = await supabase.functions.invoke(
        'invite-user',
        { body: { email } }
      );

      console.log('📩 Invite response:', { data, inviteError });

      if (inviteError)
        throw new Error(`Failed to invite user: ${inviteError.message}`);

      const { data: updateData, error } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', applicationId);

      if (error)
        throw new Error(
          `Failed to update application status: ${error.message}`
        );

      console.log('✅ Application status updated to approved:', updateData);
      return updateData;
    } else if (newStatus === 'denied') {
      console.log(`🚫 Denying application for ${email}`);

      // Крок 1: Оновлюємо статус в базі даних
      const { data, error } = await supabase
        .from('applications')
        .update({ status: 'denied' })
        .eq('id', applicationId);

      if (error) {
        // Якщо помилка в базі, зупиняємо все
        throw new Error(`Failed to update application status: ${error.message}`);
      }
      
      console.log(`ℹ️ Application denied for ${email}. Now sending rejection email...`);

      // Крок 2: ✨ НОВИЙ КОД: Надсилаємо лист про відмову ✨
      try {
        const { error: emailError } = await supabase.functions.invoke(
          'send-rejection-email', // Назва нашої нової функції
          { body: { email } } // Передаємо пошту
        );
        
        if (emailError) {
          // Важливо: Ми не зупиняємо процес, якщо лист не відправився.
          // Статус в базі вже оновлено. Просто логуємо помилку.
          console.warn('⚠️ Failed to send rejection email:', emailError.message);
        } else {
          console.log('✅ Rejection email sent successfully.');
        }
      } catch (invokeError) {
        // Так само, просто логуємо помилку
        console.warn('⚠️ Error invoking rejection email function:', invokeError.message);
      }

      // Повертаємо дані про оновлення з Кроку 1
      return data;
    }
  };

  // ---------- User Management Methods ----------
  const getUsers = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .neq('role', 'staff')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  };

  const updateUserStatus = async (userId, newStatus) => {
    const { data, error } = await supabase.functions.invoke(
      'update-user-status',
      {
        body: { userId, newStatus },
      }
    );
    if (error) throw error;
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
    supabase,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
