import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppRouter from './Routes/Router';
import { AnimationProvider } from './context/AnimationContext';

// Цей компонент залишається без змін
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    // -- Прибираємо AuthProvider та Router звідси
    <>
      <ScrollToTop />
      <AnimationProvider>
        <AppRouter />
      </AnimationProvider>
    </>
  );
}