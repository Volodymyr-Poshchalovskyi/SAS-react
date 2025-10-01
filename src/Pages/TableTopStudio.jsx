// src/Pages/TableTopStudio.jsx

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import VideoContainer from '../Components/VideoContainer';
import { AnimatePresence } from 'framer-motion';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import { tableTopData } from '../Data/TableTopData';

const showreelURL =
  'front-end/04-Service/01-ROUGE ALLURE VELVET NUIT BLANCHE, lipstick for a moment, allure for a night — CHANEL Makeup (1080p_25fps_H264-128kbit_AAC).mp4';

// ✨ Додаємо константу для базового URL нашого CDN
const CDN_BASE_URL = 'http://34.54.191.201';

const TableTopStudio = () => {
  const { isPreloaderActive, setIsPreloaderActive, onPreloaderPage } =
    useAnimation();

  // Логіка прелоадера (без змін)
  useEffect(() => {
    if (onPreloaderPage) setIsPreloaderActive(true);
  }, [onPreloaderPage, setIsPreloaderActive]);

  useEffect(() => {
    document.body.style.overflow = isPreloaderActive ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPreloaderActive]);

  const bannerTitle = 'Beauty. Flavor. Precision in Motion.';
  const bannerDescription =
    'Our in-house studio crafts bold beauty, product, and food visuals with cinematic detail. From the perfect swipe to the slow-motion pour, we transform everyday objects into irresistible icons for commercials, social, and branded content.';

  return (
    <div className="bg-white text-black min-h-screen pt-36">
      <AnimatePresence>
        {isPreloaderActive && (
          <PreloaderBanner
            title={bannerTitle}
            description={bannerDescription}
            onAnimationComplete={() => setIsPreloaderActive(false)}
          />
        )}
      </AnimatePresence>

      {/* ✨ ЗМІНА: Заголовок "TABLE TOP DIVISION" було видалено звідси. */}

      <div className="relative w-full h-screen bg-black">
        {/* ✨ Використовуємо пряме посилання на CDN для шоуріла */}
        <VideoContainer
          videoSrc={`${CDN_BASE_URL}/${showreelURL}`}
          shouldPlay={!isPreloaderActive}
        />
      </div>

      <div className="w-full bg-gray-100 flex items-center justify-center text-center py-24 px-8">
        <div className="max-w-3xl">
          <p className="text-base text-black font-semibold uppercase">
            HERE WILL BE LITTLE INFORMATION ABOUT STUDIO SPACE AND ECT...
          </p>
        </div>
      </div>

      {tableTopData.map((project) => (
        <div key={project.id} className="relative w-full h-screen bg-black">
          {/* ✨ Використовуємо пряме посилання на CDN для кожного проєкту */}
          <VideoContainer
            videoSrc={`${CDN_BASE_URL}/${project.src}`}
            shouldPlay={!isPreloaderActive}
          />
          <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center">
            <Link to={`/projects/${project.projectSlug}`}>
              <h1 className="text-white font-chanel font-normal uppercase text-4xl sm:text-6xl md:text-[5rem] tracking-[-0.3rem] md:tracking-[-0.6rem] mb-8">
                {project.title}
              </h1>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableTopStudio;