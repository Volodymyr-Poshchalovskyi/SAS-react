// src/Components/Layout/Layout.jsx

import { Outlet, useLocation } from 'react-router-dom';
import React, { useRef, useState, useLayoutEffect } from 'react'; // ✨ Імпортуємо хуки
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  const shouldHideFooter = location.pathname === '/';

  // ✨ КРОК 1: Створюємо ref та стан для висоти хедера
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // ✨ КРОК 2: Вимірюємо висоту хедера після рендеру
  // Використовуємо useLayoutEffect, щоб уникнути "стрибка" контенту
  useLayoutEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [location.pathname]); // Перераховуємо при зміні шляху, бо висота може змінитись

  return (
    <div className="min-h-screen dark:bg-gray-900 text-black dark:text-white flex flex-col">
      {/* ✨ КРОК 3: Передаємо ref в компонент Header */}
      <Header ref={headerRef} />

      <main className="flex-grow">
        {/* ✨ КРОК 4: Передаємо висоту в Outlet, щоб Main.jsx міг її отримати */}
        <Outlet context={{ headerHeight }} />
      </main>

      {!shouldHideFooter && <Footer />}
    </div>
  );
}