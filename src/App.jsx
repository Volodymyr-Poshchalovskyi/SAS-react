import { useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import AppRouter from './Routes/Router';
import { AnimationProvider } from './context/AnimationContext';

// A component that scrolls the window to the top on route changes.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

/**
 * The root component of the application.
 * It sets up the router and global context providers.
 * The main Layout component has been removed from here and is now
 * controlled by the AppRouter to allow for multiple layouts.
 */
export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AnimationProvider>
        <AppRouter />
      </AnimationProvider>
    </Router>
  );
}
