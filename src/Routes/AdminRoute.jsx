import { useAuth } from '../hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const { user } = useAuth(); // Тут нам не потрібен loading, бо його вже перевірив ProtectedRoute

  // Перевіряємо, чи email користувача закінчується на потрібний домен
  const isAdmin = user && user.email.endsWith('@sinnersandsaints.la');
  
  if (!isAdmin) {
    // Якщо користувач залогінений, але не є адміном,
    // перенаправляємо його на панель користувача.
    return <Navigate to="/userpanel" />;
  }
  
  // Якщо це адмін, показуємо вкладений контент (AdminPanel)
  return <Outlet />;
};

export default AdminRoute;