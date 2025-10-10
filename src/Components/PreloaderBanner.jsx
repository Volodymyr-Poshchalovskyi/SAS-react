import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../context/AnimationContext';

const fadeAnimation = {
  duration: 0.8,
  ease: 'easeInOut',
};

export default function PreloaderBanner({
  title,
  description,
  onAnimationComplete,
}) {
  const { isBannerFadingOut, setIsBannerFadingOut, markPreloaderAsShown } = useAnimation();
  const [isUnmounted, setIsUnmounted] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const titleWords = title ? title.split(' ') : [];
  const descriptionWords = description ? description.split(' ') : [];
  const lastWordIndex = descriptionWords.length - 1;

  const titleContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
  };

  const descriptionContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: 1, staggerChildren: 0.15 } },
  };

  const wordVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  // ✅ ПОВЕРТАЄМОСЯ ДО ПРАВИЛЬНОЇ ЛОГІКИ
  const handleTextAnimationComplete = () => {
    // 1. Позначаємо сторінку як переглянуту. Завдяки змінам у контексті,
    // це більше не призведе до миттєвого зникнення банера.
    markPreloaderAsShown();

    // 2. Запускаємо таймер на затримку перед зникненням.
    timerRef.current = setTimeout(() => {
      setIsBannerFadingOut(true);
    }, 2000);
  };

  if (isUnmounted) {
    return null;
  }

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-start justify-center px-8 py-6 md:px-16 md:py-10 bg-black/20 backdrop-blur-xs border-t border-white/10"
      initial={{ opacity: 1 }}
      animate={{ opacity: isBannerFadingOut ? 0 : 1 }}
      transition={fadeAnimation}
      onAnimationComplete={() => {
        if (isBannerFadingOut) {
          setIsUnmounted(true);
          if (onAnimationComplete) {
            onAnimationComplete();
          }
          setIsBannerFadingOut(false);
        }
      }}
    >
      <motion.h1
        className="font-chanel font-semibold text-white text-2xl md:text-4xl uppercase"
        variants={titleContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {titleWords.map((word, index) => (
          <motion.span key={index} variants={wordVariants} className="inline-block mr-3">
            {word}
          </motion.span>
        ))}
      </motion.h1>

      <motion.p
        className="font-montserrat text-gray-200 text-base max-w-5xl mt-4 normal-case"
        variants={descriptionContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {descriptionWords.map((word, index) => (
          <motion.span
            key={index}
            variants={wordVariants}
            className="inline-block mr-2"
            onAnimationComplete={() => {
              if (index === lastWordIndex) {
                handleTextAnimationComplete();
              }
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.p>
    </motion.div>
  );
}