//src/AdminComponents/Layout/Library.jsx
// ! React & Core Hooks
import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ! Third-party Libraries
import { createClient } from '@supabase/supabase-js';

// ! Lucide Icons
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
  Loader2,
  CheckCircle,
  Copy,
  Pin,
  Info, // Icon for the processing warning
} from 'lucide-react';

// ! Local Context
import { DataRefreshContext } from './AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { InlineHlsPlayer } from './CreateReel';

// ========================================================================== //
// ! CONSTANTS & API CLIENTS
// ========================================================================== //

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';

// ========================================================================== //
// ! HELPER COMPONENT: MediaPreviewModal
// ========================================================================== //

/**
 * ? MediaPreviewModal
 * A simple modal to show a larger preview of an image or video.
 */
const MediaPreviewModal = ({ mediaUrl, mediaType, onClose }) => {
  if (!mediaUrl) return null;
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-black p-4 rounded-lg relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        {mediaType === 'video' ? (
          // 👇 UPDATED LOGIC: Use InlineHlsPlayer for video
          <InlineHlsPlayer
            src={mediaUrl}
            controls
            autoPlay
            className="w-full max-h-[80vh]"
          />
        ) : (
          <img
            src={mediaUrl}
            alt="Media Preview"
            className="w-full h-full object-contain max-h-[80vh] mx-auto"
          />
        )}
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

// ========================================================================== //
// ! HELPER COMPONENT: SortableHeader
// ========================================================================== //

/**
 * ? SortableHeader
 * A reusable table header (`<th>`) component that displays sort icons
 * and handles click events to update sorting.
 */
const SortableHeader = ({
  children,
  sortKey,
  sortConfig,
  onSort,
  className = '',
}) => {
  const isActive = sortConfig.key === sortKey;

  const renderSortIcon = () => {
    if (!isActive)
      return (
        <ArrowUpDown className="h-4 w-4 text-slate-400 group-hover:text-slate-500" />
      );
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
        {children} {renderSortIcon()}
      </button>
    </th>
  );
};

// ========================================================================== //
// ! HELPER COMPONENT: CreationStatusModal
// ========================================================================== //

/**
 * ? CreationStatusModal
 * A modal to show the status of reel creation/updates (creating, success, error).
 */
const CreationStatusModal = ({ isOpen, onClose, status, title, message }) => {
  // * Auto-close the modal on success after a short delay
  useEffect(() => {
    let timer;
    if (isOpen && status === 'success') {
      timer = setTimeout(() => {
        onClose();
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [isOpen, status, onClose]);

  if (!isOpen) return null;

  const renderContent = () => {
    switch (status) {
      case 'creating':
        return (
          <div className="text-center py-4">
            <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">
              Creating Reel...
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Please wait a moment.
            </p>
          </div>
        );
      case 'updating':
        return (
          <div className="text-center py-4">
            <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">
              Updating Reel...
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Please wait a moment.
            </p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center py-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">
              {title}
            </h3>
            {message && (
              <p
                className="text-sm text-slate-500 dark:text-slate-400 mt-2"
                dangerouslySetInnerHTML={{ __html: message }} // * Used for bolding title
              />
            )}
          </div>
        );
      case 'error':
        return (
          <div className="text-center py-4">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">
              {title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {message}
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-4 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Close
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        {renderContent()}
      </div>
    </div>
  );
};

// ========================================================================== //
// ! HELPER COMPONENT: ExistingReelsList
// ========================================================================== //

/**
 * ? ExistingReelsList
 * Displays a searchable list of existing reels in the sidebar for copying.
 */
const ExistingReelsList = ({ reels, onCopy, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // * Memoized search filter
  const filteredReels = useMemo(() => {
    if (!searchTerm) return reels;
    return reels.filter(
      (reel) =>
        reel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (reel.user_profiles?.first_name || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (reel.user_profiles?.last_name || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [reels, searchTerm]);

  return (
    <div className="flex flex-col h-full">
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search existing reels..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 dark:border-slate-700 dark:text-slate-50"
        />
      </div>
      {/* Reel List */}
      <div className="flex-1 space-y-2 overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <Loader2 className="animate-spin mr-2" /> Loading...
          </div>
        ) : filteredReels.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-slate-500">
            <p>No reels found.</p>
          </div>
        ) : (
          filteredReels.map((reel) => {
            return (
              <div
                key={reel.id}
                className="group flex items-center justify-between gap-3 p-2 rounded-md bg-white dark:bg-slate-800/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-9 bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center shrink-0">
                    {reel.preview_gcs_path ? (
                      <img
                        src={`${CDN_BASE_URL}/${reel.preview_gcs_path}`}
                        alt={reel.title}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                      {reel.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      By {reel.user_profiles?.first_name || 'N/A'} |{' '}
                      {reel.total_views || 0} visits
                    </p>
                  </div>
                </div>
                {/* Copy Button (appears on hover) */}
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onCopy(reel)}
                    title="Make a copy"
                    className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <Copy className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ========================================================================== //
// ! HELPER COMPONENT: ReelCreatorSidebar
// ========================================================================== //

/**
 * ? ReelCreatorSidebar
 * The right-hand panel for building, editing, and creating new reels.
 * Manages its own tabs, drag-and-drop sorting, and submission logic.
 */
const ReelCreatorSidebar = ({
  allItems,
  activeTab,
  setActiveTab,
  reelItems,
  setReelItems,
  reelTitle,
  setReelTitle,
  editingReel,
  onUpdateSuccess,
}) => {
  // ! State
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: 'idle',
  });
  const [existingReels, setExistingReels] = useState([]);
  const [isLoadingReels, setIsLoadingReels] = useState(false);

  // ! Hooks
  const navigate = useNavigate();
  const isEditing = !!editingReel;
  const draggedItemIndex = useRef(null);
  const draggedOverItemIndex = useRef(null);
  const { session, user } = useAuth();

  // ! Effect: Fetch Existing Reels
  // * Fetches reels only when the 'existing' tab is clicked and data isn't already loaded
  useEffect(() => {
    const fetchExistingReels = async () => {
      if (activeTab === 'existing' && existingReels.length === 0) {
        setIsLoadingReels(true);

        const token = session?.access_token; // Отримуємо токен
        if (!token) {
          console.error('No auth token for fetching existing reels');
          setIsLoadingReels(false);
          // TODO: Show error to user?
          return;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/reels`, {
            headers: { Authorization: `Bearer ${token}` }, // Додаємо заголовок
          });
          if (!response.ok) throw new Error('Failed to fetch reels');
          const data = await response.json();
          setExistingReels(data);
        } catch (error) {
          console.error('Error fetching existing reels:', error);
        } finally {
          setIsLoadingReels(false);
        }
      }
    };
    fetchExistingReels();
  }, [activeTab, existingReels.length, session, user]); // Додаємо session у залежності

  // ! Handlers: Drag-and-Drop (Container)
  // * These handle dragging items from the main library *into* the sidebar
  const handleDragOverContainer = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  const handleDragLeaveContainer = () => setIsDraggingOver(false);
  const handleDropIntoContainer = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const draggedItemIds = JSON.parse(
      e.dataTransfer.getData('application/json')
    );
    // * Filter for items that aren't already in the list
    const newItems = allItems
      .filter((item) => draggedItemIds.includes(item.id))
      .filter((item) => !reelItems.some((reelItem) => reelItem.id === item.id));

    if (newItems.length > 0) setReelItems((prev) => [...prev, ...newItems]);
  };
  const handleRemoveItem = (id) =>
    setReelItems((prev) => prev.filter((item) => item.id !== id));

  // ! Handlers: Drag-and-Drop (Sorting)
  // * These handle re-ordering items *within* the sidebar
  const handleSortDragStart = (e, index) => {
    draggedItemIndex.current = index;
    e.currentTarget.classList.add('opacity-50');
  };
  const handleSortDragEnter = (e, index) => {
    draggedOverItemIndex.current = index;
  };
  const handleSortDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-50');
    draggedItemIndex.current = null;
    draggedOverItemIndex.current = null;
    // * Clear visual indicators
    document.querySelectorAll('.drag-sort-item').forEach((el) => {
      el.classList.remove('border-t-2', 'border-blue-500');
    });
  };
  const handleSortDrop = (e) => {
    e.preventDefault();
    const fromIndex = draggedItemIndex.current;
    const toIndex = draggedOverItemIndex.current;
    if (fromIndex === null || toIndex === null || fromIndex === toIndex) return;
    const itemsCopy = [...reelItems];
    const [reorderedItem] = itemsCopy.splice(fromIndex, 1);
    itemsCopy.splice(toIndex, 0, reorderedItem);
    setReelItems(itemsCopy);
  };
  const handleSortDragOver = (e) => {
    e.preventDefault();
    // * Show a visual line indicator where the item will be dropped
    document.querySelectorAll('.drag-sort-item').forEach((el) => {
      el.classList.remove('border-t-2', 'border-blue-500');
    });
    if (e.currentTarget.dataset.index != draggedItemIndex.current) {
      e.currentTarget.classList.add('border-t-2', 'border-blue-500');
    }
  };

  // ! Handlers: Form & API
  const handleSubmitReel = async () => {
    if (reelItems.length === 0 || !reelTitle.trim()) return;

    const status = isEditing ? 'updating' : 'creating';
    setModalState({ isOpen: true, status });

    const token = session?.access_token; // Отримуємо токен
    if (!token || !user) {
      // Перевірка токена і користувача
      console.error('No auth token or user for fetching existing reels');
      setIsLoadingReels(false);
      return;
    }

    try {
      if (isEditing) {
        // * --- UPDATE (PUT) ---
        const res = await fetch(`${API_BASE_URL}/reels/${editingReel.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Додаємо заголовок
          },
          body: JSON.stringify({
            title: reelTitle,
            media_item_ids: reelItems.map((i) => i.id),
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        const updatedReel = await res.json();
        setModalState({
          isOpen: true,
          status: 'success',
          title: 'Reel Updated!',
          message: `Your reel "<strong>${updatedReel.title}</strong>" was successfully updated.`,
        });
        onUpdateSuccess(updatedReel);
      } else {
        // * --- CREATE (POST) ---
        const {
          data: { user },
        } = await supabase.auth.getUser(token); // Передаємо токен для getUser
        if (!user) throw new Error('User not authenticated.');
        const res = await fetch(`${API_BASE_URL}/reels`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Додаємо заголовок
          },
          body: JSON.stringify({
            title: reelTitle,
            media_item_ids: reelItems.map((i) => i.id),
            // user_id тепер буде отриманий з токена на бекенді
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        const newReel = await res.json();
        setExistingReels((prev) => [newReel, ...prev]); // * Add to local list
        setModalState({
          isOpen: true,
          status: 'success',
          title: 'Reel Created!',
          message: `Your reel "<strong>${newReel.title}</strong>" was created.`,
        });
      }
    } catch (err) {
      const title = isEditing ? 'Update Failed' : 'Creation Failed';
      setModalState({
        isOpen: true,
        status: 'error',
        title,
        message: err.message,
      });
    }
  };

  const handleCopyReel = (reelToCopy) => {
    const itemIds = reelToCopy.media_item_ids || [];
    // * Find the full item objects from the main library 'allItems'
    const items = itemIds
      .map((id) => allItems.find((item) => item.id === id))
      .filter(Boolean); // * Filter out any missing items
    setReelItems(items);
    setReelTitle(`Copy: ${reelToCopy.title}`);
    setActiveTab('new'); // * Switch to the 'New Reel' tab
  };

  const handleCloseModal = () => {
    if (modalState.status === 'success') {
      if (isEditing) {
        // * On successful edit, go to analytics page for that reel
        navigate('/adminpanel/analytics', {
          state: { openModalForReelId: editingReel.id },
        });
      } else {
        // * On successful creation, reset the form
        setReelItems([]);
        setReelTitle(
          `Draft: Showreel (${new Date().toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
          })})`
        );
      }
    }
    setModalState({ isOpen: false, status: 'idle' });
  };

  // ! Sub-components
  const TabButton = ({ name, label }) => (
    <button
      onClick={() => setActiveTab(name)}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors w-1/2 ${
        activeTab === name
          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
      }`}
    >
      {label}
    </button>
  );

  // ! Render
  const submitButtonText = isEditing ? 'Update' : 'Deliver';
  const loadingButtonText = isEditing ? 'Updating...' : 'Creating...';

  return (
    <>
      <CreationStatusModal {...modalState} onClose={handleCloseModal} />
      <div className="w-96 shrink-0 space-y-4">
        {/* --- Tab Navigation --- */}
        <div className="p-1 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center">
          <TabButton
            name="new"
            label={isEditing ? 'Editing Reel' : 'New Reel'}
          />
          <button
            onClick={() => setActiveTab('existing')}
            disabled={isEditing} // * Cannot switch tabs when editing
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors w-1/2 ${
              activeTab === 'existing'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Existing Reels
          </button>
        </div>

        {/* --- Tab Content Area --- */}
        <div
          onDragOver={handleDragOverContainer}
          onDrop={handleDropIntoContainer}
          onDragLeave={handleDragLeaveContainer}
          className={`flex flex-col p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 transition-all duration-300 min-h-[400px] ${
            isDraggingOver
              ? 'border-2 border-blue-500 ring-4 ring-blue-500/20' // * Dropzone visual cue
              : 'border border-slate-200 dark:border-slate-800'
          }`}
        >
          {activeTab === 'new' ? (
            // * --- 'New Reel' Tab Content ---
            reelItems.length === 0 ? (
              // * Empty State
              <div className="flex flex-col items-center justify-center text-center py-16 pointer-events-none h-full">
                <Layers className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                  Drag work here
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  TO CREATE A REEL
                </p>
              </div>
            ) : (
              // * Filled State (List of items)
              <div className="flex flex-col h-full">
                {/* Reel Title Input */}
                <div className="mb-4">
                  <label
                    htmlFor="reel-title"
                    className="text-xs font-medium text-slate-500 dark:text-slate-400"
                  >
                    TITLE
                  </label>
                  <input
                    id="reel-title"
                    type="text"
                    value={reelTitle}
                    onChange={(e) => setReelTitle(e.target.value)}
                    className="mt-1 block w-full bg-transparent text-sm text-slate-900 dark:text-slate-50 font-semibold border-none p-0 focus:ring-0"
                  />
                </div>
                {/* Draggable/Sortable List */}
                <div
                  className="flex-1 space-y-2 overflow-y-auto max-h-[calc(100vh-350px)] pr-2"
                  onDrop={handleSortDrop}
                  onDragOver={(e) => e.preventDefault()} // * Necessary for onDrop to work
                >
                  {reelItems.map((item, index) => (
                    <div
                      key={item.id}
                      draggable="true"
                      onDragStart={(e) => handleSortDragStart(e, index)}
                      onDragEnter={(e) => handleSortDragEnter(e, index)}
                      onDragEnd={handleSortDragEnd}
                      onDragOver={handleSortDragOver}
                      data-index={index}
                      className="drag-sort-item group flex items-center justify-between gap-3 p-2 rounded-md bg-white dark:bg-slate-800/50 cursor-grab active:cursor-grabbing transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-9 bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center shrink-0">
                          {item.previewUrl ? (
                            <img
                              src={item.previewUrl}
                              alt={item.title}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {item.subtitle || 'No subtitle'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
                {/* Submit Button */}
                <div className="mt-auto pt-4">
                  <button
                    onClick={handleSubmitReel}
                    disabled={
                      modalState.status === 'creating' ||
                      modalState.status === 'updating'
                    }
                    className="w-full px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-400 flex items-center justify-center"
                  >
                    {modalState.status === 'creating' ||
                    modalState.status === 'updating' ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        {loadingButtonText}
                      </>
                    ) : (
                      submitButtonText
                    )}
                  </button>
                </div>
              </div>
            )
          ) : (
            // * --- 'Existing Reels' Tab Content ---
            <ExistingReelsList
              reels={existingReels}
              isLoading={isLoadingReels}
              onCopy={handleCopyReel}
            />
          )}
        </div>
      </div>
    </>
  );
};

// ========================================================================== //
// ! HELPER COMPONENT: LibraryConfirmationModal
// ========================================================================== //

/**
 * ? LibraryConfirmationModal
 * A confirmation dialog for deleting one or multiple media items.
 * Handles its own internal state (idle, deleting, success, error).
 */
const LibraryConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemTitle,
  itemCount,
}) => {
  const [status, setStatus] = useState('idle');

  // * Reset internal state when modal is opened
  useEffect(() => {
    if (isOpen) setStatus('idle');
  }, [isOpen]);

  const handleConfirmClick = async () => {
    setStatus('deleting');
    try {
      await onConfirm();
      setStatus('success');
      setTimeout(onClose, 2000); // * Auto-close on success
    } catch (error) {
      console.error('Deletion failed:', error);
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  // * Dynamic text based on single or multi-delete
  const isMultiDelete = itemCount && itemCount > 1;
  const title = isMultiDelete
    ? `Delete ${itemCount} Media Items`
    : 'Delete Media Item';
  const confirmationMessage = isMultiDelete ? (
    <>
      Are you sure you want to delete these{' '}
      <strong className="text-slate-700 dark:text-slate-200">
        {itemCount} items
      </strong>
      ? This action cannot be undone.
    </>
  ) : (
    <>
      Are you sure you want to delete{' '}
      <strong className="text-slate-700 dark:text-slate-200">
        {itemTitle}
      </strong>
      ? This action cannot be undone.
    </>
  );
  const successText = isMultiDelete
    ? `${itemCount} items were deleted successfully.`
    : `Item "${itemTitle}" was deleted.`;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={status === 'idle' ? onClose : undefined} // * Prevent close while deleting
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {status === 'success' ? (
          // * Success State
          <div className="text-center py-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">
              Deleted Successfully
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {successText}
            </p>
          </div>
        ) : (
          // * Confirmation (idle) or Deleting State
          <>
            <div className="flex items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {confirmationMessage}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
              <button
                type="button"
                onClick={handleConfirmClick}
                disabled={status === 'deleting'}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:w-auto sm:text-sm disabled:bg-red-400"
              >
                {status === 'deleting' ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  'Delete'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={status === 'deleting'}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ========================================================================== //
// ! HELPER COMPONENT: ItemActionsDropdown
// ========================================================================== //

/**
 * ? ItemActionsDropdown
 * The "..." menu (Settings) for each row in the library table.
 */
const ItemActionsDropdown = ({
  onOpenDeleteModal,
  onClose,
  onEdit,
  isLastItem,
}) => {
  const dropdownRef = useRef(null);

  // * Click-outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // * Smartly position dropdown (above if last item, below otherwise)
  const positionClass = isLastItem ? 'bottom-8' : 'top-8';

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-4 ${positionClass} z-20 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700`}
    >
      <ul className="py-1">
        <li>
          <button
            onClick={onEdit}
            className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Edit className="mr-3 h-4 w-4" />
            <span>Edit</span>
          </button>
        </li>
        <li>
          <button
            onClick={onOpenDeleteModal}
            className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Trash2 className="mr-3 h-4 w-4" />
            <span>Delete</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

// ========================================================================== //
// ! MAIN COMPONENT: Library
// ========================================================================== //

const Library = () => {
  // ! State
  // * Data & Loading
  const [items, setItems] = useState([]);
  const [previewUrls, setPreviewUrls] = useState({}); // * Stores signed URLs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // * Table Interaction & Selection
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'descending',
  });
  const [pinnedItemIds, setPinnedItemIds] = useState(new Set());

  // * UI & Modal State
  const [modalMedia, setModalMedia] = useState(null); // * For media preview
  const [activeDropdown, setActiveDropdown] = useState(null); // * For "..." menu
  const [itemToDelete, setItemToDelete] = useState(null); // * For single delete modal
  const [isMultiDeleteModalOpen, setIsMultiDeleteModalOpen] = useState(false);
  const [showProcessingWarning, setShowProcessingWarning] = useState(false);

  // * User & Auth
  const [currentUserId, setCurrentUserId] = useState(null);

  // * Sidebar (Reel Creator) State
  const [activeTab, setActiveTab] = useState('new');
  const [reelItems, setReelItems] = useState([]);
  const [reelTitle, setReelTitle] = useState(
    `Draft: Showreel (${new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })})`
  );
  const [editingReel, setEditingReel] = useState(null); // * Holds reel data if editing

  // ! Refs & Context
  const isInitialMount = useRef(true);
  const headerCheckboxRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshKey } = useContext(DataRefreshContext); // * For manual refresh
  const { session, user } = useAuth(); // Отримуємо сесію та користувача  const
  const itemsPerPage = 10;

  // ! Effect: Main Data Fetch
  // * Fetches all media items, signed URLs, and checks for processing videos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setShowProcessingWarning(false); // * Reset warning on each fetch

      const token = session?.access_token; // Отримуємо токен
      if (!token) {
        setError('User not authenticated.');
        setLoading(false);
        return;
      }
      const headers = { Authorization: `Bearer ${token}` }; // Створюємо заголовок

      try {
        // * Get current user (using token)
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser(token);
        if (userError || !user) throw userError || new Error('User not found.');
        setCurrentUserId(user.id);

        // * Fetch all media items (using Supabase client - already uses service key)
        const { data, error: itemsError } = await supabase
          .from('media_items')
          .select(
            `*, user_profiles:user_profiles(first_name, last_name, email)`
          )
          .order('created_at', { ascending: false });
        if (itemsError) throw itemsError;

        const fetchedItems = data || [];
        setItems(fetchedItems);

        // * Get signed URLs for all previews (using custom backend)
        if (fetchedItems.length > 0) {
          const gcsPaths = fetchedItems
            .map((item) => item.preview_gcs_path)
            .filter(Boolean);

          if (gcsPaths.length > 0) {
            const response = await fetch(`${API_BASE_URL}/generate-read-urls`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...headers, // Додаємо заголовок авторизації
              },
              body: JSON.stringify({ gcsPaths }),
            });
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(
                errorData.error || 'Failed to fetch signed URLs for previews'
              );
            }
            const signedUrlsMap = await response.json();
            setPreviewUrls(signedUrlsMap); // * Store the path-to-URL map
          }
        }

        // * Check for recently uploaded videos that might still be processing
        const fourMinutesAgo = new Date(Date.now() - 4 * 60 * 1000);
        const recentVideos = fetchedItems.filter((item) => {
          const createdAt = new Date(item.created_at);
          const isVideo = !!item.video_gcs_path;
          const isRecent = createdAt > fourMinutesAgo;
          return isVideo && isRecent;
        });

        // * If any recent videos are found, show the warning banner
        if (recentVideos.length > 0) {
          setShowProcessingWarning(true);
        }

        // * Load user's pinned items from localStorage
        const storedPinsRaw = localStorage.getItem('userPinnedItems');
        if (storedPinsRaw) {
          const allUsersPins = JSON.parse(storedPinsRaw);
          const userPins = allUsersPins[user.id] || [];
          setPinnedItemIds(new Set(userPins));
        }
      } catch (e) {
        setError(e.message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey, session]); // Додаємо session у залежності

  // ! Effect: Sync Pinned Items to LocalStorage
  useEffect(() => {
    // * Skip on initial mount or while loading
    if (isInitialMount.current || loading) {
      if (isInitialMount.current) {
        isInitialMount.current = false;
      }
      return;
    }
    // * Save pins namespaced by user ID
    if (currentUserId) {
      const storedPinsRaw = localStorage.getItem('userPinnedItems');
      const allUsersPins = storedPinsRaw ? JSON.parse(storedPinsRaw) : {};
      allUsersPins[currentUserId] = Array.from(pinnedItemIds);
      localStorage.setItem('userPinnedItems', JSON.stringify(allUsersPins));
    }
  }, [pinnedItemIds, currentUserId, loading]);

  // ! Effect: Handle Navigation State
  // * Checks for `location.state` (e.g., from Analytics page) to auto-populate
  // * the sidebar for editing or copying a reel.
  useEffect(() => {
    const reelToCopy = location.state?.reelToCopy;
    const reelToEdit = location.state?.reelToEdit;
    const reelData = reelToCopy || reelToEdit;

    if (reelData && items.length > 0) {
      const itemIds = reelData.media_item_ids || [];
      // * Find the full item objects corresponding to the IDs
      const rawItemsToProcess = itemIds
        .map((id) => items.find((item) => item.id === id))
        .filter(Boolean);

      if (reelToEdit) {
        setEditingReel(reelToEdit);
        setReelTitle(reelToEdit.title);
      } else {
        setEditingReel(null);
        setReelTitle(`Copy: ${reelToCopy.title}`);
      }
      setActiveTab('new'); // * Switch to the 'New Reel' tab

      // * Map items and add the static preview URL (for the sidebar)
      const finalItemsWithUrls = rawItemsToProcess.map((item) => ({
        ...item,
        previewUrl: item.preview_gcs_path
          ? `${CDN_BASE_URL}/${item.preview_gcs_path}`
          : null,
      }));
      setReelItems(finalItemsWithUrls);

      // * Clear the location state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, items, navigate]);

  // ! Memoized Data
  // * Memoized list of all items with their *static* preview URLs (for sidebar)
  const allItemsWithUrls = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        previewUrl: item.preview_gcs_path
          ? `${CDN_BASE_URL}/${item.preview_gcs_path}`
          : null,
      })),
    [items]
  );

  // * Memoized list of filtered and sorted items for the table
  const filteredItems = useMemo(() => {
    let processItems = [...items];

    // * Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      processItems = processItems.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(term)
        )
      );
    }

    // * Apply sorting (pinned items always come first)
    processItems.sort((a, b) => {
      const isAPinned = pinnedItemIds.has(a.id);
      const isBPinned = pinnedItemIds.has(b.id);
      // * Pin sorting
      if (isAPinned && !isBPinned) return -1;
      if (!isAPinned && isBPinned) return 1;
      // * Standard column sorting
      const valA = a[sortConfig.key] || '';
      const valB = b[sortConfig.key] || '';
      if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });

    return processItems;
  }, [items, sortConfig, searchTerm, pinnedItemIds]);

  // * Memoized list for the current page
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  // * Memoized text for the "Pin" button
  const pinActionText = useMemo(() => {
    if (selectedItems.size === 0) return 'Pin';
    const selectedIds = Array.from(selectedItems);
    const allSelectedArePinned = selectedIds.every((id) =>
      pinnedItemIds.has(id)
    );
    return allSelectedArePinned ? 'Unpin Selected' : 'Pin Selected';
  }, [selectedItems, pinnedItemIds]);

  // ! Effect: Header Checkbox State
  // * Manages the "select all" checkbox's `checked` and `indeterminate` states
  useEffect(() => {
    if (headerCheckboxRef.current) {
      const numSelected = selectedItems.size;
      const numOnPage = currentItems.length;
      headerCheckboxRef.current.checked =
        numSelected === numOnPage && numOnPage > 0;
      headerCheckboxRef.current.indeterminate =
        numSelected > 0 && numSelected < numOnPage;
    }
  }, [selectedItems, currentItems]);

  // ! Handlers
  const handleTogglePin = (itemIdsToToggle) => {
    const newPinnedIds = new Set(pinnedItemIds);
    itemIdsToToggle.forEach((id) => {
      newPinnedIds.has(id) ? newPinnedIds.delete(id) : newPinnedIds.add(id);
    });
    setPinnedItemIds(newPinnedIds);
    setSelectedItems(new Set()); // * Clear selection after pinning
  };

  const handleSort = (key) =>
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }));

  const handleSelectAll = (e) =>
    setSelectedItems(
      e.target.checked
        ? new Set(currentItems.map((item) => item.id))
        : new Set()
    );

  const handleRowCheck = (id) =>
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });

  const handleDragStart = (e, item) => {
    // * Drag either the single item or all selected items
    const ids = selectedItems.has(item.id) ? [...selectedItems] : [item.id];
    e.dataTransfer.setData('application/json', JSON.stringify(ids));
  };

  const formatDateTime = (date) =>
    new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  const handleEditItem = (id) =>
    navigate(
      // * Navigate to the correct panel (admin or user)
      (location.pathname.startsWith('/adminpanel')
        ? '/adminpanel'
        : '/userpanel') + `/upload-media/${id}`
    );

  const handleRowDoubleClick = (item) => {
    // * Open the full-resolution preview modal
    // 👇 UPDATED LOGIC: Prioritize HLS path over GCS video path
    const fullResolutionAssetPath = item.video_hls_path || item.video_gcs_path;

    if (!fullResolutionAssetPath) return;

    // * NOTE: Since the video_hls_path is an m3u8 playlist,
    // * we treat it as a video regardless of its explicit type.
    const isAssetVideo =
      !!item.video_gcs_path || !!item.video_hls_path || item.type === 'video';

    const assetUrl = `${CDN_BASE_URL}/${fullResolutionAssetPath}`;

    // * Determine media type (simplified to just check if it's a video asset)
    let assetType = 'image'; // * Default to image
    if (isAssetVideo) {
      assetType = 'video';
    } else {
      // Fallback to check extension if no video path is present and type is unknown
      const extension = fullResolutionAssetPath.split('.').pop().toLowerCase();
      if (['mp4', 'mov', 'webm', 'avi', 'm3u8'].includes(extension))
        assetType = 'video';
      else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension))
        assetType = 'image';
    }

    if (assetUrl && assetType)
      setModalMedia({ url: assetUrl, type: assetType });
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    const token = session?.access_token; // Отримуємо токен
    if (!token) {
      console.error('No auth token for delete');
      throw new Error('Authentication Error'); // Повертаємо помилку для модалки
    }

    // * API call to delete a single item
    const res = await fetch(`${API_BASE_URL}/media-items/${itemToDelete.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }, // Додаємо заголовок
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete item.'); // Повертаємо помилку
    }
    // * Remove from local state
    setItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
    setItemToDelete(null);
  };

  const handleConfirmMultiDelete = async () => {
    const itemIdsToDelete = Array.from(selectedItems);

    const token = session?.access_token; // Отримуємо токен
    if (!token) {
      console.error('No auth token for multi-delete');
      throw new Error('Authentication Error'); // Повертаємо помилку
    }

    // * Send all delete requests in parallel
    const deletePromises = itemIdsToDelete.map((id) =>
      fetch(`${API_BASE_URL}/media-items/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }, // Додаємо заголовок
      })
    );
    const results = await Promise.allSettled(deletePromises);

    const successfullyDeletedIds = [];
    let hasErrors = false;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.ok) {
        successfullyDeletedIds.push(itemIdsToDelete[index]);
      } else {
        hasErrors = true; // Відзначаємо, що були помилки
        console.error(
          `Failed to delete item ID: ${itemIdsToDelete[index]}`,
          result.reason || result.value?.statusText
        );
      }
    });

    // * Remove all successfully deleted items from local state
    if (successfullyDeletedIds.length > 0) {
      setItems((currentData) =>
        currentData.filter((item) => !successfullyDeletedIds.includes(item.id))
      );
    }
    setSelectedItems(new Set());
    setIsMultiDeleteModalOpen(false);

    // * Якщо були помилки, викидаємо помилку, щоб модальне вікно показало статус помилки
    if (hasErrors) {
      throw new Error(
        'Some items failed to delete. Check console for details.'
      );
    }
  };

  const handleUpdateSuccess = (updatedReel) => {
    // * This callback is passed to the sidebar, to be fired on successful update
    console.log('Reel updated, data could be refreshed here.', updatedReel);
    // * (Future enhancement: Could trigger a refresh of the 'ExistingReelsList')
  };

  // ! Render
  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        <Loader2 className="animate-spin h-6 w-6 inline-block mr-2" />
        Loading library...
      </div>
    );

  if (error)
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <>
      {/* --- Modals --- */}
      <MediaPreviewModal
        mediaUrl={modalMedia?.url}
        mediaType={modalMedia?.type}
        onClose={() => setModalMedia(null)}
      />
      <LibraryConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemTitle={itemToDelete?.title}
      />
      <LibraryConfirmationModal
        isOpen={isMultiDeleteModalOpen}
        onClose={() => setIsMultiDeleteModalOpen(false)}
        onConfirm={handleConfirmMultiDelete}
        itemCount={selectedItems.size}
      />

      {/* --- Main Layout (Table + Sidebar) --- */}
      <div className="flex items-start gap-8 p-6 min-h-screen">
        {/* --- Main Content (Table) --- */}
        <div className="flex-1">
          {/* Header & Actions */}
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                Media Library
              </h1>
              {/* Bulk Action Buttons */}
              {selectedItems.size > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePin(Array.from(selectedItems))}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Pin size={16} />
                    {pinActionText} ({selectedItems.size})
                  </button>
                  <button
                    onClick={() => setIsMultiDeleteModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                    Delete Selected ({selectedItems.size})
                  </button>
                </div>
              )}
            </div>
            {/* Search Bar */}
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

          {/* Video Processing Warning Banner */}
          {showProcessingWarning && (
            <div
              className="mb-4 flex items-start sm:items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-700"
              role="alert"
            >
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Heads up:</strong> Recently uploaded videos need a few
                minutes to finish processing. They will become available for
                preview and use shortly.
              </p>
            </div>
          )}

          {/* --- Media Table --- */}
          <div className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                {/* Table Header */}
                <thead className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 text-[11px] uppercase">
                  <tr>
                    <th className="p-4 w-12 text-left">
                      <input
                        type="checkbox"
                        ref={headerCheckboxRef}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 accent-blue-600"
                      />
                    </th>
                    <th className="p-4 w-12 text-center">
                      <Pin size={14} />
                    </th>
                    <SortableHeader
                      sortKey="title"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                      className="w-[30%]"
                    >
                      Title
                    </SortableHeader>
                    <SortableHeader
                      sortKey="artists"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                      className="w-[15%]"
                    >
                      Artists
                    </SortableHeader>
                    <SortableHeader
                      sortKey="client"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                      className="w-[15%]"
                    >
                      Client
                    </SortableHeader>
                    <SortableHeader
                      sortKey="categories"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                      className="w-[15%]"
                    >
                      Categories
                    </SortableHeader>
                    <SortableHeader
                      sortKey="user_id"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                      className="w-[15%]"
                    >
                      Added By
                    </SortableHeader>
                    <SortableHeader
                      sortKey="created_at"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                      className="w-36"
                    >
                      Created At
                    </SortableHeader>
                    <th className="p-4 w-16 text-right"></th>
                  </tr>
                </thead>
                {/* Table Body */}
                <tbody className="text-slate-800 dark:text-slate-200 text-xs">
                  {currentItems.map((item, index) => {
                    const isPinned = pinnedItemIds.has(item.id);

                    // Оновлена логіка для addedBy
                    const addedBy = item.user_profiles
                      ? `${item.user_profiles.first_name || ''} ${
                          item.user_profiles.last_name || ''
                        }`.trim() || // 1. Спробувати повне ім'я
                        item.user_profiles.email || // 2. Якщо імені немає, взяти email
                        'System' // 3. Якщо немає і email, показати "System"
                      : 'System'; // 4. Якщо об'єкт user_profiles взагалі відсутній

                    const isLastItemOnPage = index === currentItems.length - 1;
                    return (
                      <tr
                        key={item.id}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, item)}
                        className={`border-b border-slate-100 dark:border-slate-800 transition-colors cursor-pointer ${
                          selectedItems.has(item.id)
                            ? 'bg-blue-50 dark:bg-blue-900/20' // * Selected style
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50' // * Hover style
                        }`}
                        onClick={() => handleRowCheck(item.id)}
                        onDoubleClick={() => handleRowDoubleClick(item)}
                      >
                        {/* Checkbox */}
                        <td className="p-4 align-top pt-6">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleRowCheck(item.id);
                            }}
                            onClick={(e) => e.stopPropagation()} // * Prevent row click
                            className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 accent-blue-600 cursor-pointer"
                          />
                        </td>
                        {/* Pin */}
                        <td className="p-4 align-top pt-6 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePin([item.id]);
                            }}
                            className={`p-1 rounded-full ${
                              isPinned
                                ? 'text-blue-600'
                                : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'
                            }`}
                          >
                            <Pin size={16} />
                          </button>
                        </td>
                        {/* Title (with Preview) */}
                        <td className="p-4 align-top">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-10 bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center shrink-0">
                              {item.preview_gcs_path ? (
                                <img
                                  src={previewUrls[item.preview_gcs_path]} // * Use signed URL
                                  alt="preview"
                                  className="w-full h-full object-cover rounded-md"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                  <ImageIcon className="w-5 h-5 text-slate-400" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-blue-600 dark:text-blue-400 text-[10px] font-medium uppercase">
                                {item.client}
                              </div>
                              <div className="font-semibold text-slate-900 dark:text-slate-50 whitespace-normal break-words">
                                {item.title}
                              </div>
                            </div>
                          </div>
                        </td>
                        {/* Other Columns */}
                        <td className="p-4 align-top truncate">
                          {item.artists}
                        </td>
                        <td className="p-4 align-top truncate">
                          {item.client}
                        </td>
                        <td className="p-4 align-top truncate">
                          {item.categories}
                        </td>
                        <td className="p-4 align-top truncate">{addedBy}</td>
                        <td className="p-4 align-top text-slate-500 dark:text-slate-400">
                          {formatDateTime(item.created_at)}
                        </td>
                        {/* Actions Menu */}
                        <td className="p-4 align-top text-right relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown((prev) =>
                                prev?.id === item.id ? null : { id: item.id }
                              );
                            }}
                            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                          >
                            <Settings className="h-4 w-4 text-slate-500" />
                          </button>
                          {activeDropdown?.id === item.id && (
                            <ItemActionsDropdown
                              onClose={() => setActiveDropdown(null)}
                              onOpenDeleteModal={() => {
                                setItemToDelete(item);
                                setActiveDropdown(null);
                              }}
                              onEdit={() => handleEditItem(item.id)}
                              isLastItem={isLastItemOnPage}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* --- Pagination --- */}
            {totalPages > 1 && (
              <div className="p-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <p>
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border rounded-md disabled:opacity-50 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border rounded-md disabled:opacity-50 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- Reel Creator Sidebar --- */}
        <ReelCreatorSidebar
          allItems={allItemsWithUrls}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          reelItems={reelItems}
          setReelItems={setReelItems}
          reelTitle={reelTitle}
          setReelTitle={setReelTitle}
          editingReel={editingReel}
          onUpdateSuccess={handleUpdateSuccess}
        />
      </div>
    </>
  );
};

export default Library;
