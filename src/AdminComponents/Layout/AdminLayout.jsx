// ✨ ЗМІНИ: 1. Імпортуємо useState, createContext, useContext
import React, { useState, createContext, useContext } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Clapperboard,
  Library,
  BookUser,
  BarChart,
  FileText,
  Users,
  LogOut,
  Tags,
  Sparkles,
  RefreshCw, // ✨ ЗМІНИ: 2. Імпортуємо іконку для оновлення
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// ✨ ЗМІНИ: 3. Створюємо та експортуємо контекст
// Це дозволить дочірнім компонентам (на сторінках) отримати доступ до функції оновлення.
export const DataRefreshContext = createContext(null);

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  // ✨ ЗМІНИ: 4. Створюємо стан для "ключа" оновлення та функцію для його зміни
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey(prevKey => prevKey + 1);


  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isAdminPanel = location.pathname.startsWith('/adminpanel');
  const basePath = isAdminPanel ? '/adminpanel' : '/userpanel';

  const getNavLinkClasses = ({ isActive }) => {
    const baseClasses =
      'w-full flex items-center justify-start px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150';

    if (isActive) {
      return `${baseClasses} bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-50`;
    }
    return `${baseClasses} text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-50`;
  };
    
  // Класи для кнопки оновлення, щоб вона виглядала як інші пункти меню
  const refreshButtonClasses = 'w-full flex items-center justify-start px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-50';

  const navItems = [
    { to: `${basePath}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
    {
      to: `${basePath}/upload-media`,
      label: 'Upload media',
      icon: Clapperboard,
    },
    { to: `${basePath}/library`, label: 'Library', icon: Library },
    {
      to: `${basePath}/management`,
      label: 'Artists / Clients',
      icon: BookUser,
    },
    {
      to: `${basePath}/analytics`,
      label: 'Showreels Analytics',
      icon: BarChart,
    },
  ];

  const adminNavItems = [
    {
      to: '/adminpanel/feature',
      label: 'Feature management',
      icon: Sparkles,
    },
    {
      to: '/adminpanel/metadata-management',
      label: 'Metadata',
      icon: Tags,
    },
    { to: '/adminpanel/applications', label: 'Applications', icon: FileText },
    {
      to: '/adminpanel/user-management',
      label: 'User Management',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* ===== SIDEBAR ===== */}
      <aside className="fixed top-0 left-0 z-40 w-64 h-screen border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        {/* Навігація з можливістю скролу */}
        <div className="flex-1 p-4 overflow-y-auto">
          <nav className="flex flex-col space-y-1">
            {/* ✨ ЗМІНИ: 5. Додаємо кнопку оновлення */}
            <button
                onClick={triggerRefresh}
                className={refreshButtonClasses}
                title="Refresh page data"
            >
                <RefreshCw className="mr-3 h-4 w-4" />
                <span>Refresh Data</span>
            </button>

            {/* Горизонтальна лінія для візуального розділення */}
            <hr className="my-2 border-slate-200 dark:border-slate-800" />
            
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={getNavLinkClasses}
              >
                <item.icon className="mr-3 h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
            {isAdminPanel &&
              adminNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={getNavLinkClasses}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
          </nav>
        </div>

        {/* БЛОК З ІНФОРМАЦІЄЮ ПРО ЮЗЕРА */}
        <div className="p-4">
          <h1 className="text-xl font-bold text-center">
            {isAdminPanel ? 'Admin Panel' : 'User Panel'}
          </h1>
          {user && (
            <p
              className="text-center text-xs text-slate-500 dark:text-slate-400 mt-1 break-all"
              title={user.email}
            >
              {user.email}
            </p>
          )}
        </div>

        {/* Кнопка виходу */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold transition-colors
                       bg-slate-900 text-slate-50 hover:bg-slate-900/90
                       dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      {/* ✨ ЗМІНИ: 6. Обгортаємо main у провайдер контексту */}
      <DataRefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
        <main className="ml-64 flex-1 p-6 lg:p-8">
            <Outlet />
        </main>
      </DataRefreshContext.Provider>
    </div>
  );
}

export default AdminLayout;