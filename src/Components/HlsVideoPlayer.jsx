import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

const HlsVideoPlayer = ({ src, shouldPlay, isMuted = true, ...props }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null); // ✨ Додаємо ref для збереження екземпляра Hls

  useEffect(() => {
    if (!src) return;

    const video = videoRef.current;
    
    // --- ПОЧАТОК ЗМІН ---

    // 1. Ініціалізуємо Hls з вимкненим автоматичним перемиканням якості
    const hls = new Hls({
      autoLevelEnabled: false, // Це головний параметр, який вимикає ABR
    });
    
    hlsRef.current = hls; // Зберігаємо екземпляр у ref

    // 2. Встановлюємо найвищу якість, коли маніфест завантажено
    hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      if (data.levels && data.levels.length > 0) {
        const highestLevel = data.levels.length - 1;
        
        // hls.currentLevel негайно перемикає якість
        // hls.startLevel встановлює якість для початку відтворення
        // hls.nextLevel гарантує, що якість не зміниться при переході до наступного сегмента
        hls.currentLevel = highestLevel;
        hls.startLevel = highestLevel;
        hls.nextLevel = highestLevel;

        console.log(
          `Forcing highest quality: ${data.levels[highestLevel].height}p`
        );
      }
    });
    // --- КІНЕЦЬ ЗМІН ---

    hls.loadSource(src);
    hls.attachMedia(video);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  // Керування відтворенням/паузою (цей блок залишається без змін)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (shouldPlay) {
      video.play().catch(error => console.log("Autoplay was prevented:", error));
    } else {
      video.pause();
    }
  }, [shouldPlay]);

  return (
    <video
      ref={videoRef}
      className="absolute top-0 left-0 w-full h-full object-cover"
      playsInline
      loop
      muted={isMuted}
      {...props}
    />
  );
};

export default HlsVideoPlayer;