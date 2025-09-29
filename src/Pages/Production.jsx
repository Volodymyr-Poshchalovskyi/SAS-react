// src/pages/Production.jsx

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// ✨ Зміни тут: імпортуємо Link
import { Link } from 'react-router-dom';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import VideoContainer from '../Components/VideoContainer';
import ScrollProgressBar from '../Components/ScrollProgressBar';
import { productionData } from '../Data/ProductionData';

const nameAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

// ✨ Зміни тут: оновлюємо оверлей, щоб він містив кнопку
const VideoTitleOverlay = ({
  title,
  projectSlug,
  index,
  isPreloaderActive,
}) => {
  return (
    <div className="absolute inset-0 z-10 flex items-end justify-center text-center p-8 pb-24 text-white pointer-events-none">
      <motion.div
        className="flex flex-col items-center gap-4"
        variants={nameAnimation}
        initial="hidden"
        animate={index === 0 && !isPreloaderActive ? 'visible' : undefined}
        whileInView={index > 0 ? 'visible' : undefined}
        viewport={{ once: true, amount: 0.5 }}
      >
        <p className="font-chanel text-2xl sm:text-4xl text-shadow">{title}</p>
        <Link
          to={`/projects/${projectSlug}`}
          className="font-helvetica text-sm uppercase tracking-wider border border-white/50 rounded-full px-4 py-2 pointer-events-auto transition-colors hover:bg-white/10"
        >
          See Project
        </Link>
      </motion.div>
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

  // --- Логіка прелоадера (без змін) ---
  useEffect(() => {
    if (onPreloaderPage) setIsPreloaderActive(true);
  }, [onPreloaderPage, setIsPreloaderActive]);

  useEffect(() => {
    document.body.style.overflow = isPreloaderActive ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPreloaderActive]);

  // --- Завантаження URL відео (без змін) ---
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
        setVideoUrls(await response.json());
      } catch (error) {
        console.error('Error fetching production video URLs:', error);
      }
    };
    fetchVideoUrls();
  }, []);

  // --- Логіка скролу (без змін) ---
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
            {/* ✨ Зміни тут: передаємо projectSlug */}
            <VideoTitleOverlay
              title={video.title}
              projectSlug={video.projectSlug}
              index={index}
              isPreloaderActive={isPreloaderActive}
            />
          </div>
        );
      })}
    </div>
  );
}
