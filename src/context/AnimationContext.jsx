// src/context/AnimationContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// 1. Список шляхів, на яких має працювати прелоадер
const preloaderPages = ['/directors', '/originals', '/production', '/management', '/assignment', '/feature'];

const AnimationContext = createContext(null);

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within a AnimationProvider');
  }
  return context;
};

export const AnimationProvider = ({ children }) => {
  const location = useLocation();

  // 2. Встановлюємо початковий стан залежно від того, чи є поточний шлях у списку
  const [isPreloaderActive, setIsPreloaderActive] = useState(
    preloaderPages.includes(location.pathname)
  );

  // 3. Слідкуємо за зміною шляху і вмикаємо прелоадер, якщо новий шлях є у списку
  useEffect(() => {
    if (preloaderPages.includes(location.pathname)) {
      setIsPreloaderActive(true);
    }
  }, [location.pathname]);

  const value = {
    isPreloaderActive,
    setIsPreloaderActive,
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};