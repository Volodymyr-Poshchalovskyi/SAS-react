// src/Pages/Production.js

// ! React & Router Imports
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';

// ! Third-party Libraries
import { motion, AnimatePresence } from 'framer-motion'; // * For animations
import { useInView } from 'react-intersection-observer'; // * For detecting when elements are in view (used in VideoTitleOverlay)

// ! Local Component Imports
import PreloaderBanner from '../Components/PreloaderBanner';
import HlsVideoPlayer from '../Components/HlsVideoPlayer';
import ScrollProgressBar from '../Components/ScrollProgressBar';

// ! Context & Data Imports
import { useAnimation } from '../context/AnimationContext'; // * Context for managing preloader state
import { productionData } from '../Data/ProductionData'; // * Static data for production projects

// ! Constants
const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage'; // * Base URL for media assets

// ! Animation Variants
// * Framer Motion variants for the title/client overlay animation
const nameAnimation = {
  hidden: { opacity: 0, y: 30 }, // * Start transparent and slightly down
  visible: {
    opacity: 1,
    y: 0, // * Fade in and move up
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

// ========================================================================== //
// ! HELPER COMPONENT: VideoTitleOverlay
// ========================================================================== //

/**
 * ? VideoTitleOverlay Component
 * Displays the title, client name, and a link to the project details,
 * overlaid on top of the background video. Animates into view.
 *
 * @param {object} props - Component props.
 * @param {string} props.title - The title of the production project.
 * @param {string} props.client - The client associated with the project.
 * @param {string} props.projectSlug - The URL slug for linking to the project details page.
 * @param {number} props.index - The index of the current slide (used for initial animation).
 * @param {boolean} props.isPreloaderActive - Whether the initial page preloader is still active.
 */
const VideoTitleOverlay = ({ title, client, projectSlug, index, isPreloaderActive }) => {
  return (
    // * Absolute positioning, covers parent, flex centering, text styling, disabled pointer events
    <div className="absolute inset-0 z-10 flex items-end justify-center text-center p-8 pb-24 text-white pointer-events-none">
      <motion.div
        className="flex flex-col items-center gap-4"
        variants={nameAnimation} // * Apply animation variants
        initial="hidden"
        // * Animate differently for the first item vs. subsequent items triggered by scroll
        animate={index === 0 && !isPreloaderActive ? 'visible' : undefined} // * Animate first item after preloader
        whileInView={index > 0 ? 'visible' : undefined} // * Animate others when they scroll into view
        viewport={{ once: true, amount: 0.5 }} // * Trigger 'whileInView' when 50% visible, only once
      >
        {/* Project Title */}
        <p className="font-chanel text-2xl sm:text-4xl text-shadow">{title}</p>
        {/* Client Name */}
        <p className="font-light text-sm tracking-widest uppercase text-shadow">
          {client}
        </p>
        {/* Link to Project Details */}
        <Link
          to={`/projects/${projectSlug}`} // TODO: Ensure '/projects/:slug' route exists
          className="py-3 px-8 text-xs font-normal bg-white text-black border-2 border-white hover:bg-transparent hover:text-white transition-colors duration-300 pointer-events-auto" // * Re-enable pointer events for the link
          aria-label={`See project details for ${title}`}
        >
          See Project
        </Link>
      </motion.div>
    </div>
  );
};

// ========================================================================== //
// ! MAIN COMPONENT: Production Page
// ========================================================================== //

/**
 * ? Production Page Component
 * Renders a full-page scroll-snapping interface displaying production projects.
 * Each section features a background HLS video. Includes a preloader and scroll progress.
 */
export default function Production() {
  // ! Context & State
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation(); // * Preloader state from context
  const [currentIndex, setCurrentIndex] = useState(0); // * Tracks the index of the currently visible slide

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
    htmlElement.classList.add('scroll-snap-enabled'); // * Add class for CSS scroll snapping

    // * Scroll handler
    const handleScroll = () => {
      if (isPreloaderActive) return; // * Don't track during preloader
      // * Calculate index based on scroll position relative to window height
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
  const bannerTitle = 'Global Production. White Glove Support.';
  const bannerDescription =
    'Celebrity-driven production, luxury brand campaigns, and international shoots are our specialty. We travel megastars in music, film, and fashion, producing high-impact content across the globe. Our teams in Los Angeles, New York, Mexico City, Bangkok, and beyond provide full-service line production, location sourcing, casting, and post.';

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
          totalItems={productionData.length}
        />
      )}

      {/* --- Production Video Sections --- */}
      {/* // * Map through the productionData and render a section for each video */}
      {productionData.map((video, index) => {
        // * Construct public URLs for video and preview
        const publicVideoUrl = video?.src ? `${CDN_BASE_URL}/${video.src}` : '';
        const publicPreviewUrl = video?.preview_src ? `${CDN_BASE_URL}/${video.preview_src}` : '';
        // * Determine if this section is the currently active one
        const isActive = !isPreloaderActive && currentIndex === index;

        return (
          // * Full-screen container with scroll snap alignment
          <div key={video.id} className="relative w-full h-screen snap-start">
            {/* // * Render HLS player if URL is available */}
            {publicVideoUrl && (
              <HlsVideoPlayer
                src={publicVideoUrl}
                previewSrc={publicPreviewUrl}
                shouldPlay={isActive} // * Play only if this section is active
                startTime={video.startTime || 0} // * Pass start time
                isMuted={true}
                isLooped={true}
              />
            )}
            {/* // * Render the title overlay */}
            <VideoTitleOverlay
              title={video.title}
              client={video.client} // * Pass client name
              projectSlug={video.projectSlug}
              index={index}
              isPreloaderActive={isPreloaderActive} // * Pass preloader state for animation timing
            />
          </div>
        );
      })}
    </div>
  );
}