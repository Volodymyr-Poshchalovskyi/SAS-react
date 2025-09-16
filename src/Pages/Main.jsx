// src/pages/Main.jsx

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import VideoContainer from '../Components/VideoContainer';

function Main() {
  const videoPath = '/video/SHOWREEL SINNERS AND SAINTS 2024_1.mp4';

  const [shouldPlayVideo, setShouldPlayVideo] = useState(false);
  const videoSectionRef = useRef(null);

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

  useEffect(() => {
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

    if (videoSectionRef.current) {
      observer.observe(videoSectionRef.current);
    }

    return () => {
      if (videoSectionRef.current) {
        observer.unobserve(videoSectionRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen text-white" ref={videoSectionRef}>
      <VideoContainer videoSrc={videoPath} shouldPlay={shouldPlayVideo} />

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
