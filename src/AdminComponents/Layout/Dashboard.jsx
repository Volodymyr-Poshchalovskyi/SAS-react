// src/AdminComponents/Layout/Dashboard.jsx
// ! React & Router
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// ! Child Components
import WeeklyViewsChart from './WeeklyViewsChart';
import DateRangePicker from './DateRangePicker';
import TrendingVideos from './TrendingVideos';
import TrendingDirectors from './TrendingDirectors';

// ! Libraries & Utilities
import { formatDistanceToNow } from 'date-fns';

// ! Context
// * Import the context to listen for manual refresh triggers
import { DataRefreshContext } from './AdminLayout';

// ! Constants
const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';
const API_BASE_URL = import.meta.env.VITE_API_URL;

// * Tailwind classes for consistent card styling
const cardClasses =
  'bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl';

/**
 * ? ListItem
 * A presentational component for the "Recent Activity" feed.
 * Includes a built-in skeleton loading state.
 */
const ListItem = ({
  imageUrl,
  title,
  subtitle,
  time,
  actionText,
  isLoading,
  onActionClick,
}) => (
  <div className="flex items-center space-x-4 py-3">
    {isLoading ? (
      // * Skeleton Loader
      <div className="animate-pulse flex items-center space-x-4 w-full">
        <div className="w-16 h-10 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        <div className="flex-grow space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
        </div>
      </div>
    ) : (
      // * Loaded Content
      <>
        <img
          className="w-16 h-10 object-cover rounded-md border border-slate-200 dark:border-slate-800"
          src={imageUrl || 'https://placehold.co/160x100'}
          alt={title}
        />
        <div className="flex-grow min-w-0">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 break-words whitespace-normal">
            {title}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 break-words whitespace-normal truncate">
            {subtitle}
          </p>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {time}
          </span>
        </div>
        {actionText && (
          <button
            onClick={onActionClick}
            className="flex-shrink-0 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:underline ml-auto"
          >
            {actionText}
          </button>
        )}
      </>
    )}
  </div>
);

/**
 * ? toYYYYMMDD
 * Formats a Date object into a 'YYYY-MM-DD' string for API requests.
 */
const toYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * ? Dashboard
 * The main component for the admin dashboard page.
 * Fetches and displays analytics data, trending content, and recent activity.
 */
const Dashboard = () => {
  // * Default date range: last 7 days
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);

  const navigate = useNavigate();

  // ! State
  const [dateRange, setDateRange] = useState({
    from: sevenDaysAgo,
    to: today,
  });
  const [chartData, setChartData] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [trendingDirectors, setTrendingDirectors] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ! Context
  // * Get the manual refresh trigger from the parent layout
  const { refreshKey } = useContext(DataRefreshContext);

  /**
   * Navigates to the main analytics page and passes state to open
   * the modal for the specific reel.
   */
  const handleShowreelClick = (reelId) => {
    navigate('/adminpanel/analytics', {
      state: { openModalForReelId: reelId },
    });
  };

  // ! Main Data Fetching Effect
  // * This effect re-runs when 'dateRange' changes or 'refreshKey' is updated
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setTrendingDirectors([]); // * Clear directors on new fetch
      if (!dateRange.from || !dateRange.to) return;

      const startDateStr = toYYYYMMDD(dateRange.from);
      const endDateStr = toYYYYMMDD(dateRange.to);

      try {
        // * Step 1: Fetch all primary analytics data in parallel
        const [chartRes, trendingRes, activityRes] = await Promise.all([
          fetch(
            `${API_BASE_URL}/analytics/views-over-time?startDate=${startDateStr}&endDate=${endDateStr}`
          ),
          fetch(
            `${API_BASE_URL}/analytics/trending-media?startDate=${startDateStr}&endDate=${endDateStr}&limit=20`
          ),
          fetch(`${API_BASE_URL}/analytics/recent-activity?limit=5`),
        ]);

        const chartData = await chartRes.json();
        const trendingData = await trendingRes.json();
        const activityData = await activityRes.json();

        // * Step 2: Process trending videos to calculate top directors (by views)
        const directorViews = {};
        trendingData.forEach((video) => {
          if (video.artists) {
            // * Assumes first artist is the director
            const directorName = video.artists.split(',')[0].trim();
            if (directorName) {
              directorViews[directorName] =
                (directorViews[directorName] || 0) + video.views;
            }
          }
        });

        const topDirectors = Object.entries(directorViews)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([name, totalViews]) => ({ name, totalViews }));

        // * Step 3: Fetch details (photos) for the top directors
        let finalTopDirectors = [];
        if (topDirectors.length > 0) {
          const directorNames = topDirectors.map((d) => d.name);
          const detailsRes = await fetch(
            `${API_BASE_URL}/artists/details-by-names`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ names: directorNames }),
            }
          );
          const directorDetails = await detailsRes.json();

          const defaultDirectorImagePath = 'back-end/artists/director.jpg';

          // * Create a map for quick photo lookup
          const directorDetailsMap = directorDetails.reduce((acc, director) => {
            acc[director.name] = { photoGcsPath: director.photo_gcs_path };
            return acc;
          }, {});

          // * Step 4: Map director details and add default photos where missing
          finalTopDirectors = topDirectors.map((director) => ({
            ...director,
            photoGcsPath:
              directorDetailsMap[director.name]?.photoGcsPath ||
              defaultDirectorImagePath,
          }));
        }

        // * Step 5: Set all component state
        setChartData(chartData);
        setTrendingVideos(trendingData.slice(0, 4)); // * Only take top 4 for UI
        setTrendingDirectors(finalTopDirectors);
        setRecentActivity(activityData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        // * Stop loading state regardless of success or error
        setIsLoading(false);
      }
    };
    fetchDashboardData();
    // * Dependency array includes dateRange and the manual refreshKey
  }, [dateRange, refreshKey]);

  // ! Render
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      {/* --- Header --- */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Dashboard
        </h1>
        <DateRangePicker
          initialRange={dateRange}
          onRangeChange={setDateRange}
        />
      </div>

      {/* --- Main dashboard layout: 3-column grid on large screens --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- Left Side (2 columns) --- */}
        <div className="lg:col-span-2 space-y-8">
          {/* Total Views Chart */}
          <div className={`${cardClasses} dark:bg-slate-800`}>
            <div className="p-6">
              <h2 className="text-xl font-bold dark:text-slate-50 mb-1">
                TOTAL VIEWS
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                OVERVIEW FOR THE SELECTED PERIOD
              </p>
              <WeeklyViewsChart data={chartData} isLoading={isLoading} />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                FOR DETAILED GOOGLE ANALYTICS STATS ABOVE, PLEASE CONTACT YOUR
                ADMINISTRATOR.
              </p>
            </div>
          </div>

          {/* Trending Videos & Directors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TrendingVideos videos={trendingVideos} isLoading={isLoading} />
            <TrendingDirectors
              directors={trendingDirectors}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* --- Right Side (1 column) --- */}
        <div className="lg:col-span-1 space-y-8">
          {/* Recent Activity Feed */}
          <div className={cardClasses}>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Recent Activity
              </h2>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Show 5 skeleton items while loading */}
                {isLoading
                  ? [...Array(5)].map((_, i) => (
                      <ListItem key={i} isLoading={true} />
                    ))
                  : recentActivity.map((item) => (
                      <ListItem
                        key={item.id}
                        imageUrl={
                          item.preview_gcs_path
                            ? `${CDN_BASE_URL}/${item.preview_gcs_path}`
                            : null
                        }
                        title={item.client || 'N/A Client'}
                        subtitle={item.title}
                        time={formatDistanceToNow(new Date(item.created_at), {
                          addSuffix: true,
                        })}
                        actionText="SHOWREEL"
                        onActionClick={() => handleShowreelClick(item.id)}
                        isLoading={false}
                      />
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
