// src/Pages/Assignment.jsx

// ! React & Router Imports
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';

// ! Third-party Libraries
import { motion, AnimatePresence } from 'framer-motion'; // * For animations
import { useInView } from 'react-intersection-observer'; // * For detecting when elements are in view

// ! Local Component Imports
import HlsVideoPlayer from '../Components/HlsVideoPlayer';
import PreloaderBanner from '../Components/PreloaderBanner';
import ScrollProgressBar from '../Components/ScrollProgressBar';

// ! Context & Data Imports
import { useAnimation } from '../context/AnimationContext'; // * Context for managing preloader state
import { assignmentData } from '../Data/AssignmentData'; // * Data for assignment creators

// ! Constants
const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage'; // * Base URL for media assets

// ! Animation Variants
// * Framer Motion variants for the name animation on each slide
const nameAnimation = {
  hidden: { opacity: 0, y: 30 }, // * Start transparent and slightly down
  visible: {
    opacity: 1,
    y: 0, // * Fade in and move up
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

// ========================================================================== //
// ! HELPER COMPONENT: AssignmentSlide
// ========================================================================== //

/**
 * ? AssignmentSlide
 * Represents a single full-screen slide for an assignment creator.
 * Displays a background video (HLS), the creator's name (linking to their detail page),
 * and handles video preloading/playback based on visibility.
 *
 * @param {object} props - Component props.
 * @param {object} props.director - The data object for the creator on this slide.
 * @param {boolean} props.isActive - Whether this slide is currently the active one in view.
 * @param {boolean} props.shouldPreload - Whether the video for this slide should be preloaded (usually for adjacent slides).
 * @param {boolean} props.isPreloaderActive - Whether the initial page preloader is still active.
 */
const AssignmentSlide = ({
  director,
  isActive,
  shouldPreload,
  isPreloaderActive,
}) => {
  // ! State
  // * State to hold the video source URL (set when active or preloading)
  const [videoSrc, setVideoSrc] = useState('');
  // * State to hold the preview image source URL
  const [previewSrc, setPreviewSrc] = useState('');

  // ! Data Extraction & URL Construction
  // * Get the first video and its preview source from the director's data
  const firstVideo = director.videos[0]; // * Assumes each assignment entry has at least one video
  const publicVideoUrl = firstVideo?.src
    ? `${CDN_BASE_URL}/${firstVideo.src}`
    : '';
  const publicPreviewUrl = firstVideo?.preview_src
    ? `${CDN_BASE_URL}/${firstVideo.preview_src}`
    : '';

  // ! Effect: Set Video/Preview Source based on Activity/Preload
  // * Loads the video and preview URLs only when the slide is active or the next/previous one.
  useEffect(() => {
    if (isActive || shouldPreload) {
      setVideoSrc(publicVideoUrl);
      setPreviewSrc(publicPreviewUrl);
    } else {
      // * Clear sources when slide is not active/preloading to save resources
      setVideoSrc('');
      setPreviewSrc('');
    }
    // * Dependencies ensure effect runs when slide activation, preload status, or URLs change
  }, [isActive, shouldPreload, publicVideoUrl, publicPreviewUrl]);

  return (
    // * Full-screen container with scroll snap alignment
    <div className="relative w-full h-screen snap-start">
      {/* // * Conditionally render the HLS player only when videoSrc is set */}
      {videoSrc && (
        <HlsVideoPlayer
          src={videoSrc}
          previewSrc={previewSrc} // * Pass preview image URL
          shouldPlay={isActive && !isPreloaderActive} // * Play only when active and preloader is done
          startTime={firstVideo?.startTime || 0} // * Pass start time if available
          isMuted={true} // * Background videos are typically muted
          isLooped={true} // * Loop the background video
        />
      )}
      {/* // * Overlay for creator name and link */}
      <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          variants={nameAnimation} // * Apply animation variants
          initial="hidden"
          animate={isActive && !isPreloaderActive ? 'visible' : 'hidden'} // * Animate only when active and preloader done
        >
          {/* // * Link to the creator's detail page */}
          <Link
            to={`/assignment/${director.slug}`}
            className="text-white font-chanel font-normal uppercase text-4xl sm:text-6xl md:text-[5rem] tracking-[-0.3rem] md:tracking-[-0.6rem] transition-opacity duration-500 hover:opacity-50 text-shadow-md" // * Added text shadow
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
// ! MAIN COMPONENT: Assignment
// ========================================================================== //

/**
 * ? Assignment Page Component
 * Renders a full-page scroll-snapping interface displaying assignment creators.
 * Includes a preloader banner on first load and a scroll progress indicator.
 */
export default function Assignment() {
  // ! State & Context
  const [currentIndex, setCurrentIndex] = useState(0); // * Tracks the index of the currently visible slide
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation(); // * Get preloader state from context

  // ! Effects

  // * Effect: Scroll to top on mount
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // * Effect: Disable body scroll when preloader is active
  useEffect(() => {
    document.body.style.overflow = isPreloaderActive ? 'hidden' : '';
    // * Cleanup: ensure scroll is re-enabled on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPreloaderActive]);

  // * Effect: Enable scroll snapping and track current slide index
  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.add('scroll-snap-enabled'); // * Add class to enable CSS scroll snapping

    // * Scroll handler to determine the current slide index based on scroll position
    const handleScroll = () => {
      if (isPreloaderActive) return; // * Don't track scroll during preloader
      // * Calculate index based on how many full screen heights have been scrolled
      const newIndex = Math.round(window.scrollY / window.innerHeight);
      setCurrentIndex(newIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true }); // * Use passive listener for performance

    // * Cleanup function: remove class and listener
    return () => {
      htmlElement.classList.remove('scroll-snap-enabled');
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isPreloaderActive]); // * Re-run if preloader state changes

  // ! Banner Content
  const bannerTitle = 'ELITE TALENT. LIMITED AVAILABILITY.';
  const bannerDescription =
    'Our On Assignment division represents top-tier talent available exclusively for select projects. These creators bring a unique vision and expertise, adding unparalleled value to any production.';

  // ! Render Logic
  return (
    <div className="bg-black">
      {' '}
      {/* // * Base background for the page */}
      {/* --- Preloader Banner --- */}
      {/* // * AnimatePresence handles the mounting/unmounting animation */}
      <AnimatePresence>
        {isPreloaderActive && (
          <PreloaderBanner
            // * Callback to update context when banner fade-out completes
            onAnimationComplete={() => setIsPreloaderActive(false)}
            title={bannerTitle}
            description={bannerDescription}
          />
        )}
      </AnimatePresence>
      {/* --- Scroll Progress Bar --- */}
      {/* // * Rendered only when the preloader is not active */}
      {!isPreloaderActive && (
        <ScrollProgressBar
          currentIndex={currentIndex}
          totalItems={assignmentData.length}
        />
      )}
      {/* --- Assignment Slides --- */}
      {/* // * Map through the data and render a slide for each creator */}
      {assignmentData.map((director, index) => {
        const isActive = index === currentIndex; // * Is this the currently viewed slide?
        // * Should this slide preload its video? (True if it's the next or previous slide)
        const shouldPreload = Math.abs(index - currentIndex) <= 1; // * Preload current, next, and previous

        return (
          <AssignmentSlide
            key={director.id} // * Use a unique ID from data if available
            director={director}
            isActive={isActive}
            shouldPreload={shouldPreload}
            isPreloaderActive={isPreloaderActive} // * Pass preloader state down
          />
        );
      })}
    </div>
  );
}
