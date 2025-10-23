// src/Pages/Directors.jsx

// ! React & Router Imports
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';

// ! Third-party Libraries
import { motion, AnimatePresence } from 'framer-motion'; // * For animations
import { useInView } from 'react-intersection-observer'; // * (Currently unused but kept import)

// ! Local Component Imports
import HlsVideoPlayer from '../Components/HlsVideoPlayer';
import PreloaderBanner from '../Components/PreloaderBanner';
import ScrollProgressBar from '../Components/ScrollProgressBar';

// ! Context & Data Imports
import { useAnimation } from '../context/AnimationContext'; // * Context for managing preloader state
import { directorsData } from '../Data/DirectorsData'; // * Static data for directors

// ! Constants
const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage'; // * Base URL for media assets

// ! Animation Variants
// * Framer Motion variants for the director name animation on each slide
const nameAnimation = {
  hidden: { opacity: 0, y: 30 }, // * Start transparent and slightly down
  visible: {
    opacity: 1,
    y: 0, // * Fade in and move up
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

// ========================================================================== //
// ! HELPER COMPONENT: DirectorSlide
// ========================================================================== //

/**
 * ? DirectorSlide
 * Represents a single full-screen slide for a director.
 * Displays a background video (HLS), the director's name (linking to their detail page),
 * and handles video preloading/playback based on visibility.
 *
 * @param {object} props - Component props.
 * @param {object} props.director - The data object for the director on this slide.
 * @param {boolean} props.isActive - Whether this slide is currently the active one in view.
 * @param {boolean} props.shouldPreload - Whether the video for this slide should be preloaded (usually for adjacent slides).
 * @param {boolean} props.isPreloaderActive - Whether the initial page preloader is still active.
 */
const DirectorSlide = ({
  director,
  isActive,
  shouldPreload,
  isPreloaderActive,
}) => {
  // ! State
  const [videoSrc, setVideoSrc] = useState(''); // * Holds the current HLS video source URL
  const [previewSrc, setPreviewSrc] = useState(''); // * Holds the current preview image source URL

  // ! Data Extraction & URL Construction
  // * Get the first video and its preview source from the director's data array
  const firstVideo = director.videos?.[0]; // * Safely access the first video
  const publicVideoUrl = firstVideo?.src
    ? `${CDN_BASE_URL}/${firstVideo.src}`
    : '';
  const publicPreviewUrl = firstVideo?.preview_src
    ? `${CDN_BASE_URL}/${firstVideo.preview_src}`
    : '';

  // ! Effect: Load/Unload Video Source
  // * Sets the video and preview source URLs only when the slide is active or needs preloading.
  // * Clears the sources when the slide is inactive to conserve resources.
  useEffect(() => {
    if (isActive || shouldPreload) {
      setVideoSrc(publicVideoUrl);
      setPreviewSrc(publicPreviewUrl);
    } else {
      setVideoSrc(''); // * Unload video source
      setPreviewSrc(''); // * Unload preview source
    }
  }, [isActive, shouldPreload, publicVideoUrl, publicPreviewUrl]); // * Dependencies trigger loading/unloading

  return (
    // * Full-screen container with scroll snap alignment
    <div className="relative w-full h-screen snap-start">
      {/* // * Conditionally render the video player only if a source is set */}
      {videoSrc && (
        <HlsVideoPlayer
          src={videoSrc}
          previewSrc={previewSrc}
          shouldPlay={isActive && !isPreloaderActive} // * Play only if slide is active AND preloader is finished
          startTime={firstVideo?.startTime || 0} // * Pass start time if specified in data
          isMuted={true} // * Background videos should be muted
          isLooped={true} // * Loop the video
        />
      )}
      {/* // * Overlay for director name link */}
      <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center pointer-events-none">
        {' '}
        {/* // * Disable pointer events on overlay */}
        <motion.div
          className="flex flex-col items-center gap-4"
          variants={nameAnimation} // * Apply fade-in/move-up animation
          initial="hidden"
          animate={isActive && !isPreloaderActive ? 'visible' : 'hidden'} // * Animate only when active and preloader is done
        >
          {/* // * Link to the specific director's detail page */}
          <Link
            to={`/directors/${director.slug}`}
            className="text-white font-chanel font-normal uppercase text-4xl sm:text-6xl md:text-[5rem] tracking-[-0.3rem] md:tracking-[-0.6rem] transition-opacity duration-500 hover:opacity-50 pointer-events-auto text-shadow-md" // * Re-enable pointer events for the link, add text shadow
            aria-label={`View details for ${director.name}`}
          >
            {director.name}
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

// ========================================================================== //
// ! MAIN COMPONENT: Directors Page
// ========================================================================== //

/**
 * ? Directors Page Component
 * Renders a full-page scroll-snapping interface displaying a list of directors.
 * Includes a preloader banner on first load and a scroll progress indicator.
 */
export default function Directors() {
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
    return () => {
      document.body.style.overflow = '';
    };
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
  }, [isPreloaderActive]); // * Re-run if preloader state changes (to attach/detach listener)

  // ! Banner Content
  const bannerTitle =
    'VISIONARY STORYTELLERS. COMMERCIAL REBELS. GLOBAL CREATORS.';
  const bannerDescription =
    'From award-winning filmmakers to fashion-forward image makers, our directors and hybrid talent deliver world-class content across commercials, music videos, branded series, and global campaigns.';

  // ! Render Logic
  return (
    <div className="bg-black">
      {' '}
      {/* // * Set base background color */}
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
          totalItems={directorsData.length}
        />
      )}
      {/* --- Director Slides --- */}
      {/* // * Map through the directorsData and render a slide for each */}
      {directorsData.map((director, index) => {
        const isActive = index === currentIndex; // * Determine if this slide is currently active
        // * Determine if this slide's video should be preloaded (active, next, or previous slide)
        const shouldPreload = Math.abs(index - currentIndex) <= 1; // * Preload +/- 1 slide

        return (
          <DirectorSlide
            key={director.id} // * Use director's unique ID as the key
            director={director}
            isActive={isActive}
            shouldPreload={shouldPreload}
            isPreloaderActive={isPreloaderActive} // * Pass down preloader state for conditional logic
          />
        );
      })}
    </div>
  );
}
