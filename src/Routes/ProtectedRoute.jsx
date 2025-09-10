// src/Routes/ProtectedRoute.jsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAdmin, loading } = useAuth();

  // 1. Поки йде перевірка, показуємо екран завантаження
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cheking status...</p>
      </div>
    );
  }


  // 2. Якщо перевірка завершилась і користувач - адмін, показуємо контент
  if (isAdmin) {
    return <Outlet />; // Outlet рендерить дочірні маршрути (AdminLayout і AdminPanel)
  }

  // 3. Якщо перевірка завершилась і користувач - не адмін, перенаправляємо
  return <Navigate to="/login" state={{ message: 'Access denied: You are not an admin.' }} />;
};

export default ProtectedRoute;