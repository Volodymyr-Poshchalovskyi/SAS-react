// src/pages/Production.js

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import VideoContainer from '../Components/VideoContainer';
import { productionData } from '../Data/ProductionData'; // ✨ Import new data

// A simplified overlay that only shows the title
const VideoTitleOverlay = ({ title }) => {
  return (
    <div className="absolute inset-0 z-10 flex items-end justify-center text-center p-8 pb-24 text-white">
      <p className="font-chanel text-2xl sm:text-4xl text-shadow">{title}</p>
    </div>
  );
};

export default function Production() {
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoUrls, setVideoUrls] = useState({});

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch signed URLs for all videos from the data file
  useEffect(() => {
    const fetchVideoUrls = async () => {
      const gcsPaths = productionData.map(video => video.src);
      
      try {
        const response = await fetch('http://localhost:3001/generate-read-urls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gcsPaths }),
        });
        if (!response.ok) throw new Error('Failed to fetch video URLs');
        
        const urlsMap = await response.json();
        setVideoUrls(urlsMap);
      } catch (error) {
        console.error('Error fetching production video URLs:', error);
      }
    };

    fetchVideoUrls();
  }, []);

  // Manage body overflow for preloader
  useEffect(() => {
    document.body.style.overflow = isPreloaderActive ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPreloaderActive]);

  // Add scroll snapping and track current video index
  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.add('scroll-snap-enabled');

    const handleScroll = () => {
      if (isPreloaderActive) return;
      const newIndex = Math.round(window.scrollY / window.innerHeight);
      setCurrentIndex(newIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      htmlElement.classList.remove('scroll-snap-enabled');
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isPreloaderActive]);


  const handleBannerAnimationComplete = () => {
    setIsPreloaderActive(false);
  };

  const bannerTitle = 'Global Production. White Glove Support.';
  const bannerDescription =
    'Celebrity-driven production, luxury brand campaigns, and international shoots are our specialty. We travel megastars in music, film, and fashion, producing high-impact content across the globe. Our teams in Los Angeles, New York, Mexico City, Bangkok, and beyond provide full-service line production, location sourcing, casting, and post.';

  return (
    <div className="bg-black">
      <AnimatePresence>
        {isPreloaderActive && (
          <PreloaderBanner
            onAnimationComplete={handleBannerAnimationComplete}
            title={bannerTitle}
            description={bannerDescription}
          />
        )}
      </AnimatePresence>
      
      {/* ✨ Map over the productionData to render each video */}
      {productionData.map((video, index) => {
        const signedUrl = videoUrls[video.src];

        return (
          <div
            key={video.id}
            className="relative w-full h-screen snap-start"
          >
            {signedUrl ? (
              <VideoContainer
                videoSrc={signedUrl}
                shouldPlay={!isPreloaderActive && currentIndex === index}
              />
            ) : (
              // Optional: A placeholder while the URL is loading
              <div className="w-full h-full flex items-center justify-center bg-black text-white">Loading...</div>
            )}
            <VideoTitleOverlay title={video.title} />
          </div>
        );
      })}
    </div>
  );
}