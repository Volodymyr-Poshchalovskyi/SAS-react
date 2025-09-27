// src/pages/Production.js

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import VideoContainer from '../Components/VideoContainer';
import ScrollProgressBar from '../Components/ScrollProgressBar';
import { productionData } from '../Data/ProductionData';

// ✨ ЗМІНА: Додано об'єкт анімації, скопійований зі сторінки Directors
const nameAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

// ✨ ЗМІНА: Компонент VideoTitleOverlay тепер анімований
const VideoTitleOverlay = ({ title, index, isPreloaderActive }) => {
  return (
    <div className="absolute inset-0 z-10 flex items-end justify-center text-center p-8 pb-24 text-white pointer-events-none">
      <motion.p
        className="font-chanel text-2xl sm:text-4xl text-shadow"
        variants={nameAnimation}
        initial="hidden"
        // Логіка анімації, ідентична до сторінки Directors
        animate={index === 0 && !isPreloaderActive ? 'visible' : undefined}
        whileInView={index > 0 ? 'visible' : undefined}
        viewport={{ once: true, amount: 0.5 }}
      >
        {title}
      </motion.p>
    </div>
  );
};

export default function Production() {
  const { isPreloaderActive, setIsPreloaderActive, onPreloaderPage } =
    useAnimation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoUrls, setVideoUrls] = useState({});

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
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPreloaderActive]);

  // --- Завантаження URL відео ---
  useEffect(() => {
    const fetchVideoUrls = async () => {
      const gcsPaths = productionData.map((video) => video.src);
      try {
        const response = await fetch(
          'http://localhost:3001/generate-read-urls',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gcsPaths }),
          }
        );
        if (!response.ok) throw new Error('Failed to fetch video URLs');
        const urlsMap = await response.json();
        setVideoUrls(urlsMap);
      } catch (error) {
        console.error('Error fetching production video URLs:', error);
      }
    };
    fetchVideoUrls();
  }, []);

  // --- Логіка скролу ---
  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.add('scroll-snap-enabled');
    const handleScroll = () => {
      if (isPreloaderActive) return;
      const newIndex = Math.round(window.scrollY / window.innerHeight);
      setCurrentIndex(newIndex);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      htmlElement.classList.remove('scroll-snap-enabled');
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isPreloaderActive]);

  // --- Текст для банера ---
  const bannerTitle = 'Global Production. White Glove Support.';
  const bannerDescription =
    'Celebrity-driven production, luxury brand campaigns, and international shoots are our specialty. We travel megastars in music, film, and fashion, producing high-impact content across the globe. Our teams in Los Angeles, New York, Mexico City, Bangkok, and beyond provide full-service line production, location sourcing, casting, and post.';

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

      {!isPreloaderActive && (
        <ScrollProgressBar
          currentIndex={currentIndex}
          totalItems={productionData.length}
        />
      )}

      {productionData.map((video, index) => {
        const signedUrl = videoUrls[video.src];
        return (
          <div key={video.id} className="relative w-full h-screen snap-start">
            {signedUrl && (
              <VideoContainer
                videoSrc={signedUrl}
                shouldPlay={!isPreloaderActive && currentIndex === index}
              />
            )}
            {/* ✨ ЗМІНА: Передаємо index та isPreloaderActive для керування анімацією */}
            <VideoTitleOverlay
              title={video.title}
              index={index}
              isPreloaderActive={isPreloaderActive}
            />
          </div>
        );
      })}
    </div>
  );
}