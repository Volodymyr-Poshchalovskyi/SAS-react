// src/AdminComponents/AdminLayout.jsx

import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- Імпортуємо наш хук

function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth(); // <-- Отримуємо функцію виходу з контексту

  const handleLogout = async () => {
    const { error } = await logout(); // Викликаємо централізовану функцію
    if (!error) {
      navigate('/'); // Тепер ця команда гарантовано спрацює правильно
    } else {
      console.error('Помилка під час виходу:', error.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      <aside className="w-64 flex-shrink-0 bg-gray-800 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <nav className="mt-8">
            {/* Посилання адмін-панелі */}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300"
        >
          Logout
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;