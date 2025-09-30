// src/Components/VideoContainer.jsx

import React, { useRef, useEffect, useState } from 'react';

const VideoContainer = ({ videoSrc, shouldPlay }) => {
  const videoRef = useRef(null);
  // Стан для відстеження завантаження першого кадру
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Функція, що виконується після завантаження метаданих (першого кадру)
    const handleMetadataLoad = () => {
      setIsMetadataLoaded(true);
      // Перемотуємо на 0.1 секунду, щоб гарантовано показати кадр
      videoElement.currentTime = 0.1;
    };

    // Додаємо слухача події
    videoElement.addEventListener('loadedmetadata', handleMetadataLoad);

    // Очищуємо слухача при розмонтуванні компонента
    return () => {
      videoElement.removeEventListener('loadedmetadata', handleMetadataLoad);
    };
  }, [videoSrc]); // Перезапускаємо ефект, якщо змінився URL відео

  useEffect(() => {
    // Логіка відтворення/паузи залишається незмінною
    if (videoRef.current) {
      if (shouldPlay) {
        videoRef.current
          .play()
          .catch((e) => console.error('Video playback error:', e));
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0.1; // Повертаємо на початок при паузі
      }
    }
  }, [shouldPlay]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
      {/* Поки перший кадр не завантажений, показуємо анімацію пульсації */}
      {!isMetadataLoaded && (
        <div className="w-full h-full bg-neutral-900 animate-pulse" />
      )}

      {/* Відео стає видимим тільки після завантаження метаданих */}
      <video
        ref={videoRef}
        src={videoSrc}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isMetadataLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        muted
        loop
        playsInline
        // `preload="metadata"` просить браузер завантажити лише перший кадр і дані
        preload="metadata"
      />
    </div>
  );
};

export default VideoContainer;