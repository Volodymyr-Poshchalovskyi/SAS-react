// src/Pages/Assignment.jsx

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import VideoContainer from '../Components/VideoContainer';
import PreloaderBanner from '../Components/PreloaderBanner';
import ScrollProgressBar from '../Components/ScrollProgressBar';
import { useAnimation } from '../context/AnimationContext';
import { assignmentData } from '../Data/AssignmentData';

const nameAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

export default function Assignment() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isPreloaderActive, setIsPreloaderActive, onPreloaderPage } =
    useAnimation();
  
  // ❗️ Ми видалили стан `videoUrls` і `useEffect` для запиту на бекенд.

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (onPreloaderPage) {
      setIsPreloaderActive(true);
    }
    return () => {
      setIsPreloaderActive(false);
    };
  }, [onPreloaderPage, setIsPreloaderActive]);

  useEffect(() => {
    document.body.style.overflow = isPreloaderActive ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
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

  const bannerTitle = 'ELITE TALENT. LIMITED AVAILABILITY.';
  const bannerDescription =
    'Our On Assignment division represents top-tier talent available exclusively for select projects. These creators bring a unique vision and expertise, adding unparalleled value to any production.';

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
          totalItems={assignmentData.length}
        />
      )}

      {assignmentData.map((director, index) => {
        const gcsPath = director.videos[0].src;
        
        // ✨ ФОРМУЄМО ПРЯМЕ ПОСИЛАННЯ НА CDN ДЛЯ КОЖНОГО ВІДЕО
        const publicCdnUrl = `http://34.54.191.201/${gcsPath}`;

        return (
          <div
            key={director.id}
            className="relative w-full h-screen snap-start"
          >
            {publicCdnUrl && (
              <VideoContainer
                videoSrc={publicCdnUrl}
                shouldPlay={!isPreloaderActive && currentIndex === index}
              />
            )}
            <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center">
              <motion.div
                className="flex flex-col items-center gap-4"
                variants={nameAnimation}
                initial="hidden"
                animate={
                  index === 0 && !isPreloaderActive ? 'visible' : undefined
                }
                whileInView={index > 0 ? 'visible' : undefined}
                viewport={{ once: true, amount: 0.5 }}
              >
                <Link
                  to={`/assignment/${director.slug}`}
                  className="text-white font-chanel font-normal uppercase text-4xl sm:text-6xl md:text-[5rem] tracking-[-0.3rem] md:tracking-[-0.6rem] transition-opacity duration-500 hover:opacity-50"
                >
                  {director.name}
                </Link>

                
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );
}