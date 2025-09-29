import React from 'react';
import { PlayCircle } from 'lucide-react';

// ✨ ЗМІНА: Додано базовий URL для CDN
const CDN_BASE_URL = 'http://34.54.191.201';

const cardClasses =
  'bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl';

const TrendingVideosSkeleton = () => (
  <div className={`${cardClasses} p-5 animate-pulse`}>
    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
    <div className="aspect-video w-full bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
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

const TrendingVideos = ({ videos, isLoading }) => {
  if (isLoading) {
    return <TrendingVideosSkeleton />;
  }

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

  const [mostPopular, ...otherVideos] = videos;

  return (
    <div className={`${cardClasses} p-5`}>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">
        Most Played Videos
      </h2>

      {mostPopular && (
        <div className="group relative aspect-video w-full rounded-lg overflow-hidden cursor-pointer">
          <img
            // ✨ ЗМІНА: Формуємо URL з CDN, пропс тепер `preview_gcs_path`
            src={
              mostPopular.preview_gcs_path
                ? `${CDN_BASE_URL}/${mostPopular.preview_gcs_path}`
                : 'https://placehold.co/1600x900'
            }
            alt={mostPopular.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          <div className="absolute top-2 left-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-500 text-white uppercase tracking-wider">
            Most Popular
          </div>
          <div className="absolute bottom-4 left-4 text-white">
            <p className="text-sm opacity-80">
              {mostPopular.client || 'N/A Client'}
            </p>
            <p className="text-xl font-bold drop-shadow-md">
              {mostPopular.title}
            </p>
          </div>
          <div className="absolute bottom-4 right-4 flex items-center gap-2 text-white bg-black/40 px-3 py-1.5 rounded-full">
            <PlayCircle size={20} />
            <span className="text-lg font-bold">{mostPopular.views}</span>
          </div>
        </div>
      )}

      <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
        {otherVideos.map((video) => (
          <div key={video.id} className="flex items-center gap-4 py-3">
            <img
              // ✨ ЗМІНА: Формуємо URL з CDN, пропс тепер `preview_gcs_path`
              src={
                video.preview_gcs_path
                  ? `${CDN_BASE_URL}/${video.preview_gcs_path}`
                  : 'https://placehold.co/160x90'
              }
              alt={video.title}
              className="w-24 h-14 object-cover rounded border border-slate-200 dark:border-slate-800"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                {video.title}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {video.client || 'N/A Client'}
              </p>
            </div>
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