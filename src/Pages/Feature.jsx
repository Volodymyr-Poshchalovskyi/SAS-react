// src/pages/Feature.jsx

import React, { useLayoutEffect, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import VideoContainer from '../Components/VideoContainer';

const nameAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const featureData = {
  title: 'FEATURE FILMS & DOCUMENTARIES',
};

export default function Feature() {
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();
  const videoURL = '/video/SHOWREEL SINNERS AND SAINTS 2024_1.mp4';

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

  const bannerTitle =
    'From Script to Screen.';
  const bannerDescription =
    'Our feature film division specializes in packaging commercially viable projects with top-tier talent, financing strategies, and distribution plans. Whether building a festival hit or a streamer-ready series, we develop narratives with lasting impact.';

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
          <VideoContainer videoSrc={videoURL} shouldPlay={!isPreloaderActive} />

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
