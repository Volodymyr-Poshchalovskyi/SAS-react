import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * The main layout for the public-facing pages of the website.
 * It includes a header and a footer. It now uses <Outlet />
 * from react-router-dom to render its child routes.
 */
export default function Layout() {
  const location = useLocation();
  // The Login page is no longer rendered within this layout,
  // so the check for '/login' is removed.
  const shouldHideFooter = location.pathname === '/';

  return (
    <div className="min-h-screen dark:bg-gray-900 text-black dark:text-white flex flex-col">
      <Header />
      {/* The {children} prop is replaced with <Outlet /> to work with nested routes */}
      <main className="flex-grow">
        <Outlet />
      </main>
      
      {!shouldHideFooter && <Footer />}
    </div>
  );
}

