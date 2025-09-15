import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Logout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Якщо користувач ще існує в стані, викликаємо signOut
    if (user) {
      signOut();
    }
  }, [user, signOut]);

  useEffect(() => {
    // Цей useEffect спрацює, коли стан user оновиться на null після signOut
    // і перенаправить на сторінку входу.
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Поки йде процес, показуємо екран завантаження
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <h1 className="text-white text-xl">Logging out...</h1>
    </div>
  );
};

export default Logout;