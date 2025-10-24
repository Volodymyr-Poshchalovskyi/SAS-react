// src/AdminComponents/Layout/Dashboard.jsx

// ! React & Router
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ! Child Components
import WeeklyViewsChart from './WeeklyViewsChart';
import DateRangePicker from './DateRangePicker';
import TrendingVideos from './TrendingVideos';
import TrendingDirectors from './TrendingDirectors';

// ! Libraries & Utilities
import { formatDistanceToNow } from 'date-fns';

// ! Context
import { DataRefreshContext } from './AdminLayout';
import { useAuth } from '../../hooks/useAuth'; // <--- useAuth вже тут

// ! Constants
const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';
const API_BASE_URL = import.meta.env.VITE_API_URL;

const cardClasses =
  'bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl';

// ... (Компонент ListItem без змін) ...
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
      <div className="animate-pulse flex items-center space-x-4 w-full">
        <div className="w-16 h-10 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        <div className="flex-grow space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
        </div>
      </div>
    ) : (
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

const toYYYYMMDD = (date) => {
  /* ... (без змін) ... */
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Dashboard = () => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);

  const navigate = useNavigate();

  // ! State
  const [dateRange, setDateRange] = useState({ from: sevenDaysAgo, to: today });
  const [chartData, setChartData] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [trendingDirectors, setTrendingDirectors] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // ! Context
  const { refreshKey, triggerRefresh } = useContext(DataRefreshContext);
  
  // --- ▼▼▼ ЗМІНА 1: Дістаємо 'session' з useAuth ▼▼▼ ---
  const { session, user, loading: authLoading, supabase } = useAuth();
  // --- ▲▲▲ КІНЕЦЬ ЗМІНИ ▲▲▲ ---

  const handleShowreelClick = (reelId) => {
    /* ... (без змін) ... */
    navigate('/adminpanel/analytics', {
      state: { openModalForReelId: reelId },
    });
  };

  // (Опціональний focus listener, залишаємо без змін)
  useEffect(() => {
    const handleFocus = () => {
      console.log('Dashboard focused, triggering data refresh...');
      triggerRefresh();
    };
    window.addEventListener('focus', handleFocus);
    console.log('Dashboard focus listener added.');
    return () => {
      window.removeEventListener('focus', handleFocus);
      console.log('Dashboard focus listener removed.');
    };
  }, [triggerRefresh]);

  // ! Main Data Fetching Effect
  useEffect(() => {
    // --- ▼▼▼ ЗМІНА 2: Додаємо перевірку '!session' ▼▼▼ ---
    if (
      authLoading ||
      !user ||
      !session || // <-- Додано
      !supabase ||
      !dateRange.from ||
      !dateRange.to
    ) {
      console.log(
        `Dashboard fetch skipped: authLoading=${authLoading}, user=${!!user}, session=${!!session}, supabase=${!!supabase}, dateRange=${!!(dateRange.from && dateRange.to)}`
      );
      if (!authLoading && (!user || !session)) { // <-- Додано
        setIsLoading(false);
        setFetchError('Authentication required to view dashboard.');
        setChartData([]);
        setTrendingVideos([]);
        setTrendingDirectors([]);
        setRecentActivity([]);
      }
      return;
    }
    // --- ▲▲▲ КІНЕЦЬ ЗМІНИ ▲▲▲ ---

    const fetchDashboardData = async () => {
      console.log(
        `[${new Date().toLocaleTimeString()}] Starting fetchDashboardData...`
      );
      setIsLoading(true);
      setFetchError(null);
      setTrendingDirectors([]);
      let token = null;

      try {
        // --- ▼▼▼ ЗМІНА 3: Прибираємо getSession(), беремо токен з context ▼▼▼ ---
        
        // ПРИБИРАЄМО ЦЕЙ БЛОК:
        // const { data: sessionData, error: sessionError } =
        //   await supabase.auth.getSession();
        // if (sessionError || !sessionData.session) {
        //   throw new Error(
        //     'Authentication error getting session for dashboard.'
        //   );
        // }
        // token = sessionData.session.access_token;
        
        // ДОДАЄМО ЦЕ:
        token = session.access_token;
        if (!token) {
          throw new Error('Authentication error: No access token found in session.');
        }
        console.log('Got token directly from AuthContext for dashboard fetch.');
        // --- ▲▲▲ КІНЕЦЬ ЗМІНИ ▲▲▲ ---

        const headers = { Authorization: `Bearer ${token}` };

        const startDateStr = toYYYYMMDD(dateRange.from);
        const endDateStr = toYYYYMMDD(dateRange.to);

        // * Step 1: Fetch all primary analytics data in parallel
        const [chartRes, trendingRes, activityRes] = await Promise.all([
          fetch(
            `${API_BASE_URL}/analytics/views-over-time?startDate=${startDateStr}&endDate=${endDateStr}`,
            { headers }
          ),
          fetch(
            `${API_BASE_URL}/analytics/trending-media?startDate=${startDateStr}&endDate=${endDateStr}&limit=20`,
            { headers }
          ),
          fetch(`${API_BASE_URL}/analytics/recent-activity?limit=5`, {
            headers,
          }),
        ]);

        console.log('API Responses:', {
          chartStatus: chartRes.status,
          trendingStatus: trendingRes.status,
          activityStatus: activityRes.status,
        });

        if (!chartRes.ok || !trendingRes.ok || !activityRes.ok) {
          // ... (Обробка помилок залишається такою ж) ...
          let errorDetails = `HTTP error! Status: ${(!chartRes.ok && chartRes.status) || (!trendingRes.ok && trendingRes.status) || (!activityRes.ok && activityRes.status)}`;
          try {
            const errorJson = await (!chartRes.ok
              ? chartRes.json()
              : !trendingRes.ok
                ? trendingRes.json()
                : activityRes.json());
            errorDetails = errorJson.details || errorJson.error || errorDetails;
          } catch (e) {
            /*ignore*/
          }
          throw new Error(`Failed to fetch dashboard data. ${errorDetails}`);
        }

        const chartData = await chartRes.json();
        const trendingData = await trendingRes.json();
        const activityData = await activityRes.json();
        console.log('Fetched primary data:', {
          chartData: chartData.length,
          trendingData: trendingData.length,
          activityData: activityData.length,
        });

        // * Step 2: Process trending videos (Без змін)
        const directorViews = {};
        trendingData.forEach((video) => {
          if (video.artists) {
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
        console.log('Calculated top directors (pre-details):', topDirectors);

        // * Step 3: Fetch details for top directors (З ТОКЕНОМ)
        let finalTopDirectors = [];
        if (topDirectors.length > 0) {
          const directorNames = topDirectors.map((d) => d.name);
          const detailsRes = await fetch(
            `${API_BASE_URL}/artists/details-by-names`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, // <-- Використовуємо той самий токен
              },
              body: JSON.stringify({ names: directorNames }),
            }
          );

          console.log('Director details response status:', detailsRes.status);

          const directorDetails = detailsRes.ok ? await detailsRes.json() : [];
          if (!detailsRes.ok) {
            console.error('Failed to fetch director details, using defaults.');
          }
          console.log('Fetched director details:', directorDetails);

          const defaultDirectorImagePath = 'back-end/artists/director.jpg';
          const directorDetailsMap = directorDetails.reduce((acc, director) => {
            acc[director.name] = { photoGcsPath: director.photo_gcs_path };
            return acc;
          }, {});

          finalTopDirectors = topDirectors.map((director) => ({
            ...director,
            photoGcsPath:
              directorDetailsMap[director.name]?.photoGcsPath ||
              defaultDirectorImagePath,
          }));
        }

        // * Step 5: Set all component state (Без змін)
        setChartData(chartData);
        setTrendingVideos(trendingData.slice(0, 4));
        setTrendingDirectors(finalTopDirectors);
        setRecentActivity(activityData);
        console.log(
          `[${new Date().toLocaleTimeString()}] Dashboard states updated successfully.`
        );
      } catch (error) {
        console.error('Error in fetchDashboardData:', error);
        setFetchError(error.message || 'An unexpected error occurred.');
        setChartData([]);
        setTrendingVideos([]);
        setTrendingDirectors([]);
        setRecentActivity([]);
      } finally {
        console.log(
          `[${new Date().toLocaleTimeString()}] Setting isLoading to false in fetchDashboardData.`
        );
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  // --- ▼▼▼ ЗМІНА 4: Додаємо 'session' в залежності ▼▼▼ ---
  }, [dateRange, refreshKey, session, user, supabase, authLoading, navigate]);
  // --- ▲▲▲ КІНЕЦЬ ЗМІНИ ▲▲▲ ---


  // ! Render (Без змін)
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

      {/* --- Error Message Display --- */}
      {fetchError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{fetchError}</span>
        </div>
      )}

      {/* --- Main dashboard layout --- */}
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
                {!isLoading && recentActivity.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
                    No recent activity found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;