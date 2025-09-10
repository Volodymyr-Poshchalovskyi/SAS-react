// src/AdminComponents/AdminLayout.jsx

import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient'; // Імпортуємо клієнт Supabase

function AdminLayout() {
  const navigate = useNavigate();

  // Функція для обробки виходу з системи
  const handleLogout = async () => {
    // Виконуємо вихід з Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      // Якщо є помилка, виводимо її в консоль
      console.error('Error during logout:', error.message);
    } else {
      // Якщо вихід успішний, перенаправляємо на головну сторінку
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      {/* Додаємо flex flex-col, щоб розмістити кнопку внизу 
      */}
      <aside className="w-64 flex-shrink-0 bg-gray-800 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <nav className="mt-8">
            {/* Тут будуть посилання адмін-панелі */}
          </nav>
        </div>

        {/* Кнопка виходу */}
        <button
          onClick={handleLogout}
          className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300"
        >
          Logout
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet /> {/* Тут буде рендеритись AdminPanel */}
      </main>
    </div>
  );
}

export default AdminLayout;