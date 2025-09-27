// src/AdminComponents/ApplicationsForAdmin.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

// =======================
// Status Badge Component (No changes)
// =======================
const StatusBadge = ({ status }) => {
  const baseClasses =
    'inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium capitalize';
  const statusStyles = {
    approved:
      'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    denied: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
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

// =======================
// Highlight Component (No changes)
// =======================
const Highlight = ({ text, highlight }) => {
  if (!text) return null;
  if (!highlight.trim()) return <span>{text}</span>;

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

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

// ===================================
// Modal Component (No changes)
// ===================================
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

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && actionStatus === 'idle') {
        onClose();
      }
    };
    
    if (isOpen) {
      setActionStatus('idle');
      setErrorMessage('');
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirmClick = async () => {
    setActionStatus('processing');
    setErrorMessage('');
    try {
      await onConfirm();
      setActionStatus('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Modal confirmation error:', error);
      setActionStatus('error');
      setErrorMessage(error.message || 'An unexpected error occurred.');
      setTimeout(() => setActionStatus('idle'), 3000);
    }
  };

  const baseButtonClasses =
    'inline-flex items-center justify-center py-2 px-4 rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={actionStatus === 'idle' ? onClose : undefined}
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
                onClick={onClose}
                disabled={actionStatus === 'processing'}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-4 text-slate-600 dark:text-slate-300">
              {children}
            </div>
            
            {actionStatus === 'error' && (
                <div className="mt-4 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

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
                  confirmButtonClass ||
                  'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500'
                }`}
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


// =======================
// Main Component
// =======================
const ApplicationsForAdmin = () => {
  // ---------- State ----------
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: () => {},
    confirmButtonClass: '',
    successTitle: '',
    successMessage: '',
  });

  const { getApplications, updateApplicationStatus } = useAuth();

  const fetchApplications = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const data = await getApplications();
      const formattedData = data.map((app) => ({
        ...app,
        text: app.message,
        status: app.status === 'pending' ? 'in progress' : app.status,
      }));
      setApplications(formattedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getApplications]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        if (statusFilter === 'all') return true;
        return app.status === statusFilter;
      })
      .filter((app) => {
        if (!searchTerm) return true;
        return (
          app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (app.text && app.text.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
  }, [applications, searchTerm, statusFilter]);

  const closeModal = useCallback(() => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleUpdateStatus = (id, newStatus, email) => {
    const isApproving = newStatus === 'approved';
    const actionText = isApproving ? 'approve' : 'deny';
    const actionPastTense = isApproving ? 'approved' : 'denied';

    const performUpdate = async () => {
      try {
        await updateApplicationStatus(id, newStatus, email);
        setApplications((apps) =>
          apps.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );
      } catch (err) {
        console.error(`Failed to ${actionText} application:`, err);
        throw err;
      }
    };

    setModalConfig({
      isOpen: true,
      title: `Confirm Action: ${isApproving ? 'Approve' : 'Deny'}`,
      message: `Are you sure you want to ${actionText} this application for ${email}? This action cannot be undone.`,
      onConfirm: performUpdate,
      confirmText: isApproving ? 'Approve' : 'Deny',
      confirmButtonClass: isApproving
        ? 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-500'
        : 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500',
      successTitle: `Application ${actionPastTense}`,
      successMessage: `The application for ${email} has been successfully ${actionPastTense}.`,
    });
  };

  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 5);
  };
  
  // ✨ ЗМІНА: Додано `year: 'numeric'` до форматування дати
  const formatApplicationDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const baseButtonClasses =
    'py-1 px-3 rounded-md text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900';
  const approveButtonClasses =
    'border-green-600/50 text-green-700 hover:bg-green-50 dark:border-green-500/50 dark:text-green-400 dark:hover:bg-green-500/10 focus-visible:ring-green-400';
  const denyButtonClasses =
    'border-red-600/50 text-red-700 hover:bg-red-50 dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-500/10 focus-visible:ring-red-400';
  const inputClasses =
    'flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900';

  if (loading)
    return (
      <div className="p-4 text-center text-slate-500 dark:text-slate-400">
        Loading applications... ⏳
      </div>
    );
  if (error)
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Applications
        </h1>
        <div className="flex items-center gap-4 flex-wrap">
          {/* ✨ ЗМІНА: Збільшено ширину контейнера для dropdown */}
          <div className="w-full sm:w-48">
             <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={inputClasses}
              >
                <option value="all">All Statuses</option>
                <option value="in progress">In Progress</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
              </select>
          </div>
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by email or text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>
      </div>
      
      {filteredApplications.length === 0 ? (
        <div className="text-center p-8 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900/70">
          <p className="text-slate-500 dark:text-slate-400">
            {searchTerm || statusFilter !== 'all'
              ? `No applications found for the selected filters.`
              : 'There are no new applications.'}
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-auto">
              <thead className="text-slate-500 dark:text-slate-400">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-medium text-left">Email</th>
                  <th className="p-4 font-medium text-left">Application Text</th>
                  <th className="p-4 font-medium text-left">Date</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-800 dark:text-slate-200">
                {filteredApplications.slice(0, visibleCount).map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="p-4 text-left align-top">
                      <span className="font-medium text-slate-900 dark:text-slate-50 break-all">
                        <Highlight text={app.email} highlight={searchTerm} />
                      </span>
                    </td>
                    <td className="p-4 text-left align-top max-w-md">
                      <p className="text-slate-600 dark:text-slate-400 break-words">
                        <Highlight text={app.text} highlight={searchTerm} />
                      </p>
                    </td>
                    <td className="p-4 text-left align-top text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatApplicationDate(app.created_at)}
                    </td>
                    <td className="p-4 text-center align-top">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="p-4 text-center align-top">
                      {app.status === 'in progress' && (
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdateStatus(app.id, 'approved', app.email)
                            }
                            className={`${baseButtonClasses} ${approveButtonClasses}`}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(app.id, 'denied', app.email)
                            }
                            className={`${baseButtonClasses} ${denyButtonClasses}`}
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
          {visibleCount < filteredApplications.length && (
            <div className="p-4 text-center border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleShowMore}
                className="py-2 px-4 text-sm font-medium rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Show More (
                {Math.min(5, filteredApplications.length - visibleCount)} more)
              </button>
            </div>
          )}
        </div>
      )}
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
        <p>{modalConfig.message}</p>
      </Modal>
    </div>
  );
};

export default ApplicationsForAdmin;