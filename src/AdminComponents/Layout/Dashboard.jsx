import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WeeklyViewsChart from './WeeklyViewsChart';
import DateRangePicker from './DateRangePicker';
import { formatDistanceToNow } from 'date-fns';
import TrendingVideos from './TrendingVideos';
import TrendingDirectors from './TrendingDirectors';
import { getSignedUrls } from '../../lib/gcsUrlCache';

const cardClasses =
  'bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl';

const ListItem = ({ imageUrl, title, subtitle, time, actionText, isLoading, onActionClick }) => (
    <div className="flex items-center space-x-4 py-3">
    { isLoading ? (
        <div className="animate-pulse flex items-center space-x-4 w-full">
            <div className="w-16 h-10 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
            <div className="flex-grow space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            </div>
        </div>
    ) : (
    <>
        <img className="w-16 h-10 object-cover rounded-md border border-slate-200 dark:border-slate-800" src={imageUrl || 'https://placehold.co/160x100'} alt={title} />
        <div className="flex-grow min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 break-words whitespace-normal">{title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 break-words whitespace-normal truncate">{subtitle}</p>
            <span className="text-xs text-slate-400 dark:text-slate-500">{time}</span>
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

// ✨ НОВА ДОПОМІЖНА ФУНКЦІЯ для коректного форматування дати
const toYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Місяці 0-індексовані
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const Dashboard = () => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);
  
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState({
    from: sevenDaysAgo,
    to: today,
  });

  const [chartData, setChartData] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [trendingDirectors, setTrendingDirectors] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const handleShowreelClick = (reelId) => {
    navigate('/adminpanel/analytics', { state: { openModalForReelId: reelId } });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
        setIsLoading(true);
        setTrendingDirectors([]);
        if (!dateRange.from || !dateRange.to) return;

        // ✨ ВИПРАВЛЕНО: Використовуємо нову функцію замість toISOString()
        const startDateStr = toYYYYMMDD(dateRange.from);
        const endDateStr = toYYYYMMDD(dateRange.to);
        
        try {
            const [chartRes, trendingRes, activityRes] = await Promise.all([
                fetch(`http://localhost:3001/analytics/views-over-time?startDate=${startDateStr}&endDate=${endDateStr}`),
                fetch(`http://localhost:3001/analytics/trending-media?startDate=${startDateStr}&endDate=${endDateStr}&limit=20`),
                fetch(`http://localhost:3001/analytics/recent-activity?limit=5`)
            ]);

            const chartData = await chartRes.json();
            const trendingData = await trendingRes.json();
            const activityData = await activityRes.json();
            
            const directorViews = {};
            trendingData.forEach(video => {
                if (video.artists) {
                    const directorName = video.artists.split(',')[0].trim();
                    if(directorName) {
                        directorViews[directorName] = (directorViews[directorName] || 0) + video.views;
                    }
                }
            });

            const topDirectors = Object.entries(directorViews)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([name, totalViews]) => ({ name, totalViews }));

            let directorDetails = [];
            let directorPhotoPaths = [];
            if (topDirectors.length > 0) {
                const directorNames = topDirectors.map(d => d.name);
                const detailsRes = await fetch('http://localhost:3001/artists/details-by-names', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ names: directorNames }),
                });
                directorDetails = await detailsRes.json();
                directorPhotoPaths = directorDetails.map(d => d.photo_gcs_path).filter(Boolean);
            }

            const defaultDirectorImagePath = 'back-end/artists/director.jpg';
            const trendingPaths = trendingData.map(v => v.preview_gcs_path).filter(Boolean);
            const activityPaths = activityData.map(a => a.preview_gcs_path).filter(Boolean);
            const allPaths = [...new Set([...trendingPaths, ...activityPaths, ...directorPhotoPaths, defaultDirectorImagePath])];
            const urls = await getSignedUrls(allPaths);
            const fallbackDirectorUrl = urls[defaultDirectorImagePath];
            const directorDetailsMap = directorDetails.reduce((acc, director) => {
                const specificPhotoUrl = director.photo_gcs_path ? urls[director.photo_gcs_path] : null;
                acc[director.name] = { imageUrl: specificPhotoUrl || fallbackDirectorUrl };
                return acc;
            }, {});

            setTrendingDirectors(topDirectors.map(director => ({
                ...director,
                imageUrl: directorDetailsMap[director.name]?.imageUrl || fallbackDirectorUrl,
            })));
            
            setChartData(chartData);
            setTrendingVideos(trendingData.slice(0, 4).map(v => ({ ...v, imageUrl: urls[v.preview_gcs_path] })));
            setRecentActivity(activityData.map(a => ({ ...a, imageUrl: urls[a.preview_gcs_path] })));

        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchDashboardData();
  }, [dateRange]);
  
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Dashboard
        </h1>
        <DateRangePicker
          initialRange={dateRange}
          onRangeChange={setDateRange}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TrendingVideos videos={trendingVideos} isLoading={isLoading} />
            <TrendingDirectors directors={trendingDirectors} isLoading={isLoading} />
          </div>

        </div>

        <div className="lg:col-span-1 space-y-8">
          <div className={cardClasses}>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Recent Activity
              </h2>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                    [...Array(5)].map((_, i) => <ListItem key={i} isLoading={true} />)
                ) : (
                    recentActivity.map((item) => (
                      <ListItem
                        key={item.id}
                        imageUrl={item.imageUrl}
                        title={item.client || 'N/A Client'}
                        subtitle={item.title}
                        time={formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        actionText="SHOWREEL"
                        onActionClick={() => handleShowreelClick(item.id)}
                        isLoading={false}
                      />
                    ))
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