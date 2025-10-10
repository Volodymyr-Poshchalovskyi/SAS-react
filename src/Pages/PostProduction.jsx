import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // ✨ 1. Імпортуємо motion
import VideoContainer from '../Components/VideoContainer';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';

const videoURL = '/video/SHOWREEL SINNERS AND SAINTS 2024_1.mp4';

// ✨ 2. Додаємо об'єкт з варіантами анімації
const nameAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const PostProduction = () => {
  // ✅ 3. Відновлюємо setIsPreloaderActive для правильного колбеку
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();

  // ❌❌❌ 4. ВИДАЛЯЄМО ЦЕЙ БЛОК ❌❌❌
  // Він конфліктує з центральною логікою в AnimationContext.
  /*
  useEffect(() => {
    if (onPreloaderPage) {
      setIsPreloaderActive(true);
    }
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

  const bannerTitle = 'Innovation. Finish. Storytelling Refined.';
  const bannerDescription =
    'Our post-production team blends motion control, AI-enhanced editing, CG/VFX, and color finishing to deliver bold, elevated storytelling. Every project is refined frame by flawless frame — ensuring beauty, product, and performance content resonates across every platform.';

  return (
    <div className="bg-white text-black min-h-screen">
      <AnimatePresence>
        {isPreloaderActive && (
          <PreloaderBanner
            title={bannerTitle}
            description={bannerDescription}
            // ✅ 5. Відновлюємо onAnimationComplete для коректного завершення
            onAnimationComplete={() => setIsPreloaderActive(false)}
          />
        )}
      </AnimatePresence>

      <div className="relative w-full h-screen bg-black">
        <VideoContainer videoSrc={videoURL} shouldPlay={!isPreloaderActive} />
        <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center">
          {/* ✨ 6. Перетворюємо h1 на motion.h1 і додаємо логіку анімації */}
          <motion.h1
            className="text-white font-chanel font-normal uppercase text-4xl sm:text-6xl md:text-[5rem] tracking-[-0.3rem] md:tracking-[-0.6rem] mb-8"
            variants={nameAnimation}
            initial="hidden"
            animate={!isPreloaderActive ? 'visible' : 'hidden'}
          >
            SUPERNOVA
          </motion.h1>
          <Link to="/post-production-projects">
            
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostProduction;