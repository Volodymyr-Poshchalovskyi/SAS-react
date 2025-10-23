// src/Components/PhotographerPage.jsx

// ! React & Router Imports
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

// ! Data Imports
import { photographersData } from '../Data/PhotographersData';

// ! Third-party Libraries
import { motion, AnimatePresence } from 'framer-motion'; // * For animations
import { X } from 'lucide-react'; // * For close icon

// ! Asset Imports
import sinnersLogoBlack from '../assets/Logo/Sinners logo black.png'; // * Logo for modal

// ! Constants
const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage'; // * Base URL for media assets

// ========================================================================== //
// ! SECTION 1: HELPER COMPONENT - PhotographerBioModal
// ========================================================================== //

/**
 * ? PhotographerBioModal
 * A full-screen modal component to display a photographer's biography and profile photo.
 * Features:
 * - ESC key to close.
 * - Disables body scroll when open.
 * - Dynamic font sizing for the photographer's name to fit container.
 * - Framer Motion animations for smooth entry/exit.
 *
 * @param {object} props - Component props.
 * @param {object} props.photographer - The photographer data object.
 * @param {function} props.onClose - Callback function to close the modal.
 */
const PhotographerBioModal = ({ photographer, onClose }) => {
  const nameRef = useRef(null); // * Ref for the photographer's name element
  const bioRef = useRef(null); // * Ref for the bio text content (can be used for scroll or other effects)

  // * Construct the public URL for the photographer's profile photo
  const publicPhotoUrl = photographer.profilePhotoSrc
    ? `${CDN_BASE_URL}/${photographer.profilePhotoSrc}`
    : '';

  // ! Effect: Handle Escape key press and body scroll lock
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc); // * Add event listener for Escape key
    document.body.style.overflow = 'hidden'; // * Prevent body scrolling
    // * Cleanup function
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = ''; // * Re-enable body scrolling
    };
  }, [onClose]); // * Re-run if onClose changes (unlikely for a stable function)

  // ! Effect: Dynamically adjust font size of photographer's name
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

      // * Define max and min font sizes based on screen width
      const maxFontSize = window.innerWidth < 768 ? 60 : 120; // * Smaller max on mobile
      const minFontSize = 24;

      let currentFontSize = maxFontSize;
      element.style.fontSize = `${currentFontSize}px`;

      // * Decrease font size until text fits within available width
      while (
        element.scrollWidth > availableWidth &&
        currentFontSize > minFontSize
      ) {
        currentFontSize--;
        element.style.fontSize = `${currentFontSize}px`;
      }
    };

    adjustNameFontSize(); // * Run once on mount
    window.addEventListener('resize', adjustNameFontSize); // * Re-run on window resize
    // * Cleanup listener
    return () => window.removeEventListener('resize', adjustNameFontSize);
  }, [photographer]); // * Re-run if photographer data changes

  // ! Framer Motion Variants for Modal Animation
  const modalVariants = {
    hidden: { x: '-100%', opacity: 0.8 }, // * Starts off-screen to the left, slightly transparent
    visible: {
      x: '0%',
      opacity: 1,
      transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] },
    }, // * Slides in from left with custom easing
    exit: {
      x: '-100%',
      opacity: 0.8,
      transition: { duration: 0.4, ease: [0.5, 0, 0.75, 0] },
    }, // * Slides out to left with custom easing
  };

  return (
    // * Backdrop overlay for the modal
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-start bg-black/70"
      initial={{ opacity: 0 }} // * Start with transparent backdrop
      animate={{ opacity: 1 }} // * Fade in backdrop
      exit={{ opacity: 0 }} // * Fade out backdrop
      onClick={onClose} // * Close modal when clicking on the backdrop
    >
      {/* // * Modal content container */}
      <motion.div
        className="w-[90vw] h-full bg-white text-black shadow-2xl flex flex-col"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()} // * Prevent closing when clicking inside the modal content
      >
        {/* // * Modal Header (Logo and Close button) */}
        <header className="flex-shrink-0 p-8 grid grid-cols-3 items-center z-20">
          <div /> {/* // * Empty div for grid alignment */}
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
            <X size={32} /> {/* // * Lucide X icon */}
          </button>
        </header>

        {/* // * Modal Body (Name, Photo, Bio Text) */}
        <div className="flex-grow flex flex-col px-8 md:px-16 pb-[70px] overflow-hidden min-h-0">
          {/* // * Photographer Name (Dynamically sized) */}
          <h1
            ref={nameRef}
            className="flex-shrink-0 text-center font-chanel font-semibold uppercase mb-9 leading-none"
            style={{ whiteSpace: 'nowrap' }} // * Ensure name stays on one line for sizing calculation
          >
            {photographer.name}
          </h1>
          {/* // * Photo and Bio Layout (Flex column on small, row on large screens) */}
          <div className="flex-grow flex flex-col lg:flex-row gap-12 lg:gap-16 min-h-0">
            {/* // * Photo Column (Hidden on small screens) */}
            <div className="hidden lg:block w-full lg:w-2/5 flex-shrink-0">
              {publicPhotoUrl ? (
                <img
                  src={publicPhotoUrl}
                  alt={photographer.name}
                  className="w-full aspect-square object-cover" // * Cover ensures image fills space
                />
              ) : (
                <div className="w-full aspect-square bg-gray-200" /> // * Placeholder if no photo
              )}
            </div>
            {/* // * Bio Text Column (Scrollable on overflow) */}
            <div className="w-full lg:w-3/5 flex flex-col min-h-0">
              <p
                ref={bioRef}
                className="text-sm leading-relaxed whitespace-pre-line text-left lg:text-justify flex-grow overflow-y-auto pb-5 pr-1" // * pr-1 to prevent scrollbar overlaying text
              >
                {photographer.bio}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ========================================================================== //
// ! SECTION 2: MAIN COMPONENT - PhotographerPage
// ========================================================================== //

/**
 * ? PhotographerPage
 * Renders a detailed page for a specific photographer, including their
 * portfolio, bio (in a modal), and other relevant information.
 */
export default function PhotographerPage() {
  // ! Hooks
  const { photographerSlug } = useParams(); // * Get photographer slug from URL
  const sliderRef = useRef(null); // * Ref for the horizontal image slider
  const collageSectionRef = useRef(null); // * Ref for the first collage section for parallax effect
  const collageSectionRef2 = useRef(null); // * Ref for the second collage section for parallax effect

  // ! State
  const [scrollY, setScrollY] = useState(0); // * Tracks current scroll position for parallax
  const [isBioModalOpen, setIsBioModalOpen] = useState(false); // * Controls visibility of the bio modal

  // ! Data Retrieval
  // * Find the photographer data based on the URL slug
  const photographer = photographersData.find(
    (p) => p.slug === photographerSlug
  );

  // ! Effect: Update scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll); // * Add scroll listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    }; // * Cleanup
  }, []);

  // ! Effect: Scroll to top on component mount/page load
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ! Effect: Preload photographer's profile photo
  useEffect(() => {
    if (photographer?.profilePhotoSrc) {
      // * Check if data and photo source exist
      const publicPhotoUrl = `${CDN_BASE_URL}/${photographer.profilePhotoSrc}`;
      const img = new Image(); // * Create new Image object
      img.src = publicPhotoUrl; // * Assign src to trigger preload
    }
  }, [photographer]); // * Re-run when photographer data becomes available

  // ! Slider Navigation Handlers
  const handlePrev = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };
  const handleNext = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  // ! Collage Data (These remain as-is from the original code)
  const collageImagesData = [
    { width: 411, height: 732, left: 120, top: 2256 },
    { width: 363, height: 510, left: 690, top: 2271 },
    { width: 363, height: 491, left: 975, top: 2494 },
    { width: 661, height: 439, left: -55, top: 3240 },
    { width: 585, height: 732, left: 740, top: 3132 },
    { width: 446, height: 448, left: 523, top: 3921 },
    { width: 620, height: 400, left: 10, top: 4400 },
    { width: 343, height: 596, left: 551, top: 4570 },
    { width: 462, height: 580, left: 1080, top: 4484 },
  ];
  const topOffset = 2150;
  const containerHeight = Math.max(
    ...collageImagesData.map((img) => img.top - topOffset + img.height)
  );

  const collageImagesData2 = [
    { width: 500, height: 650, left: 10, top: 150 },
    { width: 400, height: 500, left: 730, top: 50 },
    { width: 380, height: 550, left: 1080, top: 400 },
    { width: 600, height: 460, left: 100, top: 950 },
    { width: 480, height: 600, left: 850, top: 1050 },
  ];
  const topOffset2 = 0;
  const containerHeight2 = Math.max(
    ...collageImagesData2.map((img) => img.top - topOffset2 + img.height)
  );

  // ! Render Logic

  // * Display "Not Found" message if photographer data is not available
  if (!photographer) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <h2 className="text-4xl font-chanel">Photographer Not Found</h2>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* --- Section: Header with Photographer Name and Back Button --- */}
      <section className="bg-white text-black flex items-center justify-center relative h-[100px] mt-[90px] md:mt-[117px]">
        {/* Back Button */}
        <Link
          to="/photographers"
          aria-label="Back to photographers listing"
          className="absolute left-8 md:left-20 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
        >
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
        {/* Photographer Name (Clickable to open Bio Modal) */}
        <button
          onClick={() => setIsBioModalOpen(true)} // * Open the bio modal on click
          className="text-4xl sm:text-5xl md:text-6xl font-chanel font-semibold uppercase text-center px-4 transition-opacity hover:opacity-70 focus:outline-none"
          aria-label={`View biography for ${photographer.name}`}
        >
          {photographer.name}
        </button>
      </section>

      {/* --- Section: Cover Image --- */}
      <section className="w-full h-screen snap-start">
        {' '}
        {/* // * snap-start for scroll snapping */}
        <img
          src={photographer.coverImage}
          alt={`Cover for ${photographer.name}`}
          className="w-full h-full object-cover"
        />
      </section>

      {/* --- Section: Description 1 --- */}
      <section className="bg-white py-20 snap-start">
        {' '}
        {/* // * snap-start for scroll snapping */}
        <div className="max-w-2xl mx-auto text-center px-4">
          <p className="text-[12px] leading-relaxed text-gray-700 text-justify">
            {photographer.section1_text}
          </p>
        </div>
      </section>

      {/* --- Section: Horizontal Image Slider --- */}
      <section className="bg-white pl-2 md:pl-5 overflow-hidden relative group snap-center">
        {' '}
        {/* // * snap-center for scroll snapping */}
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          className="absolute left-5 top-1/2 -translate-y-1/2 z-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Previous image"
        >
          <svg
            className="w-12 h-12 drop-shadow-lg"
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
        </button>
        {/* Next Button */}
        <button
          onClick={handleNext}
          className="absolute right-5 top-1/2 -translate-y-1/2 z-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Next image"
        >
          <svg
            className="w-12 h-12 drop-shadow-lg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        {/* Slider Content */}
        <div
          ref={sliderRef}
          className="flex flex-row gap-24 h-[70vh] overflow-x-auto scrollbar-hide"
        >
          {photographer.photos.map((photo, index) => (
            <div
              key={photo.id}
              className={`flex-shrink-0 ${index % 3 === 0 ? 'md:w-[30%]' : 'md:w-[25%]'}`}
            >
              <img
                src={photo.src}
                alt={`Gallery view ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* --- Section: Image Collage 1 (Photos 1-9) --- */}
      <section
        ref={collageSectionRef}
        className="w-full bg-white py-[50px] flex justify-center snap-center"
      >
        {' '}
        {/* // * snap-center for scroll snapping */}
        <div
          className="relative"
          style={{ width: '1440px', height: `${containerHeight}px` }}
        >
          {collageImagesData.map((img, index) => {
            // * Use specific collage photo if available, otherwise fallback to cover image
            const collageImageSrc =
              photographer.collagePhotos?.[index] || photographer.coverImage;

            // * Apply parallax effect to specific images (index 2 and 6)
            if (index === 2 || index === 6) {
              const parallaxStrength = 0.15;
              let parallaxY = 0;
              if (collageSectionRef.current) {
                const elementTop =
                  collageSectionRef.current.offsetTop + (img.top - topOffset);
                const scrollRelativeToElement = scrollY - elementTop;
                parallaxY = scrollRelativeToElement * parallaxStrength;
              }
              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    width: `${img.width}px`,
                    height: `${img.height}px`,
                    left: `${img.left}px`,
                    top: `${img.top - topOffset}px`,
                    zIndex: index === 6 ? 2 : 0, // * Bring image 6 slightly forward
                    overflow: 'hidden', // * Essential for parallax to crop
                  }}
                >
                  <img
                    src={collageImageSrc}
                    alt={`Collage parallax view ${index + 1}`}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '150%', // * Make image taller to allow for movement
                      objectFit: 'cover',
                      top: '0',
                      transform: `translateY(${parallaxY}px)`, // * Apply parallax transform
                    }}
                  />
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-5xl font-bold bg-black bg-opacity-50 p-4 rounded-full z-10">
                    {index + 1}
                  </span>
                </div>
              );
            }
            // * Render non-parallax images
            return (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  width: `${img.width}px`,
                  height: `${img.height}px`,
                  left: `${img.left}px`,
                  top: `${img.top - topOffset}px`,
                  zIndex: index === 7 ? 1 : 0, // * Bring image 7 slightly forward
                }}
              >
                <img
                  src={collageImageSrc}
                  alt={`Collage view ${index + 1}`}
                  className="w-full h-full object-contain"
                />{' '}
                {/* // * object-contain fits image within bounds */}
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-5xl font-bold bg-black bg-opacity-50 p-4 rounded-full">
                  {index + 1}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- Section: Description 2 --- */}
      <section className="bg-white py-20 snap-start">
        {' '}
        {/* // * snap-start for scroll snapping */}
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-[20px] font-semibold uppercase mb-6 text-center">
            {photographer.section2_title}
          </h2>
          {/* // * Conditional rendering for structured vs. plain text bio */}
          {typeof photographer.section2_text === 'object' ? (
            <div className="text-[12px] leading-relaxed text-gray-700 text-left space-y-6">
              <div>
                <h3 className="font-semibold uppercase text-black mb-2 tracking-wider">
                  Exhibitions & Collections
                </h3>
                <ul className="space-y-1">
                  {photographer.section2_text.exhibitions.map((item, index) => (
                    <li key={index} className="flex">
                      <span className="w-12 font-semibold">{item.year}</span>
                      <span>{item.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold uppercase text-black mb-2 tracking-wider">
                  Institutional Collections & Recognition
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {photographer.section2_text.institutional.map(
                    (item, index) => (
                      <li key={index}>{item}</li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold uppercase text-black mb-2 tracking-wider">
                  Clients & Editorial Collaborations
                </h3>
                <p className="leading-relaxed">
                  {photographer.section2_text.clients.join(' · ')}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[12px] leading-relaxed text-gray-700 text-justify">
              {photographer.section2_text}
            </p>
          )}
        </div>
      </section>

      {/* --- Section: Image Collage 2 (Photos 10-14) --- */}
      {/* // * Rendered only if there are enough collage photos */}
      {photographer.collagePhotos && photographer.collagePhotos.length > 9 && (
        <section
          ref={collageSectionRef2}
          className="w-full bg-white pt-[50px] pb-[150px] flex justify-center snap-center"
        >
          {' '}
          {/* // * snap-center for scroll snapping */}
          <div
            className="relative"
            style={{ width: '1440px', height: `${containerHeight2}px` }}
          >
            {collageImagesData2.map((img, index) => {
              const imageIndex = index + 9; // * Adjust index for the second collage set
              if (photographer.collagePhotos[imageIndex]) {
                const collageImageSrc = photographer.collagePhotos[imageIndex];
                return (
                  <div
                    key={imageIndex}
                    style={{
                      position: 'absolute',
                      width: `${img.width}px`,
                      height: `${img.height}px`,
                      left: `${img.left}px`,
                      top: `${img.top - topOffset2}px`,
                      zIndex: 0,
                    }}
                  >
                    <img
                      src={collageImageSrc}
                      alt={`Collage view ${imageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-5xl font-bold bg-black bg-opacity-50 p-4 rounded-full">
                      {imageIndex + 1}
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </section>
      )}

      {/* --- Photographer Bio Modal --- */}
      {/* // * Use AnimatePresence for smooth entry/exit */}
      <AnimatePresence>
        {isBioModalOpen && (
          <PhotographerBioModal
            photographer={photographer}
            onClose={() => setIsBioModalOpen(false)} // * Close handler
          />
        )}
      </AnimatePresence>
    </div>
  );
}
