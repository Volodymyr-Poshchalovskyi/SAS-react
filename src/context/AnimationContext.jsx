// src/context/AnimationContext.jsx

// ! React & Router Imports
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// * List of paths where the preloader banner should potentially be shown
const preloaderPages = [
  '/directors',
  '/originals', // ? Assuming this path exists or will exist
  '/production', // ? Assuming this path exists or will exist
  '/management', // ? Assuming this path exists or will exist
  '/assignment',
  '/feature',
  '/table-top-studio',
  '/post-production',
  '/photographers',
  '/service',
];

// * Create the context
const AnimationContext = createContext(null);

/**
 * ? useAnimation Hook
 * Custom hook to consume the AnimationContext.
 * Throws an error if used outside of an AnimationProvider.
 * @returns {object} The animation context value.
 */
export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (context === undefined) { // * Context validation
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

/**
 * ? AnimationProvider Component
 * Manages and provides animation-related state across the application,
 * primarily focusing on the preloader banner visibility logic.
 */
export const AnimationProvider = ({ children }) => {
  // ! Hooks
  const location = useLocation(); // * Get current location object

  // ! State
  // * Tracks if the preloader should be active *based on logic* (page type, visited status)
  const [isPreloaderActive, setIsPreloaderActive] = useState(false);
  // * Tracks the separate state of the banner fading out (controlled by PreloaderBanner component)
  const [isBannerFadingOut, setIsBannerFadingOut] = useState(false);
  // * Stores a Set of visited pathnames to show preloader only once per page type
  const [visitedPages, setVisitedPages] = useState(new Set());

  // ! Derived State
  // * Check if the current pathname is one that should show the preloader
  const onPreloaderPage = preloaderPages.includes(location.pathname);

  // ! Effect: Determine Preloader Activation
  // * This effect runs when the location changes. It decides if the preloader *should* be active.
  // * It checks if the current page is a designated preloader page and if it hasn't been visited yet.
  useEffect(() => {
    const hasBeenVisited = visitedPages.has(location.pathname);
    const shouldBeActive = onPreloaderPage && !hasBeenVisited;
    setIsPreloaderActive(shouldBeActive); // * Set the activation state

    // ! Important: visitedPages is deliberately omitted from dependencies.
    // * Including it would cause this effect to re-run immediately after markPreloaderAsShown updates visitedPages,
    // * prematurely setting isPreloaderActive to false before the banner's fade-out timer finishes.
    // * This ensures the banner visibility is controlled by its own fade-out logic triggered later.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, onPreloaderPage]); // * Only re-run when path or page type relevance changes

  // ! Callback: Mark Page as Visited
  /**
   * ? markPreloaderAsShown
   * Adds the current pathname to the set of visited pages.
   * Wrapped in useCallback for stability, although dependencies ensure it updates correctly.
   */
  const markPreloaderAsShown = useCallback(() => {
    // * Update the Set immutably
    setVisitedPages(prevVisitedPages => new Set(prevVisitedPages).add(location.pathname));
  }, [location.pathname]);

  // ! Context Value
  // * Memoize or define the value object passed to the provider
  const value = {
    isPreloaderActive,    // * Whether the preloader logic determines it *should* be shown
    setIsPreloaderActive, // * (Generally not used externally, managed by the effect)
    isBannerFadingOut,    // * State controlled by PreloaderBanner to signal fade-out start
    setIsBannerFadingOut, // * Setter for isBannerFadingOut (used by PreloaderBanner)
    onPreloaderPage,      // * Boolean indicating if current page is designated for preloader
    markPreloaderAsShown, // * Function for PreloaderBanner to call when text animation ends
  };

  // ! Render Provider
  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};