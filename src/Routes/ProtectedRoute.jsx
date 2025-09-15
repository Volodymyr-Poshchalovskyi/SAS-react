import { useAuth } from '../hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <h1>Loading...</h1>; // Або компонент-спіннер
  }

  if (!user) {
    // Якщо користувача немає, перенаправляємо на сторінку входу
    return <Navigate to="/login" />;
  }
  
  // Якщо користувач є, показуємо вкладений контент (UserPanel або AdminPanel)
  return <Outlet />;
};

export default ProtectedRoute;