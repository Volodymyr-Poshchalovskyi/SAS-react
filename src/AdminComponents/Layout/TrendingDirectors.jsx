// src/AdminComponents/Layout/TrendingDirectors.jsx

// ! React
import React from 'react';

// ! Constants
// * Base URL for accessing images stored in Google Cloud Storage
const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';
// * Shared Tailwind CSS classes for card styling
const cardClasses =
  'bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl';

// ========================================================================== //
// ! HELPER COMPONENT: DirectorListItem
// ========================================================================== //

/**
 * ? DirectorListItem
 * Displays a single director's information: photo, name, and view count.
 * @param {string} photoGcsPath - The path to the director's photo in GCS.
 * @param {string} name - The director's name.
 * @param {number} views - The total views associated with the director.
 */
const DirectorListItem = ({ photoGcsPath, name, views }) => (
  <div className="flex items-center gap-4 py-3">
    {/* Director Photo */}
    <img
      src={
        // * Construct the full image URL or use a placeholder
        photoGcsPath
          ? `${CDN_BASE_URL}/${photoGcsPath}`
          : 'https://placehold.co/100x100'
      }
      alt={name}
      className="w-12 h-12 object-cover rounded-full border-2 border-slate-200 dark:border-slate-700"
    />
    {/* Director Name & Title */}
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
        {name}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">Director</p>
    </div>
    {/* View Count */}
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

// ========================================================================== //
// ! HELPER COMPONENT: TrendingDirectorsSkeleton
// ========================================================================== //

/**
 * ? TrendingDirectorsSkeleton
 * Provides a loading state placeholder for the TrendingDirectors component.
 */
const TrendingDirectorsSkeleton = () => (
  <div className={`${cardClasses} p-5 animate-pulse`}>
    {/* Skeleton Header */}
    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4"></div>
    {/* Skeleton List Items */}
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

// ========================================================================== //
// ! MAIN COMPONENT: TrendingDirectors
// ========================================================================== //

/**
 * ? TrendingDirectors
 * Displays a card showing the top trending directors based on view counts.
 * Handles loading and empty states.
 * @param {Array} directors - Array of director objects { name, totalViews, photoGcsPath }.
 * @param {boolean} isLoading - Indicates if data is currently being fetched.
 */
const TrendingDirectors = ({ directors, isLoading }) => {
  // * Render skeleton if data is loading
  if (isLoading) {
    return <TrendingDirectorsSkeleton />;
  }

  return (
    <div className={`${cardClasses} p-5`}>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
        Trending Directors
      </h2>

      {/* Conditional rendering based on whether director data exists */}
      {directors && directors.length > 0 ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {directors.map((director) => (
            <DirectorListItem
              key={director.name} // * Assuming director names are unique for this period
              name={director.name}
              views={director.totalViews}
              photoGcsPath={director.photoGcsPath} // * Pass the GCS path
            />
          ))}
        </div>
      ) : (
        // * Empty state message
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
