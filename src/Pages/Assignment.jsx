import React, { useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import HlsVideoPlayer from '../Components/HlsVideoPlayer';
import PreloaderBanner from '../Components/PreloaderBanner';
import ScrollProgressBar from '../Components/ScrollProgressBar';
import { useAnimation } from '../context/AnimationContext';
import { assignmentData } from '../Data/AssignmentData';

const nameAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const AssignmentSlide = ({ director, isActive, shouldPreload, isPreloaderActive }) => {
  const [videoSrc, setVideoSrc] = useState('');
  const publicCdnUrl = `https://storage.googleapis.com/new-sas-media-storage/${director.videos[0].src}`;

  useEffect(() => {
    if (isActive || shouldPreload) {
      setVideoSrc(publicCdnUrl);
    } else {
      setVideoSrc('');
    }
  }, [isActive, shouldPreload, publicCdnUrl]);

  return (
    <div className="relative w-full h-screen snap-start">
      {videoSrc && (
        <HlsVideoPlayer
          src={videoSrc}
          shouldPlay={isActive && !isPreloaderActive}
        />
      )}
      <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          variants={nameAnimation}
          initial="hidden"
          animate={isActive && !isPreloaderActive ? 'visible' : 'hidden'}
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
};

export default function Assignment() {
  const [currentIndex, setCurrentIndex] = useState(0);
  // ✅ ВИПРАВЛЕННЯ 1: Отримуємо setIsPreloaderActive з контексту
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            // ✅ ВИПРАВЛЕННЯ 2: Передаємо callback для оновлення стану
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
        const isActive = index === currentIndex;
        const shouldPreload = Math.abs(index - currentIndex) === 1;

        return (
          <AssignmentSlide
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