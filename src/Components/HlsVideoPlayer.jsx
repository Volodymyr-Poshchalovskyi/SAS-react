import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const HlsVideoPlayer = ({ src, shouldPlay, isMuted = true, ...props }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (!src) return;

    const video = videoRef.current;
    const hls = new Hls({
      autoLevelEnabled: false,
    });

    hlsRef.current = hls;

    // --- ПОЧАТОК ЗМІН ---

    // 1. Створюємо функцію, яка вимкне лоадер
    const onVideoReady = () => {
      setIsLoading(false);
    };

    // 2. Прибираємо логіку з hls.on(...) і додаємо нативний слухач подій
    //    Подія 'loadeddata' спрацьовує, коли перший кадр відео завантажено і готовий до показу
    video.addEventListener('loadeddata', onVideoReady);

    // --- КІНЕЦЬ ЗМІН ---

    hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      if (data.levels && data.levels.length > 0) {
        const highestLevel = data.levels.length - 1;
        hls.currentLevel = highestLevel;
        hls.startLevel = highestLevel;
        hls.nextLevel = highestLevel;
      }
    });

    hls.loadSource(src);
    hls.attachMedia(video);

    return () => {
      // Важливо прибирати слухач подій, щоб уникнути витоків пам'яті
      video.removeEventListener('loadeddata', onVideoReady);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (shouldPlay && !isLoading) {
      video.play().catch(error => console.log("Autoplay was prevented:", error));
    } else {
      video.pause();
    }
  }, [shouldPlay, isLoading]);

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-t-transparent"></div>
        </div>
      )}

      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        playsInline
        loop
        muted={isMuted}
        {...props}
      />
    </>
  );
};

export default HlsVideoPlayer;