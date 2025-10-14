import React, { useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import HlsVideoPlayer from '../Components/HlsVideoPlayer';
import PreloaderBanner from '../Components/PreloaderBanner';
import ScrollProgressBar from '../Components/ScrollProgressBar';
import { useAnimation } from '../context/AnimationContext';
import { directorsData } from '../Data/DirectorsData';

const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';

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
  const [previewSrc, setPreviewSrc] = useState('');

  const firstVideo = director.videos[0];
  const publicVideoUrl = `${CDN_BASE_URL}/${firstVideo.src}`;
  
  const publicPreviewUrl = firstVideo.preview_src
    ? `${CDN_BASE_URL}/${firstVideo.preview_src}`
    : '';

  useEffect(() => {
    if (isActive || shouldPreload) {
      setVideoSrc(publicVideoUrl);
      setPreviewSrc(publicPreviewUrl);
    } else {
      setVideoSrc('');
      setPreviewSrc('');
    }
  }, [isActive, shouldPreload, publicVideoUrl, publicPreviewUrl]);

  return (
    <div className="relative w-full h-screen snap-start">
      {videoSrc && (
        <HlsVideoPlayer
          src={videoSrc}
          previewSrc={previewSrc}
          shouldPlay={isActive && !isPreloaderActive}
          startTime={firstVideo.startTime}
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