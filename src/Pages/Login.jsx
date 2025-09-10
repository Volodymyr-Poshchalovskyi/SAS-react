// src/Pages/Login.jsx

import React, { useState, useEffect } from 'react';
// --- ЗМІНА: Імпортуємо хуки для навігації та отримання даних з URL ---
import { useLocation, useNavigate } from 'react-router-dom';
// --- ЗМІНА: Імпортуємо клієнт Supabase ---
import { supabase } from '../lib/supabaseClient';


// Іконка Google (залишається без змін)
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Login = () => {
  const [currentTab, setCurrentTab] = useState('STAFF');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // --- ЗМІНА: Стан для відображення помилок ---
  const [error, setError] = useState('');

  // --- ЗМІНА: Отримуємо дані про поточний маршрут ---
  const location = useLocation();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    // --- ЗМІНА: Перевіряємо, чи є повідомлення про помилку у стані маршруту ---
    if (location.state?.message) {
      setError(location.state.message);
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [location]);

  // --- ЗМІНА: Функція для входу через Google ---
  const handleGoogleLogin = async () => {
    setError(''); // Скидаємо попередні помилки
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Вказуємо, куди повернути користувача після успішного входу
        redirectTo: `${window.location.origin}/adminpanel`,
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  const handleTabChange = (tabName) => {
    setCurrentTab(tabName);
    setEmail('');
    setPassword('');
    setError(''); // Очищуємо помилки при зміні вкладки
  };

  const getTabClass = (tabName) => {
    const baseClasses = "py-4 px-8 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all duration-300 border-b-2";
    if (currentTab === tabName) return `${baseClasses} text-black border-black`;
    return `${baseClasses} text-gray-400 border-transparent hover:text-black`;
  };

  const renderFormContent = () => {
    return (
      <div key={currentTab} className="max-w-sm mx-auto text-center animate-fadeIn">
        {(() => {
          switch (currentTab) {
            case 'SIGN_IN':
              // ... (код для SIGN_IN залишається без змін)
              return <p>Sign in form</p>;
            case 'REGISTER':
              // ... (код для REGISTER залишається без змін)
              return <p>Register info</p>;
            case 'STAFF':
              return (
                <>
                  <div className="mb-10">
                    <h2 className="text-xl font-semibold text-black mb-2 tracking-wider uppercase">WELCOME BACK.</h2>
                    <p className="text-xs text-gray-500 tracking-wider uppercase leading-relaxed">
                      PLEASE SIGN IN USING <br /> YOUR COMPANY EMAIL
                    </p>
                  </div>
                  {/* --- ЗМІНА: Відображаємо помилку, якщо вона є --- */}
                  {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                  <button
                    onClick={handleGoogleLogin} // --- ЗМІНА: Додаємо обробник кліку ---
                    type="button"
                    className="w-full py-3 mt-4 bg-white text-gray-700 font-semibold text-sm border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <GoogleIcon />
                    Sign in with Google
                  </button>
                </>
              );
            default:
              return null;
          }
        })()}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex justify-center bg-gray-100 font-sans p-14 mt-28">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-4xl font-semibold text-black mb-8 tracking-wider">ACCOUNT</h1>
        <div className="flex justify-center mb-12 border-b border-gray-300">
          <div className={getTabClass('STAFF')} onClick={() => handleTabChange('STAFF')}>STAFF</div>
          <div className={getTabClass('SIGN_IN')} onClick={() => handleTabChange('SIGN_IN')}>SIGN IN</div>
          <div className={getTabClass('REGISTER')} onClick={() => handleTabChange('REGISTER')}>REGISTER</div>
        </div>
        <div className="px-4 py-8">
          {renderFormContent()}
        </div>
      </div>
    </div>
  );
};

export default Login;