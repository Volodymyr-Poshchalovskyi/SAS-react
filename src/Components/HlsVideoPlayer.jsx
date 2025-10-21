// src/Components/HlsVideoPlayer.jsx

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const HlsVideoPlayer = ({
  src,
  shouldPlay,
  isMuted = true, // За замовчуванням Mute
  previewSrc,
  startTime = 0,
  volume = 1, // ✨ ЗМІНА 1: Додаємо проп volume (за замовчуванням 100%)
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

    const onManifestParsed = (event, data) => {
      const level_1080p_index = data.levels.findIndex(
        ({ height }) => height === 1080
      );
      if (level_1080p_index !== -1) {
        hls.startLevel = level_1080p_index;
        hls.minAutoLevel = level_1080p_index;
      }
    };

    if (Hls.isSupported()) {
      const hlsConfig = startTime > 0 ? { startPosition: startTime } : {};
      hls = new Hls(hlsConfig);
      hlsRef.current = hls;
      hls.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
      hls.loadSource(src);
      hls.attachMedia(video);
      video.addEventListener('canplay', showVideo);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = startTime > 0 ? `${src}#t=${startTime}` : src;
      video.addEventListener('canplay', showVideo);
    }

    return () => {
      video.removeEventListener('canplay', showVideo);
      if (hls) {
        hls.off(Hls.Events.MANIFEST_PARSED, onManifestParsed);
        hls.destroy();
      }
    };
  }, [src, startTime]);

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

  // ✨ ЗМІНА 2: Додаємо ефект для керування гучністю
  useEffect(() => {
    if (videoRef.current) {
      // Встановлюємо гучність, передану через пропс
      videoRef.current.volume = volume;
    }
  }, [volume]); // Цей ефект спрацює, коли зміниться проп volume

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
        muted={isMuted} // ✨ ЗМІНА 3: `muted` тепер контролюється пропсом `isMuted`
        {...props}
      />
    </div>
  );
};

export default HlsVideoPlayer;