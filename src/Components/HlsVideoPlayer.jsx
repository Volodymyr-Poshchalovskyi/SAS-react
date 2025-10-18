// src/Components/HlsVideoPlayer.jsx

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const HlsVideoPlayer = ({
  src,
  shouldPlay,
  isMuted = true,
  previewSrc,
  startTime = 0,
  ...props
}) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isVideoVisible, setIsVideoVisible] = useState(false);

  useEffect(() => {
    if (!src || !videoRef.current) return;

    const video = videoRef.current;
    let hls;

    const showVideo = () => {
      setIsVideoVisible(true);
    };

    // ✨ НОВА ЛОГІКА: Керування якістю
    const onManifestParsed = (event, data) => {
      // data.levels — це масив усіх доступних якостей
      // Зазвичай вони відсортовані від найнижчої до найвищої
      
      // 1. Знаходимо індекс для якості 1080p
      const level_1080p_index = data.levels.findIndex(({ height }) => height === 1080);
      
      // 2. Якщо такий рівень (1080p) знайдено:
      if (level_1080p_index !== -1) {
        
        // Встановлюємо 1080p як СТАРТОВИЙ рівень
        hls.startLevel = level_1080p_index;
        
        // Встановлюємо 1080p як МІНІМАЛЬНИЙ рівень для авто-якості
        // Це заборонить плеєру опускатися до 720p
        hls.minAutoLevel = level_1080p_index;
      }
      
      // Якщо рівень 1080p не знайдено (наприклад, відео має макс. 720p),
      // плеєр просто використає свою стандартну логіку ABR.
    };

    if (Hls.isSupported()) {
      // Конфігурація для HLS
      const hlsConfig = startTime > 0 ? { startPosition: startTime } : {};

      hls = new Hls(hlsConfig);
      hlsRef.current = hls;

      // ✨ ПІДКЛЮЧАЄМО НАШУ ЛОГІКУ
      // Це спрацює до того, як почнеться завантаження сегментів
      hls.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
      
      hls.loadSource(src);
      hls.attachMedia(video);

      video.addEventListener('canplay', showVideo);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Для нативних плеєрів (Safari)
      video.src = startTime > 0 ? `${src}#t=${startTime}` : src;
      video.addEventListener('canplay', showVideo);
    }

    return () => {
      video.removeEventListener('canplay', showVideo);
      if (hls) {
        // ✨ Не забуваємо відписатися від події
        hls.off(Hls.Events.MANIFEST_PARSED, onManifestParsed);
        hls.destroy();
      }
    };
  }, [src, startTime]); // Залежність від startTime важлива

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    if (shouldPlay && isVideoVisible) {
      video.play().catch((error) =>
        console.log('Autoplay was prevented:', error)
      );
    } else {
      video.pause();
    }
  }, [shouldPlay, isVideoVisible]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* PREVIEW IMAGE */}
      {previewSrc && (
        <img
          src={previewSrc}
          alt="Video preview"
          className={`absolute inset-0 w-full h-full object-cover object-center scale-[1.0001] transition-all duration-1000 ease-[cubic-bezier(0.65,0,0.35,1)] ${
            isVideoVisible
              ? 'opacity-0 blur-[10px] scale-105'
              : 'opacity-100 blur-0 scale-100'
          }`}
        />
      )}

      {/* HLS VIDEO */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ease-[cubic-bezier(0.65,0,0.35,1)] ${
          isVideoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        playsInline
        loop
        muted={isMuted}
        {...props}
      />
    </div>
  );
};

export default HlsVideoPlayer;