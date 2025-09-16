// src/pages/Logout.jsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Logout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      signOut();
    }
  }, [user, signOut]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <h1 className="text-white text-xl">Logging out...</h1>
    </div>
  );
};

export default Logout;
