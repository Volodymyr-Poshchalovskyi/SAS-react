// src/pages/Production.js

import React, { useLayoutEffect, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import VideoContainer from '../Components/VideoContainer';

// 1. Оновлені дані спеціально для сторінки Production
const productionData = [
  {
    id: 1,
    title: 'FULL-SERVICE COMMERCIAL PRODUCTION',
    projectLink: '/services/commercials' // Приклад посилання
  },
  {
    id: 2,
    title: 'GLOBAL BRANDED CONTENT',
    projectLink: '/services/branded-content' // Приклад посилання
  }
];

// Цей компонент оверлею залишається без змін
const VideoOverlay = ({ title, projectLink }) => {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-end text-center p-8 mb-8 text-white">
      <p className="text-lg font-light mb-4">{title}</p>
      <Link to={projectLink}>
        <button className="bg-white text-black py-3 px-6 text-sm font-semibold uppercase tracking-wider transition-colors duration-300 hover:bg-opacity-80">
          See Project
        </button>
      </Link>
    </div>
  );
};

// 2. Змінено назву компонента на Production
export default function Production() {
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();
  const videoURL = "/video/SHOWREEL SINNERS AND SAINTS 2024_1.mp4"; // Використовуємо те ж відео

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

      <div className="flex flex-col">
        {/* Перший контейнер відео на весь екран */}
        <div className="relative w-full h-screen overflow-hidden">
          <VideoContainer
            videoSrc={videoURL}
            shouldPlay={!isPreloaderActive}
          />
          <VideoOverlay 
            title={productionData[0].title} 
            projectLink={productionData[0].projectLink} 
          />
        </div>

        {/* Другий контейнер відео на весь екран */}
        <div className="relative w-full h-screen overflow-hidden">
          <VideoContainer
            videoSrc={videoURL}
            shouldPlay={!isPreloaderActive}
          />
          <VideoOverlay 
            title={productionData[1].title} 
            projectLink={productionData[1].projectLink} 
          />
        </div>
      </div>
    </div>
  );
}