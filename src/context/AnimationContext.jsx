import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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

  const [isPreloaderActive, setIsPreloaderActive] = useState(false);
  const [isBannerFadingOut, setIsBannerFadingOut] = useState(false);
  const [visitedPages, setVisitedPages] = useState(new Set());

  useEffect(() => {
    const hasBeenVisited = visitedPages.has(location.pathname);
    const shouldBeActive = onPreloaderPage && !hasBeenVisited;
    setIsPreloaderActive(shouldBeActive);
    
    // ✅ КЛЮЧОВА ЗМІНА: Ми прибрали `visitedPages` із масиву залежностей.
    // Це запобігає повторному запуску ефекту, коли ми викликаємо markPreloaderAsShown,
    // і розриває "ланцюгову реакцію", яка миттєво ховала банер.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, onPreloaderPage]);

  const markPreloaderAsShown = useCallback(() => {
    setVisitedPages(prevVisitedPages => new Set(prevVisitedPages).add(location.pathname));
  }, [location.pathname]);

  const value = {
    isPreloaderActive,
    setIsPreloaderActive,
    isBannerFadingOut,
    setIsBannerFadingOut,
    onPreloaderPage,
    markPreloaderAsShown,
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};