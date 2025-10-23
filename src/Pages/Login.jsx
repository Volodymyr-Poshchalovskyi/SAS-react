// src/Pages/Login.jsx

// ! React & Router Imports
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// ! Local Component Imports
import StaffLogin from '../Components/StaffLogin';
import UserLogin from '../Components/UserLogin';
import Registration from '../Components/Registration';
import RegistrationForm from '../Components/RegistrationForm';
import ForgotPassword from '../Components/ForgotPassword';

// ! Hook Imports
import { useAuth } from '../hooks/useAuth';

// ========================================================================== //
// ! MAIN COMPONENT: Login Page
// ========================================================================== //

const Login = () => {
  // ! Hooks
  const {
    signInWithGoogle,
    signInWithPassword,
    resetPassword,
    user, // * Current authenticated user object (or null)
    error: authError, // * Error from the auth context
    clearError, // * Function to clear context error
    invitationToken, // * Token parsed from URL hash if present
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // * To read state passed during navigation (e.g., error messages)

  // ! State Variables
  const [currentTab, setCurrentTab] = useState('SIGN_IN'); // * Controls which form is displayed ('STAFF', 'SIGN_IN', 'REGISTER')
  const [isForgotPassword, setIsForgotPassword] = useState(false); // * Toggles between UserLogin and ForgotPassword views
  const [email, setEmail] = useState(''); // * Email input for login/reset
  const [password, setPassword] = useState(''); // * Password input for login
  const [localError, setLocalError] = useState(''); // * Local error messages (e.g., validation)
  const [successMessage, setSuccessMessage] = useState(''); // * Success messages (e.g., after password reset request)
  const [loading, setLoading] = useState(false); // * Tracks loading state for API calls

  // ! Derived State
  const error = authError || localError; // * Combine context error and local error for display

  // ! Effects

  // * Effect: Check for messages passed via navigation state (e.g., from AuthCallback or RegistrationForm)
  useEffect(() => {
    if (location.state?.message) {
      // * Display message (could be error or success, styled accordingly where displayed)
      // * Prioritize local error for immediate feedback, maybe use successMessage for success
      // * Using setLocalError here covers redirects from AuthCallback with errors.
      // * Consider a dedicated state for general messages if needed.
      setLocalError(location.state.message);
      // * Clear the location state to prevent message persisting on refresh/revisit
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // * Effect: Switch to Registration tab if an invitation token is detected
  useEffect(() => {
    if (invitationToken) {
      setCurrentTab('REGISTER');
    }
  }, [invitationToken]);

  // * Effect: Handle redirection for already logged-in users or incomplete registrations
  useEffect(() => {
    // * Don't redirect if handling an invitation token
    if (invitationToken) return;
    // * Don't redirect if no user is logged in
    if (!user) return;

    // * Check if user profile data indicates registration is complete
    // * (Assumes 'full_name' is added during completeRegistration)
    const isRegistrationComplete = !!user.user_metadata?.full_name;

    // * Redirect staff users to admin panel
    if (user.email?.endsWith('@sinnersandsaints.la')) {
      navigate('/adminpanel');
      return;
    }

    // * Redirect fully registered users to user panel
    if (isRegistrationComplete) {
      navigate('/userpanel');
      return;
    }

    // * If logged in but registration is *not* complete, force to REGISTER tab
    // * This handles users who accepted an invite but didn't finish setting password/profile
    if (!isRegistrationComplete) {
      setCurrentTab('REGISTER');
    }

  }, [user, navigate, invitationToken]); // * Dependencies trigger checks when user state or token changes

  // ! Helper Functions
  /**
   * ? Clears all error and success messages from both context and local state.
   */
  const clearMessages = useCallback(() => {
    clearError(); // * Clear context error
    setLocalError('');
    setSuccessMessage('');
  }, [clearError]); // * Dependency on the stable clearError function from context

  // ! Event Handlers

  /**
   * ? Initiates the Google Sign-In flow.
   */
  const handleGoogleLogin = useCallback(() => {
    clearMessages();
    setLoading(true);
    signInWithGoogle().catch((err) => { // * Catch potential errors during initiation
      setLocalError(err.message || 'Failed to start Google Sign-In.');
      setLoading(false);
    });
    // * Loading will be set to false by the onAuthStateChange listener effect
  }, [signInWithGoogle, clearMessages]);

  /**
   * ? Handles standard email/password login form submission.
   */
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await signInWithPassword(email, password);
      // * Success redirection is handled by the useEffect watching the `user` state
    } catch (err) {
      // * Error is set by signInWithPassword or caught here
      setLocalError(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  }, [signInWithPassword, email, password, clearMessages]);

  /**
   * ? Handles the "Forgot Password" form submission.
   */
  const handlePasswordReset = useCallback(async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      if (!resetPassword) { // * Guard clause if reset function isn't provided by context
        throw new Error('Password reset functionality is currently unavailable.');
      }
      await resetPassword(email); // * Call the reset function from context
      setSuccessMessage('Password reset link has been sent to your email if an account exists.'); // * Show success message

      // * Automatically switch back to the login view after a delay
      setTimeout(() => {
        setIsForgotPassword(false);
        setSuccessMessage(''); // * Clear message on view switch
      }, 3000); // * 3-second delay

    } catch (err) {
      // * Display error from context or a default message
      setLocalError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [resetPassword, email, clearMessages]);

  /**
   * ? Handles switching between the main tabs (STAFF, SIGN_IN, REGISTER).
   * Clears messages, resets forgot password view, and clears form fields.
   */
  const handleTabChange = useCallback((tabName) => {
    clearMessages();
    setCurrentTab(tabName);
    setIsForgotPassword(false); // * Always reset forgot password view when changing main tabs
    setEmail('');
    setPassword('');
    setLoading(false); // * Reset loading state
  }, [clearMessages]); // * Dependency on stable clearMessages

  // ! Render Logic Helpers

  /**
   * ? Dynamically generates CSS classes for tab styling based on the active tab.
   * @param {string} tabName - The name of the tab to style.
   * @returns {string} The CSS classes for the tab.
   */
  const getTabClass = (tabName) => {
    const baseClasses =
      'py-4 px-4 sm:px-6 md:px-8 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all duration-300 border-b-2';
    // * Apply active styles if tabName matches currentTab
    return currentTab === tabName
      ? `${baseClasses} text-black border-black` // * Active tab style
      : `${baseClasses} text-gray-400 border-transparent hover:text-black`; // * Inactive tab style
  };

  /**
   * ? Determines which form component to render based on the current tab and state.
   * @returns {JSX.Element | null} The appropriate form component.
   */
  const renderFormContent = () => {
    // * Determine if the full RegistrationForm should be shown
    // * (Either user has invitation token OR user is logged in but profile is incomplete)
    const showFinalRegistration = invitationToken || (user && !user.user_metadata?.full_name);

    // * --- REGISTER Tab Logic ---
    if (currentTab === 'REGISTER') {
      return showFinalRegistration
        ? <RegistrationForm /> // * Show full form if token exists or profile incomplete
        : <Registration />; // * Show initial contact/application info if no token and profile complete/not logged in
    }

    // * --- STAFF Tab Logic ---
    if (currentTab === 'STAFF') {
      return (
        <StaffLogin
          handleGoogleLogin={handleGoogleLogin}
          loading={loading}
          error={error}
        />
      );
    }

    // * --- SIGN_IN Tab Logic ---
    if (currentTab === 'SIGN_IN') {
      if (isForgotPassword) {
        // * Show Forgot Password form if toggled
        return (
          <ForgotPassword
            email={email}
            setEmail={setEmail}
            handlePasswordReset={handlePasswordReset}
            loading={loading}
            error={error}
            successMessage={successMessage}
            onBackToLogin={() => setIsForgotPassword(false)} // * Handler to switch back
          />
        );
      }
      // * Show standard User Login form
      return (
        <UserLogin
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          handleLogin={handleLogin}
          loading={loading}
          error={error}
          successMessage={successMessage} // * Pass success message (e.g., from registration)
          onForgotPasswordClick={() => { // * Handler to switch to Forgot Password view
            clearMessages();
            setIsForgotPassword(true);
          }}
        />
      );
    }

    // * Default fallback (shouldn't be reached with current tabs)
    return null;
  };

  // ! Main Render
  return (
    // * Page container with padding and vertical centering attempt
    <div className="min-h-screen flex justify-center bg-gray-100 font-sans p-4 sm:p-8 lg:p-14 mt-[70px]"> {/* // ? mt-[70px] likely compensates for fixed header? */}
      <div className="w-full max-w-xl text-center mt-8 sm:mt-11 xl:mt-16">
        {/* --- Page Title --- */}
        <h1 className="text-3xl md:text-4xl font-semibold text-black mb-8 tracking-wider">
          ACCOUNT
        </h1>

        {/* --- Tab Navigation --- */}
        <div className="flex justify-center mb-8 md:mb-12 border-b border-gray-300">
          <div role="tab" aria-selected={currentTab === 'STAFF'} className={getTabClass('STAFF')} onClick={() => handleTabChange('STAFF')}>
            STAFF
          </div>
          <div role="tab" aria-selected={currentTab === 'SIGN_IN'} className={getTabClass('SIGN_IN')} onClick={() => handleTabChange('SIGN_IN')}>
            SIGN IN
          </div>
          <div role="tab" aria-selected={currentTab === 'REGISTER'} className={getTabClass('REGISTER')} onClick={() => handleTabChange('REGISTER')}>
            REGISTER
          </div>
        </div>

        {/* --- Form Content Area --- */}
        {/* // * key prop ensures component remounts/resets state on tab/view change */}
        <div className="px-4 py-8" key={`${currentTab}-${isForgotPassword}`}>
          {renderFormContent()}
        </div>
      </div>
    </div>
  );
};

export default Login;