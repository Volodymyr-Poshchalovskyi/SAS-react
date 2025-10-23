// src/Pages/Photographers.jsx

// ! React & Router Imports
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';

// ! Third-party Libraries
import { motion, AnimatePresence } from 'framer-motion'; // * For animations

// ! Local Component Imports
import PreloaderBanner from '../Components/PreloaderBanner';
import ScrollProgressBar from '../Components/ScrollProgressBar';

// ! Context & Data Imports
import { useAnimation } from '../context/AnimationContext'; // * Context for managing preloader state
import { photographersData } from '../Data/PhotographersData'; // * Static data for photographers

// ! Animation Variants
// * Framer Motion variants for the photographer name animation on each slide
const nameAnimation = {
  hidden: { opacity: 0, y: 30 }, // * Start transparent and slightly down
  visible: {
    opacity: 1,
    y: 0, // * Fade in and move up
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

// ========================================================================== //
// ! MAIN COMPONENT: Photographers Page
// ========================================================================== //

/**
 * ? Photographers Page Component
 * Renders a full-page scroll-snapping interface displaying a list of photographers.
 * Each slide features a background image with a subtle zoom effect and the photographer's name linking to their detail page.
 * Includes a preloader banner on first load and a scroll progress indicator.
 */
export default function Photographers() {
  // ! State & Context
  const [currentIndex, setCurrentIndex] = useState(0); // * Tracks the index of the currently visible slide
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation(); // * Get preloader state from context

  // ! Effects

  // * Effect: Scroll to top on component mount
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // * Effect: Disable body scroll when preloader is active
  useEffect(() => {
    document.body.style.overflow = isPreloaderActive ? 'hidden' : '';
    // * Cleanup function to ensure scroll is re-enabled on unmount
    return () => { document.body.style.overflow = ''; };
  }, [isPreloaderActive]);

  // * Effect: Enable scroll snapping and track current slide index via scroll position
  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.add('scroll-snap-enabled'); // * Add class to <html> for CSS scroll snapping

    // * Scroll event handler to update the current slide index
    const handleScroll = () => {
      if (isPreloaderActive) return; // * Don't track index during preloader
      // * Calculate the index based on how many full screen heights have been scrolled
      const newIndex = Math.round(window.scrollY / window.innerHeight);
      setCurrentIndex(newIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true }); // * Use passive listener

    // * Cleanup function: remove class and listener
    return () => {
      htmlElement.classList.remove('scroll-snap-enabled');
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isPreloaderActive]); // * Re-run if preloader state changes

  // ! Banner Content
  const bannerTitle = 'Masters of Light. Architects of Image.';
  const bannerDescription =
    'From iconic portraiture to fashion-driven campaigns, our photographers capture the essence of story through stills that resonate. Whether shooting luxury editorials, celebrity features, or global campaigns, they deliver timeless imagery that elevates every brand narrative.';

  // ! Render Logic
  return (
    <div className="bg-black"> {/* // * Base background color for the page */}

      {/* --- Preloader Banner --- */}
      {/* // * AnimatePresence handles the mount/unmount animation */}
      <AnimatePresence>
        {isPreloaderActive && (
          <PreloaderBanner
            // * Callback function passed to banner to update context when its fade-out completes
            onAnimationComplete={() => setIsPreloaderActive(false)}
            title={bannerTitle}
            description={bannerDescription}
          />
        )}
      </AnimatePresence>

      {/* --- Scroll Progress Bar --- */}
      {/* // * Rendered only when the preloader is finished */}
      {!isPreloaderActive && (
        <ScrollProgressBar
          currentIndex={currentIndex}
          totalItems={photographersData.length}
        />
      )}

      {/* --- Photographer Slides --- */}
      {/* // * Map through the photographersData and render a slide for each */}
      {photographersData.map((photographer, index) => {
        // * Determine if this slide is currently active
        const isActive = index === currentIndex;

        return (
          <div
            key={photographer.id} // * Use photographer's unique ID as the key
            // * Full-screen container with scroll snap, background color, and overflow hidden
            // * `overflow-hidden` is crucial to contain the scaled background image
            className="relative w-full h-screen snap-start bg-black overflow-hidden"
          >
            {/* // * Background Image Container with Scale Transition */}
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-500 ease-in-out"
              style={{
                backgroundImage: `url(${photographer.coverImage})`,
                // * Apply scale transformation: Scale down (zoom in) when active, scale up (normal) when inactive
                transform: isActive && !isPreloaderActive ? 'scale(1)' : 'scale(1.05)',
              }}
              aria-hidden="true" // * Decorative background
            />
            {/* // * Dark Overlay for better text contrast */}
            <div className="absolute inset-0 bg-black opacity-30" />
            {/* // * Photographer Name Overlay */}
            <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center pointer-events-none"> {/* // * Disable pointer events on overlay */}
              <motion.div
                className="flex flex-col items-center gap-4"
                variants={nameAnimation} // * Apply fade-in/move-up animation
                initial="hidden"
                animate={isActive && !isPreloaderActive ? 'visible' : 'hidden'} // * Animate only when active and preloader is done
              >
                {/* // * Link to the specific photographer's detail page */}
                <Link
                  to={`/photographers/${photographer.slug}`}
                  className="text-white font-chanel font-normal uppercase text-4xl sm:text-6xl md:text-[5rem] tracking-[-0.3rem] md:tracking-[-0.6rem] transition-opacity duration-500 hover:opacity-50 pointer-events-auto text-shadow-md" // * Re-enable pointer events for the link, add text shadow
                  aria-label={`View details for ${photographer.name}`}
                >
                  {photographer.name}
                </Link>
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );
}