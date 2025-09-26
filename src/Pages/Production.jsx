// src/pages/Production.js

import React, { useLayoutEffect, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import VideoContainer from '../Components/VideoContainer';

const productionData = [
  {
    id: 1,
    title: 'FULL-SERVICE COMMERCIAL PRODUCTION',
    projectLink: '/services/commercials',
  },
  {
    id: 2,
    title: 'GLOBAL BRANDED CONTENT',
    projectLink: '/services/branded-content',
  },
];

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

export default function Production() {
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();
  const videoURL = '/video/SHOWREEL SINNERS AND SAINTS 2024_1.mp4';

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

  const bannerTitle =
    'Global Production. White Glove Support.';
  const bannerDescription =
    'Celebrity-driven production, luxury brand campaigns, and international shoots are our specialty. We travel megastars in music, film, and fashion, producing high-impact content across the globe. Our teams in Los Angeles, New York, Mexico City, Bangkok, and beyond provide full-service line production, location sourcing, casting, and post.';

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
        <div className="relative w-full h-screen overflow-hidden">
          <VideoContainer videoSrc={videoURL} shouldPlay={!isPreloaderActive} />
          <VideoOverlay
            title={productionData[0].title}
            projectLink={productionData[0].projectLink}
          />
        </div>

        <div className="relative w-full h-screen overflow-hidden">
          <VideoContainer videoSrc={videoURL} shouldPlay={!isPreloaderActive} />
          <VideoOverlay
            title={productionData[1].title}
            projectLink={productionData[1].projectLink}
          />
        </div>
      </div>
    </div>
  );
}
