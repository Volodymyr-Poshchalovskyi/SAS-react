// src/AdminComponents/AdminLayout.jsx

import { Outlet, useNavigate } from 'react-router-dom';

function AdminLayout() {
  const navigate = useNavigate();

  // Спрощена функція виходу, що відповідає лише за навігацію
  const handleLogout = () => {
    // У реальному додатку тут також може бути логіка
    // для очищення стану на клієнті (напр., токену з localStorage).
    console.log('Виконується вихід...');
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      {/* Бічна панель (Sidebar) */}
      <aside className="w-64 flex-shrink-0 bg-gray-800 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <nav className="mt-8">
            {/* Тут можна додати посилання для навігації в адмін-панелі, 
              наприклад, використовуючи компонент Link або NavLink з react-router-dom.
              <Link to="/admin/dashboard">Dashboard</Link>
              <Link to="/admin/users">Users</Link>
            */}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
        >
          Logout
        </button>
      </aside>

      {/* Основний контент */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Вміст дочірніх маршрутів буде рендеритися тут */}
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;