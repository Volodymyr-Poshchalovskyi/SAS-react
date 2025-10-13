// src/components/Header.js

import { useState, forwardRef } from 'react'; // ✨ Імпортуємо forwardRef
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '../../context/AnimationContext';
import sinnersLogoBlack from '../../assets/Logo/Sinners logo black.png';
import sinnersLogoWhite from '../../assets/Logo/Sinners logo white.png';

const navLinks = [
  /* ... ваш масив посилань ... */
  { path: '/directors', label: 'Directors' },
  { path: '/photographers', label: 'Photographers' },
  { path: '/assignment', label: 'On Assignment' },
  { path: '/service', label: 'Service' },
  { path: '/feature', label: 'Feature Film Packaging' },
  { path: '/post-production', label: 'Post Production' },
  { path: '/table-top-studio', label: 'TableTop Studio' },
  { path: '/about', label: 'About' },
];

const fadeAnimation = {
  duration: 0.8,
  ease: 'easeInOut',
};

const headerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: fadeAnimation },
};

const navVariants = {
  hidden: { height: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
  visible: { height: 'auto', transition: { duration: 0.3, ease: 'easeInOut' } },
};

// ✨ КРОК 5: Огортаємо компонент в forwardRef
const Header = forwardRef(function Header(props, ref) {
  const [isHovered, setIsHovered] = useState(false);
  const { isPreloaderActive } = useAnimation();
  const location = useLocation();

  const isSpecialPage =
    location.pathname === '/' ||
    location.pathname.startsWith('/directors/') ||
    location.pathname.startsWith('/assignment/') ||
    location.pathname.startsWith('/photographers/') ||
    location.pathname === '/login' ||
    location.pathname === '/studio' ||
    location.pathname === '/table-top-studio' ||
    location.pathname === '/post-production' ||
    location.pathname === '/privacy-policy' ||
    location.pathname === '/feature' ||
    location.pathname === '/about';

  const shouldHaveBackground = isHovered || isSpecialPage || isPreloaderActive;
  const isNavExpanded = isHovered || isSpecialPage || isPreloaderActive;

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

  return (
    // ✨ КРОК 6: Прив'язуємо отриманий ref до головного елемента
    <motion.header
      ref={ref}
      className="fixed top-0 left-0 w-full z-[1000]"
      style={{
        backgroundColor: shouldHaveBackground
          ? 'rgba(255, 255, 255, 1)'
          : 'rgba(255, 255, 255, 0)',
        transition: 'background-color 0.8s ease-in-out',
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ... решта вашого JSX без змін ... */}
      <div className="w-full relative px-8 flex justify-center items-center h-16">
        <Link to="/" className="flex items-center h-full">
          <img
            src={shouldHaveBackground ? sinnersLogoBlack : sinnersLogoWhite}
            alt="Sinners Logo"
            className="w-32 h-auto "
          />
        </Link>
        <AnimatePresence>
          {shouldHaveBackground && (
            <motion.div
              className="absolute right-8 top-1/2 -translate-y-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
      <div className="absolute left-0 right-0 top-16 h-12" />
      <motion.nav
        className="w-full flex justify-center overflow-hidden"
        variants={navVariants}
        initial="hidden"
        animate={isNavExpanded ? 'visible' : 'hidden'}
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
  );
});

export default Header;