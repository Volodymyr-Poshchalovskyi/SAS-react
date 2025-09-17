// src/AdminComponents/Layout/MyAnalytic.jsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  Eye,
  Clock,
  ArrowUpDown, // Іконка за замовчуванням
  ArrowUp,     // Іконка для сортування вгору
  ArrowDown,   // Іконка для сортування вниз
  Link,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// --- Mock Data без поля 'description' ---
const mockAnalyticsData = [
    {
    id: 1,
    title: 'Mountain Adventure Documentary',
    previewUrl: 'https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    totalViews: 22890,
    completedViews: 19500,
    avgDurationSeconds: 45,
    shortLink: 'https://bit.ly/MtnDoc',
    status: 'Active',
  },
  {
    id: 2,
    title: 'Aaron Platt Mixed Reel',
    previewUrl: 'https://images.unsplash.com/photo-1598124146163-36aced836738?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    totalViews: 12543,
    completedViews: 9876,
    avgDurationSeconds: 28,
    shortLink: 'https://bit.ly/PlattReel',
    status: 'Active',
  },
  {
    id: 3,
    title: 'Summer Vibes Commercial',
    previewUrl: 'https://images.unsplash.com/photo-1507525428034-b723a9ce68c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    totalViews: 8201,
    completedViews: 3450,
    avgDurationSeconds: 15,
    shortLink: 'https://bit.ly/SummerVibe',
    status: 'Inactive',
  },
  {
    id: 4,
    title: 'Corporate Event Highlights',
    previewUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    totalViews: 4500,
    completedViews: 1200,
    avgDurationSeconds: 9,
    shortLink: 'https://bit.ly/CorpEvent',
    status: 'Active',
  },
  {
    id: 5,
    title: 'Urban Exploration Part 1',
    previewUrl: 'https://images.unsplash.com/photo-1519892300165-2d7822d0b5c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    totalViews: 15200,
    completedViews: 11000,
    avgDurationSeconds: 32,
    shortLink: 'https://bit.ly/UrbanEx1',
    status: 'Inactive',
  },
  {
    id: 6,
    title: 'Cooking with Chef Antoine',
    previewUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    totalViews: 35000,
    completedViews: 28000,
    avgDurationSeconds: 55,
    shortLink: 'https://bit.ly/ChefCook',
    status: 'Active',
  },
  {
    id: 7,
    title: 'Fitness Journey: Week 1',
    previewUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    totalViews: 7800,
    completedViews: 4500,
    avgDurationSeconds: 20,
    shortLink: 'https://bit.ly/FitWeek1',
    status: 'Active',
  },
  {
    id: 8,
    title: 'Tech Review: The New Gadget',
    previewUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    totalViews: 48000,
    completedViews: 35000,
    avgDurationSeconds: 60,
    shortLink: 'https://bit.ly/TechGadget',
    status: 'Inactive',
  },
  {
    id: 9,
    title: 'DIY Home Decor Ideas',
    previewUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    totalViews: 9200,
    completedViews: 7500,
    avgDurationSeconds: 25,
    shortLink: 'https://bit.ly/DIYDecor',
    status: 'Active',
  },
  {
    id: 10,
    title: 'Travel Vlog: Tokyo Streets',
    previewUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    totalViews: 65000,
    completedViews: 52000,
    avgDurationSeconds: 70,
    shortLink: 'https://bit.ly/TokyoVlog',
    status: 'Active',
  },
  {
    id: 11,
    title: 'Acoustic Guitar Session',
    previewUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106945?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    totalViews: 3200,
    completedViews: 2800,
    avgDurationSeconds: 18,
    shortLink: 'https://bit.ly/AcousticSesh',
    status: 'Active',
  },
  {
    id: 12,
    title: 'Gaming Highlights Montage',
    previewUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    totalViews: 120000,
    completedViews: 80000,
    avgDurationSeconds: 90,
    shortLink: 'https://bit.ly/GameMontage',
    status: 'Inactive',
  },
];

const Highlight = ({ text, highlight }) => {
  if (!highlight?.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = String(text).split(regex);
  return (
    <span>
      {' '}
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark
            key={i}
            className="bg-yellow-200 dark:bg-yellow-600/40 text-black dark:text-white rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

// --- Змінено: Компонент заголовка для відображення напрямку сортування ---
const SortableHeader = ({
  children,
  sortKey,
  sortConfig,
  onSort,
  className = '',
}) => {
  const isActive = sortConfig.key === sortKey;
  
  const renderSortIcon = () => {
    if (!isActive) {
      return (
        <ArrowUpDown className="h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />
      );
    }
    return sortConfig.direction === 'ascending' ? (
      <ArrowUp className="h-4 w-4 text-slate-800 dark:text-slate-200" />
    ) : (
      <ArrowDown className="h-4 w-4 text-slate-800 dark:text-slate-200" />
    );
  };

  return (
    <th className={`p-4 font-medium text-left ${className}`}>
      <button
        className="flex items-center gap-1 group"
        onClick={() => onSort(sortKey)}
      >
        {children}
        {renderSortIcon()}
      </button>
    </th>
  );
};

const MyAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'totalViews',
    direction: 'descending',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleToggleStatus = (id) => {
    setAnalyticsData((currentData) =>
      currentData.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'Active' ? 'Inactive' : 'Active',
            }
          : item
      )
    );
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...analyticsData];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'completionRate') {
          aValue = a.totalViews === 0 ? 0 : a.completedViews / a.totalViews;
          bValue = b.totalViews === 0 ? 0 : b.completedViews / b.totalViews;
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          if (aValue < bValue)
            return sortConfig.direction === 'ascending' ? -1 : 1;
          if (aValue > bValue)
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [analyticsData, sortConfig]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return sortedData;
    const term = searchTerm.toLowerCase();
    return sortedData.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(term)
      )
    );
  }, [sortedData, searchTerm]);

  useEffect(() => {
    if (searchTerm) setCurrentPage(1);
  }, [searchTerm]);

  const currentData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredData.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredData, currentPage]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);
  const getCompletionRate = (completed, total) =>
    total === 0 ? 0 : Math.round((completed / total) * 100);

  const inputClasses =
    'flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900';
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (loading)
    return (
      <div className="p-4 text-center text-slate-500 dark:text-slate-400">
        Loading analytics... ⏳
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          My Analytics
        </h1>
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search analytics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="text-center p-8 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900/70">
          <p className="text-slate-500 dark:text-slate-400">
            {searchTerm
              ? `No results found for "${searchTerm}"`
              : 'No analytics data available.'}
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <SortableHeader
                    sortKey="title"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    className="w-[30%]"
                  >
                    Reel
                  </SortableHeader>
                  <SortableHeader
                    sortKey="totalViews"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    className="w-[12%] text-center"
                  >
                    Total Views
                  </SortableHeader>
                  <SortableHeader
                    sortKey="completionRate"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    className="w-[15%] text-center"
                  >
                    Completion
                  </SortableHeader>
                  <SortableHeader
                    sortKey="avgDurationSeconds"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    className="w-[12%] text-center"
                  >
                    Avg. Duration
                  </SortableHeader>
                  <SortableHeader
                    sortKey="status"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    className="w-[10%] text-center"
                  >
                    Status
                  </SortableHeader>
                  <th className="p-4 font-medium text-center w-[12%]">
                    Short Link
                  </th>
                  <th className="p-4 font-medium text-center w-[9%]">Action</th>
                </tr>
              </thead>
              <tbody className="text-slate-800 dark:text-slate-200 divide-y divide-slate-100 dark:divide-slate-800">
                {currentData.map((reel) => {
                  const completionRate = getCompletionRate(
                    reel.completedViews,
                    reel.totalViews
                  );
                  return (
                    <tr
                      key={reel.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4 text-left">
                        <div className="flex items-center gap-4">
                          <img
                            src={reel.previewUrl}
                            alt={reel.title}
                            className="w-20 h-12 object-cover rounded-md border border-slate-200 dark:border-slate-700"
                          />
                          {/* --- Змінено: Прибрано опис, залишено тільки тайтл --- */}
                          <span className="font-medium text-slate-900 dark:text-slate-50">
                            <Highlight
                              text={reel.title}
                              highlight={searchTerm}
                            />
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                          <Eye className="h-4 w-4" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            <Highlight
                              text={formatNumber(reel.totalViews)}
                              highlight={searchTerm}
                            />
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <span className="font-semibold text-slate-900 dark:text-slate-50">
                            {completionRate}%
                          </span>
                          <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-slate-900 dark:bg-slate-400 h-1.5"
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatNumber(reel.completedViews)} to end
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            <Highlight
                              text={`${reel.avgDurationSeconds}s`}
                              highlight={searchTerm}
                            />
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                            reel.status === 'Active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {reel.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <a
                          href={reel.shortLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                        >
                          <Highlight
                            text={reel.shortLink.replace('https://', '')}
                            highlight={searchTerm}
                          />
                          <Link className="h-3 w-3" />
                        </a>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(reel.id)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                            reel.status === 'Active'
                              ? 'border-red-500/50 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10'
                              : 'border-green-500/50 text-green-600 hover:bg-green-50 dark:border-green-500/30 dark:text-green-400 dark:hover:bg-green-500/10'
                          }`}
                        >
                          {reel.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 flex items-center justify-between text-sm border-t border-slate-200 dark:border-slate-800">
              <div className="text-slate-600 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyAnalytics;