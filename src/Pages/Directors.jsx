import React, { useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import HlsVideoPlayer from '../Components/HlsVideoPlayer';
import PreloaderBanner from '../Components/PreloaderBanner';
import ScrollProgressBar from '../Components/ScrollProgressBar';
import { useAnimation } from '../context/AnimationContext';
import { directorsData } from '../Data/DirectorsData';

const nameAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const DirectorSlide = ({ director, isActive, shouldPreload, isPreloaderActive }) => {
  const [videoSrc, setVideoSrc] = useState('');
  const publicCdnUrl = `https://storage.googleapis.com/new-sas-media-storage/${director.videos[0].src}`;

  useEffect(() => {
    // Керуємо джерелом відео: встановлюємо URL, якщо слайд активний
    // або має бути попередньо завантажений.
    if (isActive || shouldPreload) {
      setVideoSrc(publicCdnUrl);
    } 
    // В іншому випадку — очищуємо src, щоб зупинити завантаження.
    else {
      setVideoSrc('');
    }
  }, [isActive, shouldPreload, publicCdnUrl]);

  return (
    <div className="relative w-full h-screen snap-start">
      {/* Рендеримо плеєр, тільки якщо є що завантажувати/відтворювати */}
      {videoSrc && (
        <HlsVideoPlayer
          src={videoSrc}
          shouldPlay={isActive && !isPreloaderActive} // Відтворюємо тільки активне відео
        />
      )}
      <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          variants={nameAnimation}
          initial="hidden"
          // Анімація з'являється тільки для активного слайда
          animate={isActive && !isPreloaderActive ? 'visible' : 'hidden'}
        >
          <Link
            to={`/directors/${director.slug}`}
            className="text-white font-chanel font-normal uppercase text-4xl sm:text-6xl md:text-[5rem] tracking-[-0.3rem] md:tracking-[-0.6rem] transition-opacity duration-500 hover:opacity-50"
          >
            {director.name}
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default function Directors() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isPreloaderActive, setIsPreloaderActive, onPreloaderPage } = useAnimation();

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

  const bannerTitle = 'VISIONARY STORYTELLERS. COMMERCIAL REBELS. GLOBAL CREATORS.';
  const bannerDescription =
    'From award-winning filmmakers to fashion-forward image makers, our directors and hybrid talent deliver world-class content across commercials, music videos, branded series, and global campaigns.';

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
          totalItems={directorsData.length}
        />
      )}

      {directorsData.map((director, index) => {
        // Визначаємо стан кожного слайду прямо тут
        const isActive = index === currentIndex;
        const shouldPreload = Math.abs(index - currentIndex) === 1;

        return (
          <DirectorSlide
            key={director.id}
            director={director}
            isActive={isActive}
            shouldPreload={shouldPreload}
            isPreloaderActive={isPreloaderActive}
          />
        );
      })}
    </div>
  );
}