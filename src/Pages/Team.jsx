// src/pages/Team.js

import React, { useLayoutEffect, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import VideoContainer from '../Components/VideoContainer';

// Анімація для заголовка
const nameAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

// Дані для сторінки
const teamData = {
  title: 'MEET THE SINNERS',
};

export default function Team() {
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

      <div className="relative w-full h-screen overflow-hidden">
        <VideoContainer
          videoSrc={videoURL}
          shouldPlay={!isPreloaderActive}
        />

        <div className="absolute inset-0 z-10 flex items-end justify-center">
          <motion.h1
            className="text-white text-4xl sm:text-5xl md:text-6xl font-chanel font-semibold uppercase pb-16 text-center px-4"
            variants={nameAnimation}
            initial="hidden"
            animate={!isPreloaderActive ? "visible" : "hidden"}
          >
            {teamData.title}
          </motion.h1>
        </div>
      </div>
    </div>
  );
}