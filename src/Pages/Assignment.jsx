// src/pages/Assignment.js

import React, { useLayoutEffect, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import VideoContainer from '../Components/VideoContainer';

const assignmentData = [
  {
    id: 1,
    title: 'BEHIND THE SCENES',
    projectLink: '/assignment/behind-the-scenes',
  },
  {
    id: 2,
    title: 'GLOBAL CAMPAIGN COVERAGE',
    projectLink: '/assignment/global-campaign',
  },
];

const VideoOverlay = ({ title, projectLink }) => {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-end text-center p-8 mb-8 text-white">
      <p
        className="
          font-normal                                      
          text-[5rem]                                       
          leading-none                                      
          tracking-[-0.6rem]                                
          [text-shadow:0_0_6px_rgb(0_0_0_/_60%)]             
          mb-8                                              
        "
      >
        {title}
      </p>
      <Link to={projectLink}>
        <button className="bg-white text-black py-3 px-6 text-sm font-semibold uppercase tracking-wider transition-colors duration-300 hover:bg-opacity-80">
          See More
        </button>
      </Link>
    </div>
  );
};

export default function Assignment() {
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();
  const videoURL = '/video/SHOWREEL SINNERS AND SAINTS 2024_1.mp4';

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isPreloaderActive ? 'hidden' : '';
    if (!isPreloaderActive) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPreloaderActive]);

  const handleBannerAnimationComplete = () => {
    setIsPreloaderActive(false);
  };

  const bannerTitle =
    'VISIONARY STORYTELLERS. COMMERCIAL REBELS. GLOBAL CREATORS.';
  const bannerDescription =
    'From award-winning filmmakers to fashion-forward image makers, our directors and hybrid talent deliver world-class content across commercials, music videos, branded series, and global campaigns.';

  return (
    <div>
      <AnimatePresence>
        {isPreloaderActive && (
          <PreloaderBanner
            onAnimationComplete={handleBannerAnimationComplete}
            title={bannerTitle}
            description={bannerDescription}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col">
        <div className="relative w-full h-screen overflow-hidden">
          <VideoContainer videoSrc={videoURL} shouldPlay={!isPreloaderActive} />
          <VideoOverlay
            title={assignmentData[0].title}
            projectLink={assignmentData[0].projectLink}
          />
        </div>
        <div className="relative w-full h-screen overflow-hidden">
          <VideoContainer videoSrc={videoURL} shouldPlay={!isPreloaderActive} />
          <VideoOverlay
            title={assignmentData[1].title}
            projectLink={assignmentData[1].projectLink}
          />
        </div>
      </div>
    </div>
  );
}
