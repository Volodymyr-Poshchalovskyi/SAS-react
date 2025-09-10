import { Outlet } from 'react-router-dom';

/**
 * A layout component specifically for the admin section of the application.
 * It includes a sidebar for navigation and a main content area where
 * nested admin pages will be rendered via the <Outlet /> component.
 */
function AdminLayout() {
    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
            {/* Sidebar for admin navigation */}
            <aside className="w-64 flex-shrink-0 bg-gray-800 p-6">
                <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                <nav className="mt-8">
                    {/* You can add navigation links here later */}
                    {/* Example: <Link to="/admin">Dashboard</Link> */}
                    {/* Example: <Link to="/admin/advanced">Advanced</Link> */}
                </nav>
            </aside>

            {/* Main content area for admin pages */}
            <main className="flex-1 p-8 overflow-auto">
                {/* Child routes (AdminPanel, AdvancedAdminPanel) will be rendered here */}
                <Outlet />
            </main>
        </div>
    );
}

export default AdminLayout;
