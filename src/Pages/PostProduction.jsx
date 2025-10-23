// src/Pages/PostProduction.jsx

// ! React & Router Imports
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

// ! Third-party Libraries
import { motion, AnimatePresence } from 'framer-motion'; // * For animations
import { useInView } from 'react-intersection-observer'; // * For detecting when elements are in view

// ! Local Component Imports
import HlsVideoPlayer from '../Components/HlsVideoPlayer';
import PreloaderBanner from '../Components/PreloaderBanner';

// ! Context & Data Imports
import { useAnimation } from '../context/AnimationContext'; // * Context for managing preloader state
import { postProductionData } from '../Data/PostProductionData'; // * Static data for post-production entries

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
// ! HELPER COMPONENT: ProductionBlock
// ========================================================================== //

/**
 * ? ProductionBlock
 * Represents a single full-screen section for a post-production entry.
 * Displays a background video (HLS) and the entry's name (linking to a detail page).
 * Uses Intersection Observer to play the video only when in view.
 *
 * @param {object} props - Component props.
 * @param {object} props.director - The data object for the post-production entry. (Note: prop name 'director' is kept for consistency with original code, but represents a post-production entity).
 * @param {boolean} props.isPreloaderActive - Whether the initial page preloader is still active.
 */
const ProductionBlock = ({ director, isPreloaderActive }) => {
  // ! Hooks
  // * Intersection Observer hook to track if the block is visible
  const { ref, inView } = useInView({
    threshold: 0.5, // * Trigger when 50% visible
    triggerOnce: false, // * Re-trigger if it scrolls out and back in
  });

  // ! Data Extraction & URL Construction
  // * Get the first video and its preview source from the data
  const firstVideo = director.videos?.[0]; // * Safely access the first video
  const publicVideoUrl = firstVideo?.src ? `${CDN_BASE_URL}/${firstVideo.src}` : '';
  const publicPreviewUrl = firstVideo?.preview_src ? `${CDN_BASE_URL}/${firstVideo.preview_src}` : '';

  // ! Render Logic
  return (
    // * Full-screen container with Intersection Observer ref
    <div ref={ref} className="relative w-full h-screen bg-black">
      {/* // * Render HLS video player */}
      <HlsVideoPlayer
        src={publicVideoUrl}
        previewSrc={publicPreviewUrl}
        shouldPlay={inView && !isPreloaderActive} // * Play only when in view and preloader is done
        startTime={firstVideo?.startTime || 0} // * Pass start time if available
        isMuted={true} // * Mute background video
        isLooped={true} // * Loop background video
      />
      {/* // * Overlay for the name/link */}
      <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center pointer-events-none">
        <motion.div
          className="flex flex-col items-center gap-4"
          variants={nameAnimation} // * Apply animation variants
          initial="hidden"
          animate={inView && !isPreloaderActive ? 'visible' : 'hidden'} // * Animate based on visibility and preloader state
        >
          {/* // * Link to the specific post-production detail page */}
          <Link
            to={`/post-production/${director.slug}`} // * Link using the slug from data
            className="text-white font-chanel font-normal uppercase text-4xl sm:text-6xl md:text-[5rem] tracking-[-0.3rem] md:tracking-[-0.6rem] transition-opacity duration-500 hover:opacity-50 pointer-events-auto text-shadow-md" // * Enable pointer events for the link
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
// ! MAIN COMPONENT: PostProduction Page (Exported as Production)
// ========================================================================== //

/**
 * ? Production Page Component (Represents Post Production)
 * Renders a sequence of full-screen video blocks for post-production entries.
 * Includes a preloader banner on first load.
 */
export default function Production() { // * Component name kept as Production for consistency
  // ! Context
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation(); // * Get preloader state

  // ! Effect: Disable body scroll when preloader is active
  useEffect(() => {
    document.body.style.overflow = isPreloaderActive ? 'hidden' : '';
    // * Cleanup function
    return () => { document.body.style.overflow = ''; };
  }, [isPreloaderActive]);

  // ! Banner Content
  const bannerTitle = 'Innovation. Finish. Storytelling Refined.';
  const bannerDescription =
    'Our post-production team blends motion control, AI-enhanced editing, CG/VFX, and color finishing to deliver bold, elevated storytelling. Every project is refined frame by flawless frame — ensuring beauty, product, and performance content resonates across every platform.';

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

      {/* --- Production Blocks --- */}
      {/* // * Map through the data and render a block for each entry */}
      {postProductionData.map((director) => ( // * Variable name 'director' kept
        <ProductionBlock
          key={director.id} // * Use unique ID as key
          director={director}
          isPreloaderActive={isPreloaderActive} // * Pass down preloader state
        />
      ))}
    </div>
  );
}