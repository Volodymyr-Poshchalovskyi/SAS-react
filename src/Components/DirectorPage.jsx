// src/Pages/DirectorPage.jsx

import React, { useState, useLayoutEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { directorsData } from '../Data/DirectorsData';
import { assignmentData } from '../Data/AssignmentData';
import VideoContainer from '../Components/VideoContainer';
import VideoModal from '../Components/VideoModal';
import { useInView } from 'react-intersection-observer';

const CDN_BASE_URL = 'http://34.54.191.201';

const DirectorVideoBlock = ({ video, videoSrc, onExpand }) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  return (
    <section ref={ref} className="relative w-full h-[75vh] bg-black">
      {inView && <VideoContainer videoSrc={videoSrc} shouldPlay={inView} />}
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
      {/* ✨ ПОЧАТОК ЗМІН: Ця секція тепер ідентична до PhotographerPage */}
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
      {/* ✨ КІНЕЦЬ ЗМІН */}

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

      <section className="relative w-full">
        {publicPhotoUrl && (
          <img
            src={publicPhotoUrl}
            alt={director.name}
            className="w-full h-auto block"
          />
        )}
        <div className="absolute inset-x-0 bottom-[40%] h-[40%] bg-gradient-to-t from-black to-transparent flex items-end justify-center pb-8">
          <div className="text-center">
            <h2 className="font-normal text-white text-[80px] leading-none tracking-[-0.15em]">
              {director.name}
            </h2>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-black"></div>
        <div className="absolute inset-x-0 bottom-0 h-[40%] flex justify-center pt-28">
          <p
            className="w-2/5 font-semibold text-white text-justify text-xs leading-[36px] tracking-[-0.09em]"
            style={{ wordSpacing: '0.25em' }}
          >
            {director.bio}
          </p>
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