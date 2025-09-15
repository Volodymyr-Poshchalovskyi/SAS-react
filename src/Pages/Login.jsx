import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StaffLogin from '../Components/StaffLogin';
import UserLogin from '../Components/UserLogin';
import Registration from '../Components/Registration';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  // Отримуємо глобальну помилку і функцію очищення з контексту
  const { 
    signInWithGoogle, 
    signInWithPassword, 
    user,
    error: authError, // Перейменовуємо, щоб не було конфлікту
    clearError 
  } = useAuth();
  
  const [currentTab, setCurrentTab] = useState('STAFF');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(''); // Локальна помилка для форм
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Об'єднуємо глобальну і локальну помилку для відображення
  const error = authError || localError;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    if (location.state?.message) {
      setLocalError(location.state.message);
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [location]);

  useEffect(() => {
    if (user) {
      if (user.email.endsWith('@sinnersandsaints.la')) {
        navigate('/adminpanel');
      } else {
        navigate('/userpanel');
      }
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    clearError(); // Очищуємо попередні помилки
    setLocalError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setLocalError(err.message);
      setLoading(false);
    }
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
    clearError(); // Очищуємо помилку при зміні вкладки
    setLocalError('');
    setCurrentTab(tabName);
    setEmail('');
    setPassword('');
    setLoading(false);
  };

  const getTabClass = (tabName) => {
    const baseClasses = "py-4 px-8 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all duration-300 border-b-2";
    return currentTab === tabName
      ? `${baseClasses} text-black border-black`
      : `${baseClasses} text-gray-400 border-transparent hover:text-black`;
  };

  const renderFormContent = () => {
    switch (currentTab) {
      case 'STAFF':
        return <StaffLogin handleGoogleLogin={handleGoogleLogin} loading={loading} error={error} />;
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
      case 'REGISTER':
        return <Registration />;
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
          <div className={getTabClass('STAFF')} onClick={() => handleTabChange('STAFF')}>
            STAFF
          </div>
          <div className={getTabClass('SIGN_IN')} onClick={() => handleTabChange('SIGN_IN')}>
            SIGN IN
          </div>
          <div className={getTabClass('REGISTER')} onClick={() => handleTabChange('REGISTER')}>
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