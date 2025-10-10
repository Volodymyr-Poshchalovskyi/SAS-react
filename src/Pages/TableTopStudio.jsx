import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import HlsVideoPlayer from '../Components/HlsVideoPlayer';
import { AnimatePresence } from 'framer-motion';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import { tableTopData } from '../Data/TableTopData';

const showreelURL =
  'front-end/04-Service/TRANSCODED/01-ROUGE ALLURE VELVET NUIT BLANCHE, lipstick for a moment, allure for a night — CHANEL Makeup (1080p_25fps_H264-128kbit_AAC)/master.m3u8';
const showreelPreviewURL =
  'front-end/04-Service/VIDEO_PREVIEW/04-Service/01-ROUGE ALLURE VELVET NUIT BLANCHE, lipstick for a moment, allure for a night — CHANEL Makeup (1080p_25fps_H264-128kbit_AAC).jpg';

const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';

const TableTopStudio = () => {
  // ✅ ЗМІНА 1: Залишаємо setIsPreloaderActive для колбеку
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();

  // ❌❌❌ 2. ВИДАЛЯЄМО ЦЕЙ БЛОК ❌❌❌
  // Він конфліктує з центральною логікою.
  /*
  useEffect(() => {
    if (onPreloaderPage) setIsPreloaderActive(true);
    return () => {
      setIsPreloaderActive(false);
    };
  }, [onPreloaderPage, setIsPreloaderActive]);
  */

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
    <div className="bg-white text-black min-h-screen">
      <AnimatePresence>
        {isPreloaderActive && (
          <PreloaderBanner
            title={bannerTitle}
            description={bannerDescription}
            // ✅ 3. Залишаємо цей колбек для коректного завершення анімації
            onAnimationComplete={() => setIsPreloaderActive(false)}
          />
        )}
      </AnimatePresence>

      <div className="relative w-full h-screen bg-black">
        <HlsVideoPlayer
          src={`${CDN_BASE_URL}/${showreelURL}`}
          previewSrc={`${CDN_BASE_URL}/${showreelPreviewURL}`}
          shouldPlay={!isPreloaderActive}
          isMuted={true}
          isLooped={true}
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
          <HlsVideoPlayer
            src={`${CDN_BASE_URL}/${project.src}`}
            previewSrc={`${CDN_BASE_URL}/${project.preview_src}`}
            shouldPlay={!isPreloaderActive}
            isMuted={true}
            isLooped={true}
          />
          <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center">
            <Link to={`/projects/${project.projectSlug}`}>
              {/* Цей заголовок залишається без анімації, як ви й просили */}
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