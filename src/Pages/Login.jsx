
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StaffLogin from '../Components/StaffLogin';
import UserLogin from '../Components/UserLogin';
import Registration from '../Components/Registration';
import RegistrationForm from '../Components/RegistrationForm';
import ForgotPassword from '../Components/ForgotPassword';
import { useAuth } from '../hooks/useAuth';



const Login = () => {
  const {
    signInWithGoogle,
    signInWithPassword,
    resetPassword, // Assuming this function exists in your useAuth hook
    user,
    error: authError,
    clearError,
    invitationToken,
  } = useAuth();

  const [currentTab, setCurrentTab] = useState('SIGN_IN');
  const [isForgotPassword, setIsForgotPassword] = useState(false); // State to toggle password reset view
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // State for success messages
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const error = authError || localError;

  useEffect(() => {
    if (location.state?.message) {
      setLocalError(location.state.message);
    }
  }, [location]);

  useEffect(() => {
    if (invitationToken) {
      setCurrentTab('REGISTER');
    }
  }, [invitationToken]);

  useEffect(() => {
    if (invitationToken) {
      return;
    }

    if (!user) {
      return;
    }

    const isRegistrationComplete = !!user.user_metadata?.full_name;

    if (user.email.endsWith('@sinnersandsaints.la')) {
      navigate('/adminpanel');
      return;
    }

    if (isRegistrationComplete) {
      navigate('/userpanel');
      return;
    }

    if (!isRegistrationComplete) {
      setCurrentTab('REGISTER');
    }
  }, [user, navigate, invitationToken]);

  const clearMessages = () => {
    clearError();
    setLocalError('');
    setSuccessMessage('');
  };

  const handleGoogleLogin = () => {
    clearMessages();
    setLoading(true);
    signInWithGoogle().catch((err) => {
      setLocalError(err.message);
      setLoading(false);
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await signInWithPassword(email, password);
    } catch (err) {
      setLocalError(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      // ▼▼▼ ВАШ КОД "ОЖИВАЄ" ▼▼▼
      if (!resetPassword) {
        throw new Error('Password reset functionality is not implemented.');
      }
      await resetPassword(email);
      setSuccessMessage('Password reset link has been sent to your email.');

      // Повернемо користувача на форму логіна через 3 секунди
      setTimeout(() => {
        setIsForgotPassword(false);
        setSuccessMessage(''); // Очищуємо повідомлення при поверненні
      }, 3000);
      // ▲▲▲ КІНЕЦЬ ОНОВЛЕННЯ ▲▲▲

    } catch (err) {
      setLocalError(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };


  const handleTabChange = (tabName) => {
    clearMessages();
    setCurrentTab(tabName);
    setIsForgotPassword(false); // Reset forgot password view on tab change
    setEmail('');
    setPassword('');
    setLoading(false);
  };

  const getTabClass = (tabName) => {
    const baseClasses =
      'py-4 px-4 sm:px-6 md:px-8 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all duration-300 border-b-2';
    return currentTab === tabName
      ? `${baseClasses} text-black border-black`
      : `${baseClasses} text-gray-400 border-transparent hover:text-black`;
  };

  const renderFormContent = () => {
    const showFinalRegistration =
      invitationToken || (user && !user.user_metadata?.full_name);

    if (currentTab === 'REGISTER') {
      return showFinalRegistration ? <RegistrationForm /> : <Registration />;
    }

    switch (currentTab) {
      case 'STAFF':
        return (
          <StaffLogin
            handleGoogleLogin={handleGoogleLogin}
            loading={loading}
            error={error}
          />
        );
      case 'SIGN_IN':
        if (isForgotPassword) {
          return (
            <ForgotPassword
                email={email}
                setEmail={setEmail}
                handlePasswordReset={handlePasswordReset}
                loading={loading}
                error={error}
                successMessage={successMessage}
                onBackToLogin={() => setIsForgotPassword(false)}
            />
          );
        }
        return (
          <UserLogin
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleLogin={handleLogin}
            loading={loading}
            error={error}
            successMessage={successMessage}
            onForgotPasswordClick={() => {
                clearMessages();
                setIsForgotPassword(true);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-100 font-sans p-4 sm:p-8 lg:p-14 mt-[70px]">
      <div className="w-full max-w-xl text-center mt-8 sm:mt-11 xl:mt-16">
        <h1 className="text-3xl md:text-4xl font-semibold text-black mb-8 tracking-wider">
          ACCOUNT
        </h1>
        <div className="flex justify-center mb-8 md:mb-12 border-b border-gray-300">
          <div
            className={getTabClass('STAFF')}
            onClick={() => handleTabChange('STAFF')}
          >
            STAFF
          </div>
          <div
            className={getTabClass('SIGN_IN')}
            onClick={() => handleTabChange('SIGN_IN')}
          >
            SIGN IN
          </div>
          <div
            className={getTabClass('REGISTER')}
            onClick={() => handleTabChange('REGISTER')}
          >
            REGISTER
          </div>
        </div>
        <div className="px-4 py-8" key={`${currentTab}-${isForgotPassword}`}>
          {renderFormContent()}
        </div>
      </div>
    </div>
  );
};

export default Login;
