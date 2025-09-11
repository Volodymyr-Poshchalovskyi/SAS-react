// src/App.jsx (оновлена версія)

import { useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import AppRouter from './Routes/Router';
import { AnimationProvider } from './context/AnimationContext';


const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    // Обгортаємо все в AuthProvider
   
      <Router>
        <ScrollToTop />
        <AnimationProvider>
          <AppRouter />
        </AnimationProvider>
      </Router>
  
  );
}