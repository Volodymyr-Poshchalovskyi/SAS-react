import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Hls from 'hls.js';
import sinnersLogoBlack from '../assets/Logo/Sinners logo black.png';
import sinnersLogoWhite from '../assets/Logo/Sinners logo white.png';

const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';
const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- Компонент HLS Player (з фолбеком) ---
const InlineHlsPlayer = React.forwardRef(({ src, ...props }, ref) => {
  const internalVideoRef = useRef(null);
  const videoRef = ref || internalVideoRef;

  useEffect(() => {
    if (!src || !videoRef.current) return;

    const video = videoRef.current;
    let hls;

    if (src.includes('.m3u8')) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }
    } else {
      video.src = src;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, videoRef]);

  return <video ref={videoRef} {...props} />;
});

// --- Компонент Preloader ---
const Preloader = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
    <img
      src={sinnersLogoBlack}
      alt="Sinners Logo"
      className="w-40 h-auto mb-6"
    />
    <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
    <p className="text-black tracking-widest uppercase text-sm">Loading</p>
  </div>
);

// --- Компонент Slider Arrow ---
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

// --- Компонент DownloadModal ---
const DownloadModal = ({ isOpen, onClose, mediaItems }) => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({});

  useEffect(() => {
    if (isOpen) {
      setSelectedItems(new Set());
      setDownloadProgress({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleSelection = (itemId) => {
    if (isDownloading) return;
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.has(itemId) ? newSet.delete(itemId) : newSet.add(itemId);
      return newSet;
    });
  };

  const handleDownload = async () => {
    const itemsToDownload = mediaItems.filter((item) =>
      selectedItems.has(item.id)
    );
    if (itemsToDownload.length === 0) return;

    setIsDownloading(true);
    const initialProgress = {};
    itemsToDownload.forEach((item) => {
      initialProgress[item.id] = 0;
    });
    setDownloadProgress(initialProgress);

    for (const item of itemsToDownload) {
      try {
        const downloadUrl = `${CDN_BASE_URL}/${item.videoGcsPath}`;
        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error(`Network response was not ok`);
        if (!response.body)
          throw new Error('ReadableStream not supported in this browser.');

        const contentLength = +response.headers.get('Content-Length');
        const reader = response.body.getReader();
        let receivedLength = 0;
        let chunks = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          receivedLength += value.length;

          if (contentLength) {
            const progress = Math.round(
              (receivedLength / contentLength) * 100
            );
            setDownloadProgress((prev) => ({ ...prev, [item.id]: progress }));
          }
        }

        const blob = new Blob(chunks);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const gcsPath = item.videoGcsPath;
        const decodedFileName = decodeURIComponent(
          gcsPath.substring(gcsPath.lastIndexOf('/') + 1)
        );
        const userFriendlyFileName = decodedFileName.includes('-')
          ? decodedFileName.substring(decodedFileName.indexOf('-') + 1)
          : decodedFileName;

        link.setAttribute(
          'download',
          userFriendlyFileName || `sinners-media-${item.id}`
        );
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed for:', item.title, error);
        setDownloadProgress((prev) => ({ ...prev, [item.id]: 'error' }));
      }
    }
    setTimeout(() => {
      setIsDownloading(false);
      onClose();
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={!isDownloading ? onClose : undefined}
    >
      <div
        className="bg-white border border-slate-200 shadow-2xl w-full max-w-lg text-left flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold uppercase font-montserrat tracking-widest text-black">
            Download Media
          </h3>
          <button
            onClick={!isDownloading ? onClose : undefined}
            className="text-slate-500 hover:text-black transition-colors disabled:opacity-50"
            disabled={isDownloading}
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="space-y-2 p-4 max-h-[60vh] overflow-y-auto">
          {mediaItems.map((item) => {
            const progress = downloadProgress[item.id];
            const showProgressBar = typeof progress === 'number';
            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-3 transition-colors ${
                  !item.allow_download
                    ? 'opacity-50 cursor-not-allowed'
                    : isDownloading
                    ? 'cursor-default'
                    : 'cursor-pointer hover:bg-slate-100'
                }`}
                onClick={() =>
                  item.allow_download && handleToggleSelection(item.id)
                }
              >
                <input
                  type="checkbox"
                  id={`download-${item.id}`}
                  checked={selectedItems.has(item.id)}
                  readOnly
                  disabled={!item.allow_download || isDownloading}
                  className="h-5 w-5 border-2 border-slate-300 text-black focus:ring-black accent-black shrink-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <img
                  src={`${CDN_BASE_URL}/${item.previewGcsPath}`}
                  alt={item.title}
                  className="w-24 h-14 object-cover shrink-0"
                />
                <div className="flex-grow min-w-0">
                  <p className="font-semibold text-black truncate">
                    {item.title}
                  </p>
                  <p className="text-sm text-slate-500 truncate">
                    {item.client}
                  </p>
                  {showProgressBar && (
                    <div className="mt-2 flex items-center gap-3">
                      <div className="w-full bg-slate-200 h-1 overflow-hidden">
                        <div
                          className="bg-black h-1 transition-all duration-200"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-mono text-slate-500 w-9 text-right">
                        {progress}%
                      </span>
                    </div>
                  )}
                  {progress === 'error' && (
                    <p className="text-xs text-red-500 mt-1">Download failed</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-6 mt-auto border-t border-slate-200 flex justify-end">
          <button
            onClick={handleDownload}
            disabled={selectedItems.size === 0 || isDownloading}
            className="w-48 text-center px-5 py-3 text-sm font-semibold uppercase tracking-wider bg-black text-white hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {isDownloading
              ? 'Downloading...'
              : `Download (${selectedItems.size})`}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Компонент ReelVideoModal ---
const ReelVideoModal = ({
  videos,
  currentIndex,
  onClose,
  onNavigate,
  cdnBaseUrl,
  logEvent,
  sessionCompletedMediaKey,
}) => {
  const videoRef = useRef(null);
  const currentVideo = videos[currentIndex];

  const videoSrc = currentVideo.video_hls_path
    ? `${cdnBaseUrl}/${currentVideo.video_hls_path}`
    : `${cdnBaseUrl}/${currentVideo.videoGcsPath}`;

  // Обробка клавіш
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') handlePrev();
      if (event.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, currentIndex]);

  // Логіка HLS-плеєра
  useEffect(() => {
    if (!videoSrc || !videoRef.current) return;

    const videoElement = videoRef.current;
    let hls;

    const onManifestParsed = (event, data) => {
      if (hls) {
        hls.currentLevel = data.levels.length - 1;
      }
    };

    if (videoSrc.includes('.m3u8') && Hls.isSupported()) {
      hls = new Hls();
      hls.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
      hls.loadSource(videoSrc);
      hls.attachMedia(videoElement);
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = videoSrc;
    } else {
      videoElement.src = videoSrc;
    }

    return () => {
      if (hls) {
        hls.off(Hls.Events.MANIFEST_PARSED, onManifestParsed);
        hls.destroy();
      }
    };
  }, [videoSrc]);

  // Ефект для гібридної аналітики
  useEffect(() => {
    if (!videoRef.current || !logEvent || !sessionCompletedMediaKey || !currentVideo) {
      return;
    }

    const videoElement = videoRef.current;
    const currentVideoId = currentVideo.id;

    const markMediaCompleted = (mediaId, duration) => {
      let completed = JSON.parse(
        sessionStorage.getItem(sessionCompletedMediaKey) || '[]'
      );
      if (!completed.includes(mediaId)) {
        logEvent('media_completion', mediaId, duration);
        completed.push(mediaId);
        sessionStorage.setItem(
          sessionCompletedMediaKey,
          JSON.stringify(completed)
        );
      }
    };

    const VIEW_THRESHOLD = 0.9;
    const handleTimeUpdate = () => {
      if (!videoElement?.duration) return;
      if (
        videoElement.currentTime / videoElement.duration >=
        VIEW_THRESHOLD
      ) {
        markMediaCompleted(currentVideoId, videoElement.duration);
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };

    const handleEnded = () => {
      markMediaCompleted(currentVideoId, videoElement?.duration || null);
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [
    videoRef,
    currentVideo,
    logEvent,
    sessionCompletedMediaKey,
  ]);

  // Навігація
  const handlePrev = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const artistNames = (currentVideo?.artists || [])
    .map((a) => a.name)
    .join(', ')
    .toUpperCase();

  return (
    <div
      className="fixed inset-0 bg-black z-[9999] flex flex-col"
      onClick={onClose}
    >
      {/* --- Кастомний Хедер --- */}
      <header
        className="flex-shrink-0 w-full h-[90px] md:h-[117px] bg-black text-white flex items-center justify-between px-6 md:px-12"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={sinnersLogoWhite}
          alt="Sinners"
          className="h-5 md:h-6"
        />

        {/* --- ✨ ЗМІНА 1: Поміняв місцями currentVideo.title та currentVideo.client --- */}
        <div className="text-center font-montserrat text-xs md:text-sm uppercase tracking-wider text-white/90 px-4 truncate">
          {/* Спочатку title (який, ймовірно, є клієнтом у ваших даних) */}
          <span>{currentVideo.title}</span>
          {/* Потім client (який, ймовірно, є назвою медіа) */}
          {currentVideo.client && <span> - {currentVideo.client}</span>}
          {artistNames && <span> - {artistNames}</span>}
        </div>

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

      {/* --- Контейнер для Відео --- */}
      <div
        className="flex-grow w-full flex-1 h-full flex items-center justify-center relative overflow-hidden px-4 sm:px-10 md:px-16 pb-4 sm:pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Стрілка "Назад" */}
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

        {/* Стрілка "Вперед" */}
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

        {/* --- Відео-плеєр --- */}
        <video
          key={videoSrc}
          ref={videoRef}
          className="w-full h-full object-contain"
          controls
          autoPlay
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

// --- ГОЛОВНИЙ КОМПОНЕНТ СТОРІНКИ ---
export default function PublicReelPage() {
  const { reelId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preloading, setPreloading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(() => {
    const savedSlide = sessionStorage.getItem(`reel_${reelId}_slide`);
    return savedSlide ? parseInt(savedSlide, 10) : 0;
  });
  const [isFullImageLoaded, setIsFullImageLoaded] = useState(false);
  const [isInitialPlay, setIsInitialPlay] = useState(true);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [activeModalSlide, setActiveModalSlide] = useState(null);

  const videoRef = useRef(null);
  const hasMultipleSlides = data?.mediaItems?.length > 1;

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreloading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const currentMediaItem = data?.mediaItems?.[currentSlide] || null;

  const isAnyMediaDownloadable = useMemo(
    () => data?.mediaItems?.some((item) => item.allow_download),
    [data]
  );

  const videoMediaItems = useMemo(() => {
    if (!data?.mediaItems) return [];
    return data.mediaItems.filter((item) => {
      const videoPath = item.videoGcsPath;
      const isActuallyVideo =
        videoPath &&
        ['.mp4', '.mov', '.webm', '.ogg'].some((ext) =>
          videoPath.toLowerCase().endsWith(ext)
        );
      return isActuallyVideo;
    });
  }, [data]);

  const isReadyToPlay = !loading && !preloading;

  const { isVideo, playbackUrl, imageUrl, previewUrl } = useMemo(() => {
    if (!currentMediaItem) {
      return { isVideo: false };
    }

    const videoPath = currentMediaItem.videoGcsPath;
    const hlsPath = currentMediaItem.video_hls_path;
    const isActuallyVideo =
      videoPath &&
      ['.mp4', '.mov', '.webm', '.ogg'].some((ext) =>
        videoPath.toLowerCase().endsWith(ext)
      );

    if (isActuallyVideo) {
      return {
        isVideo: true,
        playbackUrl: hlsPath
          ? `${CDN_BASE_URL}/${hlsPath}`
          : `${CDN_BASE_URL}/${videoPath}`,
        previewUrl: `${CDN_BASE_URL}/${currentMediaItem.previewGcsPath}`,
      };
    }

    return {
      isVideo: false,
      imageUrl: `${CDN_BASE_URL}/${videoPath}`,
      previewUrl: `${CDN_BASE_URL}/${currentMediaItem.previewGcsPath}`,
    };
  }, [currentMediaItem]);

  const logEvent = useCallback(
    (eventType, mediaItemId = null, duration = null) => {
      if (!data?.reelDbId) return;
      let sessionId = sessionStorage.getItem(`session_id_${data.reelDbId}`);
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem(`session_id_${data.reelDbId}`, sessionId);
      }
      const payload = {
        reel_id: data.reelDbId,
        session_id: sessionId,
        event_type: eventType,
        media_item_id: mediaItemId ?? currentMediaItem?.id,
        duration_seconds: duration,
      };
      fetch(`${API_BASE_URL}/reels/log-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch((err) => console.error(`Failed to log ${eventType}:`, err));
    },
    [data, currentMediaItem]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (activeModalSlide !== null) {
      video.pause();
    } else {
      if (isVideo && isReadyToPlay) {
        video.play().catch((e) => console.error('Playback prevented:', e));
      }
    }
  }, [activeModalSlide, isVideo, isReadyToPlay]);

  useEffect(() => {
    setIsFullImageLoaded(false);
    const video = videoRef.current;
    if (isVideo && video && isReadyToPlay && activeModalSlide === null) {
      const savedTime = sessionStorage.getItem(`reel_${reelId}_time`);
      const savedSlide = sessionStorage.getItem(`reel_${reelId}_slide`);
      if (savedTime && String(currentSlide) === savedSlide) {
        video.currentTime = parseFloat(savedTime);
        sessionStorage.removeItem(`reel_${reelId}_time`);
      } else {
        video.currentTime = 0;
      }
      video.play().catch((e) => console.error('Playback prevented:', e));
    }
  }, [
    isReadyToPlay,
    isVideo,
    currentMediaItem,
    reelId,
    currentSlide,
    activeModalSlide,
  ]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlaying = () => {
      if (isInitialPlay) setIsInitialPlay(false);
    };
    video.addEventListener('playing', onPlaying);
    return () => {
      video.removeEventListener('playing', onPlaying);
    };
  }, [currentMediaItem, isInitialPlay]);

  useEffect(() => {
    if (!isReadyToPlay || !data || !currentMediaItem) return;

    const sessionStartTimeKey = `session_start_time_${data.reelDbId}`;
    if (!sessionStorage.getItem(sessionStartTimeKey)) {
      sessionStorage.setItem(sessionStartTimeKey, Date.now().toString());
    }
    const viewLoggedKey = `view_logged_${data.reelDbId}`;
    if (!sessionStorage.getItem(viewLoggedKey)) {
      logEvent('view');
      sessionStorage.setItem(viewLoggedKey, 'true');
    }

    const nextSlideHandler = () => {
      if (!hasMultipleSlides) return;
      setCurrentSlide((prev) => (prev + 1) % data.mediaItems.length);
    };

    const completedMediaKey = `completed_media_${data.reelDbId}`;
    const markMediaCompleted = (mediaId, duration) => {
      let completed = JSON.parse(
        sessionStorage.getItem(completedMediaKey) || '[]'
      );
      if (!completed.includes(mediaId)) {
        logEvent('media_completion', mediaId, duration);
        completed.push(mediaId);
        sessionStorage.setItem(completedMediaKey, JSON.stringify(completed));
        if (completed.length === data.mediaItems.length) {
          logEvent('completion');
        }
      }
    };

    if (isVideo) {
      const VIEW_THRESHOLD = 0.9;
      const videoElement = videoRef.current;
      const handleTimeUpdate = () => {
        if (!videoElement?.duration) return;
        if (videoElement.currentTime / videoElement.duration >= VIEW_THRESHOLD) {
          markMediaCompleted(currentMediaItem.id, videoElement.duration);
          videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        }
      };
      const handleEnded = () => {
        markMediaCompleted(
          currentMediaItem.id,
          videoElement?.duration || null
        );
        // ✨ Не переходимо на наступний слайд, якщо відео не зациклене
        // nextSlideHandler();
      };
      if (videoElement) {
        videoElement.addEventListener('timeupdate', handleTimeUpdate);
        videoElement.addEventListener('ended', handleEnded);
        return () => {
          videoElement.removeEventListener('timeupdate', handleTimeUpdate);
          videoElement.removeEventListener('ended', handleEnded);
        };
      }
    } else {
      markMediaCompleted(currentMediaItem.id, 7);
      const imageTimer = setTimeout(nextSlideHandler, 7000);
      return () => clearTimeout(imageTimer);
    }
  }, [
    data,
    currentSlide,
    logEvent,
    isVideo,
    currentMediaItem,
    isReadyToPlay,
    hasMultipleSlides,
  ]);

  useEffect(() => {
    const fetchReelData = async () => {
      if (!reelId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}/reels/public/${reelId}`
        );
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(
            errData.details || 'Reel not found or is not active.'
          );
        }
        setData(await response.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReelData();
    window.scrollTo(0, 0);
  }, [reelId]);

  useEffect(() => {
    if (!reelId || !data?.reelDbId) return;

    const handlePageExit = () => {
      if (isVideo) {
        const videoElement = videoRef.current;
        if (videoElement?.currentTime) {
          sessionStorage.setItem(
            `reel_${reelId}_time`,
            videoElement.currentTime
          );
        }
      }
      sessionStorage.setItem(`reel_${reelId}_slide`, currentSlide);
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
            navigator.sendBeacon(
              `${API_BASE_URL}/reels/log-event`,
              JSON.stringify(payload)
            );
          }
        }
        sessionStorage.removeItem(sessionStartTimeKey);
      }
    };

    window.addEventListener('beforeunload', handlePageExit);
    return () => {
      window.removeEventListener('beforeunload', handlePageExit);
      handlePageExit();
    };
  }, [reelId, data, currentSlide, logEvent, isVideo]);

  const nextSlide = () => {
    if (!hasMultipleSlides) return;
    setCurrentSlide((prev) => (prev + 1) % data.mediaItems.length);
  };
  const prevSlide = () => {
    if (!hasMultipleSlides) return;
    setCurrentSlide(
      (prev) => (prev - 1 + data.mediaItems.length) % data.mediaItems.length
    );
  };

  const artistNames = (currentMediaItem?.artists || [])
    .map((a) => a.name)
    .join(', ')
    .toUpperCase();
  const artistPhotoUrl =
    data?.mediaItems?.[0]?.artists?.[0]?.photoGcsPath
      ? `${CDN_BASE_URL}/${data.mediaItems[0].artists[0].photoGcsPath}`
      : '';

  useEffect(() => {
    const isModalOpen =
      isDownloadModalOpen || activeModalSlide !== null;
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDownloadModalOpen, activeModalSlide]);

  const completedMediaKey = `completed_media_${data?.reelDbId}`;

  return (
    <>
      <AnimatePresence>
        {(preloading || loading) && (
          <motion.div
            key="preloader"
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            <Preloader />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDownloadModalOpen && data && (
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

        {activeModalSlide !== null && (
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
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && data && (
        <div className="bg-white text-black">
          <section className="relative w-full h-screen overflow-hidden bg-black">
            <div
              className={`absolute inset-0 ${
                isVideo ? 'cursor-pointer' : 'cursor-default'
              } z-10`}
              onClick={() => {
                if (isVideo) {
                  const videoIndex = videoMediaItems.findIndex(
                    (v) => v.id === currentMediaItem.id
                  );
                  if (videoIndex !== -1) {
                    setActiveModalSlide(videoIndex);
                  }
                }
              }}
            >
              <AnimatePresence initial={false}>
                {isVideo ? (
                  <motion.div
                    key={currentSlide}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* --- ✨ ЗМІНА 2: Додано loop={false} --- */}
                    <InlineHlsPlayer
                      ref={videoRef}
                      src={playbackUrl}
                      muted
                      playsInline
                      loop={false} // <-- ВІДЕО БІЛЬШЕ НЕ ЗАЦИКЛЕНЕ
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ) : isInitialPlay ? (
                  <div key={currentSlide} className="absolute inset-0">
                    <motion.img
                      src={previewUrl}
                      alt="Loading image preview"
                      className="absolute inset-0 w-full h-full object-cover"
                      animate={{ opacity: isFullImageLoaded ? 0 : 1 }}
                      transition={{ duration: 0.7 }}
                    />
                    <motion.img
                      src={imageUrl}
                      alt={currentMediaItem.title || 'Reel media'}
                      onLoad={() => {
                        setIsFullImageLoaded(true);
                        if (isInitialPlay) setIsInitialPlay(false);
                      }}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isFullImageLoaded ? 1 : 0 }}
                      transition={{ duration: 0.7 }}
                    />
                  </div>
                ) : (
                  <motion.img
                    key={currentSlide}
                    src={imageUrl}
                    alt={currentMediaItem.title || 'Reel media'}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </AnimatePresence>
              <div className="absolute inset-0 bg-black bg-opacity-30" />
            </div>

            {hasMultipleSlides && (
              <SliderArrow direction="left" onClick={prevSlide} />
            )}
            {hasMultipleSlides && (
              <SliderArrow direction="right" onClick={nextSlide} />
            )}
            <div className="absolute inset-0 text-white pointer-events-none z-20">
              <div className="w-full h-full flex justify-center items-start pt-[15vh]">
                <h1 className="text-3xl md:text-4xl font-bold uppercase font-montserrat text-center [text-shadow:0_2px_6px_rgb(0_0_0_/_0.6)] tracking-widest md:tracking-[0.2em]">
                  {data.reelTitle}
                </h1>
              </div>
              <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 font-montserrat [text-shadow:0_2px_4px_rgb(0_0_0_/_0.7)]">
                {currentMediaItem.client && (
                  <p className="text-xl md:text-2xl font-semibold">
                    {currentMediaItem.client}
                  </p>
                )}
                {currentMediaItem.title && (
                  <p className="text-md md:text-lg opacity-80">
                    {currentMediaItem.title}
                  </p>
                )}
              </div>
              <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 font-montserrat text-right [text-shadow:0_2px_4px_rgb(0_0_0_/_0.7)]">
                {artistNames && (
                  <>
                    <p className="text-sm md:text-md uppercase opacity-80">
                      {currentMediaItem.craft}
                    </p>
                    <p className="text-lg md:text-xl font-semibold">
                      {artistNames}
                    </p>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="pt-20 pb-10 md:pt-32 md:pb-16 px-6 lg:px-8 bg-white">
            <div className="max-w-screen-2xl mx-auto">
              <div className="flex justify-between items-center mb-16 flex-wrap gap-4">
                <h2 className="text-3xl md:text-4xl font-bold uppercase text-left font-montserrat">
                  Work
                </h2>
                {isAnyMediaDownloadable && (
                  <button
                    onClick={() => setIsDownloadModalOpen(true)}
                    className="px-6 py-2.5 text-xs font-semibold uppercase tracking-widest bg-transparent border border-black text-black hover:bg-black hover:text-white transition-colors"
                  >
                    Download Media
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {data.mediaItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="group relative cursor-pointer overflow-hidden"
                    onClick={() => {
                      setCurrentSlide(index);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <img
                      src={`${CDN_BASE_URL}/${item.previewGcsPath}`}
                      alt={`${item.client} - ${item.title}`}
                      className="w-full h-auto object-cover aspect-video transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-0 left-0 p-4 w-full">
                      {item.client && (
                        <p className="font-semibold text-base text-white uppercase font-montserrat [text-shadow:0_2px_4px_rgb(0_0_0_/_0.7)]">
                          {item.client}
                        </p>
                      )}
                      {item.title && (
                        <p className="text-xs text-white/90 uppercase font-montserrat [text-shadow:0_2px_4px_rgb(0_0_0_/_0.7)]">
                          {item.title}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {artistPhotoUrl && (
            <section className="pt-10 pb-20 md:pt-16 md:pb-32 px-8 sm:px-12 lg:px-16 bg-white">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-16 items-start">
                <div className="md:col-span-2">
                  <img
                    src={artistPhotoUrl}
                    alt={data.mediaItems[0].artists[0].name}
                    className="w-full h-auto object-cover"
                  /> {/* <-- Я прибрав зайву дужку '}' звідси */}
                </div>
                <div className="md:col-span-3 flex flex-col">
                  <h2 className="text-3xl md:text-4xl font-bold uppercase mb-6 font-montserrat">
                    {data.mediaItems[0].artists[0].name}
                  </h2>
                  {data.mediaItems[0].artists[0].description && (
                    <p className="font-semibold text-sm leading-relaxed tracking-normal [word-spacing:0.1em] text-[#1D1D1D]">
                      {data.mediaItems[0].artists[0].description}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      )}
      {!loading && error && (
        <div className="h-screen w-full bg-white flex items-center justify-center text-red-500 text-center p-8">
          Error: {error}
        </div>
      )}
      {!loading && !data && !error && (
        <div className="h-screen w-full bg-white flex flex-col items-center justify-center text-center p-8">
          <h1 className="text-3xl font-bold text-black mb-4">Reel is Empty</h1>
          <p className="text-slate-500">
            This reel does not contain any videos or may have been deleted.
          </p>
        </div>
      )}
    </>
  );
}