// src/Pages/AuthCallback.jsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthCallback = () => {
  const { user, loading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (error) {
      navigate('/login', { state: { message: error } });
      return;
    }

    if (user) {
      if (user.email.endsWith('@sinnersandsaints.la')) {
        navigate('/adminpanel');
      } else {
        navigate('/userpanel');
      }
      return;
    }

    navigate('/login');
  }, [user, loading, error, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <h1 className="text-white text-xl">Authenticating...</h1>
    </div>
  );
};

export default AuthCallback;
