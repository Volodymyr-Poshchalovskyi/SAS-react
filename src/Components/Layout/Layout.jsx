// src/Components/Layout/Layout.jsx

import { Outlet, useLocation } from 'react-router-dom';
import React, { useRef, useState, useLayoutEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  const shouldHideFooter = location.pathname === '/';
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useLayoutEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [location.pathname]);

  return (
    // ✨ ДОДАЙТЕ КЛАС ДЛЯ ФОНУ СЮДИ, НАПРИКЛАД, bg-white dark:bg-black
    <div className="min-h-full bg-white dark:bg-black text-black dark:text-white flex flex-col">
      <Header ref={headerRef} />
      <main className="flex-grow">
        <Outlet context={{ headerHeight }} />
      </main>
      {!shouldHideFooter && <Footer />}
    </div>
  );
}