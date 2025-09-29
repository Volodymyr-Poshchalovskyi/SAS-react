import React, { useState } from 'react';
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
  const { isBannerFadingOut, setIsBannerFadingOut } = useAnimation();
  const [isUnmounted, setIsUnmounted] = useState(false);

  const titleWords = title ? title.split(' ') : [];
  const descriptionWords = description ? description.split(' ') : [];

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

  const handleTextAnimationComplete = () => {
    setTimeout(() => {
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
          <motion.span
            key={index}
            variants={wordVariants}
            className="inline-block mr-3"
          >
            {word}
          </motion.span>
        ))}
      </motion.h1>
      <motion.p
        className="font-montserrat text-gray-200 text-base max-w-5xl mt-4 normal-case"
        variants={descriptionContainerVariants}
        initial="hidden"
        animate="visible"
        onAnimationComplete={handleTextAnimationComplete}
      >
        {descriptionWords.map((word, index) => (
          <motion.span
            key={index}
            variants={wordVariants}
            className="inline-block mr-2"
          >
            {word}
          </motion.span>
        ))}
      </motion.p>
    </motion.div>
  );
}
