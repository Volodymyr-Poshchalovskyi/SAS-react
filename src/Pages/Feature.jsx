// src/Pages/Feature.jsx

// ! React & Library Imports
import React, {
  useLayoutEffect,
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext, // * Added useContext
} from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url'; // * PDF worker
import {
  Loader2,
  AlertTriangle,
  Expand,
  Minimize,
  Eye,
  EyeOff,
  KeyRound,
  FileText,
  Download,
  Replace,
  CheckSquare,
  Sparkles,
  Check,
  Copy, // * Icons
} from 'lucide-react';

// ! Local Imports (Components, Context, Data)
import PreloaderBanner from '../Components/PreloaderBanner';
import HlsVideoPlayer from '../Components/HlsVideoPlayer';
import { useAnimation } from '../context/AnimationContext';
import { DataRefreshContext } from '../AdminComponents/Layout/AdminLayout.jsx'; // * Context for manual refresh (Although not used in fetch effect here)
import { featureProjectData } from '../Data/FeatureProjectData'; // * Static data for the video section

// ! Configuration & Constants
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc; // * Set up PDF worker path
const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';
const API_BASE_URL = import.meta.env.VITE_API_URL; // * Backend URL

// ! Animation Variants
const nameAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};
const sliderVariants = {
  // * For PDF page sliding
  enter: (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: (d) => ({
    x: d < 0 ? '100%' : '-100%',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeIn' },
  }),
};
const inputClasses =
  'flex h-10 w-full rounded-md border border-slate-300 bg-white dark:bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800/50';

// ========================================================================== //
// ! SECTION 1: HELPER COMPONENTS
// ========================================================================== //

/**
 * ? Modal Component
 * Generic modal for confirmations, status display (processing, success, error).
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  confirmText,
  onConfirm,
  successTitle = 'Success',
  successMessage,
}) => {
  const [actionStatus, setActionStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // * Effect for Escape key and state reset
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && actionStatus === 'idle') onClose();
    };
    if (isOpen) {
      setActionStatus('idle');
      setErrorMessage('');
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose, actionStatus]);

  if (!isOpen) return null;

  // * Confirmation handler with status updates
  const handleConfirmClick = async () => {
    setActionStatus('processing');
    setErrorMessage('');
    try {
      await onConfirm();
      setActionStatus('success');
      setTimeout(onClose, 2000); // Auto-close on success
    } catch (error) {
      setActionStatus('error');
      setErrorMessage(error.message || 'An unexpected error occurred.');
    }
  };

  const handleClose = () => {
    if (actionStatus !== 'processing') onClose();
  };
  const baseButtonClasses =
    'inline-flex items-center justify-center py-2 px-4 rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={handleClose}
    >
      <div
        className="relative w-full max-w-md p-6 m-4 bg-white rounded-xl shadow-xl dark:bg-slate-900"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {actionStatus === 'success' ? (
          <div className="text-center py-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">
              {successTitle}
            </h3>
            {successMessage && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {successMessage}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                {title}
              </h3>
              <button
                onClick={handleClose}
                disabled={actionStatus === 'processing'}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-4 text-slate-600 dark:text-slate-300">
              {children}
            </div>
            {actionStatus === 'error' && errorMessage && (
              <div className="mt-4 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleClose}
                disabled={actionStatus === 'processing'}
                className={`${baseButtonClasses} border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClick}
                disabled={actionStatus === 'processing'}
                className={`${baseButtonClasses} text-white bg-teal-600 hover:bg-teal-700 focus-visible:ring-teal-500`}
              >
                {actionStatus === 'processing' && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {confirmText}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * ? FormSection Component
 * Styled container for form sections.
 */
const FormSection = ({ title, children }) => (
  <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl p-6">
    {title && (
      <h2 className="text-base font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">
        {title}
      </h2>
    )}
    {children}
  </div>
);

/**
 * ? FormField Component
 * Basic label and child input wrapper.
 */
const FormField = ({ label, children }) => (
  <div className="mb-4">
    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}
    </label>
    {children}
  </div>
);

/**
 * ? PasswordInputField Component
 * Input field with visibility toggle, state managed by parent.
 */
const PasswordInputField = ({
  label,
  value,
  onChange,
  isVisible,
  onToggleVisibility,
}) => (
  <FormField label={label}>
    <div className="relative">
      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type={isVisible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder="••••••••••••"
        className={`${inputClasses} pl-10 pr-10`}
        autoComplete="current-password"
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
      >
        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </FormField>
);

/**
 * ? PasswordPrompt Component
 * Form specifically for entering the feature PDF password.
 */
const PasswordPrompt = ({
  password,
  setPassword,
  handleSubmit,
  loading,
  error,
}) => (
  <div className="max-w-sm mx-auto text-center">
    <div className="mb-10">
      <h2 className="text-xl font-semibold text-black mb-2 tracking-wider uppercase">
        ACCESS REQUIRED
      </h2>
      <p className="text-xs text-gray-500 tracking-wider uppercase">
        PLEASE ENTER THE PASSWORD TO VIEW THE DOCUMENT
      </p>
    </div>
    {error && (
      <p className="text-red-500 text-xs mb-4" role="alert">
        {error}
      </p>
    )}
    <form onSubmit={handleSubmit} className="text-left space-y-6">
      <div>
        <label
          htmlFor="feature-password"
          className="block text-xs font-semibold text-black mb-2 uppercase tracking-wider"
        >
          PASSWORD
        </label>
        <input
          type="password"
          id="feature-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter password"
          className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 text-sm text-black placeholder:text-gray-400"
          autoComplete="current-password"
          aria-required="true"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 mt-8 bg-black text-white font-semibold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />
        ) : null}
        {loading ? 'VERIFYING...' : 'Confirm'}
      </button>
    </form>
  </div>
);

/**
 * ? VideoTitleOverlay Component
 * Overlay displayed on top of the feature video section.
 */
const VideoTitleOverlay = ({
  title,
  client,
  projectSlug,
  isPreloaderActive,
}) => (
  <div className="absolute inset-0 z-10 flex items-end justify-center text-center p-8 pb-24 text-white pointer-events-none">
    <motion.div
      className="flex flex-col items-center gap-4"
      variants={nameAnimation}
      initial="hidden"
      animate={!isPreloaderActive ? 'visible' : 'hidden'}
    >
      <p className="font-chanel text-2xl sm:text-4xl text-shadow">{title}</p>
      <p className="font-light text-sm tracking-widest uppercase text-shadow">
        {client}
      </p>
      {/* // * Link to a related project page (ensure this route exists) */}
      <Link
        to={`/projects/${projectSlug}`} // TODO: Verify '/projects/' route exists and handles slugs
        className="py-3 px-8 text-xs font-normal bg-white text-black border-2 border-white hover:bg-transparent hover:text-white transition-colors duration-300 pointer-events-auto" // * Enable pointer events for the link
      >
        See Project
      </Link>
    </motion.div>
  </div>
);

// ========================================================================== //
// ! SECTION 2: MAIN COMPONENT - Feature Page
// ========================================================================== //

export default function Feature() {
  // ! Context & State
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();

  // * Authentication State
  const [isSessionChecking, setIsSessionChecking] = useState(true); // * Initial check for stored session
  const [isAuthenticated, setIsAuthenticated] = useState(false); // * Is user authenticated to view PDF?
  const [passwordInput, setPasswordInput] = useState(''); // * Input value for password prompt
  const [isVerifying, setIsVerifying] = useState(false); // * Loading state for password verification
  const [authError, setAuthError] = useState(''); // * Error message for password prompt

  // * PDF State
  const [numPages, setNumPages] = useState(null); // * Total pages in the PDF
  const [[currentPage, direction], setCurrentPage] = useState([1, 0]); // * Current page number and navigation direction
  const [pdfFile, setPdfFile] = useState(null); // * Metadata of the current PDF {id, title, gcs_path, ...}
  const [pdfUrl, setPdfUrl] = useState(null); // * Signed URL for the PDF blob
  const [isLoadingPdf, setIsLoadingPdf] = useState(true); // * Loading state for PDF fetching/rendering
  const [pdfError, setPdfError] = useState(null); // * Error message if PDF loading fails
  const [pdfWidth, setPdfWidth] = useState(0); // * Calculated width for the PDF Page component

  // * UI State
  const [isFullscreen, setIsFullscreen] = useState(false); // * Is PDF viewer in fullscreen mode?
  const [areControlsVisible, setAreControlsVisible] = useState(true); // * Visibility of controls in fullscreen
  const { refreshKey } = useContext(DataRefreshContext); // * Used for manual refresh trigger (though fetch effect doesn't use it here)

  // ! Refs
  const pdfContainerRef = useRef(null); // * Ref for the PDF container element (for size and fullscreen)
  const controlsTimeoutRef = useRef(null); // * Ref for the fullscreen controls visibility timeout
  const isWheelingRef = useRef(false); // * Ref to debounce wheel events for pagination
  const touchStartRef = useRef(null); // * Ref to store touch start position for swipe detection
  const minSwipeDistance = 50; // * Minimum horizontal distance for swipe gesture

  // ! Derived State
  // * Key for storing PDF viewing stats in sessionStorage, specific to the current PDF file ID
  const sessionStatsKey = pdfFile ? `pdf_stats_${pdfFile.id}` : null;

  // ! Effects

  // * Effect 1: Check Session Authentication on Mount
  useEffect(() => {
    const verifySession = async () => {
      const authDataString = localStorage.getItem('featureAuth');
      if (!authDataString) {
        setIsSessionChecking(false);
        return; // * No stored session
      }

      try {
        const authData = JSON.parse(authDataString);
        const oneHour = 60 * 60 * 1000;
        // * Check if stored session timestamp is older than 1 hour
        if (Date.now() - authData.timestamp > oneHour) {
          localStorage.removeItem('featureAuth');
          setIsSessionChecking(false);
          return; // * Session expired
        }

        // * Verify the stored password 'version' against the current server version
        const response = await fetch(
          `${API_BASE_URL}/feature-pdf-password/version`
        );
        if (!response.ok) throw new Error('Could not verify password version.');
        const serverData = await response.json();

        // * If versions match, user is authenticated
        if (serverData.version && serverData.version === authData.version) {
          setIsAuthenticated(true);
        } else {
          // * Versions mismatch (password changed), clear stored session
          localStorage.removeItem('featureAuth');
        }
      } catch (error) {
        console.error('Session verification failed:', error);
        localStorage.removeItem('featureAuth'); // * Clear potentially invalid session data on error
      } finally {
        setIsSessionChecking(false); // * Finished checking
      }
    };
    verifySession();
  }, []); // * Run only once on mount

  // * Effect 2: Fetch PDF Data after Authentication
  useEffect(() => {
    const fetchLatestPdf = async () => {
      if (!isAuthenticated) return; // * Only run if authenticated

      setIsLoadingPdf(true);
      setPdfError(null);
      setPdfUrl(null); // * Clear previous URL
      setPdfFile(null); // * Clear previous file metadata

      try {
        // * 1. Get metadata (title, gcs_path) of the *current* PDF from backend
        const metaResponse = await fetch(`${API_BASE_URL}/feature-pdf/current`);
        if (!metaResponse.ok)
          throw new Error(`Could not get PDF info: ${metaResponse.statusText}`);
        const pdfData = await metaResponse.json();

        // * Check if a PDF has actually been uploaded
        if (!pdfData || !pdfData.gcs_path) {
          throw new Error('No feature document is currently available.');
        }
        setPdfFile(pdfData); // * Store the metadata

        // * 2. Get a signed read URL for the PDF from backend
        const urlResponse = await fetch(`${API_BASE_URL}/generate-read-urls`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gcsPaths: [pdfData.gcs_path] }),
        });
        if (!urlResponse.ok)
          throw new Error(
            `Could not get secure URL: ${urlResponse.statusText}`
          );
        const urlsMap = await urlResponse.json();
        const signedUrl = urlsMap[pdfData.gcs_path];

        if (!signedUrl)
          throw new Error('Failed to retrieve a valid document URL.');
        setPdfUrl(signedUrl); // * Store the signed URL for react-pdf
      } catch (error) {
        console.error('Failed to load PDF:', error);
        setPdfError(error.message);
      } finally {
        setIsLoadingPdf(false);
      }
    };
    fetchLatestPdf();
  }, [isAuthenticated]); // * Re-run if authentication status changes

  // * Effect 3: Send PDF View Statistics on Page Unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // * Check if we have necessary info (stats key, total pages)
      if (sessionStatsKey && numPages && pdfFile?.id) {
        const statsRaw = sessionStorage.getItem(sessionStatsKey);
        if (statsRaw) {
          try {
            const stats = JSON.parse(statsRaw);
            const percentage = Math.min(
              100,
              (stats.maxPageReached / numPages) * 100
            ); // * Calculate completion percentage
            const payload = {
              pdf_file_id: pdfFile.id,
              completion_percentage: percentage,
            };
            const logUrl = `${API_BASE_URL}/feature-pdf/log-view`;
            // * Use sendBeacon for reliable data transmission during page unload
            if (navigator.sendBeacon) {
              navigator.sendBeacon(logUrl, JSON.stringify(payload));
            } else {
              // Fallback for older browsers (less reliable on unload)
              fetch(logUrl, {
                method: 'POST',
                body: JSON.stringify(payload),
                keepalive: true,
              });
            }
            sessionStorage.removeItem(sessionStatsKey); // * Clear session stats after sending
          } catch (e) {
            console.error('Error processing/sending PDF stats:', e);
          }
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    // * Cleanup listener
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // * Also attempt to send stats if component unmounts *before* page unload (e.g., navigation)
      handleBeforeUnload();
    };
    // * Dependencies include everything needed to construct and send the stats
  }, [sessionStatsKey, numPages, pdfFile]);

  // * Effect 4: Handle Fullscreen Change Events
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // * Effect 5: Manage Fullscreen Controls Visibility (Timeout)
  useEffect(() => {
    // * Function to handle mouse/touch activity in fullscreen
    const handleActivity = () => {
      if (!areControlsVisible) setAreControlsVisible(true); // * Show controls if hidden
      resetControlsTimeout(); // * Reset the hide timer
    };

    if (isFullscreen) {
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('touchstart', handleActivity); // * Also listen for touch
      handleActivity(); // * Show controls immediately on entering fullscreen
    }

    // * Cleanup: remove listeners and clear timeout
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isFullscreen, areControlsVisible, resetControlsTimeout]); // * Depends on fullscreen state and controls visibility

  // * Effect 6: Handle Keyboard, Wheel, and Touch Events for PDF Pagination
  useEffect(() => {
    // * Only attach listeners if authenticated and PDF container exists
    if (!isAuthenticated || !pdfContainerRef.current) return;

    const container = pdfContainerRef.current;

    // * Keyboard navigation
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ')
        paginate(1); // * Next page
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') paginate(-1); // * Previous page
      // * Prevent default space bar scroll
      if (e.key === ' ') e.preventDefault();
    };

    // * Mouse wheel navigation (with debouncing)
    const handleWheel = (e) => {
      // * Prevent default page scroll within the PDF container
      e.preventDefault();
      if (isWheelingRef.current) return; // * Debounce check

      // * Check for significant horizontal scroll delta
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 20) {
        isWheelingRef.current = true; // * Set debounce flag
        paginate(e.deltaX > 0 ? 1 : -1); // * Paginate based on horizontal direction
        setTimeout(() => {
          isWheelingRef.current = false;
        }, 300); // * Reset debounce after 300ms
      }
      // * Optional: Add vertical scroll pagination if needed
      // else if (Math.abs(e.deltaY) > 20) {
      //    isWheelingRef.current = true;
      //    paginate(e.deltaY > 0 ? 1 : -1);
      //    setTimeout(() => { isWheelingRef.current = false; }, 300);
      // }
    };

    // * Touch swipe navigation
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        // * Only track single finger swipes
        touchStartRef.current = e.touches[0].clientX;
      }
    };
    const handleTouchEnd = (e) => {
      if (touchStartRef.current === null || e.changedTouches.length !== 1)
        return;
      const touchEnd = e.changedTouches[0].clientX;
      const dist = touchStartRef.current - touchEnd; // * Calculate swipe distance

      if (dist > minSwipeDistance)
        paginate(1); // * Swipe left -> Next page
      else if (dist < -minSwipeDistance) paginate(-1); // * Swipe right -> Previous page

      touchStartRef.current = null; // * Reset touch start position
    };

    // * Attach event listeners
    document.addEventListener('keydown', handleKeyDown);
    container.addEventListener('wheel', handleWheel, { passive: false }); // * passive: false needed for preventDefault
    container.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    // * Cleanup listeners
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [paginate, isAuthenticated]); // * Depends on paginate function and auth state

  // * Effect 7: Scroll to Top when Preloader finishes
  useLayoutEffect(() => {
    if (!isPreloaderActive) {
      window.scrollTo(0, 0);
    }
  }, [isPreloaderActive]);

  // * Effect 8: Update PDF Width on Resize/Fullscreen Change
  useLayoutEffect(() => {
    if (!isAuthenticated) return; // * Only run if PDF is potentially visible
    const updateWidth = () => {
      if (pdfContainerRef.current) {
        setPdfWidth(pdfContainerRef.current.clientWidth);
      }
    };
    updateWidth(); // * Initial measurement
    window.addEventListener('resize', updateWidth); // * Update on resize
    // * Cleanup listener
    return () => window.removeEventListener('resize', updateWidth);
  }, [isFullscreen, isAuthenticated]); // * Re-measure if fullscreen or auth status changes

  // * Effect 9: Manage Body Overflow and Scroll Snap Class
  useEffect(() => {
    document.body.style.overflow = isPreloaderActive ? 'hidden' : ''; // * Disable scroll during preloader
    const htmlElement = document.documentElement;
    htmlElement.classList.add('scroll-snap-enabled'); // * Enable scroll snapping for the page
    // * Cleanup
    return () => {
      document.body.style.overflow = ''; // * Ensure scroll is enabled on unmount
      htmlElement.classList.remove('scroll-snap-enabled');
    };
  }, [isPreloaderActive]);

  // ! Handlers & Callbacks

  /**
   * ? onDocumentLoadSuccess Callback (for react-pdf)
   * Called when the PDF document is successfully loaded. Sets the total number of pages
   * and initializes or retrieves page view statistics from sessionStorage.
   */
  const onDocumentLoadSuccess = useCallback(
    ({ numPages: nextNumPages }) => {
      setNumPages(nextNumPages); // * Store total pages

      // * Initialize or load session stats
      if (sessionStatsKey) {
        let stats = { maxPageReached: 1, currentPage: 1 }; // * Default stats
        const existingStatsRaw = sessionStorage.getItem(sessionStatsKey);
        if (existingStatsRaw) {
          try {
            const existingStats = JSON.parse(existingStatsRaw);
            // * Use stored values if valid, otherwise keep defaults
            stats.maxPageReached =
              existingStats.maxPageReached > 0
                ? existingStats.maxPageReached
                : 1;
            stats.currentPage =
              existingStats.currentPage > 0 &&
              existingStats.currentPage <= nextNumPages
                ? existingStats.currentPage
                : 1;
          } catch (e) {
            console.error('Error parsing stored PDF stats:', e);
            // * If parsing fails, use defaults
          }
        }
        sessionStorage.setItem(sessionStatsKey, JSON.stringify(stats)); // * Save initialized/loaded stats
        setCurrentPage([stats.currentPage, 0]); // * Set the initial page based on stats
      } else {
        setCurrentPage([1, 0]); // * Default to page 1 if stats key isn't ready
      }
    },
    [sessionStatsKey] // * Depends on the session key (derived from pdfFile.id)
  );

  /**
   * ? paginate Function
   * Handles changing the current PDF page and updating view statistics.
   * Also resets the fullscreen controls timeout.
   */
  const paginate = useCallback(
    (newDirection) => {
      // * Calculate the target page number
      const newPageRaw = currentPage[0] + newDirection; // * Use currentPage[0] for current page number
      // * Clamp the page number within valid bounds [1, numPages]
      const newPage = Math.max(1, Math.min(newPageRaw, numPages || 1));

      // * Only update state if the page actually changed
      if (newPage !== currentPage[0]) {
        setCurrentPage([newPage, newDirection]); // * Update state with new page and direction

        // * Update session statistics
        if (sessionStatsKey) {
          const statsRaw = sessionStorage.getItem(sessionStatsKey);
          if (statsRaw) {
            try {
              const stats = JSON.parse(statsRaw);
              stats.currentPage = newPage;
              stats.maxPageReached = Math.max(stats.maxPageReached, newPage); // * Track furthest page reached
              sessionStorage.setItem(sessionStatsKey, JSON.stringify(stats));
            } catch (e) {
              console.error('Error updating PDF stats:', e);
            }
          }
        }
      }
      // * Reset fullscreen controls timeout on any pagination attempt
      if (isFullscreen) resetControlsTimeout();
    },
    [currentPage, numPages, isFullscreen, sessionStatsKey, resetControlsTimeout] // * Dependencies
  );

  /**
   * ? handlePasswordSubmit
   * Handles the submission of the password prompt form.
   * Calls the backend verification endpoint and updates authentication state.
   */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setAuthError('Password cannot be empty.');
      return;
    }
    setIsVerifying(true);
    setAuthError('');
    try {
      const response = await fetch(
        `${API_BASE_URL}/feature-pdf-password/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: passwordInput }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        // * Store timestamp and password version in localStorage on success
        const authData = { timestamp: Date.now(), version: data.version };
        localStorage.setItem('featureAuth', JSON.stringify(authData));
        setIsAuthenticated(true); // * Update auth state
      } else {
        const errorData = await response.json().catch(() => ({})); // * Try to parse error
        setAuthError(
          errorData.error || `Verification failed (status ${response.status}).`
        );
      }
    } catch (error) {
      console.error('Password verification network error:', error);
      setAuthError('Network error during verification. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * ? resetControlsTimeout Callback
   * Clears any existing timeout and sets a new one to hide fullscreen controls.
   * Wrapped in useCallback for stability when used in effects/event listeners.
   */
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(
      () => setAreControlsVisible(false),
      3000
    ); // * Hide after 3s
  }, []);

  /**
   * ? toggleFullscreen Callback
   * Enters or exits fullscreen mode for the PDF container.
   */
  const toggleFullscreen = useCallback(() => {
    const elem = pdfContainerRef.current;
    if (!elem) return;
    if (!document.fullscreenElement) {
      // * Request fullscreen
      elem.requestFullscreen().catch((err) => {
        // * Handle potential errors (e.g., user denial)
        console.error('Fullscreen request failed:', err);
        alert(`Could not enter fullscreen: ${err.message}`);
      });
    } else {
      // * Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  // ! Render Variables & Components

  // * Static banner content
  const bannerTitle = 'From Script to Screen.';
  const bannerDescription =
    'Our feature film division specializes in packaging commercially viable projects with top-tier talent, financing strategies, and distribution plans. Whether building a festival hit or a streamer-ready series, we develop narratives with lasting impact.';

  // * Reusable Pagination Controls component
  const PaginationControls = ({ className = '' }) => (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <button
        onClick={() => paginate(-1)} // * Go to previous page
        disabled={currentPage[0] <= 1} // * Disable if on first page
        className="px-6 py-3 bg-black text-white font-semibold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous Page"
      >
        Previous
      </button>
      <p className="text-lg font-semibold text-black dark:text-white tabular-nums">
        {' '}
        {/* // * Added dark mode text, tabular-nums */}
        Page {currentPage[0]} of {numPages}
      </p>
      <button
        onClick={() => paginate(1)} // * Go to next page
        disabled={currentPage[0] >= numPages} // * Disable if on last page
        className="px-6 py-3 bg-black text-white font-semibold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next Page"
      >
        Next
      </button>
    </div>
  );

  // * Function to render the PDF viewer content (including loading/error states)
  const renderPdfContent = () => (
    <>
      {/* PDF Container */}
      <div
        ref={pdfContainerRef}
        className={`relative overflow-hidden w-full shadow-lg aspect-[8.5/11] rounded-lg touch-pan-y ${
          // * Changed aspect ratio for portrait PDF
          isFullscreen ? 'bg-black' : 'bg-slate-200/50 dark:bg-slate-800/20'
        }`}
      >
        {/* Loading State */}
        {isLoadingPdf && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg">Loading Document...</p>
          </div>
        )}
        {/* Error State */}
        {pdfError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-600 p-8">
            <AlertTriangle className="w-12 h-12 mb-4" />
            <p className="text-lg font-semibold text-center">
              Failed to load document
            </p>
            <p className="text-sm text-center mt-1">{pdfError}</p>
          </div>
        )}
        {/* PDF Document & Page */}
        {pdfUrl && !isLoadingPdf && !pdfError && (
          <>
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading="" // * Hide default react-pdf loader
              error="" // * Hide default react-pdf error
            >
              {/* Animated Page Transition */}
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentPage[0]} // * Key change triggers animation
                  custom={direction} // * Pass direction to variants
                  variants={sliderVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute top-0 left-0 w-full h-full flex justify-center items-start pt-2 sm:pt-4" // * Align page top
                >
                  {/* Render Page if width is calculated */}
                  {pdfWidth > 0 && (
                    <Page
                      pageNumber={currentPage[0]}
                      renderTextLayer={false} // * Disable text layer for performance/simplicity
                      renderAnnotationLayer={false} // * Disable annotation layer
                      width={pdfWidth} // * Use calculated width
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </Document>

            {/* Fullscreen Controls Overlay */}
            <AnimatePresence>
              {isFullscreen && areControlsVisible && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" // * Use bottom gradient
                  onMouseEnter={() => clearTimeout(controlsTimeoutRef.current)} // * Pause hide timeout on hover
                  onMouseLeave={resetControlsTimeout} // * Resume hide timeout on leave
                >
                  {/* Exit Fullscreen Button */}
                  <div className="flex justify-end pointer-events-auto">
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                      aria-label="Exit Fullscreen"
                    >
                      <Minimize size={20} />
                    </button>
                  </div>
                  {/* Fullscreen Pagination */}
                  <div className="text-white pointer-events-auto pb-4">
                    {' '}
                    {/* Added pb-4 */}
                    <PaginationControls />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enter Fullscreen Button (Visible when not fullscreen) */}
            {!isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="absolute top-3 right-3 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-opacity"
                aria-label="Enter Fullscreen"
              >
                <Expand size={20} />
              </button>
            )}
          </>
        )}
      </div>
      {/* Non-Fullscreen Pagination Controls */}
      {numPages && !isLoadingPdf && !pdfError && !isFullscreen && (
        <div className="mt-8">
          <PaginationControls />
        </div>
      )}
    </>
  );

  // ! Main Component Render
  return (
    <div className="bg-black">
      {' '}
      {/* Base background */}
      {/* --- Preloader Banner --- */}
      <AnimatePresence>
        {isPreloaderActive && (
          <PreloaderBanner
            onAnimationComplete={() => setIsPreloaderActive(false)}
            title={bannerTitle}
            description={bannerDescription}
          />
        )}
      </AnimatePresence>
      {/* --- Section 1: Video --- */}
      <div className="relative w-full h-screen snap-start">
        <HlsVideoPlayer
          src={`${CDN_BASE_URL}/${featureProjectData.previewVideo.src}`}
          previewSrc={
            featureProjectData.previewVideo.preview_src
              ? `${CDN_BASE_URL}/${featureProjectData.previewVideo.preview_src}`
              : ''
          }
          shouldPlay={!isPreloaderActive} // * Play only after preloader
          isMuted={true}
          isLooped={true}
          startTime={featureProjectData.startTime || 0}
        />
        <VideoTitleOverlay
          title={`${featureProjectData.title} - SHORT FILM`} // * Modified title
          client={featureProjectData.client}
          projectSlug={featureProjectData.projectSlug}
          isPreloaderActive={isPreloaderActive}
        />
      </div>
      {/* --- Section 2: PDF Content --- */}
      <div className="relative w-full min-h-screen snap-start bg-gray-100 dark:bg-gray-900">
        {' '}
        {/* // * Background for PDF section */}
        <div className="w-full min-h-screen flex flex-col items-center justify-center pt-[140px] px-4 pb-12">
          {' '}
          {/* // * Padding top/bottom */}
          <motion.div
            className="w-full max-w-4xl" // * Max width container
            initial={{ opacity: 0 }}
            animate={{ opacity: !isPreloaderActive ? 1 : 0 }} // * Fade in after preloader
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {/* // * Conditional rendering based on authentication and loading states */}
            {isSessionChecking ? (
              // * Initial Session Check Loader
              <div className="flex items-center justify-center h-40 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : !isAuthenticated ? (
              // * Password Prompt if not authenticated
              <PasswordPrompt
                password={passwordInput}
                setPassword={setPasswordInput}
                handleSubmit={handlePasswordSubmit}
                loading={isVerifying}
                error={authError}
              />
            ) : (
              // * PDF Content if authenticated
              renderPdfContent()
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
