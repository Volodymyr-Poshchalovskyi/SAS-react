// src/Components/VideoModal.jsx

import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function VideoModal({ videos, currentIndex, onClose, onNavigate, cdnBaseUrl }) {
  const videoRef = useRef(null);
  const currentVideo = videos[currentIndex];
  const videoSrc = `${cdnBaseUrl}/${currentVideo.src}`;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') handlePrev();
      if (event.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, currentIndex]);

  useEffect(() => {
    if (!videoSrc || !videoRef.current) return;

    const videoElement = videoRef.current;
    let hls;

    // ✨ ЗМІНА 1: Оголошуємо функцію-обробник тут, щоб її можна було видалити при очищенні
    const onManifestParsed = (event, data) => {
      // Примусово встановлюємо найвищий рівень якості
      if (hls) {
        hls.currentLevel = data.levels.length - 1;
      }
    };

    if (Hls.isSupported()) {
      hls = new Hls();
      // ✨ ЗМІНА 2: Додаємо слухача події, який спрацює, коли плеєр отримає список якостей
      hls.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
      hls.loadSource(videoSrc);
      hls.attachMedia(videoElement);
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = videoSrc;
    }

    return () => {
      if (hls) {
        // ✨ ЗМІНА 3: Прибираємо слухача події, щоб уникнути витоків пам'яті
        hls.off(Hls.Events.MANIFEST_PARSED, onManifestParsed);
        hls.destroy();
      }
    };
  }, [videoSrc]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black z-[9999] flex flex-col justify-center items-center py-4 sm:py-8 md:py-12 px-16 sm:px-20 md:px-24 box-border" // <-- 🔥 ОНОВЛЕНИЙ РЯДОК
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-7 text-white text-5xl hover:text-gray-300 transition-colors z-[10001]"
        aria-label="Close video player"
      >
        &times;
      </button>

      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-[10000] bg-black/30 hover:bg-black/60 text-white p-3 rounded-full transition-colors"
          aria-label="Previous video"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {currentIndex < videos.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-[10000] bg-black/30 hover:bg-black/60 text-white p-3 rounded-full transition-colors"
          aria-label="Next video"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <div
        className="w-full h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex-grow relative">
          <video
            key={videoSrc}
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full object-contain"
            controls
            autoPlay
          />
        </div>
        <p className="text-white text-center pt-4 text-xl flex-shrink-0">
          {currentVideo.title}
        </p>
      </div>
    </div>
  );
}