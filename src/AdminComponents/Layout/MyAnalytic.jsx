import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Link,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Trash2, // ✨ ІМПОРТ: Нова іконка
  AlertTriangle, // ✨ ІМПОРТ: Нова іконка
} from 'lucide-react';

// Компонент підсвітки тексту (без змін)
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

// Компонент заголовку для сортування (без змін)
const SortableHeader = ({ children, sortKey, sortConfig, onSort, className = '' }) => {
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
    <th className={`p-3 font-medium text-left ${className}`}>
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

// ✨ НОВИЙ КОМПОНЕНТ: Модальне вікно підтвердження
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-4 text-left">
            <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-slate-50">{title}</h3>
            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">{children}</div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
          <button type="button" onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:w-auto sm:text-sm">
            Delete
          </button>
          <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const MyAnalytics = () => {
  const [reelsData, setReelsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [signedUrls, setSignedUrls] = useState({});
  const [reelToDelete, setReelToDelete] = useState(null); // ✨ НОВИЙ СТЕЙТ: для модального вікна
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
        alert(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    // ... (код без змін)
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setReelsData(currentData =>
      currentData.map(item =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );

    try {
        const response = await fetch(`http://localhost:3001/reels/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) throw new Error('Failed to update status on server.');
    } catch (error) {
        console.error(error);
        alert(`Error updating status: ${error.message}`);
        setReelsData(currentData =>
            currentData.map(item =>
                item.id === id ? { ...item, status: currentStatus } : item
            )
        );
    }
  };

  // ✨ НОВА ФУНКЦІЯ: підтвердження видалення
  const handleConfirmDelete = async () => {
    if (!reelToDelete) return;
    
    try {
        const response = await fetch(`http://localhost:3001/reels/${reelToDelete.id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.details || 'Failed to delete the reel.');
        }
        // Оновлюємо стан, видаляючи рілс зі списку
        setReelsData(currentData => currentData.filter(r => r.id !== reelToDelete.id));
        alert(`Reel "${reelToDelete.title}" was successfully deleted.`);
    } catch (error) {
        console.error("Deletion error:", error);
        alert(`Error: ${error.message}`);
    } finally {
        setReelToDelete(null); // Закриваємо модальне вікно
    }
  };


  const sortedData = useMemo(() => {
    // ... (код без змін)
    let sortableItems = [...reelsData];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else {
          if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [reelsData, sortConfig]);

  const filteredData = useMemo(() => {
    // ... (код без змін)
    if (!searchTerm) return sortedData;
    const term = searchTerm.toLowerCase();
    return sortedData.filter((item) =>
      item.title.toLowerCase().includes(term) ||
      item.status.toLowerCase().includes(term) ||
      item.short_link.toLowerCase().includes(term)
    );
  }, [sortedData, searchTerm]);
  
  const currentData = useMemo(() => {
    // ... (код без змін)
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  useEffect(() => {
    // ... (код без змін)
    const fetchSignedUrls = async () => {
      const pathsToFetch = currentData
        .map(item => item.preview_gcs_path)
        .filter(path => path && !signedUrls[path]);

      const uniquePathsToFetch = [...new Set(pathsToFetch)];
      if (uniquePathsToFetch.length === 0) return;

      try {
        const response = await fetch('http://localhost:3001/generate-read-urls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gcsPaths: uniquePathsToFetch }),
        });
        if (!response.ok) throw new Error('Failed to fetch signed URLs');
        const urlsMap = await response.json();
        setSignedUrls(prevUrls => ({ ...prevUrls, ...urlsMap }));
      } catch (err) {
        console.error('Error fetching signed URLs for analytics:', err);
      }
    };

    if (currentData.length > 0) {
      fetchSignedUrls();
    }
  }, [currentData, signedUrls]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const formatDateTime = (dateString) => new Date(dateString).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  const inputClasses = 'flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50';
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (loading) return <div className="p-4 text-center text-slate-500">Loading analytics... ⏳</div>;

  return (
    <>
    {/* ✨ РЕНДЕР МОДАЛЬНОГО ВІКНА */}
    <ConfirmationModal
        isOpen={!!reelToDelete}
        onClose={() => setReelToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Showreel"
    >
        Are you sure you want to delete the showreel{' '}
        <strong className="text-slate-700 dark:text-slate-200">{reelToDelete?.title}</strong>?
        This action will only remove the reel itself, not the media items in it. This cannot be undone.
    </ConfirmationModal>

    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Showreels Analytics</h1>
        <div className="w-full sm:w-72">
          <input type="text" placeholder="Search reels..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={inputClasses} />
        </div>
      </div>
      <div className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900">
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="p-3 font-medium text-center w-12">#</th>
                <th className="p-3 font-medium text-left w-24">Preview</th>
                <SortableHeader sortKey="title" sortConfig={sortConfig} onSort={handleSort}>Reel Title</SortableHeader>
                <SortableHeader sortKey="created_at" sortConfig={sortConfig} onSort={handleSort} className="w-48">Created At</SortableHeader>
                <SortableHeader sortKey="status" sortConfig={sortConfig} onSort={handleSort} className="w-28 text-center">Status</SortableHeader>
                <th className="p-3 font-medium text-center w-32">Short Link</th>
                <th className="p-3 font-medium text-center w-40">Actions</th> {/* Збільшено ширину */}
              </tr>
            </thead>
            <tbody className="text-sm text-slate-800 dark:text-slate-200 divide-y divide-slate-100 dark:divide-slate-800">
              {currentData.map((reel, index) => {
                const itemNumber = (currentPage - 1) * itemsPerPage + index + 1;
                const previewUrl = reel.preview_gcs_path ? signedUrls[reel.preview_gcs_path] : null;

                return (
                  <tr key={reel.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 text-center text-slate-500 dark:text-slate-400">{itemNumber}</td>
                    <td className="p-3 text-left">
                      <div className="w-16 h-10 bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center shrink-0">
                        {previewUrl ? (
                          <img src={previewUrl} alt="preview" className="w-full h-full object-cover rounded-md" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-left font-medium text-slate-900 dark:text-slate-50 truncate">
                      <Highlight text={reel.title} highlight={searchTerm} />
                    </td>
                    <td className="p-3 text-left text-slate-600 dark:text-slate-400 truncate">{formatDateTime(reel.created_at)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${ reel.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' }`}>
                        {reel.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <a href={`/reel/${reel.short_link}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 hover:underline">
                        <Highlight text={reel.short_link} highlight={searchTerm} />
                        <Link className="h-3 w-3" />
                      </a>
                    </td>
                    {/* ✨ ОНОВЛЕНА КОМІРКА З ДІЯМИ */}
                    <td className="p-3 text-center">
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
    </div>
    </>
  );
};

export default MyAnalytics;