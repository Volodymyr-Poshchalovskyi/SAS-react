// src/Components/Layout/Layout.jsx

import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();

  const shouldHideFooter = location.pathname === '/';

  return (
    <div className="min-h-screen dark:bg-gray-900 text-black dark:text-white flex flex-col">
      <Header />

      <main className="flex-grow">
        <Outlet />
      </main>

      {!shouldHideFooter && <Footer />}
    </div>
  );
}
