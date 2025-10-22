// src/Pages/DirectorPage.jsx

import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { directorsData } from '../Data/DirectorsData';
import { assignmentData } from '../Data/AssignmentData';
import { postProductionData } from '../Data/PostProductionData';
import { tableTopData } from '../Data/TableTopData';
import HlsVideoPlayer from '../Components/HlsVideoPlayer';
import VideoModal from '../Components/VideoModal';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import sinnersLogoBlack from '../assets/Logo/Sinners logo black.png';

const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';

// --- Компонент DirectorVideoBlock (без змін) ---
const DirectorVideoBlock = ({
  video,
  videoSrc,
  previewSrc,
  onExpand,
  index,
  isModalOpen,
}) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  return (
    <section ref={ref} className="relative w-full h-[75vh] bg-black">
      <HlsVideoPlayer
        src={videoSrc}
        previewSrc={previewSrc}
        shouldPlay={inView && !isModalOpen}
        startTime={video.startTime}
      />
      <div className="absolute inset-0 z-10 flex items-end justify-center">
        <div className="flex flex-col items-center text-white pb-24 px-4">
          <div className="mb-6 text-shadow text-center">
            <p className="font-chanel text-2xl sm:text-4xl text-shadow">
              {video.title}
            </p>
            {video.client && (
              <p className="font-light text-sm tracking-widest uppercase text-shadow mt-2">
                {video.client}
              </p>
            )}
          </div>
          <button
            onClick={() => onExpand(index)}
            className="bg-white text-black py-4 px-6 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-transform hover:scale-105"
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

// --- Компонент DirectorBioModal (без змін) ---
const DirectorBioModal = ({ director, onClose }) => {
  const nameRef = useRef(null);
  const bioRef = useRef(null);

  const publicPhotoUrl = director.photoSrc
    ? `${CDN_BASE_URL}/${director.photoSrc}`
    : '';

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

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
      const maxFontSize = window.innerWidth < 768 ? 60 : 120;
      const minFontSize = 24;
      let currentFontSize = maxFontSize;
      element.style.fontSize = `${currentFontSize}px`;
      while (
        element.scrollWidth > availableWidth &&
        currentFontSize > minFontSize
      ) {
        currentFontSize--;
        element.style.fontSize = `${currentFontSize}px`;
      }
    };
    adjustNameFontSize();
    window.addEventListener('resize', adjustNameFontSize);
    return () => window.removeEventListener('resize', adjustNameFontSize);
  }, [director]);

  const modalVariants = {
    hidden: { x: '-100%', opacity: 0.8 },
    visible: {
      x: '0%',
      opacity: 1,
      transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] },
    },
    exit: {
      x: '-100%',
      opacity: 0.8,
      transition: { duration: 0.4, ease: [0.5, 0, 0.75, 0] },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-start bg-black/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-[90vw] h-full bg-white text-black shadow-2xl flex flex-col"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex-shrink-0 p-8 grid grid-cols-3 items-center z-20">
          <div />
          <img
            src={sinnersLogoBlack}
            alt="Sinners and Saints Logo"
            className="h-6 justify-self-center"
          />
          <button
            onClick={onClose}
            className="text-black hover:opacity-70 transition-opacity justify-self-end"
            aria-label="Close"
          >
            <X size={32} />
          </button>
        </header>

        <div className="flex-grow flex flex-col px-8 md:px-16 pb-[70px] overflow-hidden min-h-0">
          {' '}
          <h1
            ref={nameRef}
            className="flex-shrink-0 text-center font-chanel font-semibold uppercase mb-9 leading-none"
            style={{ whiteSpace: 'nowrap' }}
          >
            {director.name}
          </h1>
          <div className="flex-grow flex flex-col lg:flex-row gap-12 lg:gap-16 min-h-0">
            <div className="hidden lg:block w-full lg:w-2/5 flex-shrink-0">
              {publicPhotoUrl ? (
                <img
                  src={publicPhotoUrl}
                  alt={director.name}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-200" />
              )}
            </div>
            <div className="w-full lg:w-3/5 flex flex-col min-h-0">
              <p
                ref={bioRef}
                className="text-sm leading-relaxed whitespace-pre-line text-left lg:text-justify flex-grow overflow-y-auto pb-5"
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

// ===================================
// ГОЛОВНИЙ КОМПОНЕНТ СТОРІNКИ (ОНОВЛЕНО)
// ===================================
export default function DirectorPage() {
  const { directorSlug } = useParams();
  const location = useLocation();

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
    dataSource = directorsData;
    backLink = '/directors';
  }

  const director = dataSource.find((d) => d.slug === directorSlug);

  const [activeVideoIndex, setActiveVideoIndex] = useState(null);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);

  // ✅ ДОДАНО: Стан для перевірки, чи бачив юзер біо ВЗАГАЛІ
  // Ми ліниво ініціалізуємо стан, зчитуючи з localStorage
  // 'typeof window' потрібен, щоб уникнути помилок при Server-Side Rendering
  const [hasEverViewedBio, setHasEverViewedBio] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hasViewedBio') === 'true';
    }
    return false;
  });

  const { ref: nameButtonRef, inView: isNameButtonInView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  const nameAnimationVariants = {
    hidden: { color: '#000000' },
    visible: {
      color: ['#000000', '#6b7280', '#000000'],
      transition: {
        duration: 2,
        repeat: 5,
        repeatType: 'loop',
        ease: 'easeInOut',
      },
    },
  };

  // ✅ ДОДАНО: Функція-обгортка для відкриття модалки
  const openBioModal = () => {
    // Якщо юзер ніколи не бачив біо,
    // записуємо в localStorage і оновлюємо стан
    if (!hasEverViewedBio) {
      localStorage.setItem('hasViewedBio', 'true');
      setHasEverViewedBio(true);
    }
    // Відкриваємо модалку
    setIsBioModalOpen(true);
  };

  const isAnyModalOpen = activeVideoIndex !== null || isBioModalOpen;

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (director && director.photoSrc) {
      const publicPhotoUrl = `${CDN_BASE_URL}/${director.photoSrc}`;
      const img = new Image();
      img.src = publicPhotoUrl;
    }
  }, [director]);

  if (!director) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <h2 className="text-4xl font-chanel">Content Not Found</h2>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <section className="bg-white text-black flex items-center justify-center relative h-[100px] mt-[90px] md:mt-[117px]">
        <Link
          to={backLink}
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

        <motion.button
          ref={nameButtonRef}
          onClick={openBioModal} // ✅ ОНОВЛЕНО: Використовуємо нову функцію
          className="text-4xl sm:text-5xl md:text-6xl font-chanel font-semibold uppercase text-center px-4 transition-opacity hover:opacity-70 focus:outline-none"
          aria-label={`View biography for ${director.name}`}
          variants={nameAnimationVariants}
          initial="hidden"
          // ✅ ОНОВЛЕНО: Анімуємо, ТІЛЬКИ якщо (в полі зору І юзер ще не бачив біо)
          animate={
            isNameButtonInView && !hasEverViewedBio ? 'visible' : 'hidden'
          }
        >
          {director.name}
        </motion.button>
      </section>

      <div className="bg-black">
        {director.videos.map((video, index) => {
          const publicVideoUrl = `${CDN_BASE_URL}/${video.src}`;
          const publicPreviewUrl = video.preview_src
            ? `${CDN_BASE_URL}/${video.preview_src}`
            : '';
          return (
            <DirectorVideoBlock
              key={index}
              index={index}
              video={video}
              videoSrc={publicVideoUrl}
              previewSrc={publicPreviewUrl}
              onExpand={setActiveVideoIndex}
              isModalOpen={isAnyModalOpen}
            />
          );
        })}
      </div>

      {/* Рендеримо модалку ВІДЕО */}
      {activeVideoIndex !== null && (
        <VideoModal
          videos={director.videos}
          currentIndex={activeVideoIndex}
          onClose={() => setActiveVideoIndex(null)}
          onNavigate={setActiveVideoIndex}
          cdnBaseUrl={CDN_BASE_URL}
        />
      )}

      {/* Рендеримо модалку БІО */}
      <AnimatePresence>
        {isBioModalOpen && (
          <DirectorBioModal
            director={director}
            onClose={() => setIsBioModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}