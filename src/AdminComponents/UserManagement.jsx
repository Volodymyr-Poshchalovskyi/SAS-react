// src/AdminComponents/UserManagement.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Loader2, CheckCircle, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

// =======================
// Modal Component (No changes)
// =======================
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
// Status Badge Component (No changes)
// =======================
const StatusBadge = ({ status }) => {
  const baseClasses =
    'inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium capitalize';
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

// =======================
// Main Component
// =======================
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'registered_at', direction: 'desc' });

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: () => {},
    confirmButtonClass: '',
    showCancelButton: true,
    successTitle: '',
    successMessage: '',
  });

  const { getUsers, updateUserStatus } = useAuth();

  const closeModal = useCallback(() => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const data = await getUsers();
      const formattedData = data.map((user) => ({
        ...user,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        state: user.status,
        registered_at: user.created_at,
      }));
      setUsers(formattedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredAndSortedUsers = useMemo(() => {
    let sortableUsers = [...users];

    // 1. Фільтрація за статусом
    if (statusFilter !== 'all') {
      sortableUsers = sortableUsers.filter(user => user.state === statusFilter);
    }
    
    // 2. Фільтрація за пошуковим терміном
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        sortableUsers = sortableUsers.filter(
            (user) =>
            user.firstName.toLowerCase().includes(term) ||
            user.lastName.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            (user.phone && user.phone.toLowerCase().includes(term)) ||
            (user.location && user.location.toLowerCase().includes(term)) ||
            user.state.toLowerCase().includes(term)
        );
    }
    
    // 3. Сортування
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        const dateA = new Date(a[sortConfig.key]);
        const dateB = new Date(b[sortConfig.key]);
        if (sortConfig.direction === 'asc') {
          return dateA - dateB;
        }
        return dateB - dateA;
      });
    }

    return sortableUsers;
  }, [users, searchTerm, statusFilter, sortConfig]);

  const handleUpdateStatus = (id, newStatus) => {
    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    const isDeactivation = action === 'deactivate';
    const userToUpdate = users.find((u) => u.id === id);
    if (!userToUpdate) return;

    const performUpdate = async () => {
      try {
        await updateUserStatus(id, newStatus);
        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.id === id ? { ...user, state: newStatus } : user
          )
        );
      } catch (err) {
        console.error(`Failed to ${action} user:`, err);
        throw err;
      }
    };
    
    setModalConfig({
      isOpen: true,
      title: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `Are you sure you want to ${action} the user "${userToUpdate.firstName} ${userToUpdate.lastName}"?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      onConfirm: performUpdate,
      showCancelButton: true,
      confirmButtonClass: isDeactivation
        ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500'
        : 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-500',
      successTitle: `User ${action}d`,
      successMessage: `User "${userToUpdate.firstName} ${userToUpdate.lastName}" has been successfully ${action}d.`
    });
  };

  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 5);
  };
  
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
        key,
        direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const formatDateTime = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  const baseButtonClasses =
    'py-1 px-3 rounded-md text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900';
  const activateButtonClasses =
    'border-green-600/50 text-green-700 hover:bg-green-50 dark:border-green-500/50 dark:text-green-400 dark:hover:bg-green-500/10 focus-visible:ring-green-400';
  const deactivateButtonClasses =
    'border-red-600/50 text-red-700 hover:bg-red-50 dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-500/10 focus-visible:ring-red-400';
  const inputClasses =
    'flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900';

  if (loading)
    return (
      <div className="p-4 text-center text-slate-500 dark:text-slate-400">
        Loading users... ⏳
      </div>
    );
  if (error)
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
        showCancelButton={modalConfig.showCancelButton}
        confirmButtonClass={modalConfig.confirmButtonClass}
        successTitle={modalConfig.successTitle}
        successMessage={modalConfig.successMessage}
      >
        <p>{modalConfig.message}</p>
      </Modal>

      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          User Management
        </h1>
        <div className="flex items-center gap-4 flex-wrap">
           <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={inputClasses}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="deactivated">Deactivated</option>
                <option value="pending">Pending</option>
              </select>
          </div>
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>
      </div>

      {filteredAndSortedUsers.length === 0 ? (
        <div className="text-center p-8 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900/70">
          <p className="text-slate-500 dark:text-slate-400">
            {searchTerm || statusFilter !== 'all'
              ? `No users found for the selected filters.`
              : 'There are no registered users.'}
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-500 dark:text-slate-400">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-medium text-left">User</th>
                  <th className="p-4 font-medium text-left">Contact Information</th>
                  <th className="p-4 font-medium text-left">Location</th>
                  {/* ✨ ЗМІНА: Порядок колонок змінено */}
                  <th className="p-4 font-medium text-left">
                    <button onClick={() => handleSort('registered_at')} className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200">
                        Registration Date
                        {sortConfig.key === 'registered_at' && (
                            sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                    </button>
                  </th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAndSortedUsers.slice(0, visibleCount).map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="p-4 text-left font-medium text-slate-900 dark:text-slate-50 whitespace-nowrap">
                      <Highlight
                        text={`${user.firstName} ${user.lastName}`}
                        highlight={searchTerm}
                      />
                    </td>
                    <td className="p-4 text-left">
                      <div><Highlight text={user.email} highlight={searchTerm} /></div>
                      <div className="text-slate-500 dark:text-slate-400">
                        <Highlight text={user.phone} highlight={searchTerm} />
                      </div>
                    </td>
                    <td className="p-4 text-left text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      <Highlight text={user.location} highlight={searchTerm} />
                    </td>
                    {/* ✨ ЗМІНА: Порядок колонок змінено */}
                    <td className="p-4 text-left text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatDateTime(user.registered_at)}
                    </td>
                    <td className="p-4 text-center">
                      <StatusBadge status={user.state} />
                    </td>
                    <td className="p-4 text-center">
                      {user.state === 'active' ? (
                        <button
                          onClick={() => handleUpdateStatus(user.id, 'deactivated')}
                          className={`${baseButtonClasses} ${deactivateButtonClasses}`}
                        >
                          Deactivate
                        </button>
                      ) : user.state === 'deactivated' ? (
                        <button
                          onClick={() => handleUpdateStatus(user.id, 'active')}
                          className={`${baseButtonClasses} ${activateButtonClasses}`}
                        >
                          Activate
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visibleCount < filteredAndSortedUsers.length && (
            <div className="p-4 text-center border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleShowMore}
                className="py-2 px-4 text-sm font-medium rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Show More ({Math.min(5, filteredAndSortedUsers.length - visibleCount)}{' '}
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