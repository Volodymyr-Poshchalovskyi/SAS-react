import React, { useState, useLayoutEffect, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import VideoContainer from '../Components/VideoContainer';

const nameAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

export default function Feature() {
  const { isPreloaderActive, setIsPreloaderActive, onPreloaderPage } = useAnimation();
  // ✨ NEW: Стан для збереження URL відео з GCS
  const [videoUrl, setVideoUrl] = useState('');

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- Логіка прелоадера ---
  useEffect(() => {
    if (onPreloaderPage) {
      setIsPreloaderActive(true);
    }
  }, [onPreloaderPage, setIsPreloaderActive]);

  useEffect(() => {
    document.body.style.overflow = isPreloaderActive ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isPreloaderActive]);
  
  // ✨ NEW: Завантаження URL для відео з GCS під час роботи прелоадера
  useEffect(() => {
    const fetchVideoUrl = async () => {
      // Використовуємо той самий шлях до головного відео, що й на сторінці Main
      const gcsPath = 'front-end/00-Main Page/SHOWREEL SINNERS AND SAINTS 2024.mp4';
      try {
        const response = await fetch('http://localhost:3001/generate-read-urls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gcsPaths: [gcsPath] }),
        });
        if (!response.ok) throw new Error('Failed to fetch video URL');
        const urlsMap = await response.json();
        if (urlsMap[gcsPath]) {
          setVideoUrl(urlsMap[gcsPath]);
        }
      } catch (error) {
        console.error('Error fetching feature video URL:', error);
      }
    };
    fetchVideoUrl();
  }, []);

  // --- Текст для банера ---
  const bannerTitle = 'From Script to Screen.';
  const bannerDescription = 'Our feature film division specializes in packaging commercially viable projects with top-tier talent, financing strategies, and distribution plans. Whether building a festival hit or a streamer-ready series, we develop narratives with lasting impact.';
  
  const featureTitle = 'FEATURE FILMS & DOCUMENTARIES';

  return (
    <div className="bg-black">
      <AnimatePresence>
        {isPreloaderActive && (
          <PreloaderBanner
            onAnimationComplete={() => setIsPreloaderActive(false)}
            title={bannerTitle}
            description={bannerDescription}
          />
        )}
      </AnimatePresence>

      {/* ✨ MODIFIED: Контент тепер рендериться одразу, а не чекає на прелоадер */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* ✨ MODIFIED: VideoContainer рендериться, коли є URL */}
        {videoUrl && (
          <VideoContainer videoSrc={videoUrl} shouldPlay={!isPreloaderActive} />
        )}
        <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center">
          <motion.h1
            className="text-white font-chanel font-normal uppercase text-4xl sm:text-6xl md:text-[5rem] tracking-[-0.3rem] md:tracking-[-0.6rem] transition-opacity duration-500 hover:opacity-50"
            variants={nameAnimation}
            initial="hidden"
            // Анімація спрацює, коли зникне прелоадер
            animate={!isPreloaderActive ? 'visible' : 'hidden'}
          >
            {featureTitle}
          </motion.h1>
        </div>
      </div>
    </div>
  );
}