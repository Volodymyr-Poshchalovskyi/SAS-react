// src/AdminComponents/ApplicationsForAdmin.jsx

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
  X as CloseIcon,
} from 'lucide-react'; // * Renamed X to CloseIcon for clarity

// ! Local Imports (Hooks & Context)
import { useAuth } from '../hooks/useAuth';
import { DataRefreshContext } from './Layout/AdminLayout'; // * Context for triggering manual data refresh

// ========================================================================== //
// ! SECTION 1: HELPER COMPONENTS
// ========================================================================== //

/**
 * ? StatusBadge
 * Displays a styled badge indicating the application status.
 */
const StatusBadge = ({ status }) => {
  const baseClasses =
    'inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium capitalize';
  // * Style mappings based on status
  const statusStyles = {
    approved:
      'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    denied: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    // * Keep 'in progress' for display
    'in progress':
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  };
  const statusDotStyles = {
    approved: 'bg-green-500',
    denied: 'bg-red-500',
    'in progress': 'bg-yellow-500',
  };
  return (
    <span className={`${baseClasses} ${statusStyles[status] || ''}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${statusDotStyles[status] || ''}`}
      ></span>
      {status}
    </span>
  );
};

/**
 * ? Highlight
 * A component to highlight search terms within a string of text.
 */
const Highlight = ({ text, highlight }) => {
  if (!text) return null; // * Return null if text is falsy
  if (!highlight?.trim()) return <span>{text}</span>; // * Use optional chaining

  // * Escape regex special characters in the highlight term
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  const parts = String(text).split(regex); // * Ensure text is a string

  return (
    <span>
      {parts.map((part, i) =>
        // * Case-insensitive comparison
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

/**
 * ? Modal
 * A generic modal component for confirmations and displaying status (processing, success, error).
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  confirmText = 'Confirm', // * Default confirm text
  onConfirm,
  showCancelButton = true,
  confirmButtonClass, // * Optional custom class for confirm button
  successTitle = 'Success',
  successMessage,
}) => {
  // * Internal state for managing the action lifecycle (idle, processing, success, error)
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

  // * Handler for the confirm button click
  const handleConfirmClick = async () => {
    setActionStatus('processing');
    setErrorMessage('');
    try {
      await onConfirm(); // * Execute the passed confirmation logic
      setActionStatus('success');
      setTimeout(() => {
        // * Auto-close on success
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Modal confirmation error:', error);
      setActionStatus('error');
      setErrorMessage(error.message || 'An unexpected error occurred.');
      // * Optionally revert to idle after showing error
      // setTimeout(() => setActionStatus('idle'), 3000);
    }
  };

  // * Reusable button styling
  const baseButtonClasses =
    'inline-flex items-center justify-center py-2 px-4 rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    // * Modal backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={actionStatus === 'idle' ? onClose : undefined} // * Close on backdrop click only if idle
    >
      {/* Modal Content */}
      <div
        className="relative w-full max-w-md p-6 m-4 bg-white rounded-xl shadow-xl dark:bg-slate-900"
        onMouseDown={(e) => e.stopPropagation()} // * Prevent closing when clicking inside
      >
        {/* Success State */}
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
          // * Idle, Processing, or Error State
          <>
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                {title}
              </h3>
              <button
                onClick={onClose}
                disabled={actionStatus === 'processing'}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
                aria-label="Close modal"
              >
                <CloseIcon className="h-6 w-6" />{' '}
                {/* // * Using renamed icon */}
              </button>
            </div>

            {/* Modal Body (Content passed as children) */}
            <div className="mt-4 text-slate-600 dark:text-slate-300">
              {children}
            </div>

            {/* Error Message Display */}
            {actionStatus === 'error' && (
              <div className="mt-4 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Modal Footer (Buttons) */}
            <div className="mt-6 flex justify-end gap-3">
              {showCancelButton && (
                <button
                  onClick={onClose}
                  disabled={actionStatus === 'processing'}
                  className={`${baseButtonClasses} border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800`}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleConfirmClick}
                disabled={actionStatus === 'processing'}
                className={`${baseButtonClasses} text-white ${
                  confirmButtonClass || // * Use provided class or default blue
                  'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500'
                }`}
              >
                {/* Show loader when processing */}
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

// ========================================================================== //
// ! SECTION 2: SKELETON LOADER COMPONENT
// ========================================================================== //

/**
 * ? SkeletonLoader
 * Displays a placeholder UI while application data is being fetched.
 */
const SkeletonLoader = () => {
  // * Single skeleton row component
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="p-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
      </td>
      <td className="p-4 max-w-md">
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
        </div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28"></div>
      </td>
      <td className="p-4 text-center">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-24 mx-auto"></div>
      </td>
      <td className="p-4 text-center">
        <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-32 mx-auto"></div>
      </td>
    </tr>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Skeleton Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="h-9 w-48 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
        </div>
      </div>
      {/* Skeleton Table */}
      <div className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          {/* // * Use the actual header for better structure representation */}
          <thead className="text-slate-500 dark:text-slate-400">
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="p-4 font-medium text-left">Email</th>
              <th className="p-4 font-medium text-left">Application Text</th>
              <th className="p-4 font-medium text-left">Date</th>
              <th className="p-4 font-medium text-center">Status</th>
              <th className="p-4 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* // * Render multiple skeleton rows */}
            {[...Array(8)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ========================================================================== //
// ! SECTION 3: MAIN COMPONENT - ApplicationsForAdmin
// ========================================================================== //

const ApplicationsForAdmin = () => {
  // ! State
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(8); // * "Show More" pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // * Filter state
  const [modalConfig, setModalConfig] = useState({ isOpen: false }); // * State for the Modal component

  // ! Context & Hooks
  const { refreshKey } = useContext(DataRefreshContext); // * For manual refresh trigger
  // * Auth hook for API calls (getApplications and updateApplicationStatus already handle auth implicitly via Supabase client)
  const { getApplications, updateApplicationStatus } = useAuth();

  // ! Data Fetching
  // * useCallback ensures fetchApplications is stable unless getApplications changes
  const fetchApplications = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      // * getApplications from useAuth will use the authenticated Supabase client
      const data = await getApplications();
      // * Format status for consistency ('pending' -> 'in progress')
      const formattedData = data.map((app) => ({
        ...app,
        text: app.message, // * Rename 'message' to 'text' if needed
        status: app.status === 'pending' ? 'in progress' : app.status,
      }));
      setApplications(formattedData);
    } catch (err) {
      console.error('Error fetching applications:', err); // * Log error
      setError(err.message || 'Failed to load applications.'); // * Set user-facing error
    } finally {
      setLoading(false);
    }
  }, [getApplications]); // * Dependency on the function from useAuth

  // * useEffect fetches data on mount and when refreshKey changes
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications, refreshKey]); // * Re-run if fetchApplications or refreshKey changes

  // ! Memoized Filtering
  // * useMemo recalculates filteredApplications only when dependencies change
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        // * Apply status filter first
        if (statusFilter === 'all') return true;
        return app.status === statusFilter;
      })
      .filter((app) => {
        // * Then apply search term filter
        if (!searchTerm.trim()) return true; // * Trim search term
        const lowerSearchTerm = searchTerm.toLowerCase();
        return (
          app.email.toLowerCase().includes(lowerSearchTerm) ||
          (app.text && app.text.toLowerCase().includes(lowerSearchTerm))
        );
      });
  }, [applications, searchTerm, statusFilter]);

  // ! Event Handlers
  // * useCallback for stable modal close function
  const closeModal = useCallback(() => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  }, []);

  /**
   * Opens the confirmation modal before updating application status.
   * @param {string} id - The ID of the application.
   * @param {string} newStatus - The target status ('approved' or 'denied').
   * @param {string} email - The applicant's email (for display).
   */
  const handleUpdateStatus = (id, newStatus, email) => {
    const isApproving = newStatus === 'approved';
    const actionText = isApproving ? 'approve' : 'deny';
    const actionPastTense = isApproving ? 'approved' : 'denied';

    // * Confirmation function to be executed by the modal
    const performUpdate = async () => {
      // * API call via useAuth hook (already handles authentication)
      await updateApplicationStatus(id, newStatus, email);
      // * Update local state optimistically (or after success confirmation)
      setApplications((apps) =>
        apps.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
      // * Note: Error handling is within the modal's handleConfirmClick
    };

    // * Configure and open the modal
    setModalConfig({
      isOpen: true,
      title: `Confirm Action: ${isApproving ? 'Approve' : 'Deny'}`,
      message: `Are you sure you want to ${actionText} this application for ${email}?`,
      onConfirm: performUpdate,
      confirmText: isApproving ? 'Approve' : 'Deny',
      confirmButtonClass: isApproving // * Specific button colors
        ? 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-500'
        : 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500',
      successTitle: `Application ${actionPastTense}`,
      successMessage: `The application for ${email} has been successfully ${actionPastTense}.`,
    });
  };

  /**
   * Handles the "Show More" button click for pagination.
   */
  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 5); // * Increase visible items
  };

  // ! Utility Functions
  /**
   * Formats a date string into a readable format.
   * @param {string} dateString - ISO date string.
   * @returns {string} Formatted date string (e.g., "Oct 23, 2025, 16:05").
   */
  const formatApplicationDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (e) {
      return 'Invalid Date'; // * Handle potential invalid date strings
    }
  };

  // ! Styles
  const baseButtonClasses =
    'py-1 px-3 rounded-md text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-50'; // * Added disabled style
  const approveButtonClasses =
    'border-green-600/50 text-green-700 hover:bg-green-50 dark:border-green-500/50 dark:text-green-400 dark:hover:bg-green-500/10 focus-visible:ring-green-400';
  const denyButtonClasses =
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
      {/* --- Page Header & Filters --- */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Applications
        </h1>
        <div className="flex items-center gap-4 flex-wrap">
          {/* Status Filter Dropdown */}
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={inputClasses}
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="in progress">In Progress</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
            </select>
          </div>
          {/* Search Input */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by email or text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={inputClasses}
              aria-label="Search applications"
            />
          </div>
        </div>
      </div>

      {/* --- Applications Table or Empty State --- */}
      {filteredApplications.length === 0 ? (
        // * Empty State Message
        <div className="text-center p-8 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900/70">
          <p className="text-slate-500 dark:text-slate-400">
            {searchTerm || statusFilter !== 'all'
              ? `No applications found matching the current filters.`
              : 'There are no applications to display.'}
          </p>
        </div>
      ) : (
        // * Table Container
        <div className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-auto">
              {/* Table Header */}
              <thead className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50">
                
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-medium text-left">Email</th>
                  <th className="p-4 font-medium text-left">
                    Application Text
                  </th>
                  <th className="p-4 font-medium text-left">Date</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody className="text-slate-800 dark:text-slate-200">
                {filteredApplications.slice(0, visibleCount).map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Email */}
                    <td className="p-4 text-left align-top">
                      <span className="font-medium text-slate-900 dark:text-slate-50 break-all">
                        <Highlight text={app.email} highlight={searchTerm} />
                      </span>
                    </td>
                    {/* Application Text */}
                    <td className="p-4 text-left align-top max-w-md">
                      {' '}
                      {/* Max width for text */}
                      <p className="text-slate-600 dark:text-slate-400 break-words line-clamp-3">
                        {' '}
                        {/* Line clamping */}
                        <Highlight text={app.text} highlight={searchTerm} />
                      </p>
                    </td>
                    {/* Date */}
                    <td className="p-4 text-left align-top text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatApplicationDate(app.created_at)}
                    </td>
                    {/* Status */}
                    <td className="p-4 text-center align-top">
                      <StatusBadge status={app.status} />
                    </td>
                    {/* Actions */}
                    <td className="p-4 text-center align-top">
                      {/* // * Show buttons only if status is 'in progress' */}
                      {app.status === 'in progress' && (
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdateStatus(app.id, 'approved', app.email)
                            }
                            className={`${baseButtonClasses} ${approveButtonClasses}`}
                            aria-label={`Approve application from ${app.email}`}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(app.id, 'denied', app.email)
                            }
                            className={`${baseButtonClasses} ${denyButtonClasses}`}
                            aria-label={`Deny application from ${app.email}`}
                          >
                            Deny
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* "Show More" Button */}
          {visibleCount < filteredApplications.length && (
            <div className="p-4 text-center border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleShowMore}
                className="py-2 px-4 text-sm font-medium rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Show More ({/* Calculate remaining items */}
                {Math.min(5, filteredApplications.length - visibleCount)} more)
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- Confirmation Modal --- */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
        confirmButtonClass={modalConfig.confirmButtonClass}
        successTitle={modalConfig.successTitle}
        successMessage={modalConfig.successMessage}
      >
        {/* // * Message content for the modal */}
        <p>{modalConfig.message}</p>
      </Modal>
    </div>
  );
};

export default ApplicationsForAdmin;