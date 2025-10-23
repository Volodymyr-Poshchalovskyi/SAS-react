// src/AdminComponents/Layout/TrendingVideos.jsx

// ! React
import React from 'react';

// ! Lucide Icons
import { PlayCircle } from 'lucide-react';

// ! Constants
const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';
// * Shared card styling
const cardClasses =
  'bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl';

// ========================================================================== //
// ! HELPER COMPONENT: TrendingVideosSkeleton
// ========================================================================== //

/**
 * ? TrendingVideosSkeleton
 * Provides a loading state placeholder for the TrendingVideos component.
 */
const TrendingVideosSkeleton = () => (
  <div className={`${cardClasses} p-5 animate-pulse`}>
    {/* Skeleton Header */}
    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
    {/* Skeleton Main Video Preview */}
    <div className="aspect-video w-full bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
    {/* Skeleton List Items */}
    <div className="mt-4 space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-24 h-14 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          </div>
          <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

// ========================================================================== //
// ! MAIN COMPONENT: TrendingVideos
// ========================================================================== //

/**
 * ? TrendingVideos
 * Displays a card showing the most played videos for a selected period.
 * Features the single most popular video prominently, followed by a list of others.
 * Handles loading and empty states.
 * @param {Array} videos - Array of video objects { id, title, client, preview_gcs_path, views }.
 * @param {boolean} isLoading - Indicates if data is currently being fetched.
 */
const TrendingVideos = ({ videos, isLoading }) => {
  // * Render skeleton if loading
  if (isLoading) {
    return <TrendingVideosSkeleton />;
  }

  // * Render empty state if no videos are found
  if (!videos || videos.length === 0) {
    return (
      <div
        className={`${cardClasses} p-5 h-full flex items-center justify-center text-center`}
      >
        <p className="text-slate-500">
          No trending videos found for the selected period.
        </p>
      </div>
    );
  }

  // * Separate the most popular video from the rest
  const [mostPopular, ...otherVideos] = videos;

  return (
    <div className={`${cardClasses} p-5`}>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">
        Most Played Videos
      </h2>

      {/* --- Most Popular Video Section --- */}
      {mostPopular && (
        <div className="group relative aspect-video w-full rounded-lg overflow-hidden cursor-pointer">
          {/* Background Image */}
          <img
            src={
              // * Construct full URL from CDN base and GCS path
              mostPopular.preview_gcs_path
                ? `${CDN_BASE_URL}/${mostPopular.preview_gcs_path}`
                : 'https://placehold.co/1600x900' // * Fallback placeholder
            }
            alt={mostPopular.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          {/* "Most Popular" Badge */}
          <div className="absolute top-2 left-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-500 text-white uppercase tracking-wider">
            Most Popular
          </div>
          {/* Text Info (Bottom Left) */}
          <div className="absolute bottom-4 left-4 text-white">
            <p className="text-sm opacity-80">
              {mostPopular.client || 'N/A Client'}
            </p>
            <p className="text-xl font-bold drop-shadow-md">
              {mostPopular.title}
            </p>
          </div>
          {/* Play Count (Bottom Right) */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 text-white bg-black/40 px-3 py-1.5 rounded-full">
            <PlayCircle size={20} />
            <span className="text-lg font-bold">{mostPopular.views}</span>
          </div>
        </div>
      )}

      {/* --- List of Other Trending Videos --- */}
      <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
        {otherVideos.map((video) => (
          <div key={video.id} className="flex items-center gap-4 py-3">
            {/* Thumbnail */}
            <img
              src={
                // * Construct full URL from CDN base and GCS path
                video.preview_gcs_path
                  ? `${CDN_BASE_URL}/${video.preview_gcs_path}`
                  : 'https://placehold.co/160x90' // * Fallback placeholder
              }
              alt={video.title}
              className="w-24 h-14 object-cover rounded border border-slate-200 dark:border-slate-800"
            />
            {/* Title & Client */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                {video.title}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {video.client || 'N/A Client'}
              </p>
            </div>
            {/* Play Count Box */}
            <div className="flex items-center justify-center text-center h-14 w-16 bg-slate-100 dark:bg-slate-800/50 rounded-md">
              <div>
                <p className="font-bold text-lg text-slate-900 dark:text-slate-50">
                  {video.views}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
                  plays
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingVideos;
