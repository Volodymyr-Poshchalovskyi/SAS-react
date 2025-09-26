// src/pages/Main.jsx

import React from 'react';
import { motion } from 'framer-motion';
import VideoContainer from '../Components/VideoContainer';

function Main() {
  // 1. Використовуємо шлях до файлу в GCS
  const GCS_VIDEO_PATH = 'front-end/00-Main Page/SHOWREEL SINNERS AND SAINTS 2024.mp4';
  
  // 2. Стан для збереження URL, статусу завантаження та помилок
  const [videoUrl, setVideoUrl] = React.useState('');
  const [error, setError] = React.useState(null);
  const [shouldPlayVideo, setShouldPlayVideo] = React.useState(false);
  const videoSectionRef = React.useRef(null);

  const titleLines = [
    ['WHERE', 'CULTURE,', 'COMMERCE'],
    ['AND', 'CINEMA', 'COLLIDE.'],
  ];

  const subtitleLines = [
    ['A', 'BOUTIQUE', 'CREATIVE', 'STUDIO'],
    ['AND', 'PRODUCTION', 'COMPANY'],
    ['CRAFTING', 'BOLD', 'CONTENT', 'WITH', 'THE'],
    ["WORLD'S", 'MOST', 'EXCITING', 'TALENT.'],
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

  const titleWordCount = titleLines.reduce((acc, line) => acc + line.length, 0);

  // 3. Ефект для завантаження підписаного URL для відео
  React.useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        const response = await fetch('http://localhost:3001/generate-read-urls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gcsPaths: [GCS_VIDEO_PATH] }),
        });
        if (!response.ok) {
          throw new Error('Failed to get video URL from server.');
        }
        const data = await response.json();
        const url = data[GCS_VIDEO_PATH];
        if (url) {
          setVideoUrl(url);
        } else {
          throw new Error('Video URL not found in the server response.');
        }
      } catch (err) {
        console.error("Error fetching main page video:", err);
        setError(err.message);
      }
    };

    fetchVideoUrl();
  }, []); // Пустий масив залежностей, щоб виконати один раз при монтуванні

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
      {/* 4. Передаємо динамічно завантажений URL в VideoContainer */}
      {/* Відображаємо відео, тільки якщо URL успішно отримано */}
      {videoUrl && <VideoContainer videoSrc={videoUrl} shouldPlay={shouldPlayVideo} />}
      
      {/* Відображаємо помилку, якщо вона виникла */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
            <p className="text-red-500">Could not load video: {error}</p>
        </div>
      )}

      {/* Анімований текст (без змін) */}
      <div className="absolute top-[140px] bottom-0 left-0 right-0 z-10 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-[2.8rem] leading-[1.2] mb-12 font-semibold expanded-text tracking-wider">
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
        <div className="text-[2rem] max-w-4xl leading-[1.2] font-medium expanded-subtitle tracking-wider">
          {subtitleLines.map((line, lineIndex) => {
            const baseIndex = subtitleLines
              .slice(0, lineIndex)
              .reduce((acc, l) => acc + l.length, 0);
            return (
              <div key={lineIndex} className="block mb-1">
                {line.map((word, wordIndex) => (
                  <motion.span
                    key={word + wordIndex}
                    custom={titleWordCount + baseIndex + wordIndex}
                    initial="hidden"
                    animate="visible"
                    variants={wordVariants}
                    className="inline-block mr-2"
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Main;