// src/Pages/PublicReelPage.jsx

// ! React & Router Imports
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  forwardRef, // Added forwardRef
} from 'react';
import { useParams } from 'react-router-dom';

// ! Third-party Libraries
import { AnimatePresence, motion } from 'framer-motion';
import Hls from 'hls.js'; // * For HLS video playback
import { pdfjs } from 'react-pdf'; // * Although imported, not used in this component's final code. Review if needed elsewhere.
import 'react-pdf/dist/Page/AnnotationLayer.css'; // * Styles potentially for PDF viewer (review if needed)
import 'react-pdf/dist/Page/TextLayer.css'; // * Styles potentially for PDF viewer (review if needed)
// import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url'; // * PDF worker (review if needed)

// ! Lucide Icons
import {
  Loader2,
  CheckCircle,
  AlertTriangle,
  Expand,
  Minimize,
  FileText,
  Download,
  Replace,
  CheckSquare,
  Sparkles,
  Check,
  Copy,
  Eye, // Explicitly import used icons
  X as CloseIcon, // Rename X for clarity
} from 'lucide-react';

// ! Local Component Imports (Review if PreloaderBanner exists or rename Preloader)
// import PreloaderBanner from '../Components/PreloaderBanner';
import HlsVideoPlayer from '../Components/HlsVideoPlayer'; // Assuming HlsVideoPlayer handles its own playback logic now

// ! Context & Data Imports (Ensure paths are correct)
import { useAnimation } from '../context/AnimationContext';
// import { featureProjectData } from '../Data/FeatureProjectData'; // Likely not needed here

// ! Asset Imports
import sinnersLogoBlack from '../assets/Logo/Sinners logo black.png';
import sinnersLogoWhite from '../assets/Logo/Sinners logo white.png';

// ! Configuration & Constants
// pdfjs.GlobalWorkerOptions.workerSrc = workerSrc; // * PDF worker setup (review if needed)
const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';
const API_BASE_URL = import.meta.env.VITE_API_URL;

// ! Animation Variants
const nameAnimation = {
  // * For title overlays
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};
const sliderVariants = {
  // * For PDF page sliding (review if needed for image slides)
  enter: (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: (d) => ({
    x: d < 0 ? '100%' : '-100%',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeIn' },
  }),
};

// ========================================================================== //
// ! SECTION 1: HELPER COMPONENTS
// ========================================================================== //

/**
 * ? InlineHlsPlayer Component
 * Renders an HTML video element with HLS support using Hls.js or native browser capabilities.
 * @param {string} src - The video source URL (.m3u8 or standard video format).
 * @param {object} props - Other standard video attributes (controls, autoPlay, loop, muted, className, etc.).
 * @param {React.Ref} ref - Forwarded ref to the video element.
 */
const InlineHlsPlayer = forwardRef(({ src, ...props }, ref) => {
  const internalVideoRef = useRef(null);
  const videoRef = ref || internalVideoRef; // * Allow parent ref override

  useEffect(() => {
    if (!src || !videoRef.current) return;

    const video = videoRef.current;
    let hlsInstance = null; // * Use local variable

    // * Determine if HLS or standard video source
    if (src.includes('.m3u8')) {
      if (Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        // TODO: Consider adding error handling for HLS loading
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // * Native HLS support (e.g., Safari)
        video.src = src;
      } else {
        console.error(
          'HLS playback is not supported and no native support detected.'
        );
      }
    } else {
      // * Standard video source (mp4, mov, etc.)
      video.src = src;
    }

    // * Cleanup function
    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
      // * Stop video and clear src on unmount to prevent memory leaks
      // video.pause();
      // video.removeAttribute('src');
      // video.load();
    };
  }, [src, videoRef]); // * Re-run only if src or ref changes

  // * Spread remaining props (like autoPlay, controls, muted, loop, className) onto the video element
  return <video ref={videoRef} {...props} />;
});
InlineHlsPlayer.displayName = 'InlineHlsPlayer'; // * For DevTools

/**
 * ? Preloader Component
 * Displays a simple loading indicator with the logo.
 */
const Preloader = () => (
  <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-white">
    <img
      src={sinnersLogoBlack}
      alt="Sinners Logo Loading"
      className="w-40 h-auto mb-6"
    />
    <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
    <p className="text-black tracking-widest uppercase text-sm">Loading Reel</p>
  </div>
);

/**
 * ? SliderArrow Component
 * Renders a left or right arrow button for slider navigation.
 * @param {string} direction - 'left' or 'right'.
 * @param {function} onClick - Click handler function.
 */
const SliderArrow = ({ direction, onClick }) => (
  <button
    onClick={onClick}
    className={`absolute top-1/2 -translate-y-1/2 z-20 text-white transition-opacity hover:opacity-70 ${
      direction === 'left' ? 'left-4 md:left-8' : 'right-4 md:right-8'
    }`}
    aria-label={direction === 'left' ? 'Previous Slide' : 'Next Slide'}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-10 w-10 md:h-14 md:w-14"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      {direction === 'left' ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 19l-7-7 7-7"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5l7 7-7 7"
        />
      )}
    </svg>
  </button>
);

/**
 * ? DownloadModal Component
 * Modal for selecting and downloading media items. Handles fetching, progress, and errors.
 */
const DownloadModal = ({ isOpen, onClose, mediaItems }) => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({}); // * { [itemId]: progressPercent | 'error' }

  // * Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedItems(new Set());
      setDownloadProgress({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // * Toggle item selection
  const handleToggleSelection = (itemId) => {
    if (isDownloading) return; // * Prevent changes during download
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.has(itemId) ? newSet.delete(itemId) : newSet.add(itemId);
      return newSet;
    });
  };

  // * Handle download initiation and process
  const handleDownload = async () => {
    const itemsToDownload = mediaItems.filter(
      (item) =>
        selectedItems.has(item.id) && item.allow_download && item.videoGcsPath
    );
    if (itemsToDownload.length === 0) return;

    setIsDownloading(true);
    const initialProgress = {};
    itemsToDownload.forEach((item) => {
      initialProgress[item.id] = 0;
    });
    setDownloadProgress(initialProgress);

    // * Download files sequentially (could be parallelized with Promise.all)
    for (const item of itemsToDownload) {
      try {
        // * Construct the *direct* GCS URL (assuming public access or requires specific handling)
        // ! This might need adjustment if files aren't publicly readable.
        // ! Consider fetching a signed URL from your backend instead.
        const downloadUrl = `${CDN_BASE_URL}/${item.videoGcsPath}`;

        const response = await fetch(downloadUrl);
        if (!response.ok)
          throw new Error(
            `Download failed: ${response.status} ${response.statusText}`
          );
        if (!response.body) throw new Error('ReadableStream not supported.');

        const contentLength = +response.headers.get('Content-Length');
        const reader = response.body.getReader();
        let receivedLength = 0;
        let chunks = []; // * Store chunks for blob creation

        // * Stream download and update progress
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          receivedLength += value.length;
          if (contentLength) {
            const progress = Math.round((receivedLength / contentLength) * 100);
            setDownloadProgress((prev) => ({ ...prev, [item.id]: progress }));
          }
        }

        // * Create blob and trigger download link
        const blob = new Blob(chunks);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // * Extract user-friendly filename
        const gcsPath = item.videoGcsPath;
        const decodedFileName = decodeURIComponent(
          gcsPath.substring(gcsPath.lastIndexOf('/') + 1)
        );
        const userFriendlyFileName = decodedFileName.includes('-')
          ? decodedFileName.substring(decodedFileName.indexOf('-') + 1)
          : decodedFileName;

        link.setAttribute(
          'download',
          userFriendlyFileName || `sinners-media-${item.id}.mp4`
        ); // * Add default extension
        document.body.appendChild(link);
        link.click();

        // * Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setDownloadProgress((prev) => ({ ...prev, [item.id]: 100 })); // * Ensure it shows 100%
      } catch (error) {
        console.error('Download failed for:', item.title, error);
        setDownloadProgress((prev) => ({ ...prev, [item.id]: 'error' })); // * Mark as error
      }
    } // End loop

    // * Briefly show final status, then close
    setTimeout(() => {
      setIsDownloading(false);
      onClose();
    }, 1500); // * Slightly longer delay
  };

  return (
    // * Modal Backdrop
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4" // * Increased z-index
      onClick={!isDownloading ? onClose : undefined} // * Prevent close during download
    >
      {/* // * Modal Content */}
      <div
        className="bg-white border border-slate-200 shadow-2xl w-full max-w-lg text-left flex flex-col max-h-[90vh]" // * Max height
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 flex-shrink-0">
          <h3 className="text-lg font-semibold uppercase font-montserrat tracking-widest text-black">
            Download Media
          </h3>
          <button
            onClick={!isDownloading ? onClose : undefined}
            className="text-slate-500 hover:text-black transition-colors disabled:opacity-50"
            disabled={isDownloading}
            aria-label="Close download selection"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        {/* List of Items */}
        <div className="space-y-2 p-4 overflow-y-auto flex-grow">
          {mediaItems.map((item) => {
            const progress = downloadProgress[item.id];
            const isCompleted = progress === 100;
            const isError = progress === 'error';
            const showProgressBar =
              typeof progress === 'number' && !isCompleted;
            const isSelectable = item.allow_download && !isDownloading;

            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-3 rounded-md transition-colors ${
                  !item.allow_download
                    ? 'opacity-50 cursor-not-allowed' // * Style for non-downloadable
                    : isDownloading
                      ? 'cursor-default bg-slate-50' // * Style while downloading
                      : 'cursor-pointer hover:bg-slate-100' // * Style when selectable
                } ${selectedItems.has(item.id) && isSelectable ? 'bg-slate-100' : ''}`} // * Style when selected
                onClick={() => isSelectable && handleToggleSelection(item.id)}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  id={`download-${item.id}`}
                  checked={selectedItems.has(item.id)}
                  onChange={() => {}} // * Controlled by div click
                  readOnly
                  disabled={!item.allow_download || isDownloading}
                  className="h-5 w-5 border-2 border-slate-300 text-black focus:ring-black accent-black shrink-0 cursor-pointer disabled:cursor-not-allowed"
                  aria-labelledby={`item-title-${item.id}`}
                />
                {/* Thumbnail */}
                <img
                  src={`${CDN_BASE_URL}/${item.previewGcsPath}`}
                  alt="" // * Decorative
                  className="w-24 h-14 object-cover shrink-0 rounded" // * Added rounded
                />
                {/* Info & Progress */}
                <div className="flex-grow min-w-0">
                  <p
                    id={`item-title-${item.id}`}
                    className="font-semibold text-black truncate"
                  >
                    {item.title}
                  </p>
                  <p className="text-sm text-slate-500 truncate">
                    {item.client}
                  </p>
                  {/* Progress Bar Area */}
                  {(showProgressBar || isCompleted || isError) && (
                    <div className="mt-2 flex items-center gap-3">
                      {/* Bar */}
                      <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                        <div
                          className={`h-1 transition-all duration-200 rounded-full ${isError ? 'bg-red-500' : isCompleted ? 'bg-green-500' : 'bg-black'}`}
                          style={{
                            width: `${showProgressBar ? progress : 100}%`,
                          }}
                        ></div>
                      </div>
                      {/* Text */}
                      <span
                        className={`text-xs font-mono w-12 text-right shrink-0 ${isError ? 'text-red-500' : isCompleted ? 'text-green-500' : 'text-slate-500'}`}
                      >
                        {isError
                          ? 'Error'
                          : isCompleted
                            ? 'Done'
                            : `${progress}%`}
                      </span>
                    </div>
                  )}
                  {!item.allow_download && (
                    <p className="text-xs text-slate-400 mt-1 italic">
                      Download not allowed
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Footer */}
        <div className="p-6 mt-auto border-t border-slate-200 flex justify-end flex-shrink-0">
          <button
            onClick={handleDownload}
            disabled={selectedItems.size === 0 || isDownloading}
            className="w-48 text-center px-5 py-3 text-sm font-semibold uppercase tracking-wider bg-black text-white hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center" // * Added flex for loader
          >
            {isDownloading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isDownloading
              ? 'Downloading...'
              : `Download (${selectedItems.size})`}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * ? ReelVideoModal Component
 * Fullscreen modal specifically for playing videos within the reel context.
 * Includes custom header, navigation arrows, and analytics event logging.
 */
const ReelVideoModal = ({
  videos,
  currentIndex,
  onClose,
  onNavigate,
  cdnBaseUrl,
  logEvent,
  sessionCompletedMediaKey,
  totalMediaCount,
}) => {
  const videoRef = useRef(null);
  const currentVideo = videos[currentIndex]; // * Assumes videos[currentIndex] exists

  // * Determine playback URL (prioritize HLS)
  const videoSrc = useMemo(() => {
    if (!currentVideo) return '';
    return currentVideo.video_hls_path
      ? `${cdnBaseUrl}/${currentVideo.video_hls_path}`
      : currentVideo.videoGcsPath
        ? `${cdnBaseUrl}/${currentVideo.videoGcsPath}`
        : '';
  }, [currentVideo, cdnBaseUrl]);

  // ! Effect: Keyboard Navigation (Escape, Arrows)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowLeft') handlePrev();
      else if (event.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, currentIndex, videos.length]); // * Recalculate if index/length changes

  // ! Effect: HLS Player Setup
  useEffect(() => {
    if (!videoSrc || !videoRef.current) return;
    const videoElement = videoRef.current;
    let hlsInstance = null;

    const onManifestParsed = (event, data) => {
      if (hlsInstance && data.levels.length > 0) {
        // * Select highest quality level
        hlsInstance.currentLevel = data.levels.length - 1;
      }
    };

    if (videoSrc.includes('.m3u8')) {
      if (Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
        hlsInstance.loadSource(videoSrc);
        hlsInstance.attachMedia(videoElement);
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = videoSrc;
      } else {
        console.error('HLS not supported.');
        // Fallback or show error? Currently falls back to src attribute below.
      }
    } else {
      // * Standard video source
      videoElement.src = videoSrc;
    }

    return () => {
      // * Cleanup
      if (hlsInstance) {
        hlsInstance.off(Hls.Events.MANIFEST_PARSED, onManifestParsed);
        hlsInstance.destroy();
      }
    };
  }, [videoSrc]); // * Re-run if video source changes

  // ! Effect: Analytics Event Logging (Completion Tracking)
  useEffect(() => {
    if (
      !videoRef.current ||
      !logEvent ||
      !sessionCompletedMediaKey ||
      !currentVideo?.id
    ) {
      return;
    }

    const videoElement = videoRef.current;
    const currentVideoId = currentVideo.id;
    const VIEW_THRESHOLD = 0.9; // * Consider media completed after 90% watched
    let timeUpdateListenerActive = true; // * Flag to remove listener once threshold is met

    // * Function to log completion event and update sessionStorage
    const markMediaCompleted = (mediaId, duration) => {
      // * Check if already logged for this session
      let completed = JSON.parse(
        sessionStorage.getItem(sessionCompletedMediaKey) || '[]'
      );
      if (!completed.includes(mediaId)) {
        logEvent('media_completion', mediaId, duration); // * Log 'media_completion'
        completed.push(mediaId);
        sessionStorage.setItem(
          sessionCompletedMediaKey,
          JSON.stringify(completed)
        );

        // * Check if all media items in the reel have been completed
        if (totalMediaCount && completed.length === totalMediaCount) {
          logEvent('completion'); // * Log overall reel 'completion'
        }
      }
    };

    // * Listener for time updates to check threshold
    const handleTimeUpdate = () => {
      if (
        !timeUpdateListenerActive ||
        !videoElement?.duration ||
        videoElement.duration === 0
      )
        return;
      if (videoElement.currentTime / videoElement.duration >= VIEW_THRESHOLD) {
        markMediaCompleted(currentVideoId, videoElement.duration);
        videoElement.removeEventListener('timeupdate', handleTimeUpdate); // * Remove listener once completed
        timeUpdateListenerActive = false; // * Set flag
      }
    };

    // * Listener for video end event (alternative completion trigger)
    const handleEnded = () => {
      markMediaCompleted(currentVideoId, videoElement?.duration || null);
    };

    // * Attach listeners
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('ended', handleEnded);

    // * Cleanup listeners
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [
    videoRef,
    currentVideo,
    logEvent,
    sessionCompletedMediaKey,
    totalMediaCount,
  ]);

  // ! Navigation Handlers
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) onNavigate(currentIndex - 1);
  }, [currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < videos.length - 1) onNavigate(currentIndex + 1);
  }, [currentIndex, videos.length, onNavigate]);

  // ! Derived Data for Display
  const artistNames = useMemo(
    () =>
      (currentVideo?.artists || [])
        .map((a) => a.name)
        .join(', ')
        .toUpperCase(),
    [currentVideo?.artists]
  );

  return (
    // * Modal container
    <div
      className="fixed inset-0 bg-black z-[9999] flex flex-col"
      onClick={onClose}
    >
      {/* --- Custom Header --- */}
      <header
        className="flex-shrink-0 w-full h-[90px] md:h-[117px] bg-black text-white flex items-center justify-between px-6 md:px-12"
        onClick={(e) => e.stopPropagation()} // * Prevent closing modal when clicking header
      >
        <img
          src={sinnersLogoWhite}
          alt="Sinners and Saints Logo"
          className="h-5 md:h-6"
        />
        {/* // * Display Title, Client, Artists (Truncated) */}
        <div className="text-center font-montserrat text-xs md:text-sm uppercase tracking-wider text-white/90 px-4 truncate flex-1 min-w-0 mx-4">
          <span>{currentVideo?.title || 'Untitled'}</span>
          {currentVideo?.client && <span> - {currentVideo.client}</span>}
          {artistNames && <span> - {artistNames}</span>}
        </div>
        {/* // * Back Button */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-xs md:text-sm uppercase tracking-wider font-montserrat hover:opacity-70 transition-opacity flex-shrink-0"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          BACK TO SHOWREEL
        </button>
      </header>

      {/* --- Video Container --- */}
      <div
        className="flex-grow w-full flex-1 h-full flex items-center justify-center relative overflow-hidden px-4 sm:px-10 md:px-16 pb-4 sm:pb-8" // * Padding around video
        onClick={(e) => e.stopPropagation()} // * Prevent closing modal
      >
        {/* Previous Arrow */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-[10000] bg-black/30 hover:bg-black/60 text-white p-3 rounded-full transition-colors"
            aria-label="Previous video"
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
          </button>
        )}
        {/* Next Arrow */}
        {currentIndex < videos.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-[10000] bg-black/30 hover:bg-black/60 text-white p-3 rounded-full transition-colors"
            aria-label="Next video"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
        {/* --- Video Player Element --- */}
        {/* // * Using the custom InlineHlsPlayer component */}
        <InlineHlsPlayer
          key={videoSrc} // * Force re-render on src change
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-contain"
          controls
          autoPlay
          onClick={(e) => e.stopPropagation()} // * Prevent closing modal
          // preload="auto" // * Changed from metadata to auto for faster playback start in modal
        />
      </div>
    </div>
  );
};

// ========================================================================== //
// ! SECTION 2: MAIN COMPONENT - PublicReelPage
// ========================================================================== //

export default function PublicReelPage() {
  // ! State Variables
  const [data, setData] = useState(null); // * Holds fetched reel data { reelDbId, reelTitle, mediaItems }
  const [loading, setLoading] = useState(true); // * Tracks initial data fetch
  const [preloading, setPreloading] = useState(true); // * Controls initial preloader screen visibility
  const [error, setError] = useState(null); // * Stores data fetching errors
  // * Tracks the current slide index, initialized from sessionStorage
  const [currentSlide, setCurrentSlide] = useState(() => {
    // * Use useParams hook directly inside component body
    const { reelId } = useParams(); // * Get reelId here
    const savedSlide = sessionStorage.getItem(`reel_${reelId}_slide`);
    return savedSlide ? parseInt(savedSlide, 10) : 0;
  });
  const [isFullImageLoaded, setIsFullImageLoaded] = useState(false); // * Tracks if full-res image has loaded (for image slides)
  const [isInitialPlay, setIsInitialPlay] = useState(true); // * Tracks if it's the first playback attempt for analytics/UI
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false); // * Download modal visibility
  const [activeModalSlide, setActiveModalSlide] = useState(null); // * Index of video currently playing in the ReelVideoModal

  // ! Hooks & Refs
  const { reelId } = useParams(); // * Get reel short link ID from URL
  const videoRef = useRef(null); // * Ref for the main background video/image player
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation(); // * Likely not needed if using local preloading state

  // ! Derived State & Memoized Calculations
  const hasMultipleSlides = data?.mediaItems?.length > 1;
  const currentMediaItem = data?.mediaItems?.[currentSlide] || null;
  // * Check if *any* item in the reel is downloadable
  const isAnyMediaDownloadable = useMemo(
    () => data?.mediaItems?.some((item) => item.allow_download),
    [data]
  );
  // * Filter out non-video items for the ReelVideoModal
  const videoMediaItems = useMemo(() => {
    if (!data?.mediaItems) return [];
    return data.mediaItems.filter((item) => {
      const videoPath = item.videoGcsPath;
      // * Basic check based on path/extension
      const isActuallyVideo =
        videoPath &&
        ['.mp4', '.mov', '.webm', '.ogg', '.m3u8'].some((ext) =>
          videoPath.toLowerCase().endsWith(ext)
        );
      return isActuallyVideo;
    });
  }, [data]);
  // * Determine if the page is ready to start playback (data loaded, preloader finished)
  const isReadyToPlay = !loading && !preloading;
  // * Memoize derived properties of the current media item (type, URLs)
  const { isVideo, playbackUrl, imageUrl, previewUrl } = useMemo(() => {
    if (!currentMediaItem) return { isVideo: false };
    const videoPath = currentMediaItem.videoGcsPath;
    const hlsPath = currentMediaItem.video_hls_path;
    const previewPath = currentMediaItem.previewGcsPath;
    // * More robust video check
    const isActuallyVideo =
      videoPath &&
      ['.mp4', '.mov', '.webm', '.ogg', '.m3u8'].some((ext) =>
        videoPath.toLowerCase().endsWith(ext)
      );

    if (isActuallyVideo) {
      return {
        isVideo: true,
        playbackUrl: hlsPath
          ? `${CDN_BASE_URL}/${hlsPath}`
          : videoPath
            ? `${CDN_BASE_URL}/${videoPath}`
            : '',
        previewUrl: previewPath ? `${CDN_BASE_URL}/${previewPath}` : '',
      };
    } else {
      // * Assume image if not video
      return {
        isVideo: false,
        imageUrl: videoPath ? `${CDN_BASE_URL}/${videoPath}` : '', // * Path to full-res image stored in videoGcsPath
        previewUrl: previewPath ? `${CDN_BASE_URL}/${previewPath}` : '',
      };
    }
  }, [currentMediaItem]);
  // * Key for storing media completion status in sessionStorage
  const completedMediaKey = useMemo(
    () => (data?.reelDbId ? `completed_media_${data.reelDbId}` : null),
    [data?.reelDbId]
  );

  // ! Analytics Logging Callback
  const logEvent = useCallback(
    (eventType, mediaItemId = null, duration = null) => {
      if (!data?.reelDbId) return; // * Need reel ID for logging

      // * Get or create session ID
      let sessionId = sessionStorage.getItem(`session_id_${data.reelDbId}`);
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem(`session_id_${data.reelDbId}`, sessionId);
      }

      // * Construct payload
      const payload = {
        reel_id: data.reelDbId,
        session_id: sessionId,
        event_type: eventType,
        media_item_id: mediaItemId ?? currentMediaItem?.id, // * Use specific ID or current item's ID
        duration_seconds: duration !== null ? Math.round(duration) : null, // * Round duration
      };

      // * Send analytics data to backend (using fetch or sendBeacon)
      fetch(`${API_BASE_URL}/reels/log-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true, // * Important if called during page unload
      }).catch((err) =>
        console.error(`Failed to log analytics event [${eventType}]:`, err)
      );
    },
    [data?.reelDbId, currentMediaItem?.id] // * Dependencies
  );

  // ! Effects

  // * Effect 1: Initial Preloader Delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreloading(false);
    }, 500); // * Minimum preloader display time
    return () => clearTimeout(timer);
  }, []);

  // * Effect 2: Fetch Reel Data
  useEffect(() => {
    const fetchReelData = async () => {
      if (!reelId) {
        setError('Reel ID not found in URL.');
        setLoading(false);
        setPreloading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/reels/public/${reelId}`);
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.details ||
              `Reel not found or is not active (Status: ${response.status}).`
          );
        }
        const fetchedData = await response.json();
        if (
          !fetchedData ||
          !fetchedData.mediaItems ||
          fetchedData.mediaItems.length === 0
        ) {
          throw new Error('Reel data is empty or invalid.');
        }
        setData(fetchedData);
      } catch (err) {
        console.error('Fetch Reel Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReelData();
    window.scrollTo(0, 0); // * Scroll top on initial load/reel change
  }, [reelId]); // * Re-fetch if reelId changes

  // * Effect 3: Pause Background Video When Modal Opens
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const isModalCurrentlyOpen =
      activeModalSlide !== null || isDownloadModalOpen;

    if (isModalCurrentlyOpen) {
      if (!video.paused) video.pause();
    } else {
      // * Resume playback only if it's a video and ready to play
      if (isVideo && isReadyToPlay && video.paused) {
        video
          .play()
          .catch((e) => console.error('Resume playback prevented:', e));
      }
    }
  }, [activeModalSlide, isDownloadModalOpen, isVideo, isReadyToPlay]); // * Depend on modal states

  // * Effect 4: Handle Video Playback Logic on Slide Change
  useEffect(() => {
    setIsFullImageLoaded(false); // * Reset image loaded state on slide change
    const video = videoRef.current;

    if (isVideo && video && isReadyToPlay && activeModalSlide === null) {
      // * Attempt to restore playback position from sessionStorage if it's the saved slide
      const savedTimeStr = sessionStorage.getItem(`reel_${reelId}_time`);
      const savedSlideStr = sessionStorage.getItem(`reel_${reelId}_slide`);
      const savedTime = savedTimeStr ? parseFloat(savedTimeStr) : null;
      const savedSlide = savedSlideStr ? parseInt(savedSlideStr, 10) : null;

      // * Restore time only if it's the slide the user left off on
      if (
        savedTime !== null &&
        savedSlide === currentSlide &&
        video.readyState >= 1
      ) {
        // Check readyState
        video.currentTime = savedTime;
        console.log(
          `Restored video time to ${savedTime} for slide ${currentSlide}`
        );
        // * Clear saved time after restoring
        sessionStorage.removeItem(`reel_${reelId}_time`);
        // sessionStorage.removeItem(`reel_${reelId}_slide`); // Keep slide potentially for initial load
      } else {
        video.currentTime = 0; // * Otherwise, start from beginning
      }

      // * Attempt to play the video
      video
        .play()
        .catch((e) => console.error('Playback prevented on slide change:', e));
    } else if (!isVideo) {
      // * Handle image logic (if any specific action needed on slide change)
    }

    // * Cleanup? Pause video on slide change? Current logic relies on `shouldPlay` in HlsPlayer.
    // return () => { if (video && !video.paused) video.pause(); };
  }, [
    isReadyToPlay,
    isVideo,
    currentMediaItem,
    reelId,
    currentSlide,
    activeModalSlide,
  ]); // * Key dependencies

  // * Effect 5: Track Initial Play Event
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;
    const onPlaying = () => {
      if (isInitialPlay) setIsInitialPlay(false); // * Mark initial play has happened
    };
    video.addEventListener('playing', onPlaying);
    return () => video.removeEventListener('playing', onPlaying);
  }, [isVideo, isInitialPlay]); // * Depend on isVideo and isInitialPlay

  // * Effect 6: Analytics Logging & Auto-Advance Logic
  useEffect(() => {
    // * Exit if not ready, no data, or no current item
    if (
      !isReadyToPlay ||
      !data?.mediaItems ||
      !currentMediaItem ||
      !completedMediaKey
    )
      return;

    // * Log initial view event if not already logged for this session
    const sessionStartTimeKey = `session_start_time_${data.reelDbId}`;
    if (!sessionStorage.getItem(sessionStartTimeKey)) {
      sessionStorage.setItem(sessionStartTimeKey, Date.now().toString());
    }
    const viewLoggedKey = `view_logged_${data.reelDbId}`;
    if (!sessionStorage.getItem(viewLoggedKey)) {
      logEvent('view');
      sessionStorage.setItem(viewLoggedKey, 'true');
    }

    // * Auto-advance to the next slide
    const nextSlideHandler = () => {
      if (!hasMultipleSlides) return;
      setCurrentSlide((prev) => (prev + 1) % data.mediaItems.length);
    };

    // * Function to mark media as completed and log event
    const markMediaCompleted = (mediaId, duration) => {
      let completed = JSON.parse(
        sessionStorage.getItem(completedMediaKey) || '[]'
      );
      if (!completed.includes(mediaId)) {
        logEvent('media_completion', mediaId, duration);
        completed.push(mediaId);
        sessionStorage.setItem(completedMediaKey, JSON.stringify(completed));
        // * Log overall completion if all items are viewed
        if (completed.length === data.mediaItems.length) {
          logEvent('completion');
        }
      }
    };

    let cleanupFunctions = []; // * Store cleanup functions

    if (isVideo) {
      // * --- Video Logic ---
      const VIEW_THRESHOLD = 0.9;
      const videoElement = videoRef.current;
      if (videoElement) {
        let timeUpdateListenerActive = true;
        // * Check completion threshold on time update
        const handleTimeUpdate = () => {
          if (
            !timeUpdateListenerActive ||
            !videoElement?.duration ||
            videoElement.duration === 0
          )
            return;
          if (
            videoElement.currentTime / videoElement.duration >=
            VIEW_THRESHOLD
          ) {
            markMediaCompleted(currentMediaItem.id, videoElement.duration);
            videoElement.removeEventListener('timeupdate', handleTimeUpdate); // * Remove listener
            timeUpdateListenerActive = false;
          }
        };
        // * Mark completed and advance on video end
        const handleEnded = () => {
          markMediaCompleted(
            currentMediaItem.id,
            videoElement?.duration || null
          );
          if (hasMultipleSlides) nextSlideHandler();
        };

        videoElement.addEventListener('timeupdate', handleTimeUpdate);
        videoElement.addEventListener('ended', handleEnded);
        cleanupFunctions.push(() => {
          if (videoElement) {
            // Check element exists before removing listeners
            videoElement.removeEventListener('timeupdate', handleTimeUpdate);
            videoElement.removeEventListener('ended', handleEnded);
          }
        });
      }
    } else {
      // * --- Image Logic ---
      markMediaCompleted(currentMediaItem.id, 7); // * Assume 7s view duration for images
      const imageTimer = setTimeout(nextSlideHandler, 7000); // * Advance after 7s
      cleanupFunctions.push(() => clearTimeout(imageTimer));
    }

    // * Return a function that executes all registered cleanup functions
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [
    data,
    currentSlide,
    logEvent,
    isVideo,
    currentMediaItem,
    isReadyToPlay,
    hasMultipleSlides,
    completedMediaKey,
  ]); // * Dependencies

  // * Effect 7: Save State & Log Session Duration on Page Exit/Unload
  useEffect(() => {
    if (!reelId || !data?.reelDbId) return; // * Need IDs

    const handlePageExit = () => {
      // * Save current video time and slide index
      if (isVideo) {
        const videoElement = videoRef.current;
        if (videoElement?.currentTime > 0) {
          // Only save if time > 0
          sessionStorage.setItem(
            `reel_${reelId}_time`,
            videoElement.currentTime.toString()
          );
        } else {
          sessionStorage.removeItem(`reel_${reelId}_time`); // Clear if at start
        }
      } else {
        sessionStorage.removeItem(`reel_${reelId}_time`); // Clear for images
      }
      sessionStorage.setItem(`reel_${reelId}_slide`, currentSlide.toString());

      // * Log session duration
      const sessionStartTimeKey = `session_start_time_${data.reelDbId}`;
      const startTime = sessionStorage.getItem(sessionStartTimeKey);
      if (startTime) {
        const durationSeconds = Math.round(
          (Date.now() - parseInt(startTime, 10)) / 1000
        );
        if (durationSeconds > 0) {
          const sessionId = sessionStorage.getItem(
            `session_id_${data.reelDbId}`
          );
          if (sessionId) {
            const payload = {
              reel_id: data.reelDbId,
              session_id: sessionId,
              event_type: 'session_duration',
              media_item_id: null,
              duration_seconds: durationSeconds,
            };
            // * Use sendBeacon for reliability on unload
            if (navigator.sendBeacon) {
              navigator.sendBeacon(
                `${API_BASE_URL}/reels/log-event`,
                JSON.stringify(payload)
              );
            } else {
              // Fallback fetch (less reliable on true unload)
              fetch(`${API_BASE_URL}/reels/log-event`, {
                method: 'POST',
                body: JSON.stringify(payload),
                keepalive: true,
              }).catch(() => {});
            }
          }
        }
        // * Clear start time after logging
        sessionStorage.removeItem(sessionStartTimeKey);
      }
    };

    window.addEventListener('beforeunload', handlePageExit); // * For tab close/refresh
    window.addEventListener('pagehide', handlePageExit); // * For mobile backgrounding/bfcache

    // * Cleanup: remove listeners and *also call handler* on component unmount (React navigation)
    return () => {
      window.removeEventListener('beforeunload', handlePageExit);
      window.removeEventListener('pagehide', handlePageExit);
      handlePageExit(); // * Ensure state is saved/logged on React navigation away
    };
  }, [reelId, data, currentSlide, isVideo]); // * Dependencies updated

  // ! Navigation Handlers
  const nextSlide = useCallback(() => {
    if (!hasMultipleSlides || !data?.mediaItems) return;
    setCurrentSlide((prev) => (prev + 1) % data.mediaItems.length);
  }, [hasMultipleSlides, data?.mediaItems]);

  const prevSlide = useCallback(() => {
    if (!hasMultipleSlides || !data?.mediaItems) return;
    setCurrentSlide(
      (prev) => (prev - 1 + data.mediaItems.length) % data.mediaItems.length
    );
  }, [hasMultipleSlides, data?.mediaItems]);

  // ! Derived Data for Display
  const artistNames = useMemo(
    () =>
      (currentMediaItem?.artists || [])
        .map((a) => a.name)
        .join(', ')
        .toUpperCase(),
    [currentMediaItem?.artists]
  );
  // * Get artist photo from the *first* artist of the *first* media item (assumption)
  const artistPhotoUrl = useMemo(() => {
    const firstArtist = data?.mediaItems?.[0]?.artists?.[0];
    return firstArtist?.photoGcsPath
      ? `${CDN_BASE_URL}/${firstArtist.photoGcsPath}`
      : '';
  }, [data?.mediaItems]);
  const artistDescription = useMemo(
    () => data?.mediaItems?.[0]?.artists?.[0]?.description || '',
    [data?.mediaItems]
  );
  const artistNameDisplay = useMemo(
    () => data?.mediaItems?.[0]?.artists?.[0]?.name || '',
    [data?.mediaItems]
  );

  // ! Effect: Body Overflow Control for Modals
  useEffect(() => {
    const isModalOpen = isDownloadModalOpen || activeModalSlide !== null;
    document.body.style.overflow = isModalOpen ? 'hidden' : '';
    // * Cleanup
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDownloadModalOpen, activeModalSlide]);

  // ! Render Logic

  return (
    <>
      {/* --- Preloader --- */}
      <AnimatePresence>
        {(preloading || loading) && ( // * Show if either initial delay or data fetching is active
          <motion.div
            key="preloader"
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            <Preloader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Modals (Download & Video) --- */}
      <AnimatePresence>
        {isDownloadModalOpen && data?.mediaItems && (
          <motion.div
            key="download-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DownloadModal
              isOpen={isDownloadModalOpen}
              onClose={() => setIsDownloadModalOpen(false)}
              mediaItems={data.mediaItems}
            />
          </motion.div>
        )}
        {activeModalSlide !== null && videoMediaItems.length > 0 && (
          <motion.div
            key="video-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ReelVideoModal
              videos={videoMediaItems}
              currentIndex={activeModalSlide}
              onClose={() => setActiveModalSlide(null)}
              onNavigate={setActiveModalSlide}
              cdnBaseUrl={CDN_BASE_URL}
              logEvent={logEvent}
              sessionCompletedMediaKey={completedMediaKey}
              totalMediaCount={data?.mediaItems?.length}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Main Content (Rendered after loading and if data exists) --- */}
      {!loading && data && (
        <div className="bg-white text-black">
          {/* --- Section 1: Main Viewer (Video or Image) --- */}
          <section className="relative w-full h-screen overflow-hidden bg-black">
            {/* Clickable Overlay to open Video Modal (only for videos) */}
            <div
              className={`absolute inset-0 z-10 ${isVideo ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => {
                if (isVideo) {
                  // * Find the index within the *filtered* videoMediaItems array
                  const videoIndex = videoMediaItems.findIndex(
                    (v) => v.id === currentMediaItem?.id
                  );
                  if (videoIndex !== -1) {
                    setActiveModalSlide(videoIndex);
                  }
                }
              }}
              role={isVideo ? 'button' : undefined}
              aria-label={
                isVideo ? `Expand video: ${currentMediaItem?.title}` : undefined
              }
            >
              {/* Animated content switching (Video/Image) */}
              <AnimatePresence initial={false} mode="wait">
                {isVideo ? (
                  // * Video Player
                  <motion.div
                    key={currentSlide + '-video'} // * Ensure key changes on slide
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <InlineHlsPlayer
                      ref={videoRef}
                      src={playbackUrl}
                      previewSrc={previewUrl} // Pass preview URL
                      playsInline
                      muted // * Background video is muted
                      loop={false} // * Do not loop background video; rely on 'ended' event
                      autoPlay={isReadyToPlay} // * Autoplay when ready
                      className="w-full h-full object-cover"
                      // * Add preload="metadata" if not handled by InlineHlsPlayer
                    />
                  </motion.div>
                ) : (
                  // * Image Display (with preview fade)
                  // ! Using key={currentSlide + '-image'} ensures transitions
                  <motion.div
                    key={currentSlide + '-image'}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Low-res Preview (optional, can remove if full image loads fast) */}
                    {previewUrl && !isFullImageLoaded && (
                      <img
                        src={previewUrl}
                        alt="" // Decorative
                        className="absolute inset-0 w-full h-full object-cover blur-sm" // Small blur
                        aria-hidden="true"
                      />
                    )}
                    {/* Full-res Image */}
                    <img
                      src={imageUrl}
                      alt={currentMediaItem?.title || 'Reel media'}
                      onLoad={() => setIsFullImageLoaded(true)}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isFullImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Dark overlay for text contrast */}
              <div className="absolute inset-0 bg-black bg-opacity-30" />
            </div>

            {/* Navigation Arrows */}
            {hasMultipleSlides && (
              <SliderArrow direction="left" onClick={prevSlide} />
            )}
            {hasMultipleSlides && (
              <SliderArrow direction="right" onClick={nextSlide} />
            )}

            {/* Text Overlays */}
            <div className="absolute inset-0 text-white pointer-events-none z-20">
              {/* Reel Title (Top Center) */}
              <div className="w-full h-full flex justify-center items-start pt-[15vh] px-4">
                <h1 className="text-3xl md:text-4xl font-bold uppercase font-montserrat text-center text-shadow-md tracking-widest md:tracking-[0.2em] break-words">
                  {data.reelTitle}
                </h1>
              </div>
              {/* Item Info (Bottom Left) */}
              <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 font-montserrat text-shadow-md max-w-[calc(100%-16rem)]">
                {' '}
                {/* Max width */}
                {currentMediaItem?.client && (
                  <p className="text-xl md:text-2xl font-semibold truncate">
                    {currentMediaItem.client}
                  </p>
                )}
                {currentMediaItem?.title && (
                  <p className="text-md md:text-lg opacity-80 truncate">
                    {currentMediaItem.title}
                  </p>
                )}
              </div>
              {/* Artist Info (Bottom Right) */}
              <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 font-montserrat text-right text-shadow-md max-w-[calc(100%-16rem)]">
                {' '}
                {/* Max width */}
                {artistNames && (
                  <>
                    <p className="text-sm md:text-md uppercase opacity-80 truncate">
                      {currentMediaItem?.craft}
                    </p>
                    <p className="text-lg md:text-xl font-semibold truncate">
                      {artistNames}
                    </p>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* --- Section 2: Work Grid --- */}
          <section className="pt-20 pb-10 md:pt-32 md:pb-16 px-6 lg:px-8 bg-white">
            <div className="max-w-screen-2xl mx-auto">
              {/* Section Header & Download Button */}
              <div className="flex justify-between items-center mb-16 flex-wrap gap-4">
                <h2 className="text-3xl md:text-4xl font-bold uppercase text-left font-montserrat text-black">
                  Work
                </h2>
                {/* Conditionally render download button */}
                {isAnyMediaDownloadable && (
                  <button
                    onClick={() => setIsDownloadModalOpen(true)}
                    className="px-6 py-2.5 text-xs font-semibold uppercase tracking-widest bg-transparent border border-black text-black hover:bg-black hover:text-white transition-colors"
                  >
                    Download Media
                  </button>
                )}
              </div>
              {/* Grid of Media Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {data.mediaItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="group relative cursor-pointer overflow-hidden rounded-md" // * Added rounded-md
                    onClick={() => {
                      setCurrentSlide(index); // * Set current slide index
                      window.scrollTo({ top: 0, behavior: 'smooth' }); // * Scroll to top smoothly
                    }}
                    role="button"
                    tabIndex={0} // Make it focusable
                    onKeyDown={(e) => {
                      // Allow activation with Enter/Space
                      if (e.key === 'Enter' || e.key === ' ') {
                        setCurrentSlide(index);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  >
                    {/* Thumbnail Image */}
                    <img
                      src={`${CDN_BASE_URL}/${item.previewGcsPath}`}
                      alt={`${item.client || ''} - ${item.title || 'Media thumbnail'}`} // * Improved alt text
                      className="w-full h-auto object-cover aspect-video transition-transform duration-300 group-hover:scale-105"
                      loading="lazy" // * Lazy load grid images
                    />
                    {/* Text Overlay */}
                    <div className="absolute top-0 left-0 p-4 w-full bg-gradient-to-b from-black/50 to-transparent">
                      {' '}
                      {/* Added gradient */}
                      {item.client && (
                        <p className="font-semibold text-base text-white uppercase font-montserrat text-shadow-sm truncate">
                          {item.client}
                        </p>
                      )}
                      {item.title && (
                        <p className="text-xs text-white/90 uppercase font-montserrat text-shadow-sm truncate">
                          {item.title}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* --- Section 3: Artist Bio (Conditional) --- */}
          {/* // * Render only if the first artist has a photo */}
          {artistPhotoUrl && (
            <section className="pt-10 pb-20 md:pt-16 md:pb-32 px-8 sm:px-12 lg:px-16 bg-white">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-16 items-start">
                {/* Artist Photo */}
                <div className="md:col-span-2">
                  <img
                    src={artistPhotoUrl}
                    alt={artistNameDisplay} // * Use fetched name for alt text
                    className="w-full h-auto object-cover aspect-square" // * Ensure aspect ratio
                    loading="lazy"
                  />
                </div>
                {/* Artist Name & Bio */}
                <div className="md:col-span-3 flex flex-col">
                  <h2 className="text-3xl md:text-4xl font-bold uppercase mb-6 font-montserrat text-black">
                    {artistNameDisplay}
                  </h2>
                  {artistDescription && (
                    // * Render description using whitespace-pre-line for formatting
                    <p className="font-semibold text-sm leading-relaxed tracking-normal [word-spacing:0.1em] text-[#1D1D1D] whitespace-pre-line">
                      {artistDescription}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* --- Error State --- */}
      {!loading && error && (
        <div className="h-screen w-full bg-white flex flex-col items-center justify-center text-center p-8">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">
            Error Loading Reel
          </h1>
          <p className="text-red-600 dark:text-red-400">{error}</p>
          {/* // ? Add a button to go back or retry? */}
        </div>
      )}

      {/* --- Empty State --- */}
      {!loading && !data && !error && (
        <div className="h-screen w-full bg-white flex flex-col items-center justify-center text-center p-8">
          <FileText className="w-16 h-16 text-slate-400 mb-4" />
          <h1 className="text-3xl font-bold text-black mb-4">
            Reel Not Found or Empty
          </h1>
          <p className="text-slate-500">
            This reel link may be invalid, the reel might be inactive, or it
            contains no media items.
          </p>
          {/* // ? Add a button to go home? */}
        </div>
      )}
    </>
  );
}
