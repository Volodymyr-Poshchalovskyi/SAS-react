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

const mobileMenuVariants = {
  hidden: { x: '-100%', transition: { duration: 0.4, ease: 'easeInOut' } },
  visible: { x: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
};

const mobileNavLinksContainerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
};

const mobileNavLinkItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const Header = forwardRef(function Header(props, ref) {
  const [isHovered, setIsHovered] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const { isPreloaderActive } = useAnimation();
  const location = useLocation();
  const lastScrollY = useRef(0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const shouldUseSmartHeader =
    location.pathname.startsWith('/photographers/') ||
    location.pathname.startsWith('/directors/') ||
    location.pathname.startsWith('/assignment/') ||
    location.pathname.startsWith('/post-production/');

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!shouldUseSmartHeader) {
      setIsNavVisible(true);
      return;
    }

    const handleScroll = () => {
      if (isMobileMenuOpen) return;

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
  }, [shouldUseSmartHeader, isMobileMenuOpen]);

  const isSpecialPage =
    location.pathname === '/' ||
    location.pathname.startsWith('/directors/') ||
    location.pathname.startsWith('/table-top-studio/') ||
    location.pathname.startsWith('/assignment/') ||
    location.pathname.startsWith('/photographers/') ||
    location.pathname.startsWith('/post-production/') ||
    location.pathname === '/update-password' ||
    location.pathname === '/login' ||
    location.pathname === '/studio' ||
    location.pathname === '/table-top-studio' ||
    location.pathname === '/privacy-policy' ||
    location.pathname === '/feature' ||
    location.pathname === '/about';

  const shouldHaveBackground =
    isHovered || isSpecialPage || isPreloaderActive || isMobileMenuOpen;
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

  return (
    <>
      <div
        ref={ref}
        className={`fixed top-0 left-0 w-screen z-[1000] overflow-hidden ${
          isSpecialPage ? 'h-auto' : 'h-28'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.header
          className="relative w-full overflow-hidden"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <div
            className="w-full relative px-4 sm:px-8 grid grid-cols-3 items-center h-16 z-20"
            style={{
              backgroundColor: shouldHaveBackground
                ? 'rgba(255, 255, 255, 1)'
                : 'rgba(255, 255, 255, 0)',
              transition: 'background-color 0.4s ease-in-out',
            }}
          >
            <div className="flex justify-start">
              <div className="flex xl:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open navigation menu"
                  className="w-10 h-10 flex items-center justify-center"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    stroke={shouldHaveBackground ? 'black' : 'white'}
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <Link to="/" className="flex items-center h-full">
                <img
                  src={
                    shouldHaveBackground ? sinnersLogoBlack : sinnersLogoWhite
                  }
                  alt="Sinners Logo"
                  className="w-24 sm:w-32 h-auto"
                />
              </Link>
            </div>

            <div className="flex justify-end">
              <Link
                to="/login"
                aria-label="Login"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                  shouldHaveBackground
                    ? 'text-black hover:bg-gray-100'
                    : 'text-white hover:bg-white/20 xl:hidden'
                }`}
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
            </div>
          </div>

          <motion.nav
            className="w-full justify-center relative z-10 bg-white hidden xl:flex"
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
            <div className="flex items-center flex-wrap justify-center gap-8 max-2xl:gap-4 pb-1 pt-2 relative">
              {' '}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onMouseEnter={handleLinkMouseEnter}
                  className="py-2 px-3 text-xs max-2xl:text-[11px] font-semibold uppercase tracking-[0.15em] text-black"
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

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-[1001] flex flex-col overflow-hidden"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="grid grid-cols-3 items-center h-16 px-4 sm:px-8 flex-shrink-0">
              <div className="flex justify-start"></div>
              <div className="flex justify-center">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <img
                    src={sinnersLogoBlack}
                    alt="Sinners Logo"
                    className="w-24 sm:w-32 h-auto"
                  />
                </Link>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="w-10 h-10 flex items-center justify-center"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            
            <motion.nav
              className="flex-grow flex flex-col items-center justify-center text-center"
              variants={mobileNavLinksContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {navLinks.map((link) => {
                // Визначаємо, чи активне посилання.
                // Для головної сторінки ('/') потрібна точна відповідність.
                // Для інших - перевіряємо, чи поточний шлях починається зі шляху посилання.
                const isActive =
                  link.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(link.path);

                return (
                  <motion.div
                    key={link.path}
                    variants={mobileNavLinkItemVariants}
                    className="w-full px-4"
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        block py-3 sm:py-4 text-xl sm:text-2xl font-semibold uppercase tracking-wide sm:tracking-widest 
                        ${isActive ? 'text-gray-400' : 'text-black'}  
                      `}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>
            
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

export default Header;