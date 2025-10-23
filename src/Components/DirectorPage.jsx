// src/Components/DirectorPage.jsx

// ! React & Router Imports
import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';

// ! Data Imports
import { directorsData } from '../Data/DirectorsData';
import { assignmentData } from '../Data/AssignmentData';
import { postProductionData } from '../Data/PostProductionData';
import { tableTopData } from '../Data/TableTopData';

// ! Component Imports
import HlsVideoPlayer from '../Components/HlsVideoPlayer';
import VideoModal from '../Components/VideoModal';

// ! Third-party Libraries
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// ! Asset Imports
import sinnersLogoBlack from '../assets/Logo/Sinners logo black.png';

// ! Constants
const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';

// ========================================================================== //
// ! SECTION 1: HELPER COMPONENT - DirectorVideoBlock
// ========================================================================== //

/**
 * ? DirectorVideoBlock
 * Renders a full-height video section with HLS playback, text overlay,
 * and an "Expand Video" button. Uses Intersection Observer to play video only when in view.
 * @param {object} video - Video metadata (title, client, startTime).
 * @param {string} videoSrc - URL for the HLS video stream.
 * @param {string} previewSrc - URL for the preview image.
 * @param {function} onExpand - Callback to open the video modal.
 * @param {number} index - Index of the video in the list.
 * @param {boolean} isModalOpen - Flag indicating if any modal is currently open.
 */
const DirectorVideoBlock = ({
  video,
  videoSrc,
  previewSrc,
  onExpand,
  index,
  isModalOpen,
}) => {
  // * Intersection Observer hook to detect when the video block is in view
  const { ref, inView } = useInView({
    threshold: 0.5, // * Trigger when 50% visible
  });

  return (
    <section ref={ref} className="relative w-full h-[75vh] bg-black snap-start">
      {' '}
      {/* // * snap-start for scroll snapping */}
      {/* // * HLS Video Player component */}
      <HlsVideoPlayer
        src={videoSrc}
        previewSrc={previewSrc}
        shouldPlay={inView && !isModalOpen} // * Play only if in view and no modal is open
        startTime={video.startTime} // * Optional start time for the video
      />
      {/* // * Overlay for text and button */}
      <div className="absolute inset-0 z-10 flex items-end justify-center pointer-events-none">
        {' '}
        {/* // * pointer-events-none on overlay allows video interaction */}
        <div className="flex flex-col items-center text-white pb-24 px-4">
          {/* // * Text content (Title, Client) */}
          <div className="mb-6 text-shadow text-center">
            <p className="font-chanel text-2xl sm:text-4xl">
              {' '}
              {/* // * Custom font class */}
              {video.title}
            </p>
            {video.client && (
              <p className="font-light text-sm tracking-widest uppercase mt-2">
                {video.client}
              </p>
            )}
          </div>
          {/* // * Expand Button */}
          <button
            onClick={() => onExpand(index)}
            className="bg-white text-black py-4 px-6 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-transform hover:scale-105 pointer-events-auto" // * Enable pointer events for the button
            aria-label={`Expand video: ${video.title}`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Expand Video
          </button>
        </div>
      </div>
    </section>
  );
};

// ========================================================================== //
// ! SECTION 2: HELPER COMPONENT - DirectorBioModal
// ========================================================================== //

/**
 * ? DirectorBioModal
 * A full-screen modal displaying the director's biography and photo.
 * Includes animation and dynamic font size adjustment for the name.
 * @param {object} director - The director's data object.
 * @param {function} onClose - Callback function to close the modal.
 */
const DirectorBioModal = ({ director, onClose }) => {
  const nameRef = useRef(null); // * Ref for the director's name element for font size calculation
  const bioRef = useRef(null); // * Ref for the bio text (currently unused but kept for potential future use)

  // * Construct the public URL for the director's photo
  const publicPhotoUrl = director.photoSrc
    ? `${CDN_BASE_URL}/${director.photoSrc}`
    : '';

  // * Effect: Add Escape key listener and disable body scroll when modal is open
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden'; // * Disable body scroll
    // * Cleanup function
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = ''; // * Re-enable body scroll
    };
  }, [onClose]);

  // * Effect: Adjust the director's name font size to fit the container width
  useLayoutEffect(() => {
    const adjustNameFontSize = () => {
      const element = nameRef.current;
      if (!element) return;
      const container = element.parentElement;
      if (!container) return;

      const containerStyle = window.getComputedStyle(container);
      const paddingLeft = parseFloat(containerStyle.paddingLeft);
      const paddingRight = parseFloat(containerStyle.paddingRight);
      const availableWidth = container.clientWidth - paddingLeft - paddingRight;

      // * Define min/max font sizes based on screen width
      const maxFontSize = window.innerWidth < 768 ? 60 : 120; // * Smaller max on mobile
      const minFontSize = 24;

      let currentFontSize = maxFontSize;
      element.style.fontSize = `${currentFontSize}px`;

      // * Reduce font size iteratively until the text fits
      while (
        element.scrollWidth > availableWidth &&
        currentFontSize > minFontSize
      ) {
        currentFontSize--;
        element.style.fontSize = `${currentFontSize}px`;
      }
    };

    adjustNameFontSize(); // * Run on mount
    window.addEventListener('resize', adjustNameFontSize); // * Re-run on resize
    // * Cleanup listener
    return () => window.removeEventListener('resize', adjustNameFontSize);
  }, [director]); // * Rerun if director changes (though unlikely within modal)

  // * Animation variants for the modal slide-in/out effect
  const modalVariants = {
    hidden: { x: '-100%', opacity: 0.8 },
    visible: {
      x: '0%',
      opacity: 1,
      transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] },
    }, // * Cubic bezier for smooth ease-out
    exit: {
      x: '-100%',
      opacity: 0.8,
      transition: { duration: 0.4, ease: [0.5, 0, 0.75, 0] },
    }, // * Different easing for exit
  };

  return (
    // * Backdrop overlay
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-start bg-black/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose} // * Close modal on backdrop click
    >
      {/* // * Modal Content */}
      <motion.div
        className="w-[90vw] h-full bg-white text-black shadow-2xl flex flex-col"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()} // * Prevent closing when clicking inside modal
      >
        {/* // * Modal Header (Logo, Close button) */}
        <header className="flex-shrink-0 p-8 grid grid-cols-3 items-center z-20">
          <div /> {/* // * Empty div for grid spacing */}
          <img
            src={sinnersLogoBlack}
            alt="Sinners and Saints Logo"
            className="h-6 justify-self-center"
          />
          <button
            onClick={onClose}
            className="text-black hover:opacity-70 transition-opacity justify-self-end"
            aria-label="Close biography modal"
          >
            <X size={32} />
          </button>
        </header>

        {/* // * Modal Body (Name, Photo, Bio) */}
        <div className="flex-grow flex flex-col px-8 md:px-16 pb-[70px] overflow-hidden min-h-0">
          {' '}
          {/* // * min-h-0 prevents flexbox overflow issues */}
          {/* // * Director Name (Dynamically sized) */}
          <h1
            ref={nameRef}
            className="flex-shrink-0 text-center font-chanel font-semibold uppercase mb-9 leading-none"
            style={{ whiteSpace: 'nowrap' }} // * Prevent wrapping during size calculation
          >
            {director.name}
          </h1>
          {/* // * Photo and Bio Container */}
          <div className="flex-grow flex flex-col lg:flex-row gap-12 lg:gap-16 min-h-0">
            {/* // * Director Photo */}
            <div
              className={`hidden lg:block w-full lg:w-2/5 flex-shrink-0 ${director.photoBg === 'black' ? 'bg-black' : ''}`}
            >
              {publicPhotoUrl ? (
                <img
                  src={publicPhotoUrl}
                  alt={director.name}
                  className="w-full aspect-square object-contain" // * Use 'contain' to prevent cropping
                />
              ) : (
                <div className="w-full aspect-square bg-gray-200" /> // * Placeholder if no photo
              )}
            </div>
            {/* // * Director Biography (Scrollable) */}
            <div className="w-full lg:w-3/5 flex flex-col min-h-0">
              <p
                ref={bioRef}
                className="text-sm leading-relaxed whitespace-pre-line text-left lg:text-justify flex-grow overflow-y-auto pb-5 pr-1" // * Added padding-right for scrollbar
              >
                {director.bio}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ========================================================================== //
// ! SECTION 3: MAIN COMPONENT - DirectorPage
// ========================================================================== //

export default function DirectorPage() {
  // ! Hooks
  const { directorSlug } = useParams(); // * Get director slug from URL
  const location = useLocation(); // * Get current path for determining data source

  // ! Data Source Logic
  // * Determine which data array and back link to use based on the current path
  const isAssignmentPage = location.pathname.startsWith('/assignment');
  const isProductionPage = location.pathname.startsWith('/post-production');
  const isTableTopPage = location.pathname.startsWith('/table-top-studio');

  let dataSource;
  let backLink;

  if (isAssignmentPage) {
    dataSource = assignmentData;
    backLink = '/assignment';
  } else if (isProductionPage) {
    dataSource = postProductionData;
    backLink = '/post-production';
  } else if (isTableTopPage) {
    dataSource = tableTopData;
    backLink = '/table-top-studio';
  } else {
    // * Default to directors data
    dataSource = directorsData;
    backLink = '/directors';
  }

  // * Find the specific director/entity from the determined data source
  const director = dataSource.find((d) => d.slug === directorSlug);

  // ! State
  const [activeVideoIndex, setActiveVideoIndex] = useState(null); // * Index of video shown in modal, null if none
  const [isBioModalOpen, setIsBioModalOpen] = useState(false); // * Bio modal visibility
  // * State to track if the user has ever viewed the bio (persisted in localStorage)
  // * Initialized lazily from localStorage to avoid hydration issues if using SSR
  const [hasEverViewedBio, setHasEverViewedBio] = useState(() => {
    if (typeof window !== 'undefined') {
      // * Check if running in browser
      return localStorage.getItem('hasViewedBio') === 'true';
    }
    return false; // * Default if not in browser
  });

  // ! Intersection Observer for Name Animation
  // * Triggers animation only once when the name button scrolls into view
  const { ref: nameButtonRef, inView: isNameButtonInView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  // ! Animation Variants for Name Button
  // * Creates a subtle color pulse effect
  const nameAnimationVariants = {
    hidden: { color: '#000000' }, // * Start black
    visible: {
      color: ['#000000', '#6b7280', '#000000'], // * Black -> Gray -> Black
      transition: {
        duration: 2,
        repeat: 5,
        repeatType: 'loop',
        ease: 'easeInOut',
      },
    },
  };

  // ! Event Handlers
  /**
   * ? openBioModal
   * Opens the bio modal and updates localStorage/state to prevent future name animations.
   */
  const openBioModal = () => {
    // * If this is the first time viewing, mark it in localStorage and update state
    if (!hasEverViewedBio) {
      localStorage.setItem('hasViewedBio', 'true');
      setHasEverViewedBio(true);
    }
    setIsBioModalOpen(true); // * Open the modal
  };

  // ! Derived State
  // * Flag to indicate if any modal (video or bio) is open, used by DirectorVideoBlock
  const isAnyModalOpen = activeVideoIndex !== null || isBioModalOpen;

  // ! Effects
  // * Scroll to top when the component mounts or director changes
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [directorSlug]); // * Dependency ensures scroll on page change

  // * Preload the director's photo when the component mounts
  useEffect(() => {
    if (director?.photoSrc) {
      // * Check if director and photoSrc exist
      const publicPhotoUrl = `${CDN_BASE_URL}/${director.photoSrc}`;
      const img = new Image();
      img.src = publicPhotoUrl; // * Start loading image in the background
    }
  }, [director]); // * Run when director data is available

  // ! Render Logic

  // * Handle case where director data is not found
  if (!director) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <h2 className="text-4xl font-chanel">Content Not Found</h2>
        {/* // TODO: Add a link back to the listing page */}
      </div>
    );
  }

  // * Main page structure
  return (
    <div className="bg-white">
      {' '}
      {/* // * Base background */}
      {/* --- Header Section (Name & Back Button) --- */}
      <section className="bg-white text-black flex items-center justify-center relative h-[100px] mt-[90px] md:mt-[117px]">
        {' '}
        {/* // * mt accounts for fixed Header height */}
        {/* Back Button */}
        <Link
          to={backLink}
          aria-label={`Back to ${backLink.substring(1)} listing`}
          className="absolute left-8 md:left-20 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
        >
          {/* // * Back arrow SVG */}
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        {/* Director Name (Button to open Bio) */}
        <motion.button
          ref={nameButtonRef} // * Ref for intersection observer
          onClick={openBioModal} // * Open bio modal on click
          className="text-4xl sm:text-5xl md:text-6xl font-chanel font-semibold uppercase text-center px-4 transition-opacity hover:opacity-70 focus:outline-none"
          aria-label={`View biography for ${director.name}`}
          variants={nameAnimationVariants}
          initial="hidden"
          // * Animate only if in view AND bio hasn't been viewed before
          animate={
            isNameButtonInView && !hasEverViewedBio ? 'visible' : 'hidden'
          }
        >
          {director.name}
        </motion.button>
      </section>
      {/* --- Video Blocks Section --- */}
      <div className="bg-black">
        {/* // * Map through the director's videos and render DirectorVideoBlock for each */}
        {director.videos.map((video, index) => {
          // * Construct public URLs for video and preview using CDN base
          const publicVideoUrl = `${CDN_BASE_URL}/${video.src}`;
          const publicPreviewUrl = video.preview_src
            ? `${CDN_BASE_URL}/${video.preview_src}`
            : '';
          return (
            <DirectorVideoBlock
              key={index} // * Using index as key, consider a more stable ID if available
              index={index}
              video={video}
              videoSrc={publicVideoUrl}
              previewSrc={publicPreviewUrl}
              onExpand={setActiveVideoIndex} // * Set state to open video modal
              isModalOpen={isAnyModalOpen} // * Pass modal state to prevent background play
            />
          );
        })}
      </div>
      {/* --- Video Modal --- */}
      {/* // * Render the VideoModal conditionally based on activeVideoIndex */}
      {activeVideoIndex !== null && (
        <VideoModal
          videos={director.videos}
          currentIndex={activeVideoIndex}
          onClose={() => setActiveVideoIndex(null)} // * Close handler
          onNavigate={setActiveVideoIndex} // * Handler for next/prev navigation
          cdnBaseUrl={CDN_BASE_URL} // * Pass CDN URL for constructing video URLs
        />
      )}
      {/* --- Bio Modal --- */}
      {/* // * Use AnimatePresence for smooth entry/exit animation */}
      <AnimatePresence>
        {isBioModalOpen && (
          <DirectorBioModal
            director={director}
            onClose={() => setIsBioModalOpen(false)} // * Close handler
          />
        )}
      </AnimatePresence>
    </div>
  );
}
