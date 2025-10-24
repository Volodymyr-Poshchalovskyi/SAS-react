// src/context/AuthContext.jsx

// ! React Imports
import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';

// ! Library Imports
import { supabase } from '../lib/supabaseClient'; // * Supabase client instance

// * Константа для базового URL бек-енду
const API_BASE_URL = import.meta.env.VITE_API_URL;

// ========================================================================== //
// ! AUTH CONTEXT CREATION
// ========================================================================== //

export const AuthContext = createContext({});

// ========================================================================== //
// ! AUTH PROVIDER COMPONENT
// ========================================================================== //

const AuthProvider = ({ children }) => {
  // ! State Variables
  const [user, setUser] = useState(null); // * Stores the authenticated user object
  const [session, setSession] = useState(null); // * Stores the current session object
  const [loading, setLoading] = useState(true); // * Tracks initial session loading state
  const [error, setError] = useState(null); // * Stores authentication or related errors
  const [invitationToken, setInvitationToken] = useState(null); // * Stores token from invitation URL hash

  // ! Helper Functions
  /**
   * ? Clears any existing error messages.
   */
  const clearError = useCallback(() => setError(null), []);

  // ! Effect: Initial Session Loading & Auth State Listener
  // * Fetches the initial session on mount and sets up a listener for auth state changes.
  useEffect(() => {
    setLoading(true);
    let isMounted = true; // * Flag to prevent state updates on unmounted component

    // * Fetch initial session data
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching initial session:', err);
        if (isMounted) setLoading(false);
      }
    };
    getSession();

    // * Subscribe to Supabase auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('Auth event:', event, session); // * Debugging log

        if (
          event === 'SIGNED_IN' &&
          session?.user.app_metadata.provider === 'google'
        ) {
          const userEmail = session.user.email;
          // * Enforce staff domain restriction
          if (!userEmail || !userEmail.endsWith('@sinnersandsaints.la')) {
            console.warn('Non-staff Google login attempt:', userEmail);
            await supabase.auth.signOut(); // * Force sign out
            setError('Access denied: Staff Google login required.');
            setUser(null);
            setSession(null);
          } else {
            // * Staff Google login successful
            console.log('Staff member logged in. Updating profile status...');

            // ▼▼▼ ПОЧАТОК ВИПРАВЛЕННЯ ▼▼▼
            try {
              // Оновлюємо статус профілю на 'active' і гарантуємо роль 'staff'
              const { error: profileError } = await supabase
                .from('user_profiles')
                .update({
                  status: 'active',
                  role: 'staff', // На про всяк випадок, якщо тригер не спрацював
                })
                .eq('id', session.user.id);

              if (profileError) {
                console.error(
                  'Error updating staff profile to active:',
                  profileError.message
                );
                // Не блокуємо вхід, але логуємо помилку
              } else {
                console.log('Staff profile status successfully set to active.');
              }
            } catch (err) {
              console.error(
                'Exception during staff profile update:',
                err.message
              );
            }
            // ▲▲▲ КІНЕЦЬ ВИПРАВЛЕННЯ ▲▲▲

            setSession(session);
            setUser(session.user);
            setError(null); // * Clear any previous errors
          }
        }
        // * General update for other sign-ins or session refreshes
        else {
          setSession(session);
          setUser(session?.user ?? null);
          setError(null); // * Clear errors on successful sign-in/refresh
        }
        setLoading(false);
      }
    );

    // * Cleanup: Unsubscribe listener and set mounted flag to false
    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []); // * Run only once on mount

  // ! Effect: Parse Invitation Token from URL Hash
  // * Checks the URL hash on mount for an invitation token.
  useEffect(() => {
    const hash = window.location.hash;
    // * Look for specific parameters indicating an invitation
    if (hash.includes('type=invite') && hash.includes('token_hash=')) {
      try {
        const params = new URLSearchParams(hash.substring(1)); // * Remove '#' and parse
        const token = params.get('token_hash');
        if (token) {
          console.log('Invitation token found:', token);
          setInvitationToken(token);
          // * Optionally clear the hash after parsing
          // window.location.hash = '';
        }
      } catch (e) {
        console.error('Error parsing invitation token from hash:', e);
      }
    }
  }, []); // * Run only once on mount

  // ! Effect: Realtime User Status Listener
  // * Listens for updates to the user's profile (specifically status changes).
  // * If the user's status is set to 'deactivated', logs them out.
  useEffect(() => {
    if (!user?.id) return; // * Only run if user is logged in

    const channel = supabase
      .channel(`realtime_user_status_check:${user.id}`) // * Unique channel name
      .on(
        'postgres_changes', // * Listen for database changes
        {
          event: 'UPDATE', // * Specifically for UPDATE events
          schema: 'public',
          table: 'user_profiles', // * On the user_profiles table
          filter: `id=eq.${user.id}`, // * Only for the current user's row
        },
        (payload) => {
          console.log('Realtime profile update received:', payload);
          // * Check if the new status is 'deactivated'
          if (payload.new?.status === 'deactivated') {
            console.warn('User deactivated remotely. Signing out.');
            supabase.auth.signOut(); // * Force sign out
            // * Optionally redirect to login or show a message
            // setUser(null); // Handled by onAuthStateChange
            // setSession(null);
            // window.location.href = '/login?message=account_deactivated';
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Realtime channel subscribed for user ${user.id}`);
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(
            `Realtime channel error for user ${user.id}:`,
            err || status
          );
        }
      });

    // * Cleanup: Remove the channel subscription on unmount or user change
    return () => {
      if (channel) {
        supabase
          .removeChannel(channel)
          .then(() =>
            console.log(`Realtime channel unsubscribed for user ${user.id}`)
          )
          .catch((err) =>
            console.error('Error removing realtime channel:', err)
          );
      }
    };
  }, [user?.id]); // * Re-subscribe if the user ID changes

  // ========================================================================== //
  // ! AUTH ACTION METHODS
  // ========================================================================== //

  /**
   * ? Initiates Google OAuth sign-in flow.
   */
  const signInWithGoogle = useCallback(async () => {
    clearError();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (oauthError) {
      setError(oauthError.message);
      throw oauthError;
    }
    // * Redirection handled by Supabase/browser
  }, [clearError]);

  /**
   * ? Signs in a user with email and password.
   * Checks the user's profile status after successful sign-in.
   */
  const signInWithPassword = useCallback(
    async (email, password) => {
      clearError();
      // * 1. Attempt Supabase sign-in
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        throw signInError;
      }
      if (!signInData?.user) {
        const err = new Error('Sign in failed: No user data returned.');
        setError(err.message);
        throw err;
      }

      // * 2. Check user profile status in the database
      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('status')
          .eq('id', signInData.user.id)
          .single(); // * Expect exactly one profile

        if (profileError) {
          // * Profile not found or other DB error, sign out immediately
          await supabase.auth.signOut();
          const err = new Error('User profile not found or inaccessible.');
          setError(err.message);
          throw err;
        }

        // * 3. Check if account is deactivated
        if (profile.status === 'deactivated') {
          await supabase.auth.signOut();
          const err = new Error(
            'Your account has been deactivated. Please contact support.'
          );
          setError(err.message);
          throw err;
        }

        // * 4. Check if profile exists but status is pending (shouldn't happen with email/pass but safety check)
        if (profile.status === 'pending') {
          await supabase.auth.signOut();
          const err = new Error(
            'Your account registration is not yet complete.'
          );
          setError(err.message);
          throw err;
        }

        // * Sign-in successful and profile is active
        // * State update handled by onAuthStateChange listener
        return signInData;
      } catch (profileCheckError) {
        // * Ensure sign out if any profile check fails
        await supabase.auth
          .signOut()
          .catch((e) =>
            console.error('Sign out error during profile check fail:', e)
          );
        setError(profileCheckError.message); // Set the specific error
        throw profileCheckError; // Re-throw for the caller
      }
    },
    [clearError]
  );

  /**
   * ? Signs out the current user.
   */
  const signOut = useCallback(async () => {
    clearError();
    
    // Очищаємо стан негайно, щоб компонент AdminLayout відразу відреагував.
    // Навіть якщо signOut() дасть помилку, ми робимо вигляд, що вийшли.
    // (Це запобігає зависанню в AdminLayout)
    setUser(null);
    setSession(null);

    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      // Якщо вихід з Supabase дав помилку, встановлюємо її, але стан залишаємо очищеним
      // (інакше користувач не зможе нічого зробити)
      setError(signOutError.message);
      console.error('Sign out error:', signOutError);
      throw signOutError; // Прокидаємо помилку, щоб AdminLayout міг її спіймати
    }
    
  }, [clearError]);

  /**
   * ? Sends a password reset email to the user.
   */
  const resetPassword = useCallback(
    async (email) => {
      clearError();
      // * Construct the redirect URL for the update password page
      const redirectURL = `${window.location.origin}/update-password`;
      const { data, error: resetError } =
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectURL,
        });
      if (resetError) {
        setError(resetError.message);
        throw resetError;
      }
      return data; // * Success data (usually null)
    },
    [clearError]
  );

  // ========================================================================== //
  // ! APPLICATION METHODS
  // ========================================================================== //

  /**
   * ? Submits a user application.
   */
  const submitApplication = useCallback(
    async ({ email, message }) => {
      clearError();
      const { data, error: insertError } = await supabase
        .from('applications')
        .insert({ email, message });
      if (insertError) {
        // * Handle potential unique constraint violation (duplicate email)
        if (insertError.code === '23505') {
          const err = new Error(
            'An application with this email already exists.'
          );
          setError(err.message);
          throw err;
        }
        setError(insertError.message);
        throw insertError;
      }
      return data;
    },
    [clearError]
  );

  /**
   * ? Retrieves all applications (for admin) - ОНОВЛЕНО: використовує бек-енд.
   */
  const getApplications = useCallback(async () => {
    clearError();
    if (!session?.access_token) {
      throw new Error('Authentication required for fetching applications.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response
          .json()
          .catch(() => ({ error: 'Failed to fetch data from backend.' }));
        throw new Error(
          errorBody.error ||
            `Backend fetch failed with status ${response.status}`
        );
      }

      return await response.json();
    } catch (fetchError) {
      setError(fetchError.message);
      throw fetchError;
    }
  }, [clearError, session]); // Залежність від session

  /**
   * ? Updates the status of an application - ОНОВЛЕНО: використовує бек-енд.
   */
  const updateApplicationStatus = useCallback(
    async (applicationId, newStatus, email) => {
      clearError();
      if (!session?.access_token) {
        throw new Error('Authentication required for updating status.');
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/applications/${applicationId}/status`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus, email: email }),
          }
        );

        if (!response.ok) {
          const errorBody = await response
            .json()
            .catch(() => ({ error: 'Failed to update status on backend.' }));
          throw new Error(
            errorBody.error ||
              `Backend update failed with status ${response.status}`
          );
        }

        // Бек-енд повертає оновлений запис заявки
        return await response.json();
      } catch (fetchError) {
        setError(fetchError.message);
        throw fetchError;
      }
    },
    [clearError, session]
  ); // Залежність від session

  // ========================================================================== //
  // ! REGISTRATION METHODS
  // ========================================================================== //

  /**
   * ? Completes the user registration process after invite acceptance.
   * Updates the user's password and profile information. Signs the user out afterwards.
   */
  const completeRegistration = useCallback(
    async ({ password, firstName, lastName, location, state, phone }) => {
      clearError();
      // * 1. Update Supabase Auth user (password, basic metadata)
      const { data: authData, error: authError } =
        await supabase.auth.updateUser({
          password: password,
          data: {
            // * Store some info in auth metadata if needed, otherwise rely on profile table
            full_name: `${firstName} ${lastName}`.trim(),
            // location, state, phone // * Usually better kept only in profile table
          },
        });
      if (authError) {
        console.error(
          'Supabase Auth Update Error during registration:',
          authError
        );
        setError(authError.message);
        throw authError;
      }
      if (!authData?.user) {
        const err = new Error('Failed to update user authentication data.');
        setError(err.message);
        throw err;
      }

      // * 2. Update the corresponding user_profiles table row
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          location, // * Assuming DB column name matches
          state, // * Assuming DB column name matches
          phone, // * Assuming DB column name matches
          status: 'active', // * Set status to active upon completion
        })
        .eq('id', authData.user.id) // * Match by user ID
        .select() // * Return the updated profile data
        .single(); // * Expecting one row

      if (profileError) {
        console.error(
          'Supabase Profile Update Error during registration:',
          profileError
        );
        // ? Consider potential rollback or cleanup if profile update fails after auth update
        setError(profileError.message);
        throw profileError;
      }
      console.log('Profile updated successfully:', profileData);

      // * 3. Sign the user out - forcing them to log in with their new password
      await supabase.auth.signOut();

      return authData; // * Return auth data (profile data is implicitly updated)
    },
    [clearError]
  );

  // ========================================================================== //
  // ! USER MANAGEMENT METHODS (Admin)
  // ========================================================================== //

  /**
   * ? Retrieves user profiles (excluding staff roles) - ОНОВЛЕНО: використовує бек-енд.
   */
  const getUsers = useCallback(async () => {
    clearError();
    if (!session?.access_token) {
      throw new Error('Authentication required for fetching users.');
    }

    try {
      // * ВИКЛИК БЕК-ЕНДУ: /users
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorBody = await response
          .json()
          .catch(() => ({ error: 'Failed to fetch user data from backend.' }));
        throw new Error(
          errorBody.error ||
            `Backend fetch failed with status ${response.status}`
        );
      }

      return await response.json();
    } catch (fetchError) {
      setError(fetchError.message);
      throw fetchError;
    }
  }, [clearError, session]); // Залежність від session

  /**
   * ? Updates a user's status (active/deactivated) - ОНОВЛЕНО: використовує бек-енд.
   */
  const updateUserStatus = useCallback(
    async (userId, newStatus) => {
      clearError();
      if (!session?.access_token) {
        throw new Error('Authentication required for updating user status.');
      }

      try {
        // * ВИКЛИК БЕК-ЕНДУ: /users/:id/status
        const response = await fetch(
          `${API_BASE_URL}/users/${userId}/status`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
          }
        );

        if (!response.ok) {
          const errorBody = await response
            .json()
            .catch(() => ({ error: 'Failed to update status on backend.' }));
          throw new Error(
            errorBody.error ||
              `Backend update failed with status ${response.status}`
          );
        }

        // Бек-енд поверне оновлений профіль
        return await response.json();
      } catch (fetchError) {
        setError(fetchError.message);
        throw fetchError;
      }
    },
    [clearError, session]
  ); // Залежність від session

  // ========================================================================== //
  // ! CONTEXT VALUE & PROVIDER RETURN
  // ========================================================================== //

  // * Define the context value object
  // * Use useMemo here if any complex calculations were involved or if passing functions
  // * directly could cause unnecessary re-renders in consumers. useCallback helps here.
  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      error,
      clearError,
      signInWithGoogle,
      signInWithPassword,
      signOut,
      submitApplication,
      invitationToken, // * Pass token for registration form
      completeRegistration,
      getApplications,
      updateApplicationStatus,
      getUsers, // * Оновлено
      updateUserStatus, // * Оновлено
      supabase, // * Expose Supabase client if needed by consumers
      resetPassword,
    }),
    [
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
      getUsers, // * Оновлено
      updateUserStatus, // * Оновлено
      resetPassword,
      supabase,
    ]
  );

  // * Render the provider, passing the value. Only render children when initial loading is done.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;