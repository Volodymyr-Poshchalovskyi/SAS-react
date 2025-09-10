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
const featureData = {
  title: 'FEATURE FILMS & DOCUMENTARIES',
  // У прикладі HTML текст 'FEATURE FILM PACKAGING', але я залишив дані з вашого компонента.
  // Ви можете змінити його тут, якщо потрібно.
};

export default function Feature() {
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();
  const videoURL = "/video/SHOWREEL SINNERS AND SAINTS 2024_1.mp4";

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isPreloaderActive ? 'hidden' : '';
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
    <div className="bg-black">
      <AnimatePresence>
        {isPreloaderActive && (
          <PreloaderBanner
            onAnimationComplete={handleBannerAnimationComplete}
            title={bannerTitle}
            description={bannerDescription}
          />
        )}
      </AnimatePresence>

      {!isPreloaderActive && (
        <div className="relative w-full h-screen overflow-hidden">
          <VideoContainer
            videoSrc={videoURL}
            shouldPlay={!isPreloaderActive}
          />

          {/* === ОНОВЛЕНИЙ БЛОК ОВЕРЛЕЮ === */}
          <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center">
            <motion.h1
              className="text-white font-chanel font-normal uppercase
                         text-4xl sm:text-6xl md:text-[5rem]
                         tracking-[-0.3rem] md:tracking-[-0.6rem]
                         transition-opacity duration-500 hover:opacity-50"
              variants={nameAnimation}
              initial="hidden"
              animate="visible"
            >
              {featureData.title}
            </motion.h1>
          </div>
        </div>
      )}
    </div>
  );
}