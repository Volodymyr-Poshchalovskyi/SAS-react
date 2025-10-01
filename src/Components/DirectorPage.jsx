// src/Pages/DirectorPage.jsx

import React, { useState, useLayoutEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { directorsData } from '../Data/DirectorsData';
import { assignmentData } from '../Data/AssignmentData';
import HlsVideoPlayer from '../Components/HlsVideoPlayer'; // <-- ЗМІНА 1: Новий імпорт
import VideoModal from '../Components/VideoModal';
import { useInView } from 'react-intersection-observer';

const CDN_BASE_URL = 'http://34.54.191.201';

const DirectorVideoBlock = ({ video, videoSrc, onExpand }) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  return (
    <section ref={ref} className="relative w-full h-[75vh] bg-black">
      <HlsVideoPlayer src={videoSrc} shouldPlay={inView} />
      <div className="absolute inset-0 z-10 flex items-end justify-center">
        <div className="flex flex-col items-center text-white pb-24 px-4">
          <div className="mb-6 text-shadow text-center">
            <p className="text-2xl font-semibold uppercase">{video.title}</p>
            {video.client && (
              <p className="text-xl font-light mt-1">{video.client}</p>
            )}
          </div>
          <button
            onClick={() => onExpand({ ...video, src: videoSrc })}
            className="bg-white text-black py-4 px-6 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-transform hover:scale-105"
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

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!director) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <h2 className="text-4xl font-chanel">Content Not Found</h2>
      </div>
    );
  }

  const publicPhotoUrl = director.photoSrc
    ? `${CDN_BASE_URL}/${director.photoSrc}`
    : '';

  return (
    <div className="bg-white">
      <section className="bg-white text-black flex items-center justify-center relative h-[100px] mt-[90px] md:mt-[117px]">
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
          const publicVideoUrl = `${CDN_BASE_URL}/${video.src}`;
          return (
            <DirectorVideoBlock
              key={index}
              video={video}
              videoSrc={publicVideoUrl}
              onExpand={setExpandedVideo}
            />
          );
        })}
      </div>

      <section className="relative w-full min-h-screen bg-black flex flex-col justify-end">
        {/* 1. Image as a true background */}
        {/* We use absolute positioning and object-cover to make the image fill the entire section without distorting it. */}
        {/* This completely decouples the layout from the image's dimensions. */}
        {publicPhotoUrl && (
          <img
            src={publicPhotoUrl}
            alt={director.name}
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        )}

        {/* 2. Unified Content Container */}
        {/* This single div now holds the name and bio. It has a gradient background and is pushed to the bottom by the parent's flexbox (`justify-end`). */}
        {/* Its height is flexible, determined by its padding and content, preventing text overflow. */}
        <div className="relative z-10 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-24 pb-20 md:pb-32">
          <div className="container mx-auto px-4 flex flex-col items-center text-center text-white">
            <h2 className="font-normal text-[80px] leading-none tracking-[-0.15em] mb-8">
              {director.name}
            </h2>
            <p
              className="w-full max-w-3xl font-semibold text-justify text-xs leading-[36px] tracking-[-0.09em]"
              style={{ wordSpacing: '0.25em' }}
            >
              {director.bio}
            </p>
          </div>
        </div>
      </section>

      {expandedVideo && (
        <VideoModal
          video={expandedVideo}
          onClose={() => setExpandedVideo(null)}
        />
      )}
    </div>
  );
}