// src/pages/Management.js

import React, { useLayoutEffect, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // 1. Імпортуємо motion для анімації
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import VideoContainer from '../Components/VideoContainer';

// Анімація для заголовка, як на сторінці Directors
const nameAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

// Дані для сторінки
const managementData = {
  title: 'ARTIST MANAGEMENT & REPRESENTATION',
};

export default function Management() {
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();
  const videoURL = "/video/SHOWREEL SINNERS AND SAINTS 2024_1.mp4";

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isPreloaderActive ? 'hidden' : '';
    if (!isPreloaderActive) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPreloaderActive]);

  const handleBannerAnimationComplete = () => {
    setIsPreloaderActive(false);
  };

  const bannerTitle = "VISIONARY STORYTELLERS. COMMERCIAL REBELS. GLOBAL CREATORS.";
  const bannerDescription = "From award-winning filmmakers to fashion-forward image makers, our directors and hybrid talent deliver world-class content across commercials, music videos, branded series, and global campaigns.";

  return (
    <div>
      <AnimatePresence>
        {isPreloaderActive && (
          <PreloaderBanner
            onAnimationComplete={handleBannerAnimationComplete}
            title={bannerTitle}
            description={bannerDescription}
          />
        )}
      </AnimatePresence>

      {/* 2. Залишаємо тільки один контейнер з відео */}
      <div className="relative w-full h-screen overflow-hidden">
        <VideoContainer
          videoSrc={videoURL}
          shouldPlay={!isPreloaderActive}
        />

        {/* 3. Новий оверлей: тільки заголовок зі стилями з Directors.js */}
        <div className="absolute inset-0 z-10 flex items-end justify-center">
          <motion.h1
            className="text-white text-4xl sm:text-5xl md:text-6xl font-chanel font-semibold uppercase pb-16 text-center px-4"
            variants={nameAnimation}
            initial="hidden"
            animate={!isPreloaderActive ? "visible" : "hidden"}
          >
            {managementData.title}
          </motion.h1>
        </div>
      </div>
    </div>
  );
}