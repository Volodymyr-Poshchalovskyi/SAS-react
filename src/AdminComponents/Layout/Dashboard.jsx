// src/AdminComponents/Layout/Dashboard.jsx

import React, { useState, useMemo } from 'react'; // Додано useMemo
import WeeklyViewsChart from './WeeklyViewsChart';
import DateRangePicker from './DateRangePicker';

// ... (решта коду для VideoCard та ListItem залишається без змін)
const cardClasses =
  'bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl';

const VideoCard = ({ title, imageUrl, badge, description }) => (
  <div className={`${cardClasses} p-5`}>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
    {description && <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{description}</p>}
    <div className="relative overflow-hidden aspect-video rounded-lg">
      <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
      {badge && <div className="absolute top-2 left-2 border text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:border-slate-700">{badge}</div>}
    </div>
  </div>
);

const ListItem = ({ imageUrl, title, subtitle, time, actionText }) => (
  <div className="flex items-center space-x-4 py-2">
    <img className="w-16 h-10 object-cover rounded-md border border-slate-200 dark:border-slate-800" src={imageUrl} alt={title} />
    <div className="flex-grow min-w-0">
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 break-words whitespace-normal">{title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 break-words whitespace-normal">{subtitle}</p>
      <span className="text-xs text-slate-400 dark:text-slate-500">{time}</span>
    </div>
    {actionText && <a href="#" className="flex-shrink-0 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:underline ml-auto">{actionText}</a>}
  </div>
);

/* -------------------------------- */
/* === Main Component (Dashboard) === */
/* -------------------------------- */
const Dashboard = () => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [dateRange, setDateRange] = useState({
    from: sevenDaysAgo,
    to: today,
  });
  
  // === ЗМІНЕНО: Генерація даних для діаграми з датами ===
  const weeklyViewsData = useMemo(() => {
    const data = [];
    // Створюємо масив з 7 днів, починаючи з 6 днів тому і до сьогодні
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      data.push({
        // Зберігаємо дату у форматі YYYY-MM-DD для стабільної роботи
        date: date.toISOString().split('T')[0],
        // Генеруємо випадкові дані для демонстрації
        views: Math.floor(Math.random() * (100 - 40 + 1)) + 40,
      });
    }
    return data;
  }, []); // Пустий масив залежностей, щоб дані генерувалися один раз


  // * Dummy data for recent activity feed
  const recentActivity = [
    { id: 1, subtitle: "'Aaron Platt Mixed Reel x Wienerschnitzel...'" },
    { id: 2, subtitle: "'Summer Vibes Commercial: Beach Party Edition...'" },
    { id: 3, subtitle: "'Mountain Adventure Documentary...'" },
    { id: 4, subtitle: "'Corporate Event Highlights...'" },
    { id: 5, subtitle: "'Product Launch Teaser...'" },
  ];

  // * Demo images
  const listImageUrl = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';
  const trendingVideoImage = 'https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80';
  const trendingDirectorImage = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* === Header with title + date range picker === */}
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
        {/* === Left Column (Main stats + trending) === */}
        <div className="lg:col-span-2 space-y-8">
          {/* Weekly Views Card */}
          <div className={`${cardClasses} dark:bg-slate-800`}>
            <div className="p-6">
              <h2 className="text-xl font-bold dark:text-slate-50 mb-1">
                TOTAL WEEKLY VIEWS
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                LAST 7 DAYS OVERVIEW
              </p>
              {/* Передаємо нові дані в компонент */}
              <WeeklyViewsChart data={weeklyViewsData} />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                FOR DETAILED GOOGLE ANALYTICS STATS ABOVE, PLEASE CONTACT YOUR
                ADMINISTRATOR.
              </p>
            </div>
          </div>

          {/* Trending Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <VideoCard
              title="TRENDING VIDEO OF THE WEEK"
              imageUrl={trendingVideoImage}
              description="A captivating short film that saw a massive surge in viewership."
              badge="NEW PEAK"
            />
            <VideoCard
              title="TRENDING DIRECTOR OF THE WEEK"
              imageUrl={trendingDirectorImage}
              description="Alex Johnson's latest work garnered significant attention."
              badge="RISING STAR"
            />
          </div>
        </div>

        {/* === Right Column (Activity + recently viewed) === */}
        <div className="lg:col-span-1 space-y-8">
          {/* Recent Activity */}
          <div className={cardClasses}>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Recent Activity
              </h2>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentActivity.map((item) => (
                  <ListItem
                    key={item.id}
                    imageUrl={listImageUrl}
                    title="Showreel Edited:"
                    subtitle={item.subtitle}
                    time="13 hours ago"
                    actionText="SHOWREEL"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Recently Viewed Content */}
          <div className={cardClasses}>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Recently Viewed Content
              </h2>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <ListItem
                  imageUrl={listImageUrl}
                  title="Showreel Viewed"
                  subtitle="'Sinners and Saints MN 2025...'"
                  time="2 hours ago"
                />
                <ListItem
                  imageUrl={listImageUrl}
                  title="Project Draft Opened"
                  subtitle="'The Grand Budapest Hotel - Wes Anderson...'"
                  time="4 hours ago"
                />
                <ListItem
                  imageUrl={listImageUrl}
                  title="Clip Rendered"
                  subtitle="'Sunset Overdrive - Gaming Montage Final Cut...'"
                  time="6 hours ago"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;