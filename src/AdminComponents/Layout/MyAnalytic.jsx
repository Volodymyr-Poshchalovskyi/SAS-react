import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Clock, ArrowUpDown, Link, ChevronLeft, ChevronRight } from 'lucide-react';

// === Розширений набір статичних даних (24 елементи) ===
const mockAnalyticsData = [
  { id: 1, title: 'Mountain Adventure Documentary', previewUrl: 'https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 22890, completedViews: 19500, avgDurationSeconds: 45, shortLink: 'https://bit.ly/MtnDoc' },
  { id: 2, title: 'Aaron Platt Mixed Reel', previewUrl: 'https://images.unsplash.com/photo-1598124146163-36aced836738?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 12543, completedViews: 9876, avgDurationSeconds: 28, shortLink: 'https://bit.ly/PlattReel' },
  { id: 3, title: 'Summer Vibes Commercial', previewUrl: 'https://images.unsplash.com/photo-1507525428034-b723a9ce68c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 8201, completedViews: 3450, avgDurationSeconds: 15, shortLink: 'https://bit.ly/SummerVibe' },
  { id: 4, title: 'Corporate Event Highlights', previewUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 4500, completedViews: 1200, avgDurationSeconds: 9, shortLink: 'https://bit.ly/CorpEvent' },
  { id: 5, title: 'Urban Exploration Part 1', previewUrl: 'https://images.unsplash.com/photo-1519892300165-2d7822d0b5c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 15200, completedViews: 11000, avgDurationSeconds: 32, shortLink: 'https://bit.ly/UrbanEx1' },
  { id: 6, title: 'Cooking with Chef Antoine', previewUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 35000, completedViews: 28000, avgDurationSeconds: 55, shortLink: 'https://bit.ly/ChefCook' },
  { id: 7, title: 'Fitness Journey: Week 1', previewUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 7800, completedViews: 4500, avgDurationSeconds: 20, shortLink: 'https://bit.ly/FitWeek1' },
  { id: 8, title: 'Tech Review: The New Gadget', previewUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 48000, completedViews: 35000, avgDurationSeconds: 60, shortLink: 'https://bit.ly/TechGadget' },
  { id: 9, title: 'DIY Home Decor Ideas', previewUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 9200, completedViews: 7500, avgDurationSeconds: 25, shortLink: 'https://bit.ly/DIYDecor' },
  { id: 10, title: 'Travel Vlog: Tokyo Streets', previewUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 65000, completedViews: 52000, avgDurationSeconds: 70, shortLink: 'https://bit.ly/TokyoVlog' },
  { id: 11, title: 'Acoustic Guitar Session', previewUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106945?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 3200, completedViews: 2800, avgDurationSeconds: 18, shortLink: 'https://bit.ly/AcousticSesh' },
  { id: 12, title: 'Gaming Highlights Montage', previewUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 120000, completedViews: 80000, avgDurationSeconds: 90, shortLink: 'https://bit.ly/GameMontage' },
  { id: 13, title: 'The Art of Coffee Making', previewUrl: 'https://images.unsplash.com/photo-1511920183276-542a9b13918a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 18500, completedViews: 15000, avgDurationSeconds: 35, shortLink: 'https://bit.ly/ArtOfCoffee' },
  { id: 14, title: 'Pet Compilation: Funny Dogs', previewUrl: 'https://images.unsplash.com/photo-1536064022159-a8a40c2d31f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 250000, completedViews: 180000, avgDurationSeconds: 120, shortLink: 'https://bit.ly/FunnyDogs' },
  { id: 15, title: 'Learning React in 2025', previewUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 98000, completedViews: 45000, avgDurationSeconds: 150, shortLink: 'https://bit.ly/React2025' },
  { id: 16, title: 'Ocean Documentary Trailer', previewUrl: 'https://images.unsplash.com/photo-1507987343542-dba78b8f2444?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 7600, completedViews: 6500, avgDurationSeconds: 22, shortLink: 'https://bit.ly/OceanDoc' },
  { id: 17, title: 'How to Build a PC', previewUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 54000, completedViews: 21000, avgDurationSeconds: 180, shortLink: 'https://bit.ly/BuildPC' },
  { id: 18, title: 'Unboxing New Smartphone', previewUrl: 'https://images.unsplash.com/photo-1588880331179-62b844114d5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 6800, completedViews: 5000, avgDurationSeconds: 40, shortLink: 'https://bit.ly/UnboxPhone' },
  { id: 19, title: 'Skateboarding Tricks', previewUrl: 'https://images.unsplash.com/photo-1549298242-048a1a36481c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 11000, completedViews: 8000, avgDurationSeconds: 28, shortLink: 'https://bit.ly/SkateTricks' },
  { id: 20, title: 'The Story of a Startup', previewUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 3300, completedViews: 2000, avgDurationSeconds: 15, shortLink: 'https://bit.ly/StartupStory' },
  { id: 21, title: 'Abstract Animation Loop', previewUrl: 'https://images.unsplash.com/photo-1558519650-3571a81b537a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 950, completedViews: 900, avgDurationSeconds: 5, shortLink: 'https://bit.ly/AnimLoop' },
  { id: 22, title: 'Car Commercial: The new Sedan', previewUrl: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 41000, completedViews: 15000, avgDurationSeconds: 30, shortLink: 'https://bit.ly/NewSedan' },
  { id: 23, title: 'Real Estate Tour', previewUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 6200, completedViews: 5500, avgDurationSeconds: 48, shortLink: 'https://bit.ly/RealEstateTour' },
  { id: 24, title: 'Wedding Highlights Film', previewUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', totalViews: 1900, completedViews: 1800, avgDurationSeconds: 24, shortLink: 'https://bit.ly/WeddingFilm' },
];

// === Допоміжні компоненти ===
const Highlight = ({ text, highlight }) => {
  if (!highlight?.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = String(text).split(regex);
  return ( <span> {parts.map((part, i) => part.toLowerCase() === highlight.toLowerCase() ? ( <mark key={i} className="bg-yellow-200 dark:bg-yellow-600/40 text-black dark:text-white rounded px-0.5">{part}</mark>) : (part))}</span>);
};

const SortableHeader = ({ children, sortKey, sortConfig, onSort, className = '' }) => {
  const isActive = sortConfig.key === sortKey;
  return (<th className={`p-4 font-medium text-left ${className}`}><button className="flex items-center gap-1 group" onClick={() => onSort(sortKey)}>{children}<ArrowUpDown className={`h-4 w-4 transition-colors ${isActive ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300'}`} /></button></th>);
};

const MyAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'totalViews', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData);
      setLoading(false);
    }, 1000);
  }, []);

  const sortedData = useMemo(() => {
    let sortableItems = [...analyticsData];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [analyticsData, sortConfig]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return sortedData;
    const term = searchTerm.toLowerCase();
    return sortedData.filter(item => Object.values(item).some(value => String(value).toLowerCase().includes(term)));
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
    if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
    setSortConfig({ key, direction });
  };

  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);
  const getCompletionRate = (completed, total) => total === 0 ? 0 : Math.round((completed / total) * 100);

  const inputClasses = "flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900";
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (loading) return <div className="p-4 text-center text-slate-500 dark:text-slate-400">Loading analytics... ⏳</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">My Analytics</h1>
        <div className="w-full sm:w-72">
          <input type="text" placeholder="Search analytics..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={inputClasses} />
        </div>
      </div>
      
      {filteredData.length === 0 ? (
        <div className="text-center p-8 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900/70">
           <p className="text-slate-500 dark:text-slate-400">{searchTerm ? `No results found for "${searchTerm}"` : 'No analytics data available.'}</p>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead className="text-slate-500 dark:text-slate-400">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <SortableHeader sortKey="title" sortConfig={sortConfig} onSort={handleSort} className="w-2/5">Reel</SortableHeader>
                  <SortableHeader sortKey="totalViews" sortConfig={sortConfig} onSort={handleSort} className="w-1/5 text-center">Total Views</SortableHeader>
                  <SortableHeader sortKey="completedViews" sortConfig={sortConfig} onSort={handleSort} className="w-1/5 text-center">Completion</SortableHeader>
                  <SortableHeader sortKey="avgDurationSeconds" sortConfig={sortConfig} onSort={handleSort} className="w-1/5 text-center">Avg. Duration</SortableHeader>
                  <SortableHeader sortKey="shortLink" sortConfig={sortConfig} onSort={handleSort} className="w-1/5 text-center">Short Link</SortableHeader>
                </tr>
              </thead>
              <tbody className="text-slate-800 dark:text-slate-200 divide-y divide-slate-100 dark:divide-slate-800">
                {currentData.map((reel) => {
                  const completionRate = getCompletionRate(reel.completedViews, reel.totalViews);
                  return (
                    <tr key={reel.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-left">
                        <div className="flex items-center gap-4">
                          <img src={reel.previewUrl} alt={reel.title} className="w-20 h-12 object-cover rounded-md border border-slate-200 dark:border-slate-700" />
                          <span className="font-medium text-slate-900 dark:text-slate-50"><Highlight text={reel.title} highlight={searchTerm} /></span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                          <Eye />
                          <span className="font-medium text-slate-800 dark:text-slate-200"><Highlight text={formatNumber(reel.totalViews)} highlight={searchTerm} /></span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                           <span className="font-semibold text-slate-900 dark:text-slate-50">{completionRate}%</span>
                           <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                             <div className="bg-slate-900 dark:bg-slate-400 h-1.5" style={{ width: `${completionRate}%` }}></div>
                           </div>
                           <span className="text-xs text-slate-500 dark:text-slate-400">{formatNumber(reel.completedViews)} to end</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                         <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                            <Clock />
                            <span className="font-medium text-slate-800 dark:text-slate-200"><Highlight text={`${reel.avgDurationSeconds}s`} highlight={searchTerm} /></span>
                         </div>
                      </td>
                      <td className="p-4 text-center">
                        <a href={reel.shortLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">
                          <Highlight text={reel.shortLink.replace('https://', '')} highlight={searchTerm} />
                          <Link className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 flex items-center justify-between text-sm border-t border-slate-200 dark:border-slate-800">
              <div className="text-slate-600 dark:text-slate-400">Page {currentPage} of {totalPages}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="h-4 w-4"/></button>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="h-4 w-4"/></button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyAnalytics;