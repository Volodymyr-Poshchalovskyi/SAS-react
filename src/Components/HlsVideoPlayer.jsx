// src/Components/HlsVideoPlayer.jsx

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const HlsVideoPlayer = ({
  src,
  shouldPlay,
  isMuted = true,
  previewSrc,
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

    // ВИПРАВЛЕННЯ 1: Оголошуємо функцію тут, щоб вона була доступна
    // як для додавання слухача, так і для його видалення у cleanup-функції.
    const onManifestParsed = (event, data) => {
      hls.startLevel = data.levels.length - 1;
    };

    if (Hls.isSupported()) {
      hls = new Hls();
      hlsRef.current = hls;

      // Тепер функція onManifestParsed знаходиться у правильній області видимості
      hls.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);

      hls.loadSource(src);
      hls.attachMedia(video);
      video.addEventListener('canplay', showVideo);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('canplay', showVideo);
    }

    return () => {
      video.removeEventListener('canplay', showVideo);
      if (hls) {
        // ВИПРАВЛЕННЯ 2: Тепер функція очищення має доступ до onManifestParsed
        // і може коректно видалити слухач подій.
        hls.off(Hls.Events.MANIFEST_PARSED, onManifestParsed);
        hls.destroy();
      }
    };
  }, [src]);

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    if (shouldPlay && isVideoVisible) {
      video.play().catch(error => console.log("Autoplay was prevented:", error));
    } else {
      video.pause();
    }
  }, [shouldPlay, isVideoVisible]);

  return (
    <>
      {previewSrc && (
        <img
          src={previewSrc}
          alt="Video preview"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isVideoVisible ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}

      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          isVideoVisible ? 'opacity-100' : 'opacity-0'
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