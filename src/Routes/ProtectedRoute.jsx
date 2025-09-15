import { useAuth } from '../hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <h1>Loading...</h1>; // Або компонент-спіннер
  }

  // 1. Якщо користувача немає, відправляємо на логін
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 2. Визначаємо, чи завершена реєстрація
  const isRegistrationComplete = !!user.user_metadata?.full_name;
  const isAdmin = user.email.endsWith('@sinnersandsaints.la');

  // 3. Якщо користувач - не адмін І його реєстрація НЕ завершена,
  // відправляємо його назад на сторінку логіну для завершення.
  if (!isAdmin && !isRegistrationComplete) {
    return <Navigate to="/login" />;
  }
  
  // 4. Якщо всі перевірки пройдено, показуємо захищений контент
  return <Outlet />;
};

export default ProtectedRoute;