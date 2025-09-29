// src/pages/Main.jsx

import React from 'react';
import { motion } from 'framer-motion';
import VideoContainer from '../Components/VideoContainer';

function Main() {
  // 1. Шлях до файлу в GCS
  const GCS_VIDEO_PATH =
    'front-end/00-Main Page/SHOWREEL SINNERS AND SAINTS 2024.mp4';

  // 2. Формуємо пряме посилання на CDN, використовуючи IP-адресу
  const videoUrl = `http://34.54.191.201/${GCS_VIDEO_PATH}`;

  // 3. Стан і логіка для відтворення відео при скролі залишаються
  const [shouldPlayVideo, setShouldPlayVideo] = React.useState(false);
  const videoSectionRef = React.useRef(null);

  const titleLines = [
    ['WHERE', 'CULTURE,', 'COMMERCE'],
    ['AND', 'CINEMA', 'COLLIDE.'],
  ];

  const wordVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.2 + i * 0.2,
      },
    }),
  };

  // 4. Ми видалили useEffect, який робив запит на бекенд, бо він більше не потрібен

  // Intersection Observer для відтворення відео залишається без змін
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShouldPlayVideo(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.5,
      }
    );

    const currentRef = videoSectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen text-white" ref={videoSectionRef}>
      {/* 5. Передаємо напряму сформований URL в VideoContainer */}
      <VideoContainer videoSrc={videoUrl} shouldPlay={shouldPlayVideo} />

      {/* Анімований текст */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-[2.8rem] leading-[1.2] font-semibold expanded-text tracking-wider">
          {titleLines.map((line, lineIndex) => {
            const baseIndex = titleLines
              .slice(0, lineIndex)
              .reduce((acc, l) => acc + l.length, 0);
            return (
              <div key={lineIndex} className="block">
                {line.map((word, wordIndex) => (
                  <motion.span
                    key={word + wordIndex}
                    custom={baseIndex + wordIndex}
                    initial="hidden"
                    animate="visible"
                    variants={wordVariants}
                    className="inline-block mr-3"
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            );
          })}
        </h1>
      </div>
    </div>
  );
}

export default Main;