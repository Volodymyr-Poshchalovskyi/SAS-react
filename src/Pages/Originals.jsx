// src/pages/Originals.js

import React, { useLayoutEffect, useEffect } from 'react'; // Видалимо useState та useRef, оскільки їх вже не потрібно тут
import { AnimatePresence } from 'framer-motion';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import VideoContainer from '../Components/VideoContainer';
import { Link } from 'react-router-dom';

const originalsData = [
  {
    id: 1,
    title: 'SINNERS AND SAINTS SHOWREEL 2024',
    projectLink: '/projects/showreel-2024',
    videoSrc: '/video/SHOWREEL SINNERS AND SAINTS 2024_1.mp4' 
  },
  {
    id: 2,
    title: 'FEATURED FASHION FILM',
    projectLink: '/projects/fashion-film',
    videoSrc: '/video/SHOWREEL SINNERS AND SAINTS 2024_1.mp4' 
  }
];

// Цей компонент залишиться для оверлею
const OriginalsVideoOverlay = ({ item }) => {
  return (
    <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center">
      <div className="text-white">
        <p className="text-2xl mb-6 font-light" style={{textShadow: '0 2px 6px rgba(0,0,0,0.5)'}}>
          {item.title}
        </p>
        <Link to={item.projectLink}>
          <button className="bg-white text-black py-4 px-10 text-xs font-semibold uppercase tracking-wider
                           transition-transform hover:scale-105">
            See Project
          </button>
        </Link>
      </div>
    </div>
  );
};


export default function Originals() {
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();

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
      
      {/* Відео тепер завжди в DOM, але не відтворюються, поки прелоадер активний */}
      <div className="flex flex-col">
        {originalsData.map((item) => (
          <section key={item.id} className="relative w-full h-screen bg-black overflow-hidden">
            <VideoContainer
              videoSrc={item.videoSrc}
              // Замінюємо логіку на пропс shouldPlay, як у Production.js
              shouldPlay={!isPreloaderActive}
            />
            <OriginalsVideoOverlay item={item} />
          </section>
        ))}
      </div>
    </div>
  );
}