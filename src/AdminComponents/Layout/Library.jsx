import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient'; // Переконайтеся, що шлях правильний

// =======================
// КОМПОНЕНТ: Модальне вікно для відео
// =======================
const VideoModal = ({ videoUrl, onClose }) => {
  if (!videoUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-black p-4 rounded-lg relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <video src={videoUrl} controls autoPlay className="w-full max-h-[80vh]"></video>
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-white text-black rounded-full p-2"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};


// =======================
// КОМПОНЕНТ: SortableHeader
// =======================
const SortableHeader = ({ children, sortKey, sortConfig, onSort, className = '' }) => {
  const isActive = sortConfig.key === sortKey;
  const renderSortIcon = () => {
    if (!isActive) return <ArrowUpDown className="h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />;
    return sortConfig.direction === 'ascending' ? <ArrowUp className="h-4 w-4 text-slate-800 dark:text-slate-200" /> : <ArrowDown className="h-4 w-4 text-slate-800 dark:text-slate-200" />;
  };
  return (
    <th className={`p-4 font-medium text-left ${className}`}>
      <button className="flex items-center gap-1 group" onClick={() => onSort(sortKey)}>
        {children}
        {renderSortIcon()}
      </button>
    </th>
  );
};

// =======================
// КОМПОНЕНТ: ReelCreatorSidebar (Drag-and-Drop)
// =======================
const ReelCreatorSidebar = ({ allItems }) => {
  const [reelItems, setReelItems] = useState([]);
  const [reelTitle, setReelTitle] = useState(`Draft: Showreel (${new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })})`);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const handleDragOver = (e) => { e.preventDefault(); setIsDraggingOver(true); };
  const handleDragLeave = () => setIsDraggingOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const draggedItemIds = JSON.parse(e.dataTransfer.getData("application/json"));
    const newItems = allItems.filter(item => draggedItemIds.includes(item.id)).filter(item => !reelItems.some(reelItem => reelItem.id === item.id));
    if (newItems.length > 0) setReelItems(prevItems => [...prevItems, ...newItems]);
  };
  const handleTitleChange = (e) => setReelTitle(e.target.value);
  const handleRemoveItem = (itemIdToRemove) => setReelItems(prevItems => prevItems.filter(item => item.id !== itemIdToRemove));
  return (
    <div className="w-96 shrink-0 space-y-4">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">New Reel</h2>
      <div onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={handleDragLeave} className={`flex flex-col p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 transition-all duration-300 min-h-[400px] ${isDraggingOver ? 'border-2 border-blue-500 ring-4 ring-blue-500/20' : 'border border-slate-200 dark:border-slate-800'}`}>
        {reelItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 pointer-events-none h-full">
            <Layers className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Drag work here</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">TO CREATE A REEL</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <label htmlFor="reel-title" className="text-xs font-medium text-slate-500 dark:text-slate-400">TITLE</label>
              <input id="reel-title" type="text" value={reelTitle} onChange={handleTitleChange} className="mt-1 block w-full bg-transparent text-sm text-slate-900 dark:text-slate-50 font-semibold border-none p-0 focus:ring-0" />
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)] pr-2">
              {reelItems.map(item => (
                <div key={item.id} className="group flex items-center justify-between gap-3 p-2 rounded-md bg-white dark:bg-slate-800/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={item.previewUrl} alt={item.title} className="w-14 h-9 object-cover rounded-md" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{item.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.subtitle}</p>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveItem(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                    <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-4">
              <button className="w-full px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Deliver</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// =======================
// ОСНОВНИЙ КОМПОНЕНТ Library
// =======================
const Library = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });
  const [modalVideoUrl, setModalVideoUrl] = useState(null);
  
  const itemsPerPage = 10;
  const headerCheckboxRef = useRef(null);
  const BUCKET_NAME = 'new-sas-media-storage';

  useEffect(() => {
    const fetchMediaItems = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('media_items')
        .select(`*, user_profiles(first_name, last_name)`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching media items:', error);
        setError(error.message);
        setLoading(false);
        return;
      }

      const itemsWithUrls = data.map(item => {
        const previewUrl = item.preview_gcs_path 
          ? `https://storage.googleapis.com/${BUCKET_NAME}/${item.preview_gcs_path}`
          : 'https://via.placeholder.com/140x90.png?text=No+Preview';
        
        const videoUrl = item.video_gcs_path
          ? `https://storage.googleapis.com/${BUCKET_NAME}/${item.video_gcs_path}`
          : null;

        return { ...item, previewUrl, videoUrl };
      });

      setItems(itemsWithUrls);
      setLoading(false);
    };
    fetchMediaItems();
  }, []);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return sortedItems;
    const term = searchTerm.toLowerCase();
    return sortedItems.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(term)
      )
    );
  }, [sortedItems, searchTerm]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  useEffect(() => {
    if (headerCheckboxRef.current) {
      const numSelected = selectedItems.size;
      const numOnPage = currentItems.length;
      headerCheckboxRef.current.checked = numSelected === numOnPage && numOnPage > 0;
      headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numOnPage;
    }
  }, [selectedItems, currentItems]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(new Set(currentItems.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleRowCheck = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
      return newSet;
    });
  };

  const handleDragStart = (e, item) => {
    const itemsToDrag = selectedItems.has(item.id) ? Array.from(selectedItems) : [item.id];
    e.dataTransfer.setData('application/json', JSON.stringify(itemsToDrag));
  };

  const formatDateTime = (dateString) => new Date(dateString).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  if (loading) return <div className="p-8 text-center text-slate-500">Loading library... ⏳</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <>
      <VideoModal videoUrl={modalVideoUrl} onClose={() => setModalVideoUrl(null)} />
      <div className="flex items-start gap-8 p-6 bg-white dark:bg-slate-950 min-h-screen">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Media Library</h1>
            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Search library..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900/70">
            <div className="overflow-x-auto">
              <table className="w-full text-xs table-fixed">
                <thead className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="p-4 w-12 text-left"><input type="checkbox" ref={headerCheckboxRef} onChange={handleSelectAll} className="h-4 w-4 accent-slate-900" /></th>
                    <SortableHeader sortKey="title" sortConfig={sortConfig} onSort={handleSort} className="w-[30%]">Title</SortableHeader>
                    <SortableHeader sortKey="artists" sortConfig={sortConfig} onSort={handleSort} className="w-[13%]">Artists</SortableHeader>
                    <SortableHeader sortKey="client" sortConfig={sortConfig} onSort={handleSort} className="w-[13%]">Client</SortableHeader>
                    <SortableHeader sortKey="user_id" sortConfig={sortConfig} onSort={handleSort} className="w-[13%]">Added By</SortableHeader>
                    <SortableHeader sortKey="created_at" sortConfig={sortConfig} onSort={handleSort} className="w-28">Created At</SortableHeader>
                  </tr>
                </thead>
                <tbody className="text-slate-800 dark:text-slate-200">
                  {currentItems.map(item => {
                    const addedBy = item.user_profiles ? `${item.user_profiles.first_name || ''} ${item.user_profiles.last_name || ''}`.trim() : 'System';
                    return (
                      <tr
                        key={item.id}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, item)}
                        className={`border-b border-slate-100 dark:border-slate-800 transition-colors ${selectedItems.has(item.id) ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                        onClick={() => handleRowCheck(item.id)}
                        onDoubleClick={() => setModalVideoUrl(item.videoUrl)}
                      >
                        <td className="p-4"><input type="checkbox" checked={selectedItems.has(item.id)} onChange={(e) => e.stopPropagation()} className="h-4 w-4 accent-slate-900" /></td>
                        <td className="p-4 text-left">
                          <div className="flex items-center gap-3">
                            <img src={item.previewUrl} alt="preview" className="w-14 h-9 object-cover rounded-md" />
                            <div>
                              <div className="font-medium text-slate-900 truncate">{item.title}</div>
                              <div className="text-slate-500 text-xs truncate">{item.subtitle || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 truncate">{item.artists}</td>
                        <td className="p-4 truncate">{item.client}</td>
                        <td className="p-4 truncate">{addedBy}</td>
                        <td className="p-4">{formatDateTime(item.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="p-4 flex items-center justify-between text-sm">
                <div>Page {currentPage} of {totalPages}</div>
                <div>
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 border rounded-md">Prev</button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 border rounded-md ml-2">Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <ReelCreatorSidebar allItems={items} />
      </div>
    </>
  );
};

export default Library;