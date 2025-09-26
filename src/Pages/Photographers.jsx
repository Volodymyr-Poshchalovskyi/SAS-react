import React, { useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import PreloaderBanner from '../Components/PreloaderBanner';
import ScrollProgressBar from '../Components/ScrollProgressBar';
import { useAnimation } from '../context/AnimationContext';
// ✨ Зміна тут: Імпортуємо дані фотографів
import { photographersData } from '../Data/PhotographersData';

const MotionLink = motion(Link);

export default function Photographers() {
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

  const handleBannerAnimationComplete = () => {
    setIsPreloaderActive(false);
  };

  // ✨ Зміна тут: Новий текст для банера
  const bannerTitle = 'Masters of Light. Architects of Image.';
  const bannerDescription = 'From iconic portraiture to fashion-driven campaigns, our photographers capture the essence of story through stills that resonate. Whether shooting luxury editorials, celebrity features, or global campaigns, they deliver timeless imagery that elevates every brand narrative.';

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
          totalItems={photographersData.length}
        />
      )}

      {photographersData.map((photographer, index) => (
        <div
          key={photographer.id}
          className="relative w-full h-screen snap-start bg-black"
        >
          {/* ✨ Зміна тут: Замість VideoContainer використовуємо div з фоновим зображенням */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${photographer.coverImage})` }}
          />
          <div className="absolute inset-0 bg-black opacity-30" />

          {/* ✨ Зміна тут: Нова верстка для інформації про фотографа, як на скріншоті */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              {photographer.category}
            </p>
            <h2 className="font-chanel font-normal uppercase text-4xl sm:text-6xl md:text-[5rem] mb-8">
              {photographer.name}
            </h2>
            <Link
              to={`/photographers/${photographer.slug}`}
              className="bg-white text-black py-3 px-8 text-xs font-semibold uppercase tracking-wider
                         transition-transform hover:scale-105"
            >
              See More
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}