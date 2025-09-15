// src/AdminComponents/Layout/AdminLayout.jsx

import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Clapperboard,
  Library,
  BarChart,
  FileText,
  Users,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth'; // ++ Імпортуємо наш хук

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth(); // ++ Отримуємо функцію signOut з контексту

  // ++ Оновлюємо функцію виходу
  const handleLogout = async () => {
    try {
      await signOut();
      // Після успішного виходу перенаправляємо на головну сторінку
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
    } else {
      return `${baseClasses} text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-50`;
    }
  };

  const navItems = [
    { to: `${basePath}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
    { to: `${basePath}/create-reel`, label: 'Create reel', icon: Clapperboard },
    { to: `${basePath}/library`, label: 'Library', icon: Library },
    { to: `${basePath}/my-analytic`, label: 'My Analytics', icon: BarChart },
  ];

  const adminNavItems = [
    { to: '/adminpanel/applications', label: 'Applications', icon: FileText },
    { to: '/adminpanel/user-management', label: 'User Management', icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* Бічна панель (Sidebar) */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-xl font-bold text-center">
            {isAdminPanel ? 'Admin Panel' : 'User Panel'}
          </h1>
        </div>
        <div className="flex-1 p-4">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end className={getNavLinkClasses}>
                <item.icon className="mr-3 h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
            {isAdminPanel && adminNavItems.map((item) => (
              <NavLink key={item.to} to={item.to} end className={getNavLinkClasses}>
                <item.icon className="mr-3 h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800">
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

      {/* Основний контент */}
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;