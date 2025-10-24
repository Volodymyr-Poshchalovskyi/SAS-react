// src/AdminComponents/Layout/AdminLayout.jsx
// ! React & Router
import React, { useState, createContext, useContext, useEffect, useCallback } from 'react'; // <-- ДОДАНО useCallback
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';

// ! Icons (lucide-react)
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
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

// ! Local Imports (Hooks & Context)
import { useAuth } from '../../hooks/useAuth';
import { UploadProvider, useUpload } from '../../context/UploadContext';

// * Context for triggering a manual data refresh across child components
export const DataRefreshContext = createContext(null);

/**
 * ? GlobalUploadStatus (без змін)
 */
const GlobalUploadStatus = () => {
  const { uploadStatus, cancelUpload } = useUpload();

  // * Don't render anything if no upload is active
  if (!uploadStatus.isActive) return null;

  const {
    message,
    error,
    isSuccess,
    totalFiles,
    completedFiles,
    currentFileName,
    currentFileProgress,
  } = uploadStatus;

  // * Derive component state from context
  const isUploading = !isSuccess && !error;
  const isError = !!error;

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-4 transition-all">
      {/* Header: Icon + Status Message */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center">
          {isSuccess ? (
            <CheckCircle2 size={18} className="mr-2 text-teal-500" />
          ) : isError ? (
            <AlertTriangle size={18} className="mr-2 text-red-500" />
          ) : (
            <Loader2 size={18} className="animate-spin mr-2" />
          )}
          {message}
        </h3>
      </div>

      {/* Uploading Warning */}
      {isUploading && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Please do not reload the page.
        </p>
      )}

      {/* Error Message */}
      {isError && (
        <p className="text-sm text-red-600 dark:text-red-500 mb-3 break-words">
          {error}
        </p>
      )}

      {/* Progress Indicators */}
      {isUploading && totalFiles > 0 && (
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 mb-3">
          {/* Overall Progress (only if more than 1 file) */}
          {totalFiles > 1 && (
            <div>
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="font-medium">Overall Progress</span>
                <span className="font-mono">
                  {completedFiles} / {totalFiles} files
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full">
                <div
                  className="h-1.5 rounded-full bg-teal-500"
                  style={{ width: `${(completedFiles / totalFiles) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Current File Progress */}
          {currentFileName && (
            <div>
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="truncate w-4/5 font-medium">
                  {currentFileName}
                </span>
                <span className="font-mono">{currentFileProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full">
                <div
                  className="h-1.5 rounded-full bg-slate-800 dark:bg-slate-200 transition-all duration-300"
                  style={{ width: `${currentFileProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel Button */}
      {isUploading && (
        <button
          onClick={cancelUpload}
          className="w-full mt-2 px-4 py-2 bg-red-100 text-red-700 text-sm font-semibold rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-all"
        >
          Cancel Uploading
        </button>
      )}
    </div>
  );
};

/**
 * ? AdminLayout
 * ...
 */
function AdminLayout() {
  // ! Hooks
  const navigate = useNavigate();
  
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  // * Effect: Перевірка автентифікації та перенаправлення
  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user) {
      console.warn('AdminLayout: Користувач не автентифікований. Перенаправлення...');
      navigate('/', { replace: true }); // Використовуємо replace, щоб історія була чистою
    }
  }, [user, loading, navigate]);


  // * Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Loader2 className="animate-spin h-10 w-10 text-white" />
      </div>
    );
  }
  
  // * Block Render if not authenticated (after loading)
  if (!user) {
    return null; 
  }

  // ! Handlers
  
  // * 1. Робимо triggerRefresh стабільною
  const triggerRefresh = useCallback(() => setRefreshKey((prevKey) => prevKey + 1), []);

  // * 2. Робимо handleLogout стабільною
  const handleLogout = useCallback(async () => {
    console.log('Attempting logout...');
    try {
      await signOut();
      navigate('/login', { replace: true }); // Перенаправляємо на /login або /
    } catch (error) {
      console.error('Error logging out:', error);
      // Навіть якщо signOut дає помилку (наприклад, мережа), перенаправляємо, щоб очистити інтерфейс.
      navigate('/login', { replace: true });
    }
  }, [signOut, navigate]);


  // ! Dynamic Configuration
  // * Check if we are in the admin panel or user panel
  const isAdminPanel = location.pathname.startsWith('/adminpanel');
  const basePath = isAdminPanel ? '/adminpanel' : '/userpanel';

  // * Helper function for NavLink active states
  const getNavLinkClasses = ({ isActive }) => {
    const baseClasses =
      'w-full flex items-center justify-start px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150';

    if (isActive) {
      return `${baseClasses} bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-50`;
    }
    return `${baseClasses} text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-50`;
  };

  const refreshButtonClasses =
    'w-full flex items-center justify-start px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-50';

  // * Navigation items
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

  // * Admin-specific navigation items
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

  // ! Render
  return (
    // * UploadProvider wraps the *entire* layout
    <UploadProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        {/* ===== SIDEBAR ===== */}
        <aside className="fixed top-0 left-0 z-40 w-64 h-screen border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
          {/* --- Scrollable Navigation --- */}
          <div className="flex-1 p-4 overflow-y-auto">
            <nav className="flex flex-col space-y-1">
              <button
                // Викликає стабільну функцію
                onClick={triggerRefresh}
                className={refreshButtonClasses}
                title="Refresh page data"
              >
                <RefreshCw className="mr-3 h-4 w-4" />
                <span>Refresh Data</span>
              </button>

              <hr className="my-2 border-slate-200 dark:border-slate-800" />

              {/* --- Main Nav --- */}
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

              {/* --- Admin-Only Nav --- */}
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

          {/* --- User Info Block --- */}
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

          {/* --- Logout Button --- */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <button
              // Викликає стабільну функцію
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
        <DataRefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
          <main className="ml-64 flex-1 p-6 lg:p-8">
            {/* * Child routes (Dashboard, Library, etc.) are rendered here */}
            <Outlet />
          </main>
        </DataRefreshContext.Provider>

        {/* ===== GLOBAL COMPONENTS ===== */}
        {/* * This component is inside UploadProvider but outside the main content area */}
        <GlobalUploadStatus />
      </div>
    </UploadProvider>
  );
}

export default AdminLayout;