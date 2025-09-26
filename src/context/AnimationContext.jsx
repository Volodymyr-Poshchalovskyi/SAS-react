// src/context/AnimationContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const preloaderPages = [
  '/directors',
  '/originals',
  '/production',
  '/management',
  '/assignment',
  '/feature',
  '/table-top-studio',
  '/post-production',
  '/photographers',
];

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
  const onPreloaderPage = preloaderPages.includes(location.pathname);

  const [isPreloaderActive, setIsPreloaderActive] = useState(onPreloaderPage);
  const [isBannerFadingOut, setIsBannerFadingOut] = useState(false);

  useEffect(() => {
    // Ця логіка тепер обробляє ОБИДВА випадки
    if (onPreloaderPage) {
      // Якщо це сторінка з прелоадером - вмикаємо його
      setIsPreloaderActive(true);
      setIsBannerFadingOut(false);
    } else {
      // ✨ ВАЖЛИВА ЗМІНА:
      // Якщо це БУДЬ-ЯКА ІНША сторінка - примусово вимикаємо всі стани прелоадера.
      // Це гарантує, що хедер не зникне.
      setIsPreloaderActive(false);
      setIsBannerFadingOut(false);
    }
    // Спрощуємо залежність, оскільки onPreloaderPage залежить від pathname
  }, [location.pathname]);

  const value = {
    isPreloaderActive,
    setIsPreloaderActive,
    isBannerFadingOut,
    setIsBannerFadingOut,
    onPreloaderPage,
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};