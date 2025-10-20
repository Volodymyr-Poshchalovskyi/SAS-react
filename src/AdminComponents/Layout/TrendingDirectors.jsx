import React from 'react';

// ✨ ЗМІНА: Додано базовий URL для CDN
const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';

const cardClasses =
  'bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl';

// ✨ ЗМІНА: Компонент тепер приймає `photoGcsPath` замість `imageUrl`
const DirectorListItem = ({ photoGcsPath, name, views }) => (
  <div className="flex items-center gap-4 py-3">
    <img
      src={
        photoGcsPath
          ? `${CDN_BASE_URL}/${photoGcsPath}`
          : 'https://placehold.co/100x100'
      }
      alt={name}
      className="w-12 h-12 object-cover rounded-full border-2 border-slate-200 dark:border-slate-700"
    />
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
        {name}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">Director</p>
    </div>
    <div className="flex items-center justify-center text-center h-14 w-16 bg-slate-100 dark:bg-slate-800/50 rounded-md">
      <div>
        <p className="font-bold text-lg text-slate-900 dark:text-slate-50">
          {views}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
          views
        </p>
      </div>
    </div>
  </div>
);

const TrendingDirectorsSkeleton = () => (
  <div className={`${cardClasses} p-5 animate-pulse`}>
    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4"></div>
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          </div>
          <div className="h-14 w-16 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        </div>
      ))}
    </div>
  </div>
);

const TrendingDirectors = ({ directors, isLoading }) => {
  if (isLoading) {
    return <TrendingDirectorsSkeleton />;
  }

  return (
    <div className={`${cardClasses} p-5`}>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
        Trending Directors
      </h2>

      {directors && directors.length > 0 ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {directors.map((director) => (
            <DirectorListItem
              key={director.name}
              name={director.name}
              views={director.totalViews}
              // ✨ ЗМІНА: Передаємо `photoGcsPath`
              photoGcsPath={director.photoGcsPath}
            />
          ))}
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-center py-10">
          <p className="text-slate-500">
            No trending director data for the selected period.
          </p>
        </div>
      )}
    </div>
  );
};

export default TrendingDirectors;