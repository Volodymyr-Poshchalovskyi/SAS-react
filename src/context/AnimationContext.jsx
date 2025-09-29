import React, { createContext, useContext, useState } from 'react';
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
