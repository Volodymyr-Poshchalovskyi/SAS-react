import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  X,
  Image as ImageIcon,
  Settings,
  Trash2,
  AlertTriangle,
  Edit,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';

// =======================
// КОМПОНЕНТ: Модальне вікно для відео (без змін)
// =======================
const VideoModal = ({ videoUrl, onClose }) => {
  if (!videoUrl) return null;
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-black p-4 rounded-lg relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <video src={videoUrl} controls autoPlay className="w-full max-h-[80vh]"></video>
        <button onClick={onClose} className="absolute -top-4 -right-4 bg-white text-black rounded-full p-2"><X size={24} /></button>
      </div>
    </div>
  );
};

// =======================
// КОМПОНЕНТ: SortableHeader (без змін)
// =======================
const SortableHeader = ({ children, sortKey, sortConfig, onSort, className = '' }) => {
  const isActive = sortConfig.key === sortKey;
  const renderSortIcon = () => {
    if (!isActive) return <ArrowUpDown className="h-4 w-4 text-slate-400 group-hover:text-slate-500" />;
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

// ======================================================
// КОМПОНЕНТ: ReelCreatorSidebar (без змін)
// ======================================================
const ReelCreatorSidebar = ({ allItems }) => {
  const [reelItems, setReelItems] = useState([]);
  const [reelTitle, setReelTitle] = useState(`Draft: Showreel (${new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })})`);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const handleDragOver = (e) => { e.preventDefault(); setIsDraggingOver(true); };
  const handleDragLeave = () => setIsDraggingOver(false);
  const handleDrop = (e) => {
    e.preventDefault(); setIsDraggingOver(false);
    const draggedItemIds = JSON.parse(e.dataTransfer.getData("application/json"));
    const newItems = allItems.filter(item => draggedItemIds.includes(item.id)).filter(item => !reelItems.some(reelItem => reelItem.id === item.id));
    if (newItems.length > 0) setReelItems(prevItems => [...prevItems, ...newItems]);
  };
  const handleRemoveItem = (itemIdToRemove) => setReelItems(prevItems => prevItems.filter(item => item.id !== itemIdToRemove));
  const handleCreateReel = async () => {
    if (reelItems.length === 0 || !reelTitle.trim()) return;
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User is not authenticated.");
      const media_item_ids = reelItems.map(item => item.id);
      const response = await fetch('http://localhost:3001/reels', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: reelTitle, media_item_ids, user_id: user.id })
      });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.details || 'Failed to create reel.'); }
      const newReel = await response.json();
      alert(`✅ Reel "${newReel.title}" created successfully!`);
      setReelItems([]);
      setReelTitle(`Draft: Showreel (${new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })})`);
    } catch (error) { console.error("Error creating reel:", error); alert(`❌ Error: ${error.message}`); }
    finally { setIsCreating(false); }
  };

  return (
    <div className="w-96 shrink-0 space-y-4">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">New Reel</h2>
      <div onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={handleDragLeave} className={`flex flex-col p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 transition-all duration-300 min-h-[400px] ${isDraggingOver ? 'border-2 border-blue-500 ring-4 ring-blue-500/20' : 'border border-slate-200 dark:border-slate-800'}`}>
        {reelItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 pointer-events-none h-full">
            <Layers className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" /><h3 className="font-semibold text-slate-800 dark:text-slate-200">Drag work here</h3><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">TO CREATE A REEL</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <label htmlFor="reel-title" className="text-xs font-medium text-slate-500 dark:text-slate-400">TITLE</label>
              <input id="reel-title" type="text" value={reelTitle} onChange={(e) => setReelTitle(e.target.value)} className="mt-1 block w-full bg-transparent text-sm text-slate-900 dark:text-slate-50 font-semibold border-none p-0 focus:ring-0" />
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)] pr-2">
              {reelItems.map(item => (
                <div key={item.id} className="group flex items-center justify-between gap-3 p-2 rounded-md bg-white dark:bg-slate-800/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-9 bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center shrink-0">
                      {item.previewUrl ? <img src={item.previewUrl} alt={item.title} className="w-full h-full object-cover rounded-md" /> : <ImageIcon className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div className="min-w-0"><p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{item.title}</p><p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.subtitle || 'No subtitle'}</p></div>
                  </div>
                  <button onClick={() => handleRemoveItem(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><X className="h-4 w-4 text-slate-500 dark:text-slate-400" /></button>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-4"><button onClick={handleCreateReel} disabled={isCreating} className="w-full px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">{isCreating ? 'Creating...' : 'Deliver'}</button></div>
          </div>
        )}
      </div>
    </div>
  );
};

// =======================
// КОМПОНЕНТИ ДЛЯ ВИДАЛЕННЯ
// =======================
const ConfirmationModal = ({ isOpen, onClose, onConfirm, itemTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-4 text-left">
            <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-slate-50">Delete Media Item</h3>
            <div className="mt-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Are you sure you want to delete <strong className="text-slate-700 dark:text-slate-200">{itemTitle}</strong>? This will permanently remove the item and its associated files from the database and storage. This action cannot be undone.
              </p>
            </div>
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

const ItemActionsDropdown = ({ onOpenDeleteModal, onClose, onEdit }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div ref={dropdownRef} className="absolute right-4 top-10 z-20 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700">
      <ul className="py-1">
        <li>
          <button onClick={onEdit} className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
            <Edit className="mr-3 h-4 w-4" />
            <span>Edit</span>
          </button>
        </li>
        <li>
          <button onClick={onOpenDeleteModal} className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700">
            <Trash2 className="mr-3 h-4 w-4" />
            <span>Delete</span>
          </button>
        </li>
      </ul>
    </div>
  );
};


// =======================
// ОСНОВНИЙ КОМПОНЕНТ Library
// =======================
const Library = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });
  const [modalVideoUrl, setModalVideoUrl] = useState(null);
  const [signedUrls, setSignedUrls] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const headerCheckboxRef = useRef(null);
  const itemsPerPage = 10;
  const allItemsWithUrls = useMemo(() => items.map(item => ({ ...item, previewUrl: signedUrls[item.preview_gcs_path] || null })), [items, signedUrls]);

  useEffect(() => {
    const fetchMediaItems = async () => {
      setLoading(true); setError(null);
      const { data, error } = await supabase.from('media_items').select(`*, user_profiles(first_name, last_name)`).order('created_at', { ascending: false });
      if (error) { console.error('Error fetching media items:', error); setError(error.message); setItems([]); }
      else { setItems(data || []); }
      setLoading(false);
    };
    fetchMediaItems();
  }, []);
  
  const publishedItems = useMemo(() => {
    const now = new Date();
    return items.filter(item => !item.publish_date || new Date(item.publish_date) <= now);
  }, [items]);

  const sortedItems = useMemo(() => {
    let sortableItems = [...publishedItems];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key] || ''; const valB = b[sortConfig.key] || '';
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [publishedItems, sortConfig]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return sortedItems;
    const term = searchTerm.toLowerCase();
    return sortedItems.filter(item => Object.values(item).some(value => String(value).toLowerCase().includes(term)));
  }, [sortedItems, searchTerm]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  useEffect(() => {
    const fetchSignedUrls = async () => {
      const pathsToFetch = currentItems.flatMap(item => [item.preview_gcs_path, item.video_gcs_path]).filter(path => path && !signedUrls[path]);
      const uniquePathsToFetch = [...new Set(pathsToFetch)];
      if (uniquePathsToFetch.length === 0) return;
      try {
        const response = await fetch('http://localhost:3001/generate-read-urls', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gcsPaths: uniquePathsToFetch }),
        });
        if (!response.ok) throw new Error('Failed to fetch signed URLs');
        const urlsMap = await response.json();
        setSignedUrls(prevUrls => ({ ...prevUrls, ...urlsMap }));
      } catch (err) { console.error('Error fetching signed URLs:', err); }
    };
    if (currentItems.length > 0) fetchSignedUrls();
  }, [currentItems, signedUrls]);

  useEffect(() => {
    if (headerCheckboxRef.current) {
      const numSelected = selectedItems.size, numOnPage = currentItems.length;
      headerCheckboxRef.current.checked = numSelected === numOnPage && numOnPage > 0;
      headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numOnPage;
    }
  }, [selectedItems, currentItems]);

  const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending' }));
  const handleSelectAll = (e) => setSelectedItems(e.target.checked ? new Set(currentItems.map(item => item.id)) : new Set());
  const handleRowCheck = (itemId) => setSelectedItems(prev => { const newSet = new Set(prev); newSet.has(itemId) ? newSet.delete(itemId) : newSet.add(itemId); return newSet; });
  const handleDragStart = (e, item) => { const itemsToDrag = selectedItems.has(item.id) ? Array.from(selectedItems) : [item.id]; e.dataTransfer.setData('application/json', JSON.stringify(itemsToDrag)); };
  const formatDateTime = (dateString) => new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  const handleDoubleClick = (item) => { const videoUrl = item.video_gcs_path ? signedUrls[item.video_gcs_path] : null; if (videoUrl) setModalVideoUrl(videoUrl); };

  const handleToggleDropdown = (e, itemId) => {
    e.stopPropagation();
    setActiveDropdown(prev => (prev === itemId ? null : itemId));
  };
  
  const handleOpenDeleteModal = (item) => {
    setItemToDelete(item);
    setActiveDropdown(null);
  };

  const handleCloseDeleteModal = () => {
    setItemToDelete(null);
  };

  const handleEditItem = (itemId) => {
    const basePath = location.pathname.startsWith('/adminpanel') ? '/adminpanel' : '/userpanel';
    navigate(`${basePath}/upload-media/${itemId}`);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`http://localhost:3001/media-items/${itemToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to delete item.');
      }
      setItems(prevItems => prevItems.filter(item => item.id !== itemToDelete.id));
      alert(`Item "${itemToDelete.title}" was successfully deleted.`);
    } catch (err) {
      console.error('Error deleting item:', err);
      alert(`Error: ${err.message}`);
    } finally {
      handleCloseDeleteModal();
    }
  };


  if (loading) return <div className="p-8 text-center text-slate-500">Loading library... ⏳</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <>
      <VideoModal videoUrl={modalVideoUrl} onClose={() => setModalVideoUrl(null)} />
      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        itemTitle={itemToDelete?.title}
      />

      <div className="flex items-start gap-8 p-6 min-h-screen">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Media Library</h1>
            <div className="w-full sm:w-72">
              <input type="text" placeholder="Search library..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm"/>
            </div>
          </div>
          <div className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 text-[11px] uppercase">
                  <tr>
                    <th className="p-4 w-12 text-left"><input type="checkbox" ref={headerCheckboxRef} onChange={handleSelectAll} className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 accent-blue-600" /></th>
                    <SortableHeader sortKey="title" sortConfig={sortConfig} onSort={handleSort} className="w-[30%]">Title</SortableHeader>
                    <SortableHeader sortKey="artists" sortConfig={sortConfig} onSort={handleSort} className="w-[15%]">Artists</SortableHeader>
                    <SortableHeader sortKey="client" sortConfig={sortConfig} onSort={handleSort} className="w-[15%]">Client</SortableHeader>
                    <SortableHeader sortKey="categories" sortConfig={sortConfig} onSort={handleSort} className="w-[15%]">Categories</SortableHeader>
                    <SortableHeader sortKey="user_id" sortConfig={sortConfig} onSort={handleSort} className="w-[15%]">Added By</SortableHeader>
                    <SortableHeader sortKey="created_at" sortConfig={sortConfig} onSort={handleSort} className="w-36">Created At</SortableHeader>
                    <th className="p-4 w-16 text-right"></th>
                  </tr>
                </thead>
                <tbody className="text-slate-800 dark:text-slate-200 text-xs">
                  {currentItems.map(item => {
                    const addedBy = item.user_profiles ? `${item.user_profiles.first_name || ''} ${item.user_profiles.last_name || ''}`.trim() : 'System';
                    const previewUrl = item.preview_gcs_path ? signedUrls[item.preview_gcs_path] : null;

                    return (
                      <tr key={item.id} draggable="true" onDragStart={(e) => handleDragStart(e, item)} className={`border-b border-slate-100 dark:border-slate-800 transition-colors cursor-pointer ${selectedItems.has(item.id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`} onClick={() => handleRowCheck(item.id)} onDoubleClick={() => handleDoubleClick(item)}>
                        <td className="p-4 align-top pt-6"><input type="checkbox" checked={selectedItems.has(item.id)} onChange={(e) => {e.stopPropagation(); handleRowCheck(item.id)}} className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 accent-blue-600" /></td>
                        <td className="p-4 align-top"><div className="flex items-start gap-4"><div className="w-16 h-10 bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center shrink-0">{previewUrl ? <img src={previewUrl} alt="preview" className="w-full h-full object-cover rounded-md" /> : <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800"><ImageIcon className="w-5 h-5 text-slate-400" /></div>}</div><div><div className="text-blue-600 dark:text-blue-400 text-[10px] font-medium uppercase">{item.client}</div><div className="font-semibold text-slate-900 dark:text-slate-50 truncate">{item.title}</div></div></div></td>
                        <td className="p-4 align-top truncate">{item.artists}</td>
                        <td className="p-4 align-top truncate">{item.client}</td>
                        <td className="p-4 align-top truncate">{item.categories}</td>
                        <td className="p-4 align-top truncate">{addedBy}</td>
                        <td className="p-4 align-top text-slate-500 dark:text-slate-400">{formatDateTime(item.created_at)}</td>
                        <td className="p-4 align-top text-right relative">
                          <button onClick={(e) => handleToggleDropdown(e, item.id)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                            <Settings className="h-4 w-4 text-slate-500" />
                          </button>
                          {activeDropdown === item.id && (
                            <ItemActionsDropdown 
                              onClose={() => setActiveDropdown(null)} 
                              onOpenDeleteModal={() => handleOpenDeleteModal(item)}
                              onEdit={() => handleEditItem(item.id)}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="p-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <div>Page {currentPage} of {totalPages}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 border rounded-md disabled:opacity-50 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"><ChevronLeft size={16} /></button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 border rounded-md disabled:opacity-50 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </div>
        </div>
        <ReelCreatorSidebar allItems={allItemsWithUrls} />
      </div>
    </>
  );
};

export default Library;