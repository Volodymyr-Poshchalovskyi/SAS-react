// src/Components/VideoModal.jsx

// ! React Imports
import React, { useEffect, useRef } from 'react';

// ! Third-party Libraries
import Hls from 'hls.js'; // * For HLS video playback support

// ========================================================================== //
// ! COMPONENT DEFINITION: VideoModal
// ========================================================================== //

/**
 * ? VideoModal Component
 * A full-screen modal overlay for playing a selected video from a list.
 * Supports HLS playback, keyboard navigation (Escape, Left/Right arrows),
 * and displays video title and client information.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.videos - Array of video objects, each containing { src, title, client, ... }.
 * @param {number} props.currentIndex - The index of the video to display initially.
 * @param {function} props.onClose - Callback function to close the modal.
 * @param {function} props.onNavigate - Callback function to change the current video index (for prev/next).
 * @param {string} props.cdnBaseUrl - The base URL for constructing video source URLs.
 * @returns {JSX.Element} The video modal component.
 */
export default function VideoModal({
  videos,
  currentIndex,
  onClose,
  onNavigate,
  cdnBaseUrl,
}) {
  // ! Refs
  const videoRef = useRef(null); // * Ref for the <video> element

  // ! Data Derivation
  // * Get the current video object based on index, provide fallback if index is out of bounds
  const currentVideo = videos[currentIndex] || {};
  // * Construct the full video source URL, handle potentially missing src
  const videoSrc = currentVideo.src ? `${cdnBaseUrl}/${currentVideo.src}` : '';

  // ! Handlers
  /**
   * ? handlePrev
   * Navigates to the previous video if possible.
   */
  const handlePrev = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1); // * Call parent navigation callback
    }
  };

  /**
   * ? handleNext
   * Navigates to the next video if possible.
   */
  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      onNavigate(currentIndex + 1); // * Call parent navigation callback
    }
  };

  // ! Effects

  // * Effect: Keyboard Navigation & Escape Key
  // * Adds event listeners for Escape (close), ArrowLeft (previous), and ArrowRight (next).
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrev(); // * Call internal handler
          break;
        case 'ArrowRight':
          handleNext(); // * Call internal handler
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    // * Cleanup listener on unmount or when dependencies change
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // * Include dependencies to ensure handlers have access to the latest props/state
  }, [onClose, currentIndex, videos.length, onNavigate]); // * Added videos.length and onNavigate

  // * Effect: HLS Player Initialization
  // * Sets up Hls.js or uses native HLS playback depending on browser support.
  // * Attempts to select the highest quality level on manifest parse.
  useEffect(() => {
    // * Exit early if dependencies aren't ready
    if (!videoSrc || !videoRef.current) return;

    const videoElement = videoRef.current;
    let hlsInstance = null; // * Use local variable for instance within effect

    // * Hls.js event handler: Select highest quality level after parsing
    const onManifestParsed = (event, data) => {
      if (hlsInstance && data.levels.length > 0) {
        // * Set currentLevel to the index of the last (usually highest quality) level
        hlsInstance.currentLevel = data.levels.length - 1;
        // TODO: Could implement more sophisticated quality selection based on height/bitrate if needed
      }
    };

    // * Initialize HLS based on browser support
    if (Hls.isSupported()) {
      hlsInstance = new Hls({
        // * Enable quality switching based on bandwidth estimations
        // * (Consider making these configurable via props if needed)
        // capLevelToPlayerSize: true,
        // maxMaxBufferLength: 30,
      });
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
      hlsInstance.loadSource(videoSrc);
      hlsInstance.attachMedia(videoElement);
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // * Native HLS support (e.g., Safari)
      videoElement.src = videoSrc;
    } else {
      console.error('HLS playback is not supported in this browser.');
    }

    // * Cleanup function: Destroy Hls.js instance and remove listeners
    return () => {
      if (hlsInstance) {
        hlsInstance.off(Hls.Events.MANIFEST_PARSED, onManifestParsed);
        hlsInstance.destroy();
      }
      // * Explicitly remove src to prevent potential memory leaks in some browsers
      // videoElement.src = '';
    };
  }, [videoSrc]); // * Re-run only if the video source URL changes

  // ! Render Logic
  return (
    // * Modal Backdrop: Fixed position, full screen, high z-index, black background
    <div
      className="fixed inset-0 bg-black z-[9999] flex flex-col justify-center items-center py-4 sm:py-8 md:py-12 px-16 sm:px-20 md:px-24 box-border"
      onClick={onClose} // * Close modal on backdrop click
    >
      {/* --- Close Button --- */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }} // * Stop propagation to prevent backdrop click
        className="absolute top-5 right-7 text-white text-5xl hover:text-gray-300 transition-colors z-[10001]" // * Higher z-index than arrows
        aria-label="Close video player"
      >
        &times; {/* // * HTML entity for 'X' symbol */}
      </button>

      {/* --- Previous Button (Conditional Rendering) --- */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }} // * Stop propagation
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-[10000] bg-black/30 hover:bg-black/60 text-white p-3 rounded-full transition-colors"
          aria-label="Previous video"
        >
          {/* // * Left arrow SVG */}
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
        </button>
      )}

      {/* --- Next Button (Conditional Rendering) --- */}
      {currentIndex < videos.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }} // * Stop propagation
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-[10000] bg-black/30 hover:bg-black/60 text-white p-3 rounded-full transition-colors"
          aria-label="Next video"
        >
          {/* // * Right arrow SVG */}
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* --- Video Player and Info Area --- */}
      {/* // * Inner div prevents clicks on video/text from closing the modal */}
      <div
        className="w-full h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* // * Video Container (takes up available vertical space) */}
        <div className="w-full flex-grow relative min-h-0">
          {' '}
          {/* // * min-h-0 prevents flexbox overflow */}
          <video
            key={videoSrc} // * Force re-initialization when videoSrc changes
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full object-contain" // * Maintain aspect ratio, contain within bounds
            controls // * Show native video player controls
            autoPlay // * Attempt to autoplay when loaded
            playsInline // * Necessary for autoplay on mobile
            preload="metadata" // * Hint browser to load metadata first
          />
        </div>
        {/* // * Video Information (Title & Client) below the video */}
        <div className="text-white text-center pt-4 flex-shrink-0">
          {' '}
          {/* // * flex-shrink-0 prevents this area from shrinking */}
          <p className="text-xl">{currentVideo.title || 'Untitled'}</p>{' '}
          {/* // * Fallback title */}
          {currentVideo.client && ( // * Render client name only if it exists
            <p className="font-light text-sm tracking-widest uppercase mt-1">
              {currentVideo.client}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
