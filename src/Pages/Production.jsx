import React  from 'react';
import { useState, useEffect, useLayoutEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import VideoContainer from '../Components/VideoContainer';
import ScrollProgressBar from '../Components/ScrollProgressBar'; // ✨ NEW: Імпортуємо прогрес-бар
import { productionData } from '../Data/ProductionData';

const VideoTitleOverlay = ({ title }) => {
  return (
    <div className="absolute inset-0 z-10 flex items-end justify-center text-center p-8 pb-24 text-white pointer-events-none">
      <p className="font-chanel text-2xl sm:text-4xl text-shadow">{title}</p>
    </div>
  );
};

export default function Production() {
  const { isPreloaderActive, setIsPreloaderActive, onPreloaderPage } =
    useAnimation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoUrls, setVideoUrls] = useState({});

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- Логіка прелоадера ---
  useEffect(() => {
    if (onPreloaderPage) {
      setIsPreloaderActive(true);
    }
  }, [onPreloaderPage, setIsPreloaderActive]);

  useEffect(() => {
    document.body.style.overflow = isPreloaderActive ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPreloaderActive]);

  // --- Завантаження URL відео (тепер запускається одночасно з прелоадером) ---
  useEffect(() => {
    const fetchVideoUrls = async () => {
      const gcsPaths = productionData.map((video) => video.src);
      try {
        const response = await fetch(
          'http://localhost:3001/generate-read-urls',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gcsPaths }),
          }
        );
        if (!response.ok) throw new Error('Failed to fetch video URLs');
        const urlsMap = await response.json();
        setVideoUrls(urlsMap);
      } catch (error) {
        console.error('Error fetching production video URLs:', error);
      }
    };
    fetchVideoUrls();
  }, []);

  // --- Логіка скролу ---
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

  // --- Текст для банера ---
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

      {/* ✨ NEW: Додаємо прогрес-бар, який з'являється після прелоадера */}
      {!isPreloaderActive && (
        <ScrollProgressBar
          currentIndex={currentIndex}
          totalItems={productionData.length}
        />
      )}

      {/* ✨ MODIFIED: Рендеримо контент одразу, а не чекаємо на кінець анімації прелоадера */}
      {productionData.map((video, index) => {
        const signedUrl = videoUrls[video.src];
        return (
          <div key={video.id} className="relative w-full h-screen snap-start">
            {/* ✨ MODIFIED: Логіка рендерингу VideoContainer як на сторінці Directors */}
            {signedUrl && (
              <VideoContainer
                videoSrc={signedUrl}
                shouldPlay={!isPreloaderActive && currentIndex === index}
              />
            )}
            <VideoTitleOverlay title={video.title} />
          </div>
        );
      })}
    </div>
  );
}