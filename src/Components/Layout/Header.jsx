// src/components/Header.js

import { useState, useEffect, useRef, forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '../../context/AnimationContext';
import sinnersLogoBlack from '../../assets/Logo/Sinners logo black.png';
import sinnersLogoWhite from '../../assets/Logo/Sinners logo white.png';

const navLinks = [
  { path: '/directors', label: 'Directors' },
  { path: '/photographers', label: 'Photographers' },
  { path: '/assignment', label: 'On Assignment' },
  { path: '/service', label: 'Service' },
  { path: '/feature', label: 'Feature Film Packaging' },
  { path: '/post-production', label: 'AI | Post Production' },
  { path: '/table-top-studio', label: 'TableTop Studio' },
  { path: '/about', label: 'About' },
];

const fadeAnimation = {
  duration: 0.4,
  ease: 'easeInOut',
};

const headerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: fadeAnimation },
};

const Header = forwardRef(function Header(props, ref) {
  const [isHovered, setIsHovered] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const { isPreloaderActive } = useAnimation();
  const location = useLocation();
  const lastScrollY = useRef(0);

  const shouldUseSmartHeader =
    location.pathname.startsWith('/photographers/') ||
    location.pathname.startsWith('/directors/') ||
    location.pathname.startsWith('/assignment/') ||
    location.pathname.startsWith('/post-production/');

  useEffect(() => {
    if (!shouldUseSmartHeader) {
      setIsNavVisible(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY - lastScrollY.current;

      if (currentScrollY < 10) {
        setIsNavVisible(true);
      } else if (scrollDirection > 5) {
        setIsNavVisible(false);
      } else if (scrollDirection < -5) {
        setIsNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [shouldUseSmartHeader]);

  const isSpecialPage =
    location.pathname === '/' ||
    location.pathname.startsWith('/directors/') ||
    location.pathname.startsWith('/assignment/') ||
    location.pathname.startsWith('/photographers/') ||
    location.pathname.startsWith('/post-production/') ||
    location.pathname === '/login' ||
    location.pathname === '/studio' ||
    location.pathname === '/table-top-studio' ||
    location.pathname === '/privacy-policy' ||
    location.pathname === '/feature' ||
    location.pathname === '/about';

  const shouldHaveBackground = isHovered || isSpecialPage || isPreloaderActive;
  const isNavExpanded = isHovered || isSpecialPage || isPreloaderActive;

  const shouldUseInstantNav = isHovered && !isSpecialPage;

  const [indicatorStyle, setIndicatorStyle] = useState({
    opacity: 0,
    left: 0,
    width: 0,
  });

  const handleLinkMouseEnter = (e) => {
    const linkElement = e.currentTarget;
    setIndicatorStyle({
      opacity: 1,
      left: linkElement.offsetLeft,
      width: linkElement.offsetWidth,
    });
  };

  const handleNavMouseLeave = () => {
    setIndicatorStyle((prevStyle) => ({ ...prevStyle, opacity: 0 }));
  };
  
  // ✅ КРОК 1: Створюємо обгортку, яка буде контролювати стан наведення.
  // Вона буде мати фіксовану висоту (h-28 ~ 112px), щоб захопити область під хедером.
  // Для "спеціальних" сторінок, де меню завжди видиме, висота буде автоматичною.
  return (
    <div
      ref={ref}
      className={`fixed top-0 left-0 w-full z-[1000] ${
        isSpecialPage ? 'h-auto' : 'h-28' // h-28 дає достатньо місця для маневру курсором
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ✅ КРОК 2: Забираємо з motion.header властивості позиціонування та обробники наведення, 
          оскільки тепер за це відповідає зовнішня обгортка. */}
      <motion.header
        className="relative w-full overflow-hidden" // Замість fixed -> relative
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div
          className="w-full relative px-8 flex justify-center items-center h-16 z-20"
          style={{
            backgroundColor: shouldHaveBackground
              ? 'rgba(255, 255, 255, 1)'
              : 'rgba(255, 255, 255, 0)',
            transition: 'background-color 0.4s ease-in-out',
          }}
        >
          <Link to="/" className="flex items-center h-full">
            <img
              src={shouldHaveBackground ? sinnersLogoBlack : sinnersLogoWhite}
              alt="Sinners Logo"
              className="w-32 h-auto"
            />
          </Link>
          <AnimatePresence>
            {shouldHaveBackground && (
              <motion.div
                className="absolute right-8 top-1/2 -translate-y-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fadeAnimation}
              >
                <Link
                  to="/login"
                  aria-label="Login"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 text-black hover:bg-gray-100"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6"
                  >
                    <circle cx="12" cy="7" r="3" />
                    <path d="M5 20a7 7 0 0 1 14 0" />
                  </svg>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.nav
          className="w-full flex justify-center relative z-10 bg-white"
          initial={{ y: 0, height: 0, opacity: 0 }}
          animate={
            shouldUseSmartHeader
              ? { height: 'auto', y: isNavVisible ? 0 : '-100%', opacity: 1 }
              : isNavExpanded
                ? { height: 'auto', y: 0, opacity: 1 }
                : { height: 0, y: 0, opacity: 0 }
          }
          transition={{
            duration: shouldUseInstantNav ? 0.4 : 0.4,
            ease: 'easeInOut',
          }}
          onMouseLeave={handleNavMouseLeave}
        >
          <div className="flex items-center gap-8 pb-1 pt-2 relative">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onMouseEnter={handleLinkMouseEnter}
                className="py-2 px-3 text-xs font-semibold uppercase tracking-[0.15em] text-black"
              >
                {link.label}
              </Link>
            ))}
            <div
              className="absolute bottom-0 h-[3px] bg-black"
              style={{
                ...indicatorStyle,
                transition:
                  'left 0.2s ease-out, width 0.2s ease-out, opacity 0.2s ease-out',
              }}
            />
          </div>
        </motion.nav>
      </motion.header>
    </div>
  );
});

export default Header;