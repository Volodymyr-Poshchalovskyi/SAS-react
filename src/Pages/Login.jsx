import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Import newly created components
import StaffLogin from '../Components/StaffLogin';
import UserLogin from '../Components/UserLogin';
import Registration from '../Components/Registration';

const Login = () => {
  const [currentTab, setCurrentTab] = useState('STAFF'); // Changed initial tab to STAFF for logical consistency
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    if (location.state?.message) {
      setError(location.state.message);
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [location]);

  // Simulate Google login
  const handleGoogleLogin = () => {
    setError('');
    setLoading(true);
    setTimeout(() => {
      console.log('Successful login, redirecting to /adminpanel');
      setLoading(false);
      navigate('/adminpanel');
    }, 1500);
  };
  
  // Simulate login with email and password
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (email === 'user@example.com' && password === 'password123') {
        console.log('Successful login, redirecting to /userpanel');
        navigate('/userpanel');
      } else {
        setError('Incorrect email or password.');
      }
      setLoading(false);
    }, 1500);
  };

  const handleTabChange = (tabName) => {
    setCurrentTab(tabName);
    // Reset form-specific states on tab change
    setEmail('');
    setPassword('');
    setError('');
    setLoading(false);
  };

  const getTabClass = (tabName) => {
    const baseClasses = "py-4 px-8 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all duration-300 border-b-2";
    return currentTab === tabName
      ? `${baseClasses} text-black border-black`
      : `${baseClasses} text-gray-400 border-transparent hover:text-black`;
  };

  // The render function is now much simpler
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
        // This component is self-contained and doesn't require props
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
        {/* Using key to make React remount the component on tab change,
            which ensures that the internal state (if any) is reset and triggers the fadeIn animation */}
        <div className="px-4 py-8" key={currentTab}>
            {renderFormContent()}
        </div>
      </div>
    </div>
  );
};

export default Login;