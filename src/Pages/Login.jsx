// src/pages/Login.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StaffLogin from '../Components/StaffLogin';
import UserLogin from '../Components/UserLogin';
import Registration from '../Components/Registration';
import RegistrationForm from '../Components/RegistrationForm';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const {
    signInWithGoogle,
    signInWithPassword,
    user,
    error: authError,
    clearError,
    invitationToken,
  } = useAuth();

  const [currentTab, setCurrentTab] = useState('STAFF');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
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

  const handleGoogleLogin = () => {
    clearError();
    setLocalError('');
    setLoading(true);
    signInWithGoogle().catch((err) => {
      setLocalError(err.message);
      setLoading(false);
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError('');
    setLoading(true);
    try {

      await signInWithPassword(email, password);
      
    } catch (err) {
      setLocalError(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabName) => {
    clearError();
    setLocalError('');
    setCurrentTab(tabName);
    setEmail('');
    setPassword('');
    setLoading(false);
  };

  const getTabClass = (tabName) => {
    const baseClasses =
      'py-4 px-8 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all duration-300 border-b-2';
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
        return (
          <UserLogin
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleLogin={handleLogin}
            loading={loading}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-100 font-sans p-14 mt-28">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-4xl font-semibold text-black mb-8 tracking-wider">
          ACCOUNT
        </h1>
        <div className="flex justify-center mb-12 border-b border-gray-300">
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
        <div className="px-4 py-8" key={currentTab}>
          {renderFormContent()}
        </div>
      </div>
    </div>
  );
};

export default Login;
