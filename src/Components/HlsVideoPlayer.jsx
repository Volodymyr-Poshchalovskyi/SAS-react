// src/Components/HlsVideoPlayer.jsx

// ! React Imports
import React, { useEffect, useRef, useState } from 'react';

// ! Third-party Libraries
import Hls from 'hls.js'; // * For HLS video playback support

// ========================================================================== //
// ! COMPONENT DEFINITION: HlsVideoPlayer
// ========================================================================== //

/**
 * ? HlsVideoPlayer Component
 * Renders an HTML5 video element with HLS (HTTP Live Streaming) support.
 * Handles HLS initialization, playback control based on visibility,
 * preview image display with fade transition, and optional looping/muting/start time.
 *
 * @param {string} src - The URL of the HLS manifest (.m3u8).
 * @param {boolean} shouldPlay - Controls whether the video should attempt to play (e.g., based on visibility).
 * @param {boolean} [isMuted=true] - Whether the video should be muted initially.
 * @param {string} [previewSrc] - Optional URL for a preview image shown before video loads/plays.
 * @param {number} [startTime=0] - Optional start time for the video playback (in seconds).
 * @param {number} [volume=1] - Initial volume level (0 to 1).
 * @param {boolean} [isLooped=true] - Whether the video should loop automatically.
 * @param {object} props - Any other standard HTML video attributes (e.g., poster, controls).
 * @returns {JSX.Element} The video player component.
 */
const HlsVideoPlayer = ({
  src,
  shouldPlay,
  isMuted = true,
  previewSrc,
  startTime = 0,
  volume = 1,
  isLooped = true, // * Default loop to true
  ...props // * Capture rest of the props for the <video> element
}) => {
  // ! Refs
  const videoRef = useRef(null); // * Ref for the <video> element
  const hlsRef = useRef(null); // * Ref to store the Hls.js instance

  // ! State
  const [isVideoVisible, setIsVideoVisible] = useState(false); // * Controls the fade transition from preview to video

  // ! Effect: Initialize Hls.js or Native HLS
  useEffect(() => {
    if (!src || !videoRef.current) return; // * Exit if no source or video element yet

    const video = videoRef.current;
    let hlsInstance = null; // * Use a local variable for the instance in this effect

    // * Function to trigger the fade-in transition
    const showVideo = () => {
      setIsVideoVisible(true);
    };

    // * Hls.js Event Handler: Attempt to set preferred quality on manifest load
    const onManifestParsed = (event, data) => {
      // * Try to find a 1080p level
      const level_1080p_index = data.levels.findIndex(
        ({ height }) => height === 1080
      );
      if (level_1080p_index !== -1 && hlsInstance) {
        // * If found, set it as the starting and minimum auto level
        hlsInstance.startLevel = level_1080p_index;
        hlsInstance.minAutoLevel = level_1080p_index;
      }
      // TODO: Consider adding fallback logic if 1080p isn't available (e.g., choose highest available)
    };

    // * Check if Hls.js is supported by the browser
    if (Hls.isSupported()) {
      const hlsConfig = startTime > 0 ? { startPosition: startTime } : {}; // * Set start position if provided
      hlsInstance = new Hls(hlsConfig);
      hlsRef.current = hlsInstance; // * Store instance in ref for potential external access
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, onManifestParsed); // * Attach event listener
      hlsInstance.loadSource(src); // * Load the HLS manifest
      hlsInstance.attachMedia(video); // * Attach Hls.js to the video element
      video.addEventListener('canplay', showVideo); // * Show video when it's ready
    }
    // * Check if the browser supports native HLS playback (e.g., Safari)
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // * Set video source directly, adding start time fragment if needed
      video.src = startTime > 0 ? `${src}#t=${startTime}` : src;
      video.addEventListener('canplay', showVideo); // * Show video when ready
    } else {
      console.error('HLS playback is not supported in this browser.');
    }

    // * Cleanup function: Remove event listeners and destroy Hls.js instance
    return () => {
      video.removeEventListener('canplay', showVideo);
      if (hlsInstance) {
        hlsInstance.off(Hls.Events.MANIFEST_PARSED, onManifestParsed);
        hlsInstance.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, startTime]); // * Re-run effect if src or startTime changes

  // ! Effect: Control Play/Pause based on `shouldPlay` prop and visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (shouldPlay && isVideoVisible) {
      // * Attempt to play, catch potential autoplay errors
      video.play().catch((error) => {
        // * Autoplay errors are common, log them but don't treat as critical
        if (error.name === 'NotAllowedError') {
          console.log('Autoplay was prevented by the browser.');
        } else {
          console.error('Video play error:', error);
        }
      });
    } else {
      video.pause();
    }
  }, [shouldPlay, isVideoVisible]); // * Re-run when play state or video visibility changes

  // ! Effect: Set initial volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]); // * Only needs to run if volume prop changes (rarely)

  // ! Render Logic
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* --- Preview Image --- */}
      {/* // * Rendered only if previewSrc is provided */}
      {previewSrc && (
        <img
          src={previewSrc}
          alt="Video preview"
          // * Apply transition classes for fade and blur effect
          className={`absolute inset-0 w-full h-full object-cover object-center scale-[1.0001] transition-all duration-1000 ease-[cubic-bezier(0.65,0,0.35,1)] ${
            // * Custom cubic-bezier for smooth ease
            isVideoVisible
              ? 'opacity-0 blur-[10px] scale-105' // * State when video is visible (fade out preview)
              : 'opacity-100 blur-0 scale-100' // * Initial state (preview visible)
          }`}
          loading="lazy" // * Lazy load preview image
        />
      )}

      {/* --- HLS Video Element --- */}
      <video
        ref={videoRef}
        // * Apply transition classes for fade-in effect
        className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ease-[cubic-bezier(0.65,0,0.35,1)] ${
          isVideoVisible
            ? 'opacity-100 scale-100' // * State when video should be visible
            : 'opacity-0 scale-95' // * Initial hidden state (slightly scaled down)
        }`}
        playsInline // * Essential for autoplay on mobile
        loop={isLooped} // * Use the loop attribute controlled by the isLooped prop
        muted={isMuted} // * Control muted state via prop
        preload="metadata" // * Load only metadata initially
        {...props} // * Spread remaining props (e.g., poster, controls if needed)
      />
    </div>
  );
};

export default HlsVideoPlayer;
