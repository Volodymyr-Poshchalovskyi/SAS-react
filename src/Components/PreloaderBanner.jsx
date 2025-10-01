import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../context/AnimationContext';

// Конфігурація анімації зникнення
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

  // ✅ Крок 1: Створюємо ref для зберігання ID таймера
  const timerRef = useRef(null);

  // ✅ Крок 2: Додаємо ефект для очищення таймера при демонтуванні компонента
  useEffect(() => {
    // Ця функція буде викликана, коли компонент зникає (unmounts)
    return () => {
      // Якщо таймер ще існує, очищуємо його
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []); // Пустий масив залежностей означає, що очищення спрацює тільки один раз при демонтуванні

  // Розбиваємо текст на слова для анімації
  const titleWords = title ? title.split(' ') : [];
  const descriptionWords = description ? description.split(' ') : [];

  // Варіанти анімації для контейнерів
  const titleContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
  };

  const descriptionContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: 1, staggerChildren: 0.15 } },
  };

  // Варіанти анімації для окремих слів
  const wordVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  // Функція, що викликається після завершення анімації тексту
  const handleTextAnimationComplete = () => {
    // ✅ Крок 3: Зберігаємо ID таймера в ref, щоб мати до нього доступ пізніше
    timerRef.current = setTimeout(() => {
      setIsBannerFadingOut(true); // Запускаємо анімацію зникнення банера
    }, 2000); // Затримка у 2 секунди
  };

  // Не рендеримо нічого, якщо компонент повністю демонтований
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
        // Коли анімація зникнення завершена
        if (isBannerFadingOut) {
          setIsUnmounted(true); // Позначаємо, що компонент можна демонтувати
          if (onAnimationComplete) {
            onAnimationComplete(); // Викликаємо колбек для батьківського компонента
          }
          setIsBannerFadingOut(false); // Скидаємо стан у контексті
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
        onAnimationComplete={handleTextAnimationComplete} // Запускаємо таймер після анімації
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