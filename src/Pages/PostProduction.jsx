// src/Pages/PostProduction.jsx

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import HlsVideoPlayer from '../Components/HlsVideoPlayer';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import { postProductionData } from '../Data/PostProductionData';
import { useInView } from 'react-intersection-observer';

const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';

const nameAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const ProductionBlock = ({ director, isPreloaderActive }) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  const firstVideo = director.videos[0];
  const publicVideoUrl = `${CDN_BASE_URL}/${firstVideo.src}`;
  const publicPreviewUrl = firstVideo.preview_src
    ? `${CDN_BASE_URL}/${firstVideo.preview_src}`
    : '';

  return (
    <div ref={ref} className="relative w-full h-screen bg-black">
      <HlsVideoPlayer
        src={publicVideoUrl}
        previewSrc={publicPreviewUrl}
        shouldPlay={inView && !isPreloaderActive}
        startTime={firstVideo.startTime}
      />
      <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          variants={nameAnimation}
          initial="hidden"
          animate={inView && !isPreloaderActive ? 'visible' : 'hidden'}
        >
          <Link
            to={`/post-production/${director.slug}`}
            className="text-white font-chanel font-normal uppercase text-4xl sm:text-6xl md:text-[5rem] tracking-[-0.3rem] md:tracking-[-0.6rem] transition-opacity duration-500 hover:opacity-50"
          >
            {director.name}
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default function Production() {
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();

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

      {postProductionData.map((director) => (
        <ProductionBlock
          key={director.id}
          director={director}
          isPreloaderActive={isPreloaderActive}
        />
      ))}
    </div>
  );
}