import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Eye,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
  Layers,
  Loader2,
  CheckCircle,
  User,
  Calendar,
  Settings,
  Copy,
  Power,
  PowerOff,
  Edit,
  Pin, // PIN UPDATE: Import Pin icon
} from 'lucide-react';
import { getSignedUrls } from '../../lib/gcsUrlCache';

// Припускаємо, що у вас є Supabase клієнт, якщо ні, його потрібно ініціалізувати
// import { createClient } from '@supabase/supabase-js';
// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =======================
// HELPER FUNCTIONS & UTILITIES
// =======================
const getSignedUrlsCached = async (gcsPaths) => {
  const uniquePaths = [...new Set(gcsPaths.filter((path) => path))];
  if (uniquePaths.length === 0) return {};
  return getSignedUrls(uniquePaths);
};

const Highlight = ({ text, highlight }) => {
  if (!highlight?.trim() || !text) return <span>{text}</span>;
  const regex = new RegExp(
    `(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi'
  );
  const parts = String(text).split(regex);
  return (
    <span>
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
      <ArrowUp className="h-4 w-4 text-slate-800" />
    ) : (
      <ArrowDown className="h-4 w-4 text-slate-800" />
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

const FormField = ({ label, children }) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}
    </label>
    {children}
  </div>
);
const inputClasses =
  'flex h-10 w-full rounded-md border border-slate-300 bg-white dark:bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50';

// =======================
// MODAL & DROPDOWN COMPONENTS
// =======================
const ConfirmationModal = ({ isOpen, onClose, onConfirm, itemTitle }) => {
  const [status, setStatus] = useState('idle');
  useEffect(() => {
    if (isOpen) setStatus('idle');
  }, [isOpen]);

  const handleConfirmClick = async () => {
    setStatus('deleting');
    try {
      await onConfirm();
      setStatus('success');
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Deletion failed:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={status === 'idle' ? onClose : undefined}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {status === 'success' ? (
          <div className="text-center py-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">
              Deleted Successfully
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              The showreel "
              <strong className="text-slate-700 dark:text-slate-200">
                {itemTitle}
              </strong>
              " was deleted.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-slate-50">
                  Delete Showreel
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {status === 'error' ? (
                      <span className="text-red-500">
                        Failed to delete. Please try again.
                      </span>
                    ) : (
                      <>
                        Are you sure you want to delete{' '}
                        <strong className="text-slate-700 dark:text-slate-200">
                          {itemTitle}
                        </strong>
                        ? This action cannot be undone.
                      </>
                    )}
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
                <Loader2
                  className={`animate-spin h-5 w-5 ${status !== 'deleting' && 'hidden'}`}
                />{' '}
                {status !== 'deleting' && 'Delete'}
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

const EditReelModal = ({ isOpen, onClose, reel, onSaveSuccess, onCopy }) => {
  const [formData, setFormData] = useState({ title: '' });
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (reel) {
      setFormData({ title: reel.title || '' });
      setStatus('idle');
      setErrorMessage('');
    }
  }, [reel]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/reel/${reel.short_link}`;
    navigator.clipboard.writeText(link);
  };

  const handleChangeMedia = () => {
    navigate('/adminpanel/library', { state: { reelToEdit: reel } });
  };

  const handleCopyClick = () => {
    if (onCopy && reel) {
      onCopy(reel);
    }
    onClose();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus('saving');
    setErrorMessage('');
    try {
      const response = await fetch(`http://localhost:3001/reels/${reel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || `Failed to update reel.`);
      }
      const updatedReel = await response.json();
      onSaveSuccess(updatedReel);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
      setStatus('error');
      setErrorMessage(error.message);
    }
  };

  const primaryButtonClasses =
    'w-full justify-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 flex items-center';
  const secondaryButtonClasses =
    'w-full justify-center px-4 py-2 text-sm font-medium rounded-md border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 disabled:opacity-50';

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={status === 'idle' ? onClose : undefined}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSave}>
          <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-slate-50 mb-4">
            Edit Showreel
          </h3>
          <div className="space-y-4">
            <FormField label="Title">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={inputClasses}
                required
              />
            </FormField>

            <FormField label="Short Link">
              <div className="flex items-center gap-2">
                <a
                  href={`/reel/${reel.short_link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-grow px-3 py-2 text-sm text-blue-500 dark:text-blue-400 bg-slate-100 dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-700 truncate hover:underline"
                >
                  /reel/{reel.short_link}
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  title="Copy Link"
                  className="p-2 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Copy className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </FormField>

            {status === 'error' && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleChangeMedia}
              className={secondaryButtonClasses}
            >
              <Layers className="h-4 w-4" />
              Edit Media
            </button>
            <button
              type="button"
              onClick={handleCopyClick}
              className={secondaryButtonClasses}
            >
              <Copy className="h-4 w-4" />
              Make a Copy
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={status === 'saving'}
              className={secondaryButtonClasses}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === 'saving'}
              className={primaryButtonClasses}
            >
              {status === 'saving' ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" /> Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReelActionsDropdown = ({
  reel,
  onEdit,
  onCopy,
  onDelete,
  onToggleStatus,
  onClose,
  isLastItem,
}) => {
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  const positionClass = isLastItem ? 'bottom-8' : 'top-8';
  return (
    <div
      ref={dropdownRef}
      className={`absolute right-4 ${positionClass} z-20 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700`}
    >
      <ul className="py-1 text-sm text-slate-700 dark:text-slate-200">
        <li>
          <button
            onClick={() => {
              onEdit(reel);
              onClose();
            }}
            className="w-full flex items-center px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Edit className="mr-3 h-4 w-4" />
            <span>Edit</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              onCopy(reel);
              onClose();
            }}
            className="w-full flex items-center px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Copy className="mr-3 h-4 w-4" />
            <span>Make a Copy</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              onToggleStatus(reel.id, reel.status);
              onClose();
            }}
            className="w-full flex items-center px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {reel.status === 'Active' ? (
              <PowerOff className="mr-3 h-4 w-4 text-yellow-500" />
            ) : (
              <Power className="mr-3 h-4 w-4 text-green-500" />
            )}
            <span>{reel.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
          </button>
        </li>
        <li>
          <div className="my-1 h-px bg-slate-100 dark:bg-slate-700"></div>
        </li>
        <li>
          <button
            onClick={() => {
              onDelete(reel);
              onClose();
            }}
            className="w-full flex items-center px-4 py-2 text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Trash2 className="mr-3 h-4 w-4" />
            <span>Delete</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

// =======================
// MAIN COMPONENT: MyAnalytics
// =======================
const MyAnalytics = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [reelsData, setReelsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'descending',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [signedUrls, setSignedUrls] = useState({});
  const [reelToDelete, setReelToDelete] = useState(null);
  const [reelToEdit, setReelToEdit] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);
  const itemsPerPage = 10;

  // PIN UPDATE: State for pins, selection, and user ID
  const [selectedReels, setSelectedReels] = useState(new Set());
  const [pinnedReelIds, setPinnedReelIds] = useState(new Set());
  const [currentUserId, setCurrentUserId] = useState(null);
  const isInitialMount = useRef(true);
  const headerCheckboxRef = useRef(null);

  // PIN UPDATE: Fetch reels and load pins from localStorage
  useEffect(() => {
    const fetchReels = async () => {
      setLoading(true);
      try {
        // We need the user to scope the pins in localStorage.
        // Assuming a Supabase client `supabase.auth.getUser()`
        // If you get user from another endpoint, adjust it.
        // const { data: { user } } = await supabase.auth.getUser();
        // For now, let's assume a mock user fetch if no supabase client
        const user = { id: 'mock-user-id-123' }; // Replace with your actual user fetching
        if (user) setCurrentUserId(user.id);

        const response = await fetch('http://localhost:3001/reels');
        if (!response.ok) throw new Error('Failed to fetch reels data.');
        const data = await response.json();
        setReelsData(data);

        // Load pins from localStorage
        if (user) {
          const storedPinsRaw = localStorage.getItem('userPinnedReels');
          if (storedPinsRaw) {
            const allUsersPins = JSON.parse(storedPinsRaw);
            const userPins = allUsersPins[user.id] || [];
            setPinnedReelIds(new Set(userPins));
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, []);

  // PIN UPDATE: Save pins to localStorage whenever they change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (currentUserId) {
      const storedPinsRaw = localStorage.getItem('userPinnedReels');
      const allUsersPins = storedPinsRaw ? JSON.parse(storedPinsRaw) : {};
      allUsersPins[currentUserId] = Array.from(pinnedReelIds);
      localStorage.setItem('userPinnedReels', JSON.stringify(allUsersPins));
    }
  }, [pinnedReelIds, currentUserId]);

  useEffect(() => {
    const reelIdToOpen = location.state?.openModalForReelId;
    if (reelIdToOpen && !loading && reelsData.length > 0) {
      const reel = reelsData.find((r) => r.id === reelIdToOpen);
      if (reel) {
        setReelToEdit(reel);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, reelsData, loading, navigate, location.pathname]);

  const handleTogglePin = (reelIdsToToggle) => {
    const newPinnedIds = new Set(pinnedReelIds);
    reelIdsToToggle.forEach((id) => {
      newPinnedIds.has(id) ? newPinnedIds.delete(id) : newPinnedIds.add(id);
    });
    setPinnedReelIds(newPinnedIds);
    setSelectedReels(new Set());
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setReelsData((currentData) =>
      currentData.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
    try {
      await fetch(`http://localhost:3001/reels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error(error);
      setReelsData((currentData) =>
        currentData.map((item) =>
          item.id === id ? { ...item, status: currentStatus } : item
        )
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!reelToDelete) return;
    const response = await fetch(
      `http://localhost:3001/reels/${reelToDelete.id}`,
      { method: 'DELETE' }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || 'Failed to delete the showreel.');
    }
    setReelsData((currentData) =>
      currentData.filter((r) => r.id !== reelToDelete.id)
    );
  };

  const handleCopy = (reel) => {
    navigate('/adminpanel/library', { state: { reelToCopy: reel } });
  };

  const handleEdit = (reel) => {
    setReelToEdit(reel);
    setActiveDropdown(null);
  };

  const handleCopyLink = (shortLink) => {
    const link = `${window.location.origin}/reel/${shortLink}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(shortLink);
      setTimeout(() => setCopiedLink(null), 2000);
    });
  };

  const handleSaveSuccess = (updatedReel) => {
    setReelsData((prevData) =>
      prevData.map((reel) => (reel.id === updatedReel.id ? updatedReel : reel))
    );
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...reelsData];
    sortableItems.sort((a, b) => {
      const isAPinned = pinnedReelIds.has(a.id);
      const isBPinned = pinnedReelIds.has(b.id);

      if (isAPinned && !isBPinned) return -1;
      if (!isAPinned && isBPinned) return 1;

      if (sortConfig.key) {
        let aValue = a[sortConfig.key] ?? 0;
        let bValue = b[sortConfig.key] ?? 0;
        if (sortConfig.key === 'created_by') {
          aValue =
            `${a.user_profiles?.first_name || ''} ${a.user_profiles?.last_name || ''}`.trim();
          bValue =
            `${b.user_profiles?.first_name || ''} ${b.user_profiles?.last_name || ''}`.trim();
        }
        if (typeof aValue === 'string' && typeof bValue === 'string')
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        if (aValue < bValue)
          return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [reelsData, sortConfig, pinnedReelIds]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return sortedData;
    const term = searchTerm.toLowerCase();
    return sortedData.filter((item) => {
      const createdByName =
        `${item.user_profiles?.first_name || ''} ${item.user_profiles?.last_name || ''}`
          .trim()
          .toLowerCase();
      const createdAtDateTime = item.created_at
        ? new Date(item.created_at).toLocaleString('uk-UA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '';
      return (
        item.title.toLowerCase().includes(term) ||
        item.short_link.toLowerCase().includes(term) ||
        createdAtDateTime.includes(term) ||
        createdByName.includes(term)
      );
    });
  }, [sortedData, searchTerm]);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  useEffect(() => {
    const fetchAndCacheUrls = async () => {
      const pathsToFetch = currentData
        .map((item) => item.preview_gcs_path)
        .filter((path) => path);
      if (pathsToFetch.length > 0) {
        const urlsMap = await getSignedUrlsCached(pathsToFetch);
        setSignedUrls((prevUrls) => ({ ...prevUrls, ...urlsMap }));
      }
    };
    if (currentData.length > 0) fetchAndCacheUrls();
  }, [currentData]);

  const handleSort = (key) =>
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }));

  const handleSelectAll = (e) =>
    setSelectedReels(
      e.target.checked ? new Set(currentData.map((item) => item.id)) : new Set()
    );
  const handleRowCheck = (id) =>
    setSelectedReels((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });

  useEffect(() => {
    if (headerCheckboxRef.current) {
      const numSelected = selectedReels.size;
      const numOnPage = currentData.length;
      headerCheckboxRef.current.checked =
        numSelected === numOnPage && numOnPage > 0;
      headerCheckboxRef.current.indeterminate =
        numSelected > 0 && numSelected < numOnPage;
    }
  }, [selectedReels, currentData]);

  const pinActionText = useMemo(() => {
    if (selectedReels.size === 0) return 'Pin';
    const allSelectedArePinned = Array.from(selectedReels).every((id) =>
      pinnedReelIds.has(id)
    );
    return allSelectedArePinned ? 'Unpin Selected' : 'Pin Selected';
  }, [selectedReels, pinnedReelIds]);

  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (loading)
    return (
      <div className="p-4 text-center text-slate-500">
        Loading analytics... ⏳
      </div>
    );

  return (
    <>
      <ConfirmationModal
        isOpen={!!reelToDelete}
        onClose={() => setReelToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemTitle={reelToDelete?.title}
      />
      <EditReelModal
        onCopy={handleCopy}
        isOpen={!!reelToEdit}
        onClose={() => setReelToEdit(null)}
        reel={reelToEdit}
        onSaveSuccess={handleSaveSuccess}
      />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              Analytics
            </h1>
            {selectedReels.size > 0 && (
              <button
                onClick={() => handleTogglePin(Array.from(selectedReels))}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Pin size={16} />
                {pinActionText} ({selectedReels.size})
              </button>
            )}
          </div>
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
        <div className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900">
                <tr className="border-b border-slate-200 dark:border-slate-800">
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
                    className="w-[23%]"
                  >
                    Reel
                  </SortableHeader>
                  <SortableHeader
                    sortKey="total_views"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    className="w-[8%] text-center"
                  >
                    Views
                  </SortableHeader>
                  <SortableHeader
                    sortKey="completion_rate"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    className="w-[12%] text-center"
                  >
                    Completion
                  </SortableHeader>
                  <SortableHeader
                    sortKey="avg_watch_duration"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    className="w-[8%] text-center"
                  >
                    Avg. Time
                  </SortableHeader>
                  <SortableHeader
                    sortKey="created_by"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    className="w-[12%]"
                  >
                    Created By
                  </SortableHeader>
                  <SortableHeader
                    sortKey="created_at"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    className="w-[12%]"
                  >
                    Created At
                  </SortableHeader>
                  <SortableHeader
                    sortKey="status"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    className="w-[8%] text-center"
                  >
                    Status
                  </SortableHeader>
                  <th className="p-4 font-medium text-center w-[8%]">Link</th>
                  <th className="p-4 font-medium text-center w-[9%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-800 dark:text-slate-200 divide-y divide-slate-100 dark:divide-slate-800">
                {currentData.map((reel, index) => {
                  const isPinned = pinnedReelIds.has(reel.id);
                  const previewUrl = reel.preview_gcs_path
                    ? signedUrls[reel.preview_gcs_path]
                    : null;
                  const completionRate = Math.round(reel.completion_rate || 0);
                  const createdBy = reel.user_profiles
                    ? `${reel.user_profiles.first_name || ''} ${reel.user_profiles.last_name || ''}`.trim()
                    : 'N/A';
                  const createdAtDateTime = reel.created_at
                    ? new Date(reel.created_at).toLocaleString('uk-UA', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A';
                  const isLastItem = index === currentData.length - 1;
                  return (
                    <tr
                      key={reel.id}
                      onClick={() => handleRowCheck(reel.id)}
                      className={`transition-colors cursor-pointer ${selectedReels.has(reel.id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
                    >
                      <td className="p-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedReels.has(reel.id)}
                          onChange={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 accent-blue-600 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePin([reel.id]);
                          }}
                          className={`p-1 rounded-full ${isPinned ? 'text-blue-600' : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'}`}
                        >
                          <Pin size={16} />
                        </button>
                      </td>
                      <td className="p-4 text-left">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-12 bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                            {previewUrl ? (
                              <img
                                src={previewUrl}
                                alt={reel.title}
                                className="w-full h-full object-cover rounded-md"
                              />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
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
                            {formatNumber(reel.total_views || 0)}
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
                            <Highlight
                              text={createdBy === '' ? 'N/A' : createdBy}
                              highlight={searchTerm}
                            />
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-left">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          <Calendar className="h-4 w-4" />
                          <span>
                            <Highlight
                              text={createdAtDateTime}
                              highlight={searchTerm}
                            />
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${reel.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'}`}
                        >
                          {reel.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={`/reel/${reel.short_link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <Highlight
                              text={reel.short_link}
                              highlight={searchTerm}
                            />
                            <LinkIcon className="h-3 w-3" />
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyLink(reel.short_link);
                            }}
                            title="Copy Link"
                            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            {copiedLink === reel.short_link ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-slate-500" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="relative flex items-center justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown((prev) =>
                                prev === reel.id ? null : reel.id
                              );
                            }}
                            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <Settings className="h-4 w-4 text-slate-500" />
                          </button>
                          {activeDropdown === reel.id && (
                            <ReelActionsDropdown
                              reel={reel}
                              onEdit={handleEdit}
                              onCopy={handleCopy}
                              onDelete={setReelToDelete}
                              onToggleStatus={handleToggleStatus}
                              onClose={() => setActiveDropdown(null)}
                              isLastItem={isLastItem}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
              <div>
                Page {currentPage} of {totalPages}
              </div>
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
    </>
  );
};

export default MyAnalytics;
