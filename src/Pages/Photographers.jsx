import React, { useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import PreloaderBanner from '../Components/PreloaderBanner';
import ScrollProgressBar from '../Components/ScrollProgressBar';
import { useAnimation } from '../context/AnimationContext';
import { photographersData } from '../Data/PhotographersData';

const nameAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

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

  const bannerTitle = 'Masters of Light. Architects of Image.';
  const bannerDescription =
    'From iconic portraiture to fashion-driven campaigns, our photographers capture the essence of story through stills that resonate. Whether shooting luxury editorials, celebrity features, or global campaigns, they deliver timeless imagery that elevates every brand narrative.';

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
          totalItems={photographersData.length}
        />
      )}

      {photographersData.map((photographer, index) => (
        <div
          key={photographer.id}
          // ✅ ОСЬ ЄДИНА ЗМІНА: додано 'overflow-hidden'
          className="relative w-full h-screen snap-start bg-black overflow-hidden"
        >
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-500 ease-in-out"
            style={{
              backgroundImage: `url(${photographer.coverImage})`,
              transform: index === currentIndex && !isPreloaderActive ? 'scale(1)' : 'scale(1.05)',
            }}
          />
          <div className="absolute inset-0 bg-black opacity-30" />
          <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center">
            <motion.div
              className="flex flex-col items-center gap-4"
              variants={nameAnimation}
              initial="hidden"
              animate={index === currentIndex && !isPreloaderActive ? 'visible' : 'hidden'}
            >
              <Link
                to={`/photographers/${photographer.slug}`}
                className="text-white font-chanel font-normal uppercase text-4xl sm:text-6xl md:text-[5rem] tracking-[-0.3rem] md:tracking-[-0.6rem] transition-opacity duration-500 hover:opacity-50"
              >
                {photographer.name}
              </Link>
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
}