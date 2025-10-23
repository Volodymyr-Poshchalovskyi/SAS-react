// src/Pages/TableTopStudio.jsx

// ! React & Router Imports
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';

// ! Third-party Libraries
import { motion, AnimatePresence } from 'framer-motion'; // * For animations
import { useInView } from 'react-intersection-observer'; // * For detecting element visibility (currently unused in this version, but kept import)

// ! Local Component Imports
import HlsVideoPlayer from '../Components/HlsVideoPlayer';
import PreloaderBanner from '../Components/PreloaderBanner';
import ScrollProgressBar from '../Components/ScrollProgressBar';

// ! Context & Data Imports
import { useAnimation } from '../context/AnimationContext'; // * Context for managing preloader state
import { tableTopData } from '../Data/TableTopData'; // * Static data for Table Top projects

// ! Constants
const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage'; // * Base URL for media assets

// ! Animation Variants
// * Framer Motion variants for the project name animation on each slide
const nameAnimation = {
  hidden: { opacity: 0, y: 30 }, // * Start transparent and slightly down
  visible: {
    opacity: 1,
    y: 0, // * Fade in and move up
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

// ========================================================================== //
// ! HELPER COMPONENT: TableTopSlide
// ========================================================================== //

/**
 * ? TableTopSlide Component
 * Represents a single full-screen slide for a Table Top Studio project.
 * Displays a background video (HLS), the project name (linking to its detail page),
 * and handles video preloading/playback based on visibility.
 *
 * @param {object} props - Component props.
 * @param {object} props.project - The data object for the project on this slide.
 * @param {boolean} props.isActive - Whether this slide is currently the active one in view.
 * @param {boolean} props.shouldPreload - Whether the video for this slide should be preloaded (adjacent slides).
 * @param {boolean} props.isPreloaderActive - Whether the initial page preloader is still active.
 */
const TableTopSlide = ({ project, isActive, shouldPreload, isPreloaderActive }) => {
  // ! State
  const [videoSrc, setVideoSrc] = useState(''); // * Holds the current HLS video source URL
  const [previewSrc, setPreviewSrc] = useState(''); // * Holds the current preview image source URL

  // ! Data Extraction & URL Construction
  // * Safely access the first video and its preview source from the project data
  const firstVideo = project.videos?.[0];
  const publicVideoUrl = firstVideo?.src ? `${CDN_BASE_URL}/${firstVideo.src}` : '';
  const publicPreviewUrl = firstVideo?.preview_src ? `${CDN_BASE_URL}/${firstVideo.preview_src}` : '';

  // ! Effect: Load/Unload Video Source
  // * Sets video/preview URLs based on whether the slide is active or needs preloading.
  // * Clears sources when inactive to save resources.
  useEffect(() => {
    if (isActive || shouldPreload) {
      setVideoSrc(publicVideoUrl);
      setPreviewSrc(publicPreviewUrl);
    } else {
      setVideoSrc(''); // * Unload video
      setPreviewSrc(''); // * Unload preview
    }
  }, [isActive, shouldPreload, publicVideoUrl, publicPreviewUrl]); // * Dependencies trigger load/unload

  return (
    // * Full-screen container with scroll snap alignment
    <div className="relative w-full h-screen snap-start">
      {/* // * Conditionally render the HLS player only when videoSrc is set */}
      {videoSrc && (
        <HlsVideoPlayer
          src={videoSrc}
          previewSrc={previewSrc}
          shouldPlay={isActive && !isPreloaderActive} // * Play only if active AND preloader is done
          startTime={firstVideo?.startTime || 0} // * Pass start time or default to 0
          isMuted={true} // * Mute background video
          isLooped={true} // * Loop background video
        />
      )}
      {/* // * Overlay for project name link */}
      <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center pointer-events-none">
        <motion.div
          className="flex flex-col items-center gap-4"
          variants={nameAnimation} // * Apply animation
          initial="hidden"
          animate={isActive && !isPreloaderActive ? 'visible' : 'hidden'} // * Animate based on state
        >
          {/* // * Link to the specific Table Top project detail page */}
          <Link
            to={`/table-top-studio/${project.slug}`} // * Use slug for dynamic route
            className="text-white font-chanel font-normal uppercase text-4xl sm:text-6xl md:text-[5rem] tracking-[-0.3rem] md:tracking-[-0.6rem] transition-opacity duration-500 hover:opacity-50 pointer-events-auto text-shadow-md" // * Enable pointer events, add text shadow
            aria-label={`View details for ${project.name}`}
          >
            {project.name}
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

// ========================================================================== //
// ! MAIN COMPONENT: TableTopStudio Page
// ========================================================================== //

/**
 * ? TableTopStudio Page Component
 * Renders a full-page scroll-snapping interface displaying Table Top Studio projects.
 * Includes a preloader banner on first load and a scroll progress indicator.
 */
export default function TableTopStudio() {
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
    // * Cleanup function
    return () => { document.body.style.overflow = ''; };
  }, [isPreloaderActive]);

  // * Effect: Enable scroll snapping and track current slide index via scroll position
  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.add('scroll-snap-enabled'); // * Add class to <html> for CSS scroll snapping

    // * Scroll handler
    const handleScroll = () => {
      if (isPreloaderActive) return; // * Don't track during preloader
      // * Calculate index based on scroll position
      const newIndex = Math.round(window.scrollY / window.innerHeight);
      setCurrentIndex(newIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true }); // * Use passive listener

    // * Cleanup function
    return () => {
      htmlElement.classList.remove('scroll-snap-enabled');
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isPreloaderActive]); // * Re-run if preloader state changes

  // ! Banner Content
  const bannerTitle = 'Beauty. Flavor. Precision in Motion.';
  const bannerDescription =
    'Our in-house studio crafts bold beauty, product, and food visuals with cinematic detail. From the perfect swipe to the slow-motion pour, we transform everyday objects into irresistible icons for commercials, social, and branded content.';

  // ! Render Logic
  return (
    <div className="bg-black"> {/* // * Base background */}

      {/* --- Preloader Banner --- */}
      <AnimatePresence>
        {isPreloaderActive && (
          <PreloaderBanner
            onAnimationComplete={() => setIsPreloaderActive(false)} // * Update context on completion
            title={bannerTitle}
            description={bannerDescription}
          />
        )}
      </AnimatePresence>

      {/* --- Scroll Progress Bar --- */}
      {/* // * Rendered only when preloader is finished */}
      {!isPreloaderActive && (
        <ScrollProgressBar
          currentIndex={currentIndex}
          totalItems={tableTopData.length} // * Use length of tableTopData
        />
      )}

      {/* --- Table Top Project Slides --- */}
      {/* // * Map through the tableTopData and render a slide for each project */}
      {tableTopData.map((project, index) => {
        const isActive = index === currentIndex; // * Determine if this slide is active
        // * Determine if this slide's video should be preloaded (active, next, or previous)
        const shouldPreload = Math.abs(index - currentIndex) <= 1; // * Preload +/- 1 slide

        return (
          <TableTopSlide
            key={project.id} // * Use project's unique ID as key
            project={project}
            isActive={isActive}
            shouldPreload={shouldPreload}
            isPreloaderActive={isPreloaderActive} // * Pass down preloader state
          />
        );
      })}
    </div>
  );
}