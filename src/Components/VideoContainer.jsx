// src/Components/VideoContainer.jsx

// ! React Imports
import React, { useRef, useEffect, useState } from 'react';

// ========================================================================== //
// ! COMPONENT DEFINITION: VideoContainer
// ========================================================================== //

/**
 * ? VideoContainer Component
 * Renders an HTML5 video element designed for background playback.
 * Features:
 * - Autoplays when `shouldPlay` is true.
 * - Shows a pulsing skeleton loader until the first frame is loaded.
 * - Fades in the video smoothly after the first frame is ready.
 * - Resets to the beginning when paused.
 * - Muted, looped, and plays inline by default.
 *
 * @param {object} props - Component props.
 * @param {string} props.videoSrc - The source URL of the video file.
 * @param {boolean} props.shouldPlay - Controls whether the video should attempt to play.
 * @returns {JSX.Element} The VideoContainer component.
 */
const VideoContainer = ({ videoSrc, shouldPlay }) => {
  // ! Refs and State
  const videoRef = useRef(null); // * Ref for the <video> element
  // * State to track if video metadata (including the first frame) has loaded
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);

  // ! Effects

  // * Effect: Handle Metadata Loading
  // * Adds an event listener to detect when the video's metadata (dimensions, duration, first frame) is loaded.
  // * Sets `isMetadataLoaded` to true, triggering the fade-in effect.
  // * Seeks to a slightly non-zero time to ensure the first frame is displayed reliably.
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return; // * Exit if video element isn't available yet

    // * Reset metadata state if the video source changes
    setIsMetadataLoaded(false);

    // * Function executed once metadata is loaded
    const handleMetadataLoad = () => {
      setIsMetadataLoaded(true);
      // * Seek slightly past the beginning to ensure the frame renders on some browsers
      videoElement.currentTime = 0.1;
    };

    // * Add the event listener
    videoElement.addEventListener('loadedmetadata', handleMetadataLoad);

    // * Cleanup function: Remove the listener when the component unmounts or videoSrc changes
    return () => {
      videoElement.removeEventListener('loadedmetadata', handleMetadataLoad);
    };
  }, [videoSrc]); // * Re-run this effect if the video source URL changes

  // * Effect: Control Playback (Play/Pause)
  // * Manages playing or pausing the video based on the `shouldPlay` prop.
  // * Resets the video to the beginning when paused.
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (shouldPlay) {
      // * Attempt to play the video
      videoElement.play().catch((e) => {
        // * Log common autoplay errors without crashing
        if (e.name === 'NotAllowedError') {
          console.warn('Video autoplay was prevented by the browser.');
        } else {
          console.error('Video playback error:', e);
        }
      });
    } else {
      // * Pause the video and reset its time
      videoElement.pause();
      if (videoElement.readyState >= 1) {
        // Ensure metadata is loaded before seeking
        videoElement.currentTime = 0.1; // * Seek near the beginning
      }
    }
  }, [shouldPlay]); // * Re-run this effect when the `shouldPlay` prop changes

  // ! Render Logic
  return (
    // * Container: Absolute positioning, fills parent, hides overflow, black background as fallback
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
      {/* --- Skeleton Loader --- */}
      {/* // * Displayed only *before* metadata is loaded */}
      {!isMetadataLoaded && (
        <div className="absolute inset-0 w-full h-full bg-neutral-900 animate-pulse" />
      )}

      {/* --- Video Element --- */}
      <video
        ref={videoRef}
        src={videoSrc}
        // * Apply fade-in transition based on `isMetadataLoaded` state
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          isMetadataLoaded ? 'opacity-100' : 'opacity-0' // * Fade in when ready
        }`}
        muted // * Muted by default for background video
        loop // * Loop playback
        playsInline // * Required for autoplay on mobile browsers
        preload="metadata" // * Hint to browser to load only metadata (first frame, dimensions, duration) initially
        // * Consider adding `poster` attribute for a static image before loading starts
      />
    </div>
  );
};

export default VideoContainer;
