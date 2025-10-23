// src/Components/Layout/Header.jsx

// ! React & Router Imports
import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

// ! Third-party Library Imports
import { motion, AnimatePresence } from 'framer-motion';

// ! Context Imports
import { useAnimation } from '../../context/AnimationContext';

// ! Local Asset Imports
import sinnersLogoBlack from '../../assets/Logo/Sinners logo black.png';
import sinnersLogoWhite from '../../assets/Logo/Sinners logo white.png';

// ========================================================================== //
// ! CONSTANTS & CONFIGURATION
// ========================================================================== //

// * Navigation links data
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

// * Animation configurations for Framer Motion
const fadeAnimation = { duration: 0.4, ease: 'easeInOut' };

const headerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: fadeAnimation },
};

const mobileMenuVariants = {
  hidden: { x: '-100%', transition: { duration: 0.4, ease: 'easeInOut' } },
  visible: { x: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
};

const mobileNavLinksContainerVariants = {
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
};

const mobileNavLinkItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

// ========================================================================== //
// ! HEADER COMPONENT DEFINITION
// ========================================================================== //

/**
 * ? Header Component
 * Renders the site header, including logo, navigation (desktop and mobile),
 * and login link. Handles dynamic background/text colors and smart visibility
 * based on scroll and page location. Uses `forwardRef` to allow parent components
 * to get a ref to the underlying div.
 */
const Header = forwardRef(function Header(props, ref) {
  // ! State Variables
  const [isHovered, setIsHovered] = useState(false); // * Tracks if mouse is over the header area
  const [isNavVisible, setIsNavVisible] = useState(true); // * Controls visibility of desktop nav on scroll
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // * Tracks mobile menu open/closed state
  const [indicatorStyle, setIndicatorStyle] = useState({
    opacity: 0,
    left: 0,
    width: 0,
  }); // * Style for desktop nav underline indicator

  // ! Hooks
  const { isPreloaderActive } = useAnimation(); // * Context to check if preloader animation is running
  const location = useLocation(); // * Gets the current URL path
  const lastScrollY = useRef(0); // * Stores the last scroll position for direction detection

  // ! Derived State & Logic
  // * Determine if the smart header (hide on scroll down, show on scroll up) should be active
  const shouldUseSmartHeader =
    location.pathname.startsWith('/photographers/') ||
    location.pathname.startsWith('/directors/') ||
    location.pathname.startsWith('/assignment/') ||
    location.pathname.startsWith('/post-production/');

  // * Determine if the current page requires specific header styling (e.g., always white background)
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

  // * Logic to determine header background state
  const shouldHaveBackground =
    isHovered || isSpecialPage || isPreloaderActive || isMobileMenuOpen;
  // * Logic to determine if desktop nav should be expanded (vs. hidden/collapsed)
  const isNavExpanded = isHovered || isSpecialPage || isPreloaderActive;
  // * Use faster transition when hovering reveals nav on non-special pages
  const shouldUseInstantNav = isHovered && !isSpecialPage;

  // ! Effects

  // * Effect: Lock/unlock body scroll when mobile menu opens/closes
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';
    // * Cleanup function to ensure scroll is re-enabled on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  // * Effect: Implement the "smart header" scroll behavior
  useEffect(() => {
    // * Disable smart header if not applicable to the current page
    if (!shouldUseSmartHeader) {
      setIsNavVisible(true); // * Ensure nav is always visible
      return;
    }

    const handleScroll = () => {
      if (isMobileMenuOpen) return; // * Don't hide header if mobile menu is open

      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY - lastScrollY.current;

      if (currentScrollY < 10) {
        // * Always show at the top
        setIsNavVisible(true);
      } else if (scrollDirection > 5) {
        // * Hide when scrolling down significantly
        setIsNavVisible(false);
      } else if (scrollDirection < -5) {
        // * Show when scrolling up significantly
        setIsNavVisible(true);
      }
      lastScrollY.current = currentScrollY; // * Update last scroll position
    };

    window.addEventListener('scroll', handleScroll, { passive: true }); // * Use passive listener for performance

    // * Cleanup scroll listener on unmount or when dependencies change
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [shouldUseSmartHeader, isMobileMenuOpen]); // * Re-run if page type or mobile menu state changes

  // ! Event Handlers

  // * Update the underline indicator position on mouse enter
  const handleLinkMouseEnter = (e) => {
    const linkElement = e.currentTarget;
    setIndicatorStyle({
      opacity: 1,
      left: linkElement.offsetLeft,
      width: linkElement.offsetWidth,
    });
  };

  // * Hide the underline indicator on mouse leave from the nav area
  const handleNavMouseLeave = () => {
    setIndicatorStyle((prevStyle) => ({ ...prevStyle, opacity: 0 }));
  };

  // ! Render Logic
  return (
    <>
      {/* --- Main Header Container --- */}
      {/* // * Fixed positioning, high z-index. Height adjusts for special pages. */}
      <div
        ref={ref} // * Forwarded ref
        className={`fixed top-0 left-0 w-screen z-[1000] overflow-hidden ${
          isSpecialPage ? 'h-auto' : 'h-28' // * Allows nav to expand below initial 16 height units
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
          {/* --- Top Bar (Logo, Burger, Login) --- */}
          <div
            className="w-full relative px-4 sm:px-8 grid grid-cols-3 items-center h-16 z-20"
            // * Dynamic background color with smooth transition
            style={{
              backgroundColor: shouldHaveBackground
                ? 'rgba(255, 255, 255, 1)' // * White
                : 'rgba(255, 255, 255, 0)', // * Transparent
              transition: 'background-color 0.4s ease-in-out',
            }}
          >
            {/* Left: Mobile Burger Menu */}
            <div className="flex justify-start">
              <div className="flex xl:hidden">
                {' '}
                {/* // * Hidden on XL screens and up */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open navigation menu"
                  className="w-10 h-10 flex items-center justify-center"
                >
                  {/* // * Burger icon, stroke color changes with background */}
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

            {/* Center: Logo */}
            <div className="flex justify-center">
              <Link
                to="/"
                className="flex items-center h-full"
                aria-label="Go to homepage"
              >
                <img
                  src={
                    shouldHaveBackground ? sinnersLogoBlack : sinnersLogoWhite
                  }
                  alt="Sinners Logo"
                  className="w-24 sm:w-32 h-auto" // * Responsive logo size
                />
              </Link>
            </div>

            {/* Right: Login Icon */}
            <div className="flex justify-end">
              <Link
                to="/login"
                aria-label="Login"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                  shouldHaveBackground
                    ? 'text-black hover:bg-gray-100' // * Style for white background
                    : 'text-white hover:bg-white/20 xl:hidden' // * Style for transparent background (hidden on desktop nav visible)
                }`}
              >
                {/* // * User icon */}
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

          {/* --- Desktop Navigation --- */}
          {/* // * Hidden below XL breakpoint */}
          <motion.nav
            className="w-full justify-center relative z-10 bg-white hidden xl:flex"
            // * Animate height, y-position, and opacity based on state
            initial={{ y: 0, height: 0, opacity: 0 }}
            animate={
              shouldUseSmartHeader
                ? { height: 'auto', y: isNavVisible ? 0 : '-100%', opacity: 1 } // * Smart header animation
                : isNavExpanded
                  ? { height: 'auto', y: 0, opacity: 1 } // * Normal expand animation
                  : { height: 0, y: 0, opacity: 0 } // * Collapsed state
            }
            transition={{
              duration: shouldUseInstantNav ? 0.4 : 0.4, // * Slightly faster if revealed by hover
              ease: 'easeInOut',
            }}
            onMouseLeave={handleNavMouseLeave} // * Hide indicator when leaving nav
          >
            <div className="flex items-center flex-wrap justify-center gap-8 max-2xl:gap-4 pb-1 pt-2 relative">
              {/* // * Map through navLinks array */}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onMouseEnter={handleLinkMouseEnter} // * Show indicator on hover
                  className="py-2 px-3 text-xs max-2xl:text-[11px] font-semibold uppercase tracking-[0.15em] text-black"
                >
                  {link.label}
                </Link>
              ))}
              {/* Underline Indicator */}
              <div
                className="absolute bottom-0 h-[3px] bg-black"
                style={{
                  ...indicatorStyle,
                  transition:
                    'left 0.2s ease-out, width 0.2s ease-out, opacity 0.2s ease-out', // * Smooth indicator transition
                }}
              />
            </div>
          </motion.nav>
        </motion.header>
      </div>

      {/* --- Mobile Menu Overlay --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-[1001] flex flex-col overflow-hidden"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden" // * Animate out
          >
            {/* Mobile Menu Header (Logo, Close Button) */}
            <div className="grid grid-cols-3 items-center h-16 px-4 sm:px-8 flex-shrink-0">
              <div className="flex justify-start"></div> {/* // * Spacer */}
              <div className="flex justify-center">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Go to homepage"
                >
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
                  {/* // * Close (X) icon */}
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

            {/* Mobile Menu Navigation Links */}
            <motion.nav
              className="flex-grow flex flex-col items-center justify-center text-center"
              variants={mobileNavLinksContainerVariants}
              initial="hidden"
              animate="visible" // * Trigger stagger animation
            >
              {navLinks.map((link) => {
                // * Determine if the link is active based on the current path
                const isActive =
                  link.path === '/'
                    ? location.pathname === '/' // * Exact match for home
                    : location.pathname.startsWith(link.path); // * StartsWith for others

                return (
                  <motion.div
                    key={link.path}
                    variants={mobileNavLinkItemVariants} // * Individual link animation
                    className="w-full px-4"
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)} // * Close menu on link click
                      className={`
                        block py-3 sm:py-4 text-xl sm:text-2xl font-semibold uppercase tracking-wide sm:tracking-widest
                        ${isActive ? 'text-gray-400' : 'text-black'} // * Style active link differently
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
