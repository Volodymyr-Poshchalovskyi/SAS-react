// src/App.jsx

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppRouter from './Routes/Router';
import { AnimationProvider } from './context/AnimationContext';
import { UploadProvider } from './context/UploadContext';
import UploadModal from './Components/UploadModal';


/**
 * ScrollToTop
 * Ensures that the page scrolls to the top whenever the route changes.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

/**
 * App
 * Main application component that wraps:
 * - Scroll-to-top behavior
 * - Animation context provider
 * - Application router
 */
export default function App() {
  return (
    <>
    <UploadProvider>
      {/* Scrolls page to top on route change */}
      <ScrollToTop />

      {/* Wraps app with animation context */}
      <AnimationProvider>
        {/* Application routes */}
        <AppRouter />
      </AnimationProvider>
      <UploadModal/>
      </UploadProvider>
    </>
  );
}
