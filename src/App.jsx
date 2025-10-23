// src/App.jsx

// ! React & Router Imports
import React, { useEffect } from 'react'; // * React import for JSX transform
import { useLocation } from 'react-router-dom';

// ! Local Imports (Router & Context Providers & Components)
import AppRouter from './Routes/Router'; // * Main application router configuration
import { AnimationProvider } from './context/AnimationContext'; // * Context for managing preloader/banner animations
import { UploadProvider } from './context/UploadContext'; // * Context for managing global file uploads
import UploadModal from './Components/UploadModal'; // * Global modal to display upload progress

// ========================================================================== //
// ! HELPER COMPONENT: ScrollToTop
// ========================================================================== //

/**
 * ? ScrollToTop Component
 * A utility component that automatically scrolls the window to the top (0, 0)
 * whenever the current route (pathname) changes.
 * It renders null, as its only purpose is the side effect.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation(); // * Get the current URL path

  // * Effect runs whenever the pathname changes
  useEffect(() => {
    window.scrollTo(0, 0); // * Scroll to top-left corner
  }, [pathname]); // * Dependency array ensures effect runs on path change

  return null; // * This component does not render any visible UI
};

// ========================================================================== //
// ! MAIN APPLICATION COMPONENT: App
// ========================================================================== //

/**
 * ? App Component
 * The root component of the application.
 * Sets up global context providers (Upload, Animation) and renders the main router.
 * Includes the `ScrollToTop` utility and the global `UploadModal`.
 */
export default function App() {
  return (
    <>
      {' '}
      {/* // * Use React Fragment to avoid adding extra div to the DOM */}
      {/* // * UploadProvider makes upload status and functions available globally */}
      <UploadProvider>
        {/* // * Ensures page scrolls to top on navigation */}
        <ScrollToTop />

        {/* // * AnimationProvider manages preloader banner state */}
        <AnimationProvider>
          {/* // * Renders the appropriate page based on the current URL */}
          <AppRouter />
        </AnimationProvider>

        {/* // * Global modal listening to UploadContext for progress display */}
        <UploadModal />
      </UploadProvider>
    </>
  );
}
