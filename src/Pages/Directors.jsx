// src/pages/Directors.js

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import VideoContainer from '../Components/VideoContainer';
import PreloaderBanner from '../Components/PreloaderBanner';
import ScrollProgressBar from '../Components/ScrollProgressBar';
import { useAnimation } from '../context/AnimationContext';
import { directorsData } from '../Data/DirectorsData';

// Анімація для появи імені
const nameAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

// Створюємо анімований Link для чистоти коду
const MotionLink = motion(Link);

function Directors() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isPreloaderActive ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isPreloaderActive]);

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
      
      {!isPreloaderActive && <ScrollProgressBar currentIndex={currentIndex} totalItems={directorsData.length} />}

      {directorsData.map((director, index) => (
        <div key={director.name} className="relative w-full h-screen snap-start">
          <VideoContainer
            videoSrc={director.videos[0].src}
            shouldPlay={!isPreloaderActive && currentIndex === index}
          />

          {/* === ОНОВЛЕНИЙ БЛОК === */}
          {/* Контейнер для позиціювання тексту, як у класі .content */}
          <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center">
            <MotionLink
              to={`/directors/${director.slug}`}
              // Стилі, що відповідають класу .hero-title
              className="text-white font-chanel font-normal uppercase 
                         text-4xl sm:text-6xl md:text-[5rem] 
                         tracking-[-0.3rem] md:tracking-[-0.6rem]
                         transition-opacity duration-500 hover:opacity-50"
              variants={nameAnimation}
              initial="hidden"
              // Анімація для першого елемента спрацює одразу після прелоадера
              animate={index === 0 && !isPreloaderActive ? 'visible' : undefined}
              // Анімація для інших елементів при появі у в'юпорті
              whileInView={index > 0 ? 'visible' : undefined}
              viewport={{ once: true, amount: 0.5 }}
            >
              {director.name}
            </MotionLink>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Directors;