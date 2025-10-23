// src/AdminComponents/UserManagement.jsx

// ! React & Core Hooks
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from 'react';

// ! Lucide Icons
import {
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  X as CloseIcon,
} from 'lucide-react';

// ! Local Imports (Hooks & Context)
import { useAuth } from '../hooks/useAuth';
import { DataRefreshContext } from './Layout/AdminLayout'; // * Context for manual refresh

// ========================================================================== //
// ! SECTION 1: HELPER COMPONENTS
// ========================================================================== //

/**
 * ? Modal
 * A generic modal component for confirmations and displaying status.
 * (Assumed to be correctly implemented as per previous examples)
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  confirmText,
  onConfirm,
  showCancelButton = true,
  confirmButtonClass,
  successTitle = 'Success',
  successMessage,
}) => {
  const [actionStatus, setActionStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

 // Ефект 1: Скидає стан модалки, коли вона ВІДКРИВАЄТЬСЯ
  useEffect(() => {
    if (isOpen) {
      setActionStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]); // * Залежить ТІЛЬКИ від isOpen

  // Ефект 2: Керує слухачем клавіші 'Escape'
  useEffect(() => {
    const handleEscape = (event) => {
      // * Дозволяє закрити лише якщо стан 'idle'
      if (event.key === 'Escape' && actionStatus === 'idle') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose, actionStatus]);

  if (!isOpen) return null;

  const handleConfirmClick = async () => {
    setActionStatus('processing');
    setErrorMessage('');
    try {
      await onConfirm();
      setActionStatus('success');
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Modal confirmation error:', error);
      setActionStatus('error');
      setErrorMessage(error.message || 'An unexpected error occurred.');
      // Keep modal open on error
    }
  };

  const handleClose = () => {
    if (actionStatus !== 'processing') onClose();
  };

  const baseButtonClasses =
    'inline-flex items-center justify-center py-2 px-4 rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={handleClose}
    >
      <div
        className="relative w-full max-w-md p-6 m-4 bg-white rounded-xl shadow-xl dark:bg-slate-900"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {actionStatus === 'success' ? (
          <div className="text-center py-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">
              {successTitle}
            </h3>
            {successMessage && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {successMessage}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                {title}
              </h3>
              <button
                onClick={handleClose}
                disabled={actionStatus === 'processing'}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
                aria-label="Close modal"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-4 text-slate-600 dark:text-slate-300">
              {children}
            </div>
            {actionStatus === 'error' && errorMessage && (
              <div className="mt-4 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              {showCancelButton && (
                <button
                  onClick={handleClose}
                  disabled={actionStatus === 'processing'}
                  className={`${baseButtonClasses} border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800`}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleConfirmClick}
                disabled={actionStatus === 'processing'}
                className={`${baseButtonClasses} text-white ${confirmButtonClass || 'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500'}`}
              >
                {actionStatus === 'processing' && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {confirmText}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * ? StatusBadge
 * Displays a styled badge indicating the user status (active, deactivated, pending).
 */
const StatusBadge = ({ status }) => {
  const baseClasses =
    'inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium capitalize';
  // * Style mappings
  const statusStyles = {
    active:
      'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    deactivated:
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    pending:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  };
  const statusDotStyles = {
    active: 'bg-green-500',
    deactivated: 'bg-slate-500',
    pending: 'bg-yellow-500',
  };
  // * Fallback for unexpected statuses
  const currentStatusStyle = statusStyles[status] || statusStyles.pending;
  const currentDotStyle = statusDotStyles[status] || statusDotStyles.pending;

  return (
    <span className={`${baseClasses} ${currentStatusStyle}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${currentDotStyle}`}></span>
      {status}
    </span>
  );
};

/**
 * ? Highlight
 * A component to highlight search terms within a string of text.
 */
const Highlight = ({ text, highlight }) => {
  if (!text) return null;
  if (!highlight?.trim()) return <span>{text}</span>;

  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
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
// ! SECTION 2: SKELETON LOADER COMPONENT
// ========================================================================== //

/**
 * ? SkeletonLoader
 * Displays a placeholder UI while user data is being fetched.
 */
const SkeletonLoader = () => {
  // * Single skeleton row
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="p-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
      </td>
      <td className="p-4">
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
        </div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/5"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28"></div>
      </td>
      <td className="p-4 text-center">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-24 mx-auto"></div>
      </td>
      <td className="p-4 text-center">
        <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-24 mx-auto"></div>
      </td>
    </tr>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Skeleton Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="h-9 w-60 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
          <div className="h-10 w-72 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
        </div>
      </div>
      {/* Skeleton Table */}
      <div className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          {/* // * Render the actual header for structure */}
          <thead className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50">
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="p-4 font-medium text-left">User</th>
              <th className="p-4 font-medium text-left">Contact Information</th>
              <th className="p-4 font-medium text-left">Location</th>
              <th className="p-4 font-medium text-left">Registration Date</th>
              <th className="p-4 font-medium text-center">Status</th>
              <th className="p-4 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {[...Array(8)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
        {/* // * Skeleton Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

// ========================================================================== //
// ! SECTION 3: MAIN COMPONENT - UserManagement
// ========================================================================== //

const UserManagement = () => {
  // ! State
  const [users, setUsers] = useState([]); // * Holds the user data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(8); // * "Show More" pagination
  const [statusFilter, setStatusFilter] = useState('all'); // * Status filter ('all', 'active', 'deactivated', 'pending')
  const [sortConfig, setSortConfig] = useState({
    key: 'registered_at',
    direction: 'desc',
  }); // * Sorting state
  const [modalConfig, setModalConfig] = useState({ isOpen: false }); // * State for the confirmation modal

  // ! Context & Hooks
  const { refreshKey } = useContext(DataRefreshContext); // * Manual refresh trigger
  // * Auth hook for API calls (getUsers and updateUserStatus already handle auth implicitly via Supabase client / Edge Function context)
  const { getUsers, updateUserStatus } = useAuth();

  // ! Data Fetching
  // * Stable fetch function using useCallback
  const fetchUsers = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      // * Call API function from useAuth - authentication is handled within useAuth/Supabase client
      const data = await getUsers();
      // * Format data slightly for consistency within this component
      const formattedData = data.map((user) => ({
        ...user,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        state: user.status, // * Use 'state' internally, maps to 'status' from DB
        registered_at: user.created_at, // * Alias 'created_at'
      }));
      setUsers(formattedData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load user data.');
    } finally {
      setLoading(false);
    }
  }, [getUsers]); // * Dependency: the API function itself

  // * useEffect runs fetchUsers on mount and when refreshKey changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refreshKey]); // * Dependencies: the stable fetch function and the refresh trigger

  // ! Memoized Filtering & Sorting
  // * Recalculates only when dependencies change
  const filteredAndSortedUsers = useMemo(() => {
    let processUsers = [...users];

    // * Apply status filter
    if (statusFilter !== 'all') {
      processUsers = processUsers.filter((user) => user.state === statusFilter);
    }

    // * Apply search term filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      processUsers = processUsers.filter(
        (user) =>
          user.firstName.toLowerCase().includes(term) ||
          user.lastName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          (user.phone && user.phone.includes(term)) || // * Simpler check for phone
          (user.location && user.location.toLowerCase().includes(term)) ||
          user.state.toLowerCase().includes(term)
      );
    }

    // * Apply sorting (currently only by registration date)
    if (sortConfig.key === 'registered_at') {
      processUsers.sort((a, b) => {
        // * Safely create Date objects, fallback to 0 if invalid
        const dateA = a.registered_at ? new Date(a.registered_at).getTime() : 0;
        const dateB = b.registered_at ? new Date(b.registered_at).getTime() : 0;

        if (isNaN(dateA) || isNaN(dateB)) {
          // * Handle potential invalid dates gracefully, maybe push them to the end
          if (isNaN(dateA) && !isNaN(dateB)) return 1;
          if (!isNaN(dateA) && isNaN(dateB)) return -1;
          return 0;
        }

        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }
    // * TODO: Implement sorting for other columns if needed

    return processUsers;
  }, [users, searchTerm, statusFilter, sortConfig]);

  // ! Event Handlers
  // * Stable modal close function
  const closeModal = useCallback(() => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  }, []);

  /**
   * Opens the confirmation modal before activating/deactivating a user.
   * @param {string} id - The user ID.
   * @param {string} newStatus - The target status ('active' or 'deactivated').
   */
  const handleUpdateStatus = (id, newStatus) => {
    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    const isDeactivation = action === 'deactivate';
    const userToUpdate = users.find((u) => u.id === id);
    if (!userToUpdate) return; // * Safety check

    // * Confirmation function passed to the modal
    const performUpdate = async () => {
      // * API call via useAuth hook (already handles authentication)
      await updateUserStatus(id, newStatus);
      // * Update local state after successful API call (handled by Modal)
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === id ? { ...user, state: newStatus } : user
        )
      );
      // * Error handling is done within the Modal component
    };

    // * Configure and open the modal
    setModalConfig({
      isOpen: true,
      title: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `Are you sure you want to ${action} the user "${userToUpdate.firstName} ${userToUpdate.lastName}" (${userToUpdate.email})?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      onConfirm: performUpdate,
      showCancelButton: true,
      confirmButtonClass: isDeactivation // * Set button color based on action
        ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500'
        : 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-500',
      successTitle: `User ${action}d`,
      successMessage: `User "${userToUpdate.firstName} ${userToUpdate.lastName}" has been successfully ${action}d.`,
    });
  };

  /**
   * Increases the number of visible items for "Show More" pagination.
   */
  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 5);
  };

  /**
   * Handles clicks on the sortable table header (currently only for date).
   * @param {string} key - The data key to sort by ('registered_at').
   */
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      // * Toggle direction if the same key is clicked again
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  // ! Utility Functions
  /**
   * Formats an ISO date string into a more readable format.
   * @param {string} dateString - ISO date string.
   * @returns {string} Formatted date string (e.g., "Oct 23, 2025, 16:05").
   */
  const formatDateTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (e) {
      return 'Invalid Date'; // * Handle potential errors
    }
  };

  // ! Styles
  const baseButtonClasses =
    'py-1 px-3 rounded-md text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900';
  const activateButtonClasses =
    'border-green-600/50 text-green-700 hover:bg-green-50 dark:border-green-500/50 dark:text-green-400 dark:hover:bg-green-500/10 focus-visible:ring-green-400';
  const deactivateButtonClasses =
    'border-red-600/50 text-red-700 hover:bg-red-50 dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-500/10 focus-visible:ring-red-400';
  const inputClasses =
    'flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900';

  // ! Render Logic

  // * Loading State
  if (loading) return <SkeletonLoader />;

  // * Error State
  if (error)
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto">
      {/* --- Confirmation Modal --- */}
      <Modal {...modalConfig} onClose={closeModal} />

      {/* --- Header & Filters --- */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          User Management
        </h1>
        <div className="flex items-center gap-4 flex-wrap">
          {/* Status Filter */}
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={inputClasses}
              aria-label="Filter users by status"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="deactivated">Deactivated</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          {/* Search Input */}
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={inputClasses}
              aria-label="Search users"
            />
          </div>
        </div>
      </div>

      {/* --- User Table or Empty State --- */}
      {filteredAndSortedUsers.length === 0 ? (
        // * Empty State
        <div className="text-center p-8 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900/70">
          <p className="text-slate-500 dark:text-slate-400">
            {searchTerm || statusFilter !== 'all'
              ? `No users found matching the current filters.`
              : 'There are no registered users.'}
          </p>
        </div>
      ) : (
        // * User Table
        <div className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* Table Header */}
              <thead className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-medium text-left">User</th>
                  <th className="p-4 font-medium text-left">
                    Contact Information
                  </th>
                  <th className="p-4 font-medium text-left">Location</th>
                  <th className="p-4 font-medium text-left">
                    {/* Sortable Registration Date Header */}
                    <button
                      onClick={() => handleSort('registered_at')}
                      className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200"
                      aria-label={`Sort by Registration Date ${sortConfig.key === 'registered_at' ? (sortConfig.direction === 'asc' ? '(ascending)' : '(descending)') : ''}`}
                    >
                      Registration Date
                      {/* // * Display sort icon */}
                      {sortConfig.key === 'registered_at' &&
                        (sortConfig.direction === 'asc' ? (
                          <ArrowUp size={14} />
                        ) : (
                          <ArrowDown size={14} />
                        ))}
                    </button>
                  </th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* // * Render only the visible users based on pagination */}
                {filteredAndSortedUsers.slice(0, visibleCount).map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* User Name */}
                    <td className="p-4 text-left font-medium text-slate-900 dark:text-slate-50 whitespace-nowrap">
                      <Highlight
                        text={`${user.firstName} ${user.lastName}`}
                        highlight={searchTerm}
                      />
                    </td>
                    {/* Contact Info */}
                    <td className="p-4 text-left">
                      <div className="truncate" title={user.email}>
                        <Highlight text={user.email} highlight={searchTerm} />
                      </div>
                      <div
                        className="text-slate-500 dark:text-slate-400 truncate"
                        title={user.phone}
                      >
                        <Highlight text={user.phone} highlight={searchTerm} />
                      </div>
                    </td>
                    {/* Location */}
                    <td
                      className="p-4 text-left text-slate-600 dark:text-slate-300 whitespace-nowrap truncate"
                      title={user.location}
                    >
                      <Highlight text={user.location} highlight={searchTerm} />
                    </td>
                    {/* Registration Date */}
                    <td className="p-4 text-left text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatDateTime(user.registered_at)}
                    </td>
                    {/* Status */}
                    <td className="p-4 text-center">
                      <StatusBadge status={user.state} />
                    </td>
                    {/* Actions (Activate/Deactivate) */}
                    <td className="p-4 text-center">
                      {user.state === 'active' ? (
                        // --- Стан Active: Можна деактивувати ---
                        <button
                          onClick={() =>
                            handleUpdateStatus(user.id, 'deactivated')
                          }
                          className={`${baseButtonClasses} ${deactivateButtonClasses}`}
                          aria-label={`Deactivate user ${user.firstName} ${user.lastName}`}
                        >
                          Deactivate
                        </button>
                      ) : user.state === 'deactivated' ? (
                        // --- Стан Deactivated: Можна активувати ---
                        <button
                          onClick={() => handleUpdateStatus(user.id, 'active')}
                          className={`${baseButtonClasses} ${activateButtonClasses}`}
                          aria-label={`Activate user ${user.firstName} ${user.lastName}`}
                        >
                          Activate
                        </button>
                      ) : user.state === 'pending' ? (
                        // --- Стан Pending: Адмін не може нічого зробити ---
                        <span className="text-xs text-slate-500 dark:text-slate-400 italic px-3">
                          Awaiting User
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* "Show More" Button */}
          {visibleCount < filteredAndSortedUsers.length && (
            <div className="p-4 text-center border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleShowMore}
                className="py-2 px-4 text-sm font-medium rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Show More (
                {Math.min(5, filteredAndSortedUsers.length - visibleCount)}{' '}
                more)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;