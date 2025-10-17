// src/pages/Production.js

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import HlsVideoPlayer from '../Components/HlsVideoPlayer';
import ScrollProgressBar from '../Components/ScrollProgressBar';
// Дані залишаються тими самими, тому я їх приховав для стислості
import { productionData } from '../Data/ProductionData';

const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';

const nameAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

// ▼▼▼ ЗМІНА №1: Приймаємо новий проп `client` ▼▼▼
const VideoTitleOverlay = ({
  title,
  client, // <--- ДОДАНО
  projectSlug,
  index,
  isPreloaderActive,
}) => {
  return (
    <div className="absolute inset-0 z-10 flex items-end justify-center text-center p-8 pb-24 text-white pointer-events-none">
      <motion.div
        className="flex flex-col items-center gap-4"
        variants={nameAnimation}
        initial="hidden"
        animate={index === 0 && !isPreloaderActive ? 'visible' : undefined}
        whileInView={index > 0 ? 'visible' : undefined}
        viewport={{ once: true, amount: 0.5 }}
      >
        <p className="font-chanel text-2xl sm:text-4xl text-shadow">{title}</p>
        
        {/* ▼▼▼ ЗМІНА №2: Відображаємо `client` з відповідними стилями ▼▼▼ */}
        <p className="font-light text-sm tracking-widest uppercase text-shadow">
          {client}
        </p>
        {/* ▲▲▲ ДОДАНО ▲▲▲ */}

        <Link
          to={`/projects/${projectSlug}`}
          className="py-3 px-8 text-xs font-normal bg-white text-black border-2 border-white hover:bg-transparent hover:text-white transition-colors duration-300 pointer-events-auto"
        >
          See Project
        </Link>
      </motion.div>
    </div>
  );
};

export default function Production() {
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const bannerTitle = 'Global Production. White Glove Support.';
  const bannerDescription =
    'Celebrity-driven production, luxury brand campaigns, and international shoots are our specialty. We travel megastars in music, film, and fashion, producing high-impact content across the globe. Our teams in Los Angeles, New York, Mexico City, Bangkok, and beyond provide full-service line production, location sourcing, casting, and post.';

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
          totalItems={productionData.length}
        />
      )}

      {productionData.map((video, index) => {
        const publicVideoUrl = `${CDN_BASE_URL}/${video.src}`;
        const publicPreviewUrl = video.preview_src
          ? `${CDN_BASE_URL}/${video.preview_src}`
          : '';

        return (
          <div key={video.id} className="relative w-full h-screen snap-start">
            {publicVideoUrl && (
              <HlsVideoPlayer
                src={publicVideoUrl}
                previewSrc={publicPreviewUrl}
                shouldPlay={!isPreloaderActive && currentIndex === index}
                startTime={video.startTime}
              />
            )}
            <VideoTitleOverlay
              title={video.title}
              client={video.client} // <--- ▼▼▼ ЗМІНА №3: Передаємо проп `client` ▼▼▼
              projectSlug={video.projectSlug}
              index={index}
              isPreloaderActive={isPreloaderActive}
            />
          </div>
        );
      })}
    </div>
  );
}