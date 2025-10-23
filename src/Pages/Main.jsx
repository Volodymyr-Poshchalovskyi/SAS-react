// src/Pages/Main.jsx

// ! React & Router Imports
import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom'; // * Hook to receive context (headerHeight) from Layout

// ! Third-party Libraries
import { motion } from 'framer-motion'; // * For animations

// ! Local Component Imports
import VideoContainer from '../Components/VideoContainer'; // * Component for rendering the background video

// ========================================================================== //
// ! MAIN COMPONENT DEFINITION: Main Page
// ========================================================================== //

function Main() {
  // ! Hooks & Context
  const { headerHeight } = useOutletContext(); // * Get the measured height of the header from the parent Layout's Outlet context
  const videoSectionRef = useRef(null); // * Ref for the main container to observe intersection

  // ! State
  const [shouldPlayVideo, setShouldPlayVideo] = useState(false); // * Controls video playback based on visibility

  // ! Configuration & Constants
  // ? GCS path is defined but not directly used for the video source in this version.
  const GCS_VIDEO_PATH =
    'front-end/00-Main Page/SHOWREEL SINNERS AND SAINTS 2024.mp4';
  // * Hardcoded local path for the video source. Consider making this dynamic or using CDN.
  const videoUrl = `/video/SHOWREEL SINNERS AND SAINTS 2024_1.mp4`;

  // * Structure for the animated headline text
  const titleLines = [
    ['WHERE', 'CULTURE,', 'COMMERCE'],
    ['AND', 'CINEMA', 'COLLIDE.'],
  ];

  // * Animation variants for the staggered word effect in the headline
  const wordVariants = {
    hidden: { opacity: 0, y: 10 }, // * Start transparent and slightly down
    visible: (i) => ({
      // * i is the custom index passed for delay calculation
      opacity: 1,
      y: 0, // * Fade in and move up
      transition: {
        duration: 0.6,
        delay: 0.2 + i * 0.2, // * Staggered delay based on word index
      },
    }),
  };

  // ! Effect: Intersection Observer for Video Playback
  // * Sets up an IntersectionObserver to play the video only when its section is sufficiently visible (>= 50%).
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // * Update state based on whether the element is intersecting
        setShouldPlayVideo(entry.isIntersecting);
      },
      {
        root: null, // * Observe intersections relative to the viewport
        rootMargin: '0px',
        threshold: 0.5, // * Trigger when 50% of the element is visible
      }
    );

    const currentRef = videoSectionRef.current; // * Capture ref value
    if (currentRef) {
      observer.observe(currentRef); // * Start observing the main container
    }

    // * Cleanup function: Stop observing when the component unmounts
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []); // * Empty dependency array ensures this runs only once on mount

  // ! Render Logic
  return (
    // * Main container: Full screen height, relative positioning for children
    <div className="relative w-full h-screen text-white" ref={videoSectionRef}>
      {/* --- Background Video --- */}
      <VideoContainer videoSrc={videoUrl} shouldPlay={shouldPlayVideo} />

      {/* --- Animated Headline Overlay --- */}
      {/* // * Positioned absolutely, uses headerHeight from context for dynamic top offset and height */}
      <div
        className="absolute left-0 right-0 z-10 flex flex-col items-center justify-center text-center px-4"
        style={{
          // * Start the text container directly below the measured header height
          top: headerHeight !== null ? `${headerHeight}px` : '0px', // * Fallback to 0px if height not measured yet
          // * Calculate the height to fill the remaining viewport below the header
          height:
            headerHeight !== null ? `calc(100vh - ${headerHeight}px)` : '100vh', // * Fallback to full height
          // ? Consider adding a transition for top/height if headerHeight changes dynamically (unlikely here)
        }}
      >
        <h1 className="text-[2.8rem] leading-[1.2] font-semibold expanded-text tracking-wider">
          {' '}
          {/* // ? 'expanded-text' class likely adds letter-spacing? */}
          {/* // * Map through lines and words to create animated spans */}
          {titleLines.map((line, lineIndex) => {
            // * Calculate the base index for staggering delays across lines
            const baseIndex = titleLines
              .slice(0, lineIndex)
              .reduce((acc, l) => acc + l.length, 0);
            return (
              <div key={lineIndex} className="block">
                {' '}
                {/* // * Each line on a new block */}
                {line.map((word, wordIndex) => (
                  <motion.span
                    key={word + wordIndex} // * Unique key combining word and index
                    custom={baseIndex + wordIndex} // * Pass index for staggered delay
                    initial="hidden"
                    animate="visible"
                    variants={wordVariants}
                    className="inline-block mr-3" // * Spacing between words
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            );
          })}
        </h1>
      </div>
    </div>
  );
}

export default Main;
