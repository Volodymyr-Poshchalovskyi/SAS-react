// src/Components/DirectorPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { directorsData } from '../Data/DirectorsData';
import VideoContainer from '../Components/VideoContainer';
import Photo from '../assets/Photos/DirectorPhoto.png';

const DirectorVideoBlock = ({ video }) => {
  const [shouldPlay, setShouldPlay] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShouldPlay(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  return (
    <section ref={videoRef} className="relative w-full h-[75vh] bg-black">
      <VideoContainer videoSrc={video.src} shouldPlay={shouldPlay} />
      <div className="absolute inset-0 z-10 flex items-end justify-center">
        <div className="text-center text-white pb-24">
          <p className="text-2xl mb-6 text-shadow">{video.title}</p>
          <button
            className="bg-white text-black py-4 px-6 text-xs font-semibold uppercase tracking-wider flex items-center gap-2
                           transition-transform hover:scale-105"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Expand Video
          </button>
        </div>
      </div>
    </section>
  );
};

export default function DirectorPage() {
  const { directorSlug } = useParams();
  const director = directorsData.find((d) => d.slug === directorSlug);

  if (!director) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <h2 className="text-4xl font-chanel">Director Not Found</h2>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <section className="bg-white text-black h-[40vh] flex items-center justify-center relative pt-20 md:pt-28">
        <Link
          to="/directors"
          className="absolute left-8 md:left-20 top-1/2 -translate-y-1/2 flex items-center justify-center 
                   w-12 h-12 border-2 border-black text-black 
                   hover:bg-black hover:text-white transition-colors"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-chanel font-semibold uppercase text-center px-4">
          {director.name}
        </h1>
      </section>

      <div className="bg-black">
        {director.videos.map((video, index) => (
          <DirectorVideoBlock key={index} video={video} />
        ))}
      </div>

      <section className="w-full bg-white text-black py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
          <div className="w-full max-w-md md:w-[450px] flex-shrink-0">
            <img
              src={Photo}
              alt={director.name}
              className="w-full h-auto object-cover aspect-square"
            />
          </div>
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-4xl font-chanel font-semibold uppercase mb-6">
              {director.name}
            </h2>
            <p className="text-sm font-helvetica leading-relaxed">
              {director.bio}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
