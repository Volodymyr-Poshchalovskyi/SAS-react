// src/AdminComponents/ApplicationsForAdmin.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';

// =======================
// Status Badge Component
// =======================
const StatusBadge = ({ status }) => {
  // ... (цей компонент залишається без змін)
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
// Highlight Component
// =======================
const Highlight = ({ text, highlight }) => {
  // ... (цей компонент залишається без змін)
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
// ✨ NEW: Confirmation Modal Component
// ===================================
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Confirm',
  confirmVariant = 'default',
}) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const baseButtonClasses =
    'inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 transition-colors';
  const variantClasses = {
    approve: `${baseButtonClasses} bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500`,
    deny: `${baseButtonClasses} bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500`,
    default: `${baseButtonClasses} bg-slate-600 text-white hover:bg-slate-700 focus-visible:ring-slate-500`,
  };
  const confirmButtonClasses =
    variantClasses[confirmVariant] || variantClasses.default;
  const cancelButtonClasses = `${baseButtonClasses} bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800`;

  return (
    <div
      className="relative z-50"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-in-out" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 text-left align-middle shadow-xl transition-all duration-300 ease-in-out">
            <div className="p-6">
              <h3
                className="text-lg font-medium leading-6 text-slate-900 dark:text-slate-50"
                id="modal-title"
              >
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {children}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
              <button
                type="button"
                className={confirmButtonClasses}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
              <button
                type="button"
                className={cancelButtonClasses}
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
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

  // --- ✨ NEW: State for managing the modal ---
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    confirmVariant: 'default',
  });

  const { getApplications, updateApplicationStatus } = useAuth();

  // ---------- Fetch Applications ----------
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

  // ---------- Filtered Applications ----------
  const filteredApplications = useMemo(() => {
    if (!searchTerm) return applications;
    return applications.filter(
      (app) =>
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.text && app.text.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [applications, searchTerm]);

  // ---------- Handlers ----------
  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  // --- ✨ NEW: Function to execute the update after confirmation ---
  const executeStatusUpdate = async (id, newStatus, email) => {
    try {
      await updateApplicationStatus(id, newStatus, email);
      setApplications((apps) =>
        apps.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      // Show error in a modal instead of an alert
      setModalConfig({
        isOpen: true,
        title: 'An Error Occurred',
        message: err.message,
        confirmText: 'OK',
        confirmVariant: 'deny',
        onConfirm: closeModal, // Just close the modal on OK
      });
    } finally {
      closeModal();
    }
  };

  // --- ✨ MODIFIED: This function now just opens the modal ---
  const handleUpdateStatus = (id, newStatus, email) => {
    const isApproving = newStatus === 'approved';
    setModalConfig({
      isOpen: true,
      title: `Confirm Action: ${isApproving ? 'Approve' : 'Deny'}`,
      message: `Are you sure you want to ${newStatus} this application for ${email}? This action cannot be undone.`,
      onConfirm: () => executeStatusUpdate(id, newStatus, email),
      confirmText: isApproving ? 'Approve' : 'Deny',
      confirmVariant: isApproving ? 'approve' : 'deny',
    });
  };

  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 5);
  };

  // ---------- Styles ----------
  const baseButtonClasses =
    'py-1 px-3 rounded-md text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900';
  const approveButtonClasses =
    'border-green-600/50 text-green-700 hover:bg-green-50 dark:border-green-500/50 dark:text-green-400 dark:hover:bg-green-500/10 focus-visible:ring-green-400';
  const denyButtonClasses =
    'border-red-600/50 text-red-700 hover:bg-red-50 dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-500/10 focus-visible:ring-red-400';
  const inputClasses =
    'flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900';

  // ---------- Loading / Error States ----------
  if (loading)
    return (
      <div className="p-4 text-center text-slate-500 dark:text-slate-400">
        Loading applications... ⏳
      </div>
    );
  if (error)
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  // ---------- Render ----------
  return (
    <div className="max-w-7xl mx-auto">
      {/* ... (Header and table JSX remains the same) ... */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Applications
        </h1>
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
      {/* ... */}
      {filteredApplications.length === 0 ? (
        <div className="text-center p-8 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900/70">
          <p className="text-slate-500 dark:text-slate-400">
            {searchTerm
              ? `No applications found for "${searchTerm}"`
              : 'There are no new applications.'}
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
          {/* ---- Table ---- */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-auto">
              {/* Table Head */}
              <thead className="text-slate-500 dark:text-slate-400">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-medium text-left">Email</th>
                  <th className="p-4 font-medium text-left">Application Text</th>
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
          {/* ---- Show More Button ---- */}
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

      {/* --- ✨ NEW: Render the modal here --- */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        confirmText={modalConfig.confirmText}
        confirmVariant={modalConfig.confirmVariant}
      >
        {modalConfig.message}
      </ConfirmationModal>
    </div>
  );
};

export default ApplicationsForAdmin;