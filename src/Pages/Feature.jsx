import React, {
  useLayoutEffect,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { Loader2, AlertTriangle, Expand, Minimize } from 'lucide-react';

// Налаштування для react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

// Анімації для Framer Motion
const nameAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const sliderVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeIn' },
  }),
};

// Компонент для форми введення пароля
const PasswordPrompt = ({
  password,
  setPassword,
  handleSubmit,
  loading,
  error,
}) => {
  return (
    <div className="max-w-sm mx-auto text-center">
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-black mb-2 tracking-wider uppercase">
          ACCESS REQUIRED
        </h2>
        <p className="text-xs text-gray-500 tracking-wider uppercase">
          PLEASE ENTER THE PASSWORD TO VIEW THE DOCUMENT
        </p>
      </div>
      {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
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
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 mt-8 bg-black text-white font-semibold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'VERIFYING...' : 'Confirm'}
        </button>
      </form>
    </div>
  );
};

// Головний компонент сторінки
export default function Feature() {
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();

  // Стан для автентифікації
  const [isSessionChecking, setIsSessionChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState('');

  // Стан для PDF
  const [numPages, setNumPages] = useState(null);
  const [[currentPage, direction], setCurrentPage] = useState([1, 0]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [pdfError, setPdfError] = useState(null);

  // Стан для UI та взаємодії
  const pdfContainerRef = useRef(null);
  const [pdfWidth, setPdfWidth] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef(null);
  const isWheelingRef = useRef(false);
  const minSwipeDistance = 50;
  const touchStartRef = useRef(null);

  // Ефект для перевірки збереженої сесії при завантаженні
  useEffect(() => {
    const verifySession = async () => {
      const authDataString = localStorage.getItem('featureAuth');
      if (!authDataString) {
        setIsSessionChecking(false);
        return;
      }
      
      const authData = JSON.parse(authDataString);
      const oneHour = 60 * 60 * 1000;

      if (Date.now() - authData.timestamp > oneHour) {
        localStorage.removeItem('featureAuth');
        setIsSessionChecking(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/feature-pdf-password/version');
        const serverData = await response.json();

        if (response.ok && serverData.version === authData.version) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('featureAuth');
        }
      } catch (error) {
        console.error("Session verification failed:", error);
        localStorage.removeItem('featureAuth');
      } finally {
        setIsSessionChecking(false);
      }
    };
    
    verifySession();
  }, []);

  // Ефект для завантаження PDF після успішної автентифікації
  useEffect(() => {
    const fetchLatestPdf = async () => {
      if (!isAuthenticated) return;
      setIsLoadingPdf(true);
      setPdfError(null);
      try {
        const metaResponse = await fetch('http://localhost:3001/feature-pdf/current');
        if (!metaResponse.ok) throw new Error('Could not get PDF information.');
        const pdfData = await metaResponse.json();
        if (!pdfData || !pdfData.gcs_path) throw new Error('No feature document has been uploaded yet.');
        const urlResponse = await fetch('http://localhost:3001/generate-read-urls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gcsPaths: [pdfData.gcs_path] }),
        });
        if (!urlResponse.ok) throw new Error('Could not get a secure URL for the document.');
        const urlsMap = await urlResponse.json();
        const signedUrl = urlsMap[pdfData.gcs_path];
        if (!signedUrl) throw new Error('Failed to retrieve a valid document URL.');
        setPdfUrl(signedUrl);
      } catch (error) {
        console.error('Failed to load PDF:', error);
        setPdfError(error.message);
      } finally {
        setIsLoadingPdf(false);
      }
    };
    fetchLatestPdf();
  }, [isAuthenticated]);

  // Функція перевірки пароля
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setAuthError('');
    try {
      const response = await fetch('http://localhost:3001/feature-pdf-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      if (response.ok) {
        const data = await response.json();
        const authData = { timestamp: Date.now(), version: data.version };
        localStorage.setItem('featureAuth', JSON.stringify(authData));
        setIsAuthenticated(true);
      } else {
        const errorData = await response.json();
        setAuthError(errorData.error || 'Invalid password.');
      }
    } catch (error) {
      setAuthError('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Функція для скидання таймера авто-приховування контролів
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setAreControlsVisible(false);
    }, 3000);
  }, []);

  // Функція для керування повноекранним режимом
  const toggleFullscreen = useCallback(() => {
    const elem = pdfContainerRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Ефект для синхронізації стану повноекранного режиму
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Ефект для авто-приховування елементів керування
  useEffect(() => {
    const handleActivity = () => {
      if (!areControlsVisible) {
        setAreControlsVisible(true);
      }
      resetControlsTimeout();
    };

    if (isFullscreen) {
      window.addEventListener('mousemove', handleActivity);
      handleActivity();
    }

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isFullscreen, areControlsVisible, resetControlsTimeout]);

  // Обробник успішного завантаження документа
  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);
    setCurrentPage([1, 0]);
  }

  // Функція пагінації (перегортання сторінок)
  const paginate = useCallback((newDirection) => {
    if (newDirection > 0 && currentPage >= numPages) return;
    if (newDirection < 0 && currentPage <= 1) return;

    setCurrentPage([currentPage + newDirection, newDirection]);
    if (isFullscreen) {
      resetControlsTimeout();
    }
  }, [currentPage, numPages, isFullscreen, resetControlsTimeout]);

  // Ефект для обробки клавіатури, тачскріну та тачпаду
  useEffect(() => {
    if (!isAuthenticated) return;

    const container = pdfContainerRef.current;
    if (!container) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') paginate(1);
      else if (e.key === 'ArrowLeft') paginate(-1);
    };

    const handleWheel = (e) => {
        e.preventDefault();
        if (isWheelingRef.current) return;
        const { deltaX } = e;

        if (Math.abs(deltaX) > 20) { 
            isWheelingRef.current = true;
            if (deltaX > 0) paginate(1);
            else paginate(-1);
            
            setTimeout(() => { isWheelingRef.current = false; }, 500);
        }
    };
    
    const handleTouchStart = (e) => (touchStartRef.current = e.targetTouches[0].clientX);
    const handleTouchEnd = (e) => {
      if (touchStartRef.current === null) return;
      const touchEnd = e.changedTouches[0].clientX;
      const distance = touchStartRef.current - touchEnd;
      if (distance > minSwipeDistance) paginate(1);
      else if (distance < -minSwipeDistance) paginate(-1);
      touchStartRef.current = null;
    };

    document.addEventListener('keydown', handleKeyDown);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [paginate, isAuthenticated]);

  // Ефект для адаптивної ширини PDF
  useLayoutEffect(() => {
    if (!isAuthenticated) return;
    window.scrollTo(0, 0);
    const updateWidth = () => {
      if (pdfContainerRef.current) {
        setPdfWidth(pdfContainerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isPreloaderActive, isFullscreen, isAuthenticated]);

  // Ефект для блокування скролу під час прелоадера
  useEffect(() => {
    document.body.style.overflow = isPreloaderActive ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isPreloaderActive]);
  
  const bannerTitle = 'From Script to Screen.';
  const bannerDescription = 'Our feature film division specializes in packaging commercially viable projects with top-tier talent, financing strategies, and distribution plans. Whether building a festival hit or a streamer-ready series, we develop narratives with lasting impact.';
  const featureTitle = 'FEATURE FILMS & DOCUMENTARIES';

  // Компонент для кнопок пагінації
  const PaginationControls = ({ className = '' }) => (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <button onClick={() => paginate(-1)} disabled={currentPage <= 1} className="px-6 py-3 bg-black text-white font-semibold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:opacity-50">Previous</button>
      <p className="text-lg font-semibold text-black">Page {currentPage} of {numPages}</p>
      <button onClick={() => paginate(1)} disabled={currentPage >= numPages} className="px-6 py-3 bg-black text-white font-semibold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:opacity-50">Next</button>
    </div>
  );

  // Функція для рендерингу блоку з PDF
  const renderPdfContent = () => {
    return (
      <>
        <div 
          ref={pdfContainerRef} 
          className={`relative overflow-hidden w-full shadow-lg aspect-video rounded-lg touch-pan-y
            ${isFullscreen ? 'bg-black' : 'bg-slate-200/50 dark:bg-slate-800/20'}`
          }
        >
          {isLoadingPdf && ( <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500"> <Loader2 className="w-12 h-12 animate-spin mb-4" /> <p className="text-lg">Loading Document...</p> </div> )}
          {pdfError && ( <div className="absolute inset-0 flex flex-col items-center justify-center text-red-600 p-8"> <AlertTriangle className="w-12 h-12 mb-4" /> <p className="text-lg font-semibold text-center">Failed to load document</p> <p className="text-sm text-center mt-1">{pdfError}</p> </div> )}
          
          {pdfUrl && !isLoadingPdf && !pdfError && (
            <>
              <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={currentPage}
                    custom={direction}
                    variants={sliderVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute top-0 left-0 w-full h-full flex justify-center items-center"
                  >
                    {pdfWidth > 0 && ( <Page pageNumber={currentPage} renderTextLayer={false} renderAnnotationLayer={false} width={pdfWidth} /> )}
                  </motion.div>
                </AnimatePresence>
              </Document>

              <AnimatePresence>
                {isFullscreen && areControlsVisible && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/50 to-transparent"
                    onMouseEnter={() => clearTimeout(controlsTimeoutRef.current)} onMouseLeave={resetControlsTimeout}
                  >
                    <div className="flex justify-end">
                      <button onClick={toggleFullscreen} className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70" aria-label="Exit Fullscreen"> <Minimize size={20} /> </button>
                    </div>
                    <div className="text-white"> <PaginationControls /> </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!isFullscreen && (
                <button onClick={toggleFullscreen} className="absolute top-3 right-3 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-opacity" aria-label="Enter Fullscreen"> <Expand size={20} /> </button>
              )}
            </>
          )}
        </div>

        {numPages && !isLoadingPdf && !pdfError && !isFullscreen && ( <div className="mt-8"> <PaginationControls /> </div> )}
      </>
    );
  };

  // Фінальний рендеринг сторінки
  return (
      <div className="bg-gray-100">
          <AnimatePresence>
              {isPreloaderActive && ( <PreloaderBanner onAnimationComplete={() => setIsPreloaderActive(false)} title={bannerTitle} description={bannerDescription} /> )}
          </AnimatePresence>
          <div className="w-full min-h-screen flex flex-col items-center justify-center pt-[140px] px-4 pb-12">
              <motion.h1
                  className="text-black font-chanel font-normal uppercase text-4xl sm:text-6xl md:text-[5rem] tracking-[-0.3rem] md:tracking-[-0.6rem] transition-opacity duration-500 hover:opacity-50 text-center mb-12"
                  variants={nameAnimation}
                  initial="hidden"
                  animate={!isPreloaderActive ? 'visible' : 'hidden'}
              >
                  {featureTitle}
              </motion.h1>
              
              <motion.div
                  className="w-full max-w-4xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: !isPreloaderActive ? 1 : 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
              >
                  {isSessionChecking ? (
                    <div className="flex items-center justify-center h-40 text-slate-500">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                  ) : !isAuthenticated ? (
                    <PasswordPrompt
                      password={passwordInput}
                      setPassword={setPasswordInput}
                      handleSubmit={handlePasswordSubmit}
                      loading={isVerifying}
                      error={authError}
                    />
                  ) : (
                    renderPdfContent()
                  )}
              </motion.div>
          </div>
      </div>
  );
}