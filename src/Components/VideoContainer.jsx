// src/Components/VideoContainer.js

import React, { useRef, useEffect } from 'react';

const VideoContainer = ({ videoSrc, shouldPlay }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (shouldPlay) {
        videoRef.current
          .play()
          .catch((e) => console.error('Video playback error:', e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [shouldPlay]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <video
        ref={videoRef}
        src={videoSrc}
        type="video/quicktime"
        className="w-full h-full object-cover"
        muted
        loop
        playsInline
        preload="metadata"
      />
    </div>
  );
};

export default VideoContainer;
