// src/Components/Layout/Layout.jsx

import { Outlet, useLocation } from 'react-router-dom';
import React, { useRef, useState, useLayoutEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  const shouldHideFooter = location.pathname === '/';
  const headerRef = useRef(null);
  // Ініціалізуємо висоту як null, щоб чітко розрізняти стан "ще не виміряно"
  const [headerHeight, setHeaderHeight] = useState(null);

  // Замінюємо попередній useLayoutEffect на цей
  useLayoutEffect(() => {
    const headerElement = headerRef.current;
    if (!headerElement) return;

    // Створюємо ResizeObserver для відстеження будь-яких змін висоти хедера
    const resizeObserver = new ResizeObserver(entries => {
      // Зазвичай тут лише один запис, але ми пройдемось по всіх для надійності
      for (let entry of entries) {
        const { height } = entry.contentRect;
        // Оновлюємо стейт, тільки якщо висота дійсно змінилась, щоб уникнути зайвих рендерів
        setHeaderHeight(prevHeight => (prevHeight !== height ? height : prevHeight));
      }
    });

    // Починаємо спостереження за елементом хедера
    resizeObserver.observe(headerElement);

    // Функція очищення: припиняємо спостереження, коли компонент демонтується
    return () => {
      resizeObserver.disconnect();
    };
  }, []); // Пустий масив залежностей означає, що ефект спрацює один раз при монтуванні

  return (
    <div className="min-h-full bg-white text-black flex flex-col">
      <Header ref={headerRef} />
      <main className="flex-grow">
        {/* Передаємо контекст в Outlet. 
          Доки headerHeight === null, дочірні компоненти можуть показувати 
          стан завантаження або використовувати fallback-значення.
        */}
        <Outlet context={{ headerHeight }} />
      </main>
      {!shouldHideFooter && <Footer />}
    </div>
  );
}