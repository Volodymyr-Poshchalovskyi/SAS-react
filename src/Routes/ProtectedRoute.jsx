// src/Routes/ProtectedRoute.jsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAdmin, loading, isLoggingOut } = useAuth(); // <-- Отримуємо новий стан

  // Показуємо завантаження, поки йде початкова перевірка АБО процес виходу
  if (loading || isLoggingOut) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Checkin status...</p>
      </div>
    );
  }

  // Якщо користувач адмін, показуємо контент
  if (isAdmin) {
    return <Outlet />;
  }

  // В іншому випадку — на сторінку логіну
  return <Navigate to="/login" state={{ message: 'Access denied: You are not an admin.' }} />;
};

export default ProtectedRoute;