// src/Pages/TableTopStudio.jsx

import React, { useState, useEffect, useLayoutEffect } from 'react'; // ✨ Додано useState та useLayoutEffect
import { Link } from 'react-router-dom';
import VideoContainer from '../Components/VideoContainer';
import { AnimatePresence } from 'framer-motion';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import { tableTopData } from '../Data/TableTopData'; 

const showreelURL = 'front-end/04-Service/01-ROUGE ALLURE VELVET NUIT BLANCHE, lipstick for a moment, allure for a night — CHANEL Makeup (1080p_25fps_H264-128kbit_AAC).mp4';

const TableTopStudio = () => {
  const { isPreloaderActive, setIsPreloaderActive, onPreloaderPage } = useAnimation();
  // ✨ Крок 1: Додаємо стан для зберігання підписаних URL
  const [videoUrls, setVideoUrls] = useState({});

  // ✨ Крок 2: Додаємо логіку для завантаження URL
  useEffect(() => {
    const fetchVideoUrls = async () => {
      // Збираємо всі шляхи до відео: шоуріл + всі проєкти
      const gcsPaths = [showreelURL, ...tableTopData.map(p => p.src)];
      
      try {
        const response = await fetch('http://localhost:3001/generate-read-urls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gcsPaths }),
        });
        if (!response.ok) throw new Error('Failed to fetch video URLs');
        setVideoUrls(await response.json());
      } catch (error) {
        console.error('Error fetching Table Top video URLs:', error);
      }
    };

    fetchVideoUrls();
  }, []); // Запускаємо один раз при завантаженні компонента


  // Логіка прелоадера (без змін)
  useEffect(() => {
    if (onPreloaderPage) setIsPreloaderActive(true);
  }, [onPreloaderPage, setIsPreloaderActive]);

  useEffect(() => {
    document.body.style.overflow = isPreloaderActive ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isPreloaderActive]);

  const bannerTitle = 'Beauty. Flavor. Precision in Motion.';
  const bannerDescription = 'Our in-house studio crafts bold beauty, product, and food visuals with cinematic detail. From the perfect swipe to the slow-motion pour, we transform everyday objects into irresistible icons for commercials, social, and branded content.';

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

      <h1 className="text-center text-4xl md:text-5xl font-semibold text-black py-12 uppercase tracking-wider">
        TABLE TOP DIVISION
      </h1>

      <div className="relative w-full h-screen bg-black">
        {/* ✨ Крок 3: Використовуємо підписаний URL для шоуріла */}
        <VideoContainer videoSrc={videoUrls[showreelURL]} shouldPlay={!isPreloaderActive} />
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
          {/* ✨ Крок 3: Використовуємо підписаний URL для кожного проєкту */}
          <VideoContainer videoSrc={videoUrls[project.src]} shouldPlay={!isPreloaderActive} />
          <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center">
            <h1 className="text-white font-chanel font-normal uppercase text-4xl sm:text-6xl md:text-[5rem] tracking-[-0.3rem] md:tracking-[-0.6rem] mb-8">
              {project.title}
            </h1>
            <Link to={`/projects/${project.projectSlug}`}>
              <button className="py-3 px-8 text-xs font-normal bg-white text-black border-2 border-white hover:bg-transparent hover:text-white transition-colors duration-300">
                SEE PROJECT
              </button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableTopStudio;