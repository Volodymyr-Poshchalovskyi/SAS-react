// src/Pages/DirectorPage.jsx

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { directorsData } from '../Data/DirectorsData';
import { assignmentData } from '../Data/AssignmentData';
import VideoContainer from '../Components/VideoContainer';
import VideoModal from '../Components/VideoModal';

// ✨ Додаємо константу для базового URL нашого CDN
const CDN_BASE_URL = 'http://34.54.191.201';

// ✨ Крок 1: Оновлюємо компонент DirectorVideoBlock
// Він тепер приймає повний `videoSrc`, а не `signedUrl`
const DirectorVideoBlock = ({ video, videoSrc, onExpand }) => {
  const [shouldPlay, setShouldPlay] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShouldPlay(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );
    const currentRef = videoRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <section ref={videoRef} className="relative w-full h-[75vh] bg-black">
      {videoSrc ? (
        <VideoContainer videoSrc={videoSrc} shouldPlay={shouldPlay} />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white">
          Loading...
        </div>
      )}
      <div className="absolute inset-0 z-10 flex items-end justify-center">
        <div className="flex flex-col items-center text-white pb-24">
          <p className="text-2xl mb-6 text-shadow text-center">{video.title}</p>
          <button
            onClick={() => onExpand({ ...video, src: videoSrc })}
            disabled={!videoSrc}
            className="bg-white text-black py-4 px-6 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-transform hover:scale-105 disabled:opacity-50"
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
  const location = useLocation();

  const isAssignmentPage = location.pathname.startsWith('/assignment');
  const dataSource = isAssignmentPage ? assignmentData : directorsData;
  const backLink = isAssignmentPage ? '/assignment' : '/directors';

  const director = dataSource.find((d) => d.slug === directorSlug);

  const [expandedVideo, setExpandedVideo] = useState(null);

  // ❗️ Ми видалили стани `videoUrls`, `photoUrl` і `useEffect` для запиту на бекенд.

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleExpandVideo = (video) => setExpandedVideo(video);
  const handleCloseModal = () => setExpandedVideo(null);

  if (!director) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <h2 className="text-4xl font-chanel">Content Not Found</h2>
      </div>
    );
  }

  // ✨ Крок 2: Формуємо URL для фото прямо тут
  const publicPhotoUrl = director.photoSrc
    ? `${CDN_BASE_URL}/${director.photoSrc}`
    : '';

  return (
    <div className="bg-white">
      <section className="bg-white text-black h-[40vh] flex items-center justify-center relative pt-20 md:pt-28">
        <Link
          to={backLink}
          className="absolute left-8 md:left-20 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
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
        {director.videos.map((video, index) => {
          // ✨ Крок 3: Формуємо URL для кожного відео прямо в циклі
          const publicVideoUrl = `${CDN_BASE_URL}/${video.src}`;
          return (
            <DirectorVideoBlock
              key={index}
              video={video}
              videoSrc={publicVideoUrl}
              onExpand={handleExpandVideo}
            />
          );
        })}
      </div>

      <section className="w-full bg-white text-black py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
          <div className="w-full max-w-md md:w-[450px] flex-shrink-0">
            {/* ✨ Крок 4: Використовуємо пряме посилання для фото */}
            {publicPhotoUrl ? (
              <img
                src={publicPhotoUrl}
                alt={director.name}
                className="w-full h-auto object-cover aspect-square"
              />
            ) : (
              <div className="w-full bg-gray-200 aspect-square animate-pulse"></div>
            )}
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

      {/* ✨ Крок 5: Модальне вікно тепер отримує об'єкт з уже повним URL */}
      {expandedVideo && (
        <VideoModal video={expandedVideo} onClose={handleCloseModal} />
      )}
    </div>
  );
}