// src/AdminComponents/Layout/MyAnalytic.jsx

// ! React & Core Hooks
import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ! Lucide Icons
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
  Pin,
} from 'lucide-react';

// ! Local Context
import { DataRefreshContext } from './AdminLayout'; // * Context for triggering manual data refresh
import { useAuth } from '../../hooks/useAuth';

// ! Constants
const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';
const API_BASE_URL = import.meta.env.VITE_API_URL;

// ========================================================================== //
// ! HELPER COMPONENT: Highlight
// ========================================================================== //

/**
 * ? Highlight
 * A component to highlight search terms within a string of text.
 */
const Highlight = ({ text, highlight }) => {
  // * Return original text if no highlight or text is provided
  if (!highlight?.trim() || !text) return <span>{text}</span>;
  // * Create a case-insensitive regex, escaping special characters
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

// ========================================================================== //
// ! HELPER COMPONENT: FormField (Shared)
// ========================================================================== //

/**
 * ? FormField
 * A simple wrapper for form fields with a label.
 */
const FormField = ({ label, children }) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}
    </label>
    {children}
  </div>
);

// * Shared input styling
const inputClasses =
  'flex h-10 w-full rounded-md border border-slate-300 bg-white dark:bg-slate-800 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50';

// ========================================================================== //
// ! HELPER COMPONENT: ConfirmationModal
// ========================================================================== //

/**
 * ? ConfirmationModal
 * A generic confirmation modal used for deleting single or multiple items.
 * Handles its own internal state (idle, deleting, success, error).
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemTitle,
  itemCount,
}) => {
  const [status, setStatus] = useState('idle');

  // * Reset internal state when modal opens
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
      console.error('Action failed:', error);
      setStatus('error');
      // * Optionally revert status after error display or require manual close
      // setTimeout(() => setStatus('idle'), 3000);
    }
  };

  if (!isOpen) return null;

  // * Dynamic text based on single or multi-item action
  const isMultiDelete = itemCount && itemCount > 1;
  const entityName = isMultiDelete ? 'Showreels' : 'Showreel';
  const title = isMultiDelete
    ? `Delete ${itemCount} ${entityName}`
    : `Delete ${entityName}`;
  const confirmationMessage = isMultiDelete ? (
    <>
      Are you sure you want to delete these{' '}
      <strong className="text-slate-700 dark:text-slate-200">
        {itemCount} {entityName.toLowerCase()}
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
    ? `${itemCount} ${entityName.toLowerCase()} were deleted successfully.`
    : `The ${entityName.toLowerCase()} "${itemTitle}" was deleted.`;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={status === 'idle' ? onClose : undefined} // * Prevent close while deleting
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md"
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
          // * Confirmation (idle), Deleting, or Error State
          <>
            <div className="flex items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-slate-50">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {status === 'error' ? (
                      <span className="text-red-500 font-medium">
                        Failed to delete. Please try again or check console.
                      </span>
                    ) : (
                      confirmationMessage
                    )}
                  </p>
                </div>
              </div>
            </div>
            {/* Buttons */}
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
// ! HELPER COMPONENT: EditReelModal
// ========================================================================== //

/**
 * ? EditReelModal
 * Modal specifically for editing a reel's title and accessing related actions
 * like copying link, editing media content, or making a copy.
 */
const EditReelModal = ({
  isOpen,
  onClose,
  reel,
  onSaveSuccess,
  onCopy,
  session,
}) => {
  const [formData, setFormData] = useState({ title: '' });
  const [status, setStatus] = useState('idle'); // 'idle', 'saving', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // * Populate form when reel data changes (modal opens)
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

  // * Copy the public reel link to clipboard
  const handleCopyLink = () => {
    const link = `${window.location.origin}/reel/${reel.short_link}`;
    navigator.clipboard.writeText(link);
    // * TODO: Add visual feedback for successful copy
  };

  // * Navigate to the Library page with state to edit media for this reel
  const handleChangeMedia = () => {
    navigate('/adminpanel/library', { state: { reelToEdit: reel } });
  };

  // * Trigger the copy action in the parent and close modal
  const handleCopyClick = () => {
    if (onCopy && reel) {
      onCopy(reel);
    }
    onClose();
  };

  // * Handle form submission to update the reel title
  const handleSave = async (e) => {
    e.preventDefault();
    setStatus('saving');
    setErrorMessage('');

    const token = session?.access_token;
    if (!token) {
      setStatus('error');
      setErrorMessage('Authentication error. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reels/${reel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        // * Only send fields that can be edited here (currently just title)
        body: JSON.stringify({ title: formData.title }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // * Try to parse JSON error
        throw new Error(errorData.details || `Failed to update reel.`);
      }
      const updatedReel = await response.json();
      onSaveSuccess(updatedReel); // * Update parent state
      onClose(); // * Close modal on success
    } catch (error) {
      console.error('Save failed:', error);
      setStatus('error');
      setErrorMessage(error.message);
    }
  };

  // * Button styles
  const primaryButtonClasses =
    'w-full justify-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 flex items-center';
  const secondaryButtonClasses =
    'w-full justify-center px-4 py-2 text-sm font-medium rounded-md border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 disabled:opacity-50';

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={status !== 'saving' ? onClose : undefined} // * Prevent close while saving
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
            {/* Title Input */}
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

            {/* Short Link Display & Copy */}
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

            {/* Error Message */}
            {status === 'error' && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
          </div>

          {/* Action Buttons */}
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

// ========================================================================== //
// ! HELPER COMPONENT: ReelActionsDropdown
// ========================================================================== //

/**
 * ? ReelActionsDropdown
 * The dropdown menu ("...") for each reel row in the table.
 */
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

  // * Click-outside handler to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // * Position dropdown above if it's the last item in the table page
  const positionClass = isLastItem ? 'bottom-8' : 'top-8';

  return (
    <div
      ref={dropdownRef}
      className={`absolute right-4 ${positionClass} z-20 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700`}
    >
      <ul className="py-1 text-sm text-slate-700 dark:text-slate-200">
        <li>
          <button
            onClick={(e) => {
              e.stopPropagation();
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
            onClick={(e) => {
              e.stopPropagation();
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
            onClick={(e) => {
              e.stopPropagation();
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
          <div className="my-1 h-px bg-slate-100 dark:bg-slate-700"></div>{' '}
          {/* Separator */}
        </li>
        <li>
          <button
            onClick={(e) => {
              e.stopPropagation();
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

// ========================================================================== //
// ! MAIN COMPONENT: MyAnalytics
// ========================================================================== //

const MyAnalytics = () => {
  // ! State
  // * Data & Loading
  const [reelsData, setReelsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // * Table Interaction & Selection
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'descending',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReels, setSelectedReels] = useState(new Set());
  const [pinnedReelIds, setPinnedReelIds] = useState(new Set());

  // * Modal & UI State
  const [reelToDelete, setReelToDelete] = useState(null); // * For single delete confirmation
  const [reelToEdit, setReelToEdit] = useState(null); // * For edit modal
  const [activeDropdown, setActiveDropdown] = useState(null); // * Tracks which row's dropdown is open
  const [copiedLink, setCopiedLink] = useState(null); // * Tracks recently copied link for feedback
  const [isMultiDeleteModalOpen, setIsMultiDeleteModalOpen] = useState(false);

  // * User Info (example - replace with actual auth context)
  const [currentUserId, setCurrentUserId] = useState(null);

  // ! Refs & Context
  const isInitialMount = useRef(true); // * Prevents saving pins on first load
  const headerCheckboxRef = useRef(null); // * Ref for the "select all" checkbox
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshKey } = useContext(DataRefreshContext); // * Manual refresh trigger
  const { session, user } = useAuth();
  const itemsPerPage = 10;

  // ! Effect: Fetch Reels Data
  // * Fetches data on initial mount and when refreshKey changes
  useEffect(() => {
    const fetchReels = async () => {
      setLoading(true);

      const token = session?.access_token;
      if (!token) {
        setLoading(false);
        console.error('No auth token found');
        return;
      }

      try {
        // * TODO: Replace mock user with actual user from auth context
        if (user) setCurrentUserId(user.id);

        const response = await fetch(`${API_BASE_URL}/reels`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch reels data.');
        const data = await response.json();
        setReelsData(data);

        // * Load pinned reels from local storage for the current user
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
        // * TODO: Add user-facing error state/message
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, [refreshKey, session, user]); // * Re-fetch when refreshKey changes

  // ! Effect: Sync Pinned Reels to Local Storage
  useEffect(() => {
    // * Skip initial mount and loading states
    if (isInitialMount.current || loading) {
      if (isInitialMount.current) isInitialMount.current = false;
      return;
    }
    // * Save pinned IDs, namespaced by user ID
    if (currentUserId) {
      const storedPinsRaw = localStorage.getItem('userPinnedReels');
      const allUsersPins = storedPinsRaw ? JSON.parse(storedPinsRaw) : {};
      allUsersPins[currentUserId] = Array.from(pinnedReelIds);
      localStorage.setItem('userPinnedReels', JSON.stringify(allUsersPins));
    }
  }, [pinnedReelIds, currentUserId, loading]);

  // ! Effect: Handle Navigation State (for Edit Modal)
  // * Opens the edit modal if navigated here with `openModalForReelId` state
  useEffect(() => {
    const reelIdToOpen = location.state?.openModalForReelId;
    if (reelIdToOpen && !loading && reelsData.length > 0) {
      const reel = reelsData.find((r) => r.id === reelIdToOpen);
      if (reel) {
        setReelToEdit(reel);
        // * Clear the state from history after opening modal
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, reelsData, loading, navigate, location.pathname]);

  // ! Handlers: Pinning
  const handleTogglePin = (reelIdsToToggle) => {
    const newPinnedIds = new Set(pinnedReelIds);
    reelIdsToToggle.forEach((id) => {
      newPinnedIds.has(id) ? newPinnedIds.delete(id) : newPinnedIds.add(id);
    });
    setPinnedReelIds(newPinnedIds);
    setSelectedReels(new Set()); // * Clear selection after pinning/unpinning
  };

  // ! Handlers: API Actions
  /**
   * Toggles the status (Active/Inactive) of a reel via API.
   * Optimistically updates UI first, then reverts on error.
   */
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

    const token = session?.access_token;
    if (!token) {
      console.error('No auth token for status toggle');
      return;
    }

    // * Optimistic UI update
    setReelsData((currentData) =>
      currentData.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
    try {
      // * API call
      const response = await fetch(`${API_BASE_URL}/reels/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status.');
    } catch (error) {
      console.error('Status toggle failed:', error);
      // * Revert UI on error
      setReelsData((currentData) =>
        currentData.map((item) =>
          item.id === id ? { ...item, status: currentStatus } : item
        )
      );
      // * TODO: Show error toast to user
    }
  };

  /**
   * Deletes a single reel via API call (triggered by ConfirmationModal).
   */
  const handleConfirmDelete = async () => {
    if (!reelToDelete) return;

    const token = session?.access_token;
    if (!token) {
      console.error('No auth token for delete');
      throw new Error('Authentication error.');
    }

    const response = await fetch(`${API_BASE_URL}/reels/${reelToDelete.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || 'Failed to delete the showreel.');
    }
    // * Remove from local state on success
    setReelsData((currentData) =>
      currentData.filter((r) => r.id !== reelToDelete.id)
    );
    setReelToDelete(null); // * Close confirmation modal implicitly
  };

  /**
   * Deletes multiple selected reels via API calls (triggered by ConfirmationModal).
   */
  const handleConfirmMultiDelete = async () => {
    const reelIdsToDelete = Array.from(selectedReels);

    const token = session?.access_token;
    if (!token) {
      console.error('No auth token for multi-delete');
      throw new Error('Authentication error.');
    }

    // * Send delete requests in parallel
    const deletePromises = reelIdsToDelete.map((id) =>
      fetch(`${API_BASE_URL}/reels/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    const results = await Promise.allSettled(deletePromises);

    const successfullyDeletedIds = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.ok) {
        successfullyDeletedIds.push(reelIdsToDelete[index]);
      } else {
        // * Log errors for failed deletions
        console.error(
          `Failed to delete reel ID: ${reelIdsToDelete[index]}`,
          result.reason || result.value?.statusText
        );
        // * TODO: Show partial success/failure message to user
      }
    });

    // * Update local state by removing successfully deleted reels
    if (successfullyDeletedIds.length > 0) {
      setReelsData((currentData) =>
        currentData.filter((r) => !successfullyDeletedIds.includes(r.id))
      );
    }

    setSelectedReels(new Set()); // * Clear selection
    setIsMultiDeleteModalOpen(false); // * Close confirmation modal
  };

  // ! Handlers: Row Actions & Navigation
  /**
   * Navigates to the Library page with state to copy the selected reel.
   */
  const handleCopy = (reel) => {
    navigate('/adminpanel/library', { state: { reelToCopy: reel } });
  };

  /**
   * Opens the EditReelModal for the selected reel.
   */
  const handleEdit = (reel) => {
    setReelToEdit(reel);
    setActiveDropdown(null); // * Close the dropdown menu
  };

  /**
   * Copies the reel's short link to the clipboard and provides visual feedback.
   */
  const handleCopyLink = (shortLink) => {
    const link = `${window.location.origin}/reel/${shortLink}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(shortLink);
      setTimeout(() => setCopiedLink(null), 2000); // * Reset feedback after 2s
    });
  };

  /**
   * Callback for EditReelModal on successful save. Updates local state.
   */
  const handleSaveSuccess = (updatedReel) => {
    setReelsData((prevData) =>
      prevData.map((reel) => (reel.id === updatedReel.id ? updatedReel : reel))
    );
  };

  // ! Memoized Data: Sorting & Filtering
  // * Memoized sorted data (applies pinning and column sort)
  const sortedData = useMemo(() => {
    let sortableItems = [...reelsData];
    sortableItems.sort((a, b) => {
      // * Pinned items always come first
      const isAPinned = pinnedReelIds.has(a.id);
      const isBPinned = pinnedReelIds.has(b.id);
      if (isAPinned && !isBPinned) return -1;
      if (!isAPinned && isBPinned) return 1;

      // * Standard column sorting logic
      if (sortConfig.key) {
        let aValue = a[sortConfig.key] ?? 0;
        let bValue = b[sortConfig.key] ?? 0;
        // * Special handling for 'created_by' (uses nested profile data)
        if (sortConfig.key === 'created_by') {
          aValue =
            (a.user_profiles
              ? `${a.user_profiles.first_name || ''} ${a.user_profiles.last_name || ''}`.trim() ||
                a.user_profiles.email
              : '') || 'N/A';
          bValue =
            (b.user_profiles
              ? `${b.user_profiles.first_name || ''} ${b.user_profiles.last_name || ''}`.trim() ||
                b.user_profiles.email
              : '') || 'N/A';
        }
        // * Sort strings locale-sensitively, numbers numerically
        if (typeof aValue === 'string' && typeof bValue === 'string')
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        if (aValue < bValue)
          return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0; // * Maintain original order if values are equal
    });
    return sortableItems;
  }, [reelsData, sortConfig, pinnedReelIds]);

  // * Memoized filtered data (applies search term to sorted data)
  const filteredData = useMemo(() => {
    if (!searchTerm) return sortedData;
    const term = searchTerm.toLowerCase();
    return sortedData.filter((item) => {
      // * Check relevant fields for search term match
      const createdByName = (
        `${item.user_profiles?.first_name || ''} ${item.user_profiles?.last_name || ''}`.trim() ||
        item.user_profiles?.email ||
        ''
      ).toLowerCase();
      const createdAtDateTime = item.created_at
        ? new Date(item.created_at).toLocaleString('uk-UA', {
            // * Locale specific date format
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

  // * Memoized data for the current page
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // ! Handlers: Table Interaction
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

  // ! Effect: Header Checkbox State
  // * Manages the indeterminate state of the "select all" checkbox
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

  // ! Memoized Text for Pin Button
  const pinActionText = useMemo(() => {
    if (selectedReels.size === 0) return 'Pin';
    const allSelectedArePinned = Array.from(selectedReels).every((id) =>
      pinnedReelIds.has(id)
    );
    return allSelectedArePinned ? 'Unpin Selected' : 'Pin Selected';
  }, [selectedReels, pinnedReelIds]);

  // ! Utility Functions
  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);

  // ! Constants for Rendering
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // ! Skeleton Loading Component
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="p-4">
        <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </td>
      <td className="p-4">
        <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto"></div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-12 bg-slate-200 dark:bg-slate-700 rounded-md shrink-0"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        </div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12 mx-auto"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 mx-auto"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-10 mx-auto"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28"></div>
      </td>
      <td className="p-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20 mx-auto"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 mx-auto"></div>
      </td>
      <td className="p-4">
        <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded-md mx-auto"></div>
      </td>
    </tr>
  );

  // ! Render Loading State
  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Skeleton Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-9 w-48 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
          <div className="h-10 w-72 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
        </div>
        {/* Skeleton Table */}
        <div className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            {/* // * Render the actual header even during loading */}
            <thead className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900">
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 w-12 text-left">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 accent-blue-600"
                    disabled
                  />
                </th>
                <th className="p-4 w-12 text-center">
                  <Pin size={14} />
                </th>
                <th className="p-4 font-medium text-left w-[23%]">Reel</th>
                <th className="p-4 font-medium text-center w-[8%]">Views</th>
                <th className="p-4 font-medium text-center w-[12%]">
                  Completion
                </th>
                <th className="p-4 font-medium text-center w-[8%]">
                  Avg. Time
                </th>
                <th className="p-4 font-medium text-left w-[12%]">
                  Created By
                </th>
                <th className="p-4 font-medium text-left w-[12%]">
                  Created At
                </th>
                <th className="p-4 font-medium text-center w-[8%]">Status</th>
                <th className="p-4 font-medium text-center w-[8%]">Link</th>
                <th className="p-4 font-medium text-center w-[9%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...Array(itemsPerPage)].map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
          {/* // * Skeleton Pagination (optional) */}
          <div className="p-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-8 w-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ! Render Main Component
  return (
    <>
      {/* --- Modals --- */}
      <ConfirmationModal
        isOpen={!!reelToDelete}
        onClose={() => setReelToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemTitle={reelToDelete?.title}
      />
      <ConfirmationModal
        isOpen={isMultiDeleteModalOpen}
        onClose={() => setIsMultiDeleteModalOpen(false)}
        onConfirm={handleConfirmMultiDelete}
        itemCount={selectedReels.size}
      />
      <EditReelModal
        isOpen={!!reelToEdit}
        onClose={() => setReelToEdit(null)}
        reel={reelToEdit}
        onSaveSuccess={handleSaveSuccess}
        onCopy={handleCopy}
        session={session}
      />

      {/* --- Main Content Area --- */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Bulk Actions */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              Analytics
            </h1>
            {selectedReels.size > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTogglePin(Array.from(selectedReels))}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Pin size={16} />
                  {pinActionText} ({selectedReels.size})
                </button>
                <button
                  onClick={() => setIsMultiDeleteModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <Trash2 size={16} />
                  Delete Selected ({selectedReels.size})
                </button>
              </div>
            )}
          </div>
          {/* Search Input */}
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

        {/* --- Analytics Table --- */}
        <div className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
<table className="w-full table-fixed text-sm">              
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
              {/* Table Body */}
              <tbody className="text-slate-800 dark:text-slate-200 divide-y divide-slate-100 dark:divide-slate-800">
                {currentData.map((reel, index) => {
                  const isPinned = pinnedReelIds.has(reel.id);
                  const completionRate = Math.round(reel.completion_rate || 0);
                  const createdBy = reel.user_profiles
                    ? `${reel.user_profiles.first_name || ''} ${reel.user_profiles.last_name || ''}`.trim() ||
                      reel.user_profiles.email ||
                      'N/A'
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
                      onClick={() => handleRowCheck(reel.id)} // * Select row on click
                      className={`transition-colors cursor-pointer ${selectedReels.has(reel.id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedReels.has(reel.id)}
                          onChange={() => handleRowCheck(reel.id)}
                          onClick={(e) => e.stopPropagation()} // * Prevent row selection when clicking checkbox directly
                          className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 accent-blue-600 cursor-pointer"
                        />
                      </td>
                      {/* Pin */}
                      <td className="p-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePin([reel.id]);
                          }}
                          title={isPinned ? 'Unpin Reel' : 'Pin Reel'}
                          className={`p-1 rounded-full ${isPinned ? 'text-blue-600' : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'}`}
                        >
                          <Pin size={16} />
                        </button>
                      </td>
                      {/* Reel Title & Preview */}
                      <td className="p-4 text-left">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-12 bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                            {reel.preview_gcs_path ? (
                              <img
                                src={`${CDN_BASE_URL}/${reel.preview_gcs_path}`}
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
                      {/* Views */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                          <Eye className="h-4 w-4" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {formatNumber(reel.total_views || 0)}
                          </span>
                        </div>
                      </td>
                      {/* Completion Rate */}
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
                      {/* Average Watch Time */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {Math.round(reel.avg_watch_duration || 0)}s
                          </span>
                        </div>
                      </td>
                     {/* Created By */}
                      <td className="p-4 text-left truncate">
                        <div className="flex items-center gap-2 truncate text-slate-600 dark:text-slate-400">
                          <User className="h-4 w-4" />
                          <span>
                            <Highlight
                              text={createdBy === '' ? 'N/A' : createdBy}
                              highlight={searchTerm}
                            />
                          </span>
                        </div>
                      </td>
                      {/* Created At */}
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
                      {/* Status */}
                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${reel.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'}`}
                        >
                          {reel.status}
                        </span>
                      </td>
                      {/* Link */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={`/reel/${reel.short_link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 hover:underline"
                            onClick={(e) => e.stopPropagation()} // * Prevent row selection
                            title="Open Reel"
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
                      {/* Actions Dropdown */}
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
                            aria-label={`Actions for ${reel.title}`}
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

          {/* --- Pagination --- */}
          {totalPages > 1 && (
            <div className="p-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
              <div>
                Page {currentPage} of {totalPages} ({filteredData.length} items)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border rounded-md disabled:opacity-50 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border rounded-md disabled:opacity-50 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  aria-label="Next Page"
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
