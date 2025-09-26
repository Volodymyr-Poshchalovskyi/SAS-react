// src/pages/Directors.js

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import VideoContainer from '../Components/VideoContainer';
import PreloaderBanner from '../Components/PreloaderBanner';
import ScrollProgressBar from '../Components/ScrollProgressBar';
import { useAnimation } from '../context/AnimationContext';
import { directorsData } from '../Data/DirectorsData';

const nameAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const MotionLink = motion(Link);

function Directors() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();
  
  // 1. Стан для зберігання підписаних URL-адрес
  // Структура: { 'gcs/path/1': 'https://signed.url/1', 'gcs/path/2': '...' }
  const [videoUrls, setVideoUrls] = useState({});

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 2. Ефект для завантаження URL-адрес, коли прелоадер зникає
  useEffect(() => {
    // Завантажуємо відео, тільки коли сторінка стає видимою
    if (!isPreloaderActive && Object.keys(videoUrls).length === 0) {
      const fetchVideoUrls = async () => {
        // Збираємо всі GCS шляхи з даних
        const gcsPaths = directorsData.map(director => director.videos[0].src);
        
        try {
          const response = await fetch('http://localhost:3001/generate-read-urls', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gcsPaths }),
          });
          if (!response.ok) throw new Error('Failed to fetch video URLs');
          
          const urlsMap = await response.json();
          setVideoUrls(urlsMap);
        } catch (error) {
          console.error('Error fetching director video URLs:', error);
        }
      };

      fetchVideoUrls();
    }
  }, [isPreloaderActive, videoUrls]); // Залежність від isPreloaderActive

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

  const handleBannerAnimationComplete = () => {
    setIsPreloaderActive(false);
  };

  const bannerTitle = 'VISIONARY STORYTELLERS. COMMERCIAL REBELS. GLOBAL CREATORS.';
  const bannerDescription = 'From award-winning filmmakers to fashion-forward image makers, our directors and hybrid talent deliver world-class content across commercials, music videos, branded series, and global campaigns.';

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
        <ScrollProgressBar
          currentIndex={currentIndex}
          totalItems={directorsData.length}
        />
      )}

      {directorsData.map((director, index) => {
        // 3. Отримуємо GCS шлях та відповідний підписаний URL зі стану
        const gcsPath = director.videos[0].src;
        const signedUrl = videoUrls[gcsPath];

        return (
          <div
            key={director.id} // Краще використовувати унікальний id як ключ
            className="relative w-full h-screen snap-start"
          >
            {/* 4. Передаємо підписаний URL в VideoContainer */}
            {/* Відео буде відрендерено, тільки коли signedUrl стане доступним */}
            {signedUrl && (
              <VideoContainer
                videoSrc={signedUrl}
                shouldPlay={!isPreloaderActive && currentIndex === index}
              />
            )}

            <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center">
              <MotionLink
                to={`/directors/${director.slug}`}
                className="text-white font-chanel font-normal uppercase 
                           text-4xl sm:text-6xl md:text-[5rem] 
                           tracking-[-0.3rem] md:tracking-[-0.6rem]
                           transition-opacity duration-500 hover:opacity-50"
                variants={nameAnimation}
                initial="hidden"
                animate={
                  index === 0 && !isPreloaderActive ? 'visible' : undefined
                }
                whileInView={index > 0 ? 'visible' : undefined}
                viewport={{ once: true, amount: 0.5 }}
              >
                {director.name}
              </MotionLink>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Directors;