// src/pages/Main.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom'; // ✨ Імпортуємо хук
import VideoContainer from '../Components/VideoContainer';

function Main() {
  // ✨ КРОК 7: Отримуємо висоту хедера з контексту
  const { headerHeight } = useOutletContext();

  const GCS_VIDEO_PATH =
    'front-end/00-Main Page/SHOWREEL SINNERS AND SAINTS 2024.mp4';
  const videoUrl = `http://34.54.191.201/${GCS_VIDEO_PATH}`;

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
      <VideoContainer videoSrc={videoUrl} shouldPlay={shouldPlayVideo} />

      {/* ✨ КРОК 8: Застосовуємо динамічні стилі до контейнера з текстом */}
      <div
        className="absolute left-0 right-0 z-10 flex flex-col items-center justify-center text-center px-4"
        style={{
          // Починаємо контейнер відразу під хедером
          top: `${headerHeight}px`,
          // Висота контейнера - це висота екрану мінус висота хедера
          height: `calc(100vh - ${headerHeight}px)`,
        }}
      >
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