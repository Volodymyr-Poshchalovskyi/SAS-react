import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import VideoContainer from '../Components/VideoContainer';
import { AnimatePresence } from 'framer-motion';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';

const videoURL = '/video/SHOWREEL SINNERS AND SAINTS 2024_1.mp4';

const PostProduction = () => {
  const { isPreloaderActive, setIsPreloaderActive, onPreloaderPage } =
    useAnimation();

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

  const bannerTitle = 'Innovation. Finish. Storytelling Refined.';
  const bannerDescription =
    'Our post-production team blends motion control, AI-enhanced editing, CG/VFX, and color finishing to deliver bold, elevated storytelling. Every project is refined frame by flawless frame — ensuring beauty, product, and performance content resonates across every platform.';

  return (
    // ✨ ЗВЕРНІТЬ УВАГУ: Я також прибрав клас pt-36 з цього div,
    // оскільки він, ймовірно, був потрібен для відступу від видаленого банера.
    // Якщо вам потрібен відступ для хедера, можливо, варто його повернути або змінити.
    <div className="bg-white text-black min-h-screen">
      <AnimatePresence>
        {isPreloaderActive && (
          <PreloaderBanner
            title={bannerTitle}
            description={bannerDescription}
            onAnimationComplete={() => setIsPreloaderActive(false)}
          />
        )}
      </AnimatePresence>

      {/* 🗑️ ВИДАЛЕНО БЛОК H1 З НАПИСОМ "POST PRODUCTION" */}

      <div className="relative w-full h-screen bg-black">
        <VideoContainer videoSrc={videoURL} shouldPlay={!isPreloaderActive} />
        <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center">
          <h1 className="text-white font-chanel font-normal uppercase text-4xl sm:text-6xl md:text-[5rem] tracking-[-0.3rem] md:tracking-[-0.6rem] mb-8">
            SUPERNOVA
          </h1>
          <Link to="/post-production-projects">
            
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostProduction;