// src/AdminComponents/Layout/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import WeeklyViewsChart from './WeeklyViewsChart';
import DateRangePicker from './DateRangePicker';
import { formatDistanceToNow } from 'date-fns';
import TrendingVideos from './TrendingVideos';

const cardClasses =
  'bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl';

const VideoCard = ({ title, imageUrl, badge, description, isLoading }) => (
  <div className={`${cardClasses} p-5`}>
    { isLoading ? (
        <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
    ) : (
    <>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
        {description && <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{description}</p>}
        <div className="relative overflow-hidden aspect-video rounded-lg">
            <img src={imageUrl || 'https://placehold.co/1600x900'} alt={title} className="w-full h-full object-cover" />
            {badge && <div className="absolute top-2 left-2 border text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:border-slate-700">{badge}</div>}
        </div>
    </>
    )}
  </div>
);

const fetchSignedUrls = async (gcsPaths) => {
    if (!gcsPaths || gcsPaths.length === 0) return {};
    try {
        const response = await fetch('http://localhost:3001/generate-read-urls', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gcsPaths }),
        });
        if (!response.ok) throw new Error('Failed to fetch signed URLs');
        return await response.json();
    } catch (err) {
        console.error('Error fetching signed URLs:', err);
        return {};
    }
};

const ListItem = ({ imageUrl, title, subtitle, time, actionText, isLoading }) => (
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
        {actionText && <a href="#" className="flex-shrink-0 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:underline ml-auto">{actionText}</a>}
    </>
    )}
    </div>
);

const Dashboard = () => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);

  const [dateRange, setDateRange] = useState({
    from: sevenDaysAgo,
    to: today,
  });

  const [chartData, setChartData] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
        setIsLoading(true);
        if (!dateRange.from || !dateRange.to) return;

        const startDateStr = dateRange.from.toISOString().split('T')[0];
        const endDateStr = dateRange.to.toISOString().split('T')[0];
        
        try {
            const [chartRes, trendingRes, activityRes] = await Promise.all([
                fetch(`http://localhost:3001/analytics/views-over-time?startDate=${startDateStr}&endDate=${endDateStr}`),
                fetch(`http://localhost:3001/analytics/trending-media?startDate=${startDateStr}&endDate=${endDateStr}&limit=4`),
                fetch(`http://localhost:3001/analytics/recent-activity?limit=5`)
            ]);

            const chartData = await chartRes.json();
            const trendingData = await trendingRes.json();
            const activityData = await activityRes.json();

            setChartData(chartData);
            
            const trendingPaths = trendingData.map(v => v.preview_gcs_path).filter(Boolean);
            const activityPaths = activityData.map(a => a.preview_gcs_path).filter(Boolean);
            const allPaths = [...new Set([...trendingPaths, ...activityPaths])];

            const urls = await fetchSignedUrls(allPaths);
            
            setTrendingVideos(trendingData.map(v => ({ ...v, imageUrl: urls[v.preview_gcs_path] })));
            setRecentActivity(activityData.map(a => ({ ...a, imageUrl: urls[a.preview_gcs_path] })));

        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchDashboardData();
  }, [dateRange]);

  const trendingDirectorImage = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';
  
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
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
            <VideoCard
              title="TRENDING DIRECTOR OF THE WEEK"
              imageUrl={trendingDirectorImage}
              description="Alex Johnson's latest work garnered significant attention."
              badge="RISING STAR"
              isLoading={isLoading}
            />
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