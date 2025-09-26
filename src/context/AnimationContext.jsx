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

  const [isPreloaderActive, setIsPreloaderActive] = useState(
    preloaderPages.includes(location.pathname)
  );
  
  // 👇 ДОДАНО НОВИЙ СТАН 👇
  const [isBannerFadingOut, setIsBannerFadingOut] = useState(false);

  useEffect(() => {
    if (preloaderPages.includes(location.pathname)) {
      setIsPreloaderActive(true);
      // Скидаємо стан зникнення при переході на нову сторінку
      setIsBannerFadingOut(false); 
    }
  }, [location.pathname]);

  const value = {
    isPreloaderActive,
    setIsPreloaderActive,
    // 👇 ДОДАНО В КОНТЕКСТ 👇
    isBannerFadingOut,
    setIsBannerFadingOut,
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};