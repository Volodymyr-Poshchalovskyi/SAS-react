// src/Pages/DirectorPage.jsx

import React, { useState, useLayoutEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
// ✅ 1. Import new data source
import { directorsData } from '../Data/DirectorsData';
import { assignmentData } from '../Data/AssignmentData';
import { postProductionData } from '../Data/PostProductionData';
import HlsVideoPlayer from '../Components/HlsVideoPlayer';
import VideoModal from '../Components/VideoModal';
import { useInView } from 'react-intersection-observer';

const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';

const DirectorVideoBlock = ({
  video,
  videoSrc,
  previewSrc,
  onExpand,
  index,
}) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  return (
    <section ref={ref} className="relative w-full h-[75vh] bg-black">
      <HlsVideoPlayer
        src={videoSrc}
        previewSrc={previewSrc}
        shouldPlay={inView}
        startTime={video.startTime}
      />
      <div className="absolute inset-0 z-10 flex items-end justify-center">
        <div className="flex flex-col items-center text-white pb-24 px-4">
          <div className="mb-6 text-shadow text-center">
            <p className="text-2xl font-semibold uppercase">{video.title}</p>
            {video.client && (
              <p className="text-xl font-light mt-1">{video.client}</p>
            )}
          </div>
          <button
            onClick={() => onExpand(index)}
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

  // ✅ 2. Update logic to handle the '/production' route
  const isAssignmentPage = location.pathname.startsWith('/assignment');
  const isProductionPage = location.pathname.startsWith('/production');

  let dataSource;
  let backLink;

  if (isAssignmentPage) {
    dataSource = assignmentData;
    backLink = '/assignment';
  } else if (isProductionPage) {
    dataSource = postProductionData;
    backLink = '/production';
  } else {
    dataSource = directorsData;
    backLink = '/directors';
  }

  const director = dataSource.find((d) => d.slug === directorSlug);
  const [activeVideoIndex, setActiveVideoIndex] = useState(null);

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
          const publicPreviewUrl = video.preview_src
            ? `${CDN_BASE_URL}/${video.preview_src}`
            : '';
          return (
            <DirectorVideoBlock
              key={index}
              index={index}
              video={video}
              videoSrc={publicVideoUrl}
              previewSrc={publicPreviewUrl}
              onExpand={setActiveVideoIndex}
            />
          );
        })}
      </div>

      <section className="relative w-full bg-black text-white pt-16">
        <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />

        {publicPhotoUrl && (
          <div className="flex justify-center px-4">
            <div className="relative w-full md:w-1/2 lg:w-5/12">
              <img
                src={publicPhotoUrl}
                alt={director.name}
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black to-transparent pointer-events-none" />
            </div>
          </div>
        )}

        <div className="w-full bg-black">
          <div className="container mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center">
            <h2 className="font-normal text-[80px] leading-none tracking-[-0.15em] mb-8">
              {director.name}
            </h2>
            <p
              className="w-full max-w-3xl font-semibold text-justify text-xs leading-[36px] tracking-[-0.09em]"
              style={{ wordSpacing: '0.1em' }}
            >
              {director.bio}
            </p>
          </div>
        </div>
      </section>

      {activeVideoIndex !== null && (
        <VideoModal
          videos={director.videos}
          currentIndex={activeVideoIndex}
          onClose={() => setActiveVideoIndex(null)}
          onNavigate={setActiveVideoIndex}
          cdnBaseUrl={CDN_BASE_URL}
        />
      )}
    </div>
  );
}