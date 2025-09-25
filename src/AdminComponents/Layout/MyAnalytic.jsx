// src/AdminComponents/Layout/MyAnalytics.jsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  Eye,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Link,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle,
  User,
} from 'lucide-react';
import { getSignedUrls } from '../../lib/gcsUrlCache';

// =======================
// UTILITY COMPONENTS
// =======================
const Highlight = ({ text, highlight }) => {
  if (!highlight?.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = String(text).split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-600/40 text-black dark:text-white rounded px-0.5">
            {part}
          </mark>
        ) : ( part )
      )}
    </span>
  );
};

const SortableHeader = ({ children, sortKey, sortConfig, onSort, className = '' }) => {
  const isActive = sortConfig.key === sortKey;
  const renderSortIcon = () => {
    if (!isActive) return <ArrowUpDown className="h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />;
    return sortConfig.direction === 'ascending' ? <ArrowUp className="h-4 w-4 text-slate-800 dark:text-slate-200" /> : <ArrowDown className="h-4 w-4 text-slate-800 dark:text-slate-200" />;
  };
  return (
    <th className={`p-4 font-medium text-left ${className}`}>
      <button className="flex items-center gap-1 group" onClick={() => onSort(sortKey)}>
        {children} {renderSortIcon()}
      </button>
    </th>
  );
};

// ===========================================
// ✨ ЗМІНА: Додано відсутній компонент ConfirmationModal
// ===========================================
const ConfirmationModal = ({ isOpen, onClose, onConfirm, itemTitle }) => {
  const [status, setStatus] = useState('idle'); // 'idle', 'deleting', 'success', 'error'

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
    }
  }, [isOpen]);

  const handleConfirmClick = async () => {
    setStatus('deleting');
    try {
      await onConfirm();
      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 2000); // Auto-close after 2 seconds on success
    } catch (error) {
      console.error("Deletion failed:", error);
      setStatus('error');
      setTimeout(() => {
        if (status === 'error') setStatus('idle');
      }, 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={status === 'idle' ? onClose : undefined}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md transition-all" onClick={(e) => e.stopPropagation()}>
        {status === 'success' ? (
          <div className="text-center py-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">Deleted Successfully</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              The showreel "<strong className="text-slate-700 dark:text-slate-200">{itemTitle}</strong>" was deleted.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-slate-50">Delete Showreel</h3>
                <div className="mt-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {status === 'error' 
                      ? <span className="text-red-500">Failed to delete the showreel. Please try again.</span>
                      : <>Are you sure you want to delete <strong className="text-slate-700 dark:text-slate-200">{itemTitle}</strong>? This action cannot be undone.</>
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
              <button type="button" onClick={handleConfirmClick} disabled={status === 'deleting'} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:w-auto sm:text-sm disabled:bg-red-400 disabled:cursor-not-allowed">
                {status === 'deleting' ? <Loader2 className="animate-spin h-5 w-5" /> : 'Delete'}
              </button>
              <button type="button" onClick={onClose} disabled={status === 'deleting'} className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50">
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


// =======================
// MAIN COMPONENT: MyAnalytics
// =======================
const MyAnalytics = () => {
  const [reelsData, setReelsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'total_views', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [signedUrls, setSignedUrls] = useState({});
  const [reelToDelete, setReelToDelete] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchReels = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3001/reels');
        if (!response.ok) throw new Error('Failed to fetch reels data.');
        const data = await response.json();
        setReelsData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, []);
  
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setReelsData(currentData => currentData.map(item => item.id === id ? { ...item, status: newStatus } : item));
    try {
      await fetch(`http://localhost:3001/reels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error(error);
      setReelsData(currentData => currentData.map(item => item.id === id ? { ...item, status: currentStatus } : item));
    }
  };
  
  const handleConfirmDelete = async () => {
    if (!reelToDelete) return;
    const response = await fetch(`http://localhost:3001/reels/${reelToDelete.id}`, { method: 'DELETE' });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || 'Failed to delete the showreel.');
    }
    setReelsData(currentData => currentData.filter(r => r.id !== reelToDelete.id));
  };


  const sortedData = useMemo(() => {
    let sortableItems = [...reelsData];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'created_by') {
          // ✨ ЗМІНА: Оновлена логіка сортування для user_profiles
          aValue = `${a.user_profiles?.first_name || ''} ${a.user_profiles?.last_name || ''}`.trim();
          bValue = `${b.user_profiles?.first_name || ''} ${b.user_profiles?.last_name || ''}`.trim();
        } else {
          aValue = a[sortConfig.key] ?? 0; 
          bValue = b[sortConfig.key] ?? 0;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [reelsData, sortConfig]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return sortedData;
    const term = searchTerm.toLowerCase();
    return sortedData.filter((item) => {
      // ✨ ЗМІНА: Оновлена логіка пошуку для user_profiles
      const createdByName = `${item.user_profiles?.first_name || ''} ${item.user_profiles?.last_name || ''}`.trim().toLowerCase();
      return item.title.toLowerCase().includes(term) ||
             item.short_link.toLowerCase().includes(term) ||
             createdByName.includes(term);
    });
  }, [sortedData, searchTerm]);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  useEffect(() => {
    const fetchAndCacheUrls = async () => {
      const pathsToFetch = currentData.map(item => item.preview_gcs_path).filter(path => path);
      if (pathsToFetch.length === 0) return;
      const urlsMap = await getSignedUrls(pathsToFetch);
      setSignedUrls(prevUrls => ({ ...prevUrls, ...urlsMap }));
    };
    if (currentData.length > 0) {
      fetchAndCacheUrls();
    }
  }, [currentData]);

  const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending' }));
  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);

  const inputClasses = 'flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50';
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (loading) return <div className="p-4 text-center text-slate-500">Loading analytics... ⏳</div>;

  return (
    <>
      <ConfirmationModal
        isOpen={!!reelToDelete}
        onClose={() => setReelToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemTitle={reelToDelete?.title}
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Analytics</h1>
          <div className="w-full sm:w-72">
            <input type="text" placeholder="Search analytics..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={inputClasses} />
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <SortableHeader sortKey="title" sortConfig={sortConfig} onSort={handleSort} className="w-[30%]">Reel</SortableHeader>
                  <SortableHeader sortKey="total_views" sortConfig={sortConfig} onSort={handleSort} className="w-[10%] text-center">Views</SortableHeader>
                  <SortableHeader sortKey="completion_rate" sortConfig={sortConfig} onSort={handleSort} className="w-[13%] text-center">Completion</SortableHeader>
                  <SortableHeader sortKey="avg_watch_duration" sortConfig={sortConfig} onSort={handleSort} className="w-[10%] text-center">Avg. Time</SortableHeader>
                  <SortableHeader sortKey="created_by" sortConfig={sortConfig} onSort={handleSort} className="w-[12%]">Created By</SortableHeader>
                  <SortableHeader sortKey="status" sortConfig={sortConfig} onSort={handleSort} className="w-[8%] text-center">Status</SortableHeader>
                  <th className="p-4 font-medium text-center w-[8%]">Link</th>
                  <th className="p-4 font-medium text-center w-[9%]">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-800 dark:text-slate-200 divide-y divide-slate-100 dark:divide-slate-800">
                {currentData.map((reel) => {
                  const previewUrl = reel.preview_gcs_path ? signedUrls[reel.preview_gcs_path] : null;
                  const completionRate = Math.round(reel.completion_rate || 0);
                  // ✨ ЗМІНА: Формуємо повне ім'я автора
                  const createdBy = reel.user_profiles ? `${reel.user_profiles.first_name || ''} ${reel.user_profiles.last_name || ''}`.trim() : 'N/A';

                  return (
                    <tr key={reel.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 text-left">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-12 bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                            {previewUrl ? <img src={previewUrl} alt={reel.title} className="w-full h-full object-cover rounded-md" /> : <ImageIcon className="w-6 h-6 text-slate-400" />}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-slate-50">
                            <Highlight text={reel.title} highlight={searchTerm} />
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                          <Eye className="h-4 w-4" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {formatNumber(reel.total_views || 0)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <span className="font-semibold text-slate-900 dark:text-slate-50">{completionRate}%</span>
                          <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-slate-900 dark:bg-slate-400 h-1.5" style={{ width: `${completionRate}%` }}></div>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatNumber(reel.completed_views || 0)} to end
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {Math.round(reel.avg_watch_duration || 0)}s
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-left">
                         <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <User className="h-4 w-4" />
                            <span>
                               <Highlight text={createdBy === '' ? 'N/A' : createdBy} highlight={searchTerm} />
                            </span>
                         </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${reel.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'}`}>
                          {reel.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <a href={`/reel/${reel.short_link}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 hover:underline">
                           <Highlight text={reel.short_link} highlight={searchTerm} />
                          <Link className="h-3 w-3" />
                        </a>
                      </td>
                      <td className="p-4 text-center">
                         <div className="flex items-center justify-center gap-2">
                           <button onClick={() => handleToggleStatus(reel.id, reel.status)} className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${ reel.status === 'Active' ? 'border-yellow-500/50 text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-500/10' : 'border-green-500/50 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-500/10' }`}>
                               {reel.status === 'Active' ? 'Deactivate' : 'Activate'}
                           </button>
                           <button onClick={() => setReelToDelete(reel)} className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-colors">
                               <Trash2 className="h-4 w-4" />
                           </button>
                         </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 flex items-center justify-between text-sm border-t border-slate-200 dark:border-slate-800">
                {/* Pagination */}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyAnalytics;