// src/AdminComponents/Layout/MetaDataManagement.jsx

// ! React & Core Hooks
import React, {
  useState,
  useMemo,
  useEffect,
  useContext,
  useCallback,
} from 'react';

// ! Lucide Icons
import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

// ! Local Imports (Context & Auth)
// import { supabase } from '../../lib/supabaseClient'; // ВИДАЛЕНО: Прямий імпорт Supabase
import { DataRefreshContext } from './AdminLayout';
import { useAuth } from '../../hooks/useAuth';

// ========================================================================== //
// ! HELPER COMPONENT: Highlight
// ========================================================================== //

/**
 * ? Highlight
 * A component to highlight search terms within a string of text.
 */
const Highlight = ({ text, highlight }) => {
  if (!highlight?.trim() || !text) return <span>{text}</span>;
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  try {
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = String(text).split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          part && part.toLowerCase() === highlight.toLowerCase() ? (
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
  } catch (e) {
    console.error('Highlight regex error:', e);
    return <span>{text}</span>;
  }
};

// ========================================================================== //
// ! HELPER COMPONENT: SkeletonCard
// ========================================================================== //

/**
 * ? SkeletonCard
 * A placeholder card shown while data is loading.
 */
const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl p-4 min-h-[300px] animate-pulse">
    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full mb-4"></div>
    <div className="space-y-2 p-2">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
    </div>
  </div>
);


// ========================================================================== //
// ! HELPER COMPONENT: DataTable
// ========================================================================== //

/**
 * ? DataTable
 * A reusable card component that displays a searchable, paginated list of items
 * with add, edit, and delete functionality. Used for Content Types, Categories, Crafts.
 */
const DataTable = ({ title, data, onAdd, onEdit, onDelete, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(10); // * "Show More" pagination state

  // * Memoized search filtering
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  // * Reset pagination when search term changes
  useEffect(() => {
    setVisibleCount(10);
  }, [searchTerm]);

  // * Memoized slice for "Show More" pagination
  const dataToDisplay = useMemo(() => {
    return filteredData.slice(0, visibleCount);
  }, [filteredData, visibleCount]);

  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 10);
  };

  return (
    <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl flex flex-col min-h-[300px]">
      {/* Card Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          {title}
        </h2>
        <button
          onClick={onAdd}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 rounded-md hover:bg-slate-700 dark:hover:bg-slate-300 transition-colors w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search in ${title}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
            className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent pl-9 pr-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Item List */}
      <div className="p-2 overflow-y-auto flex-1">
        {isLoading ? (
          <SkeletonCard />
        ) : dataToDisplay.length > 0 ? (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {dataToDisplay.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  <Highlight text={item.name} highlight={searchTerm} />
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    aria-label="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className="p-1.5 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
            {searchTerm ? `No results for "${searchTerm}"` : 'No items found.'}
          </p>
        )}
      </div>

      {/* Show More Button */}
      {!isLoading && filteredData.length > visibleCount && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
          <button
            onClick={handleShowMore}
            className="w-full px-4 py-2 text-sm font-semibold rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            Show More ({visibleCount} / {filteredData.length})
          </button>
        </div>
      )}
    </div>
  );
};


// ========================================================================== //
// ! MAIN COMPONENT: MetaDataManagement
// ========================================================================== //

const MetaDataManagement = () => {
  // ! State
  // * Data State
  const [contentTypes, setContentTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [crafts, setCrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added submitting state

  // * Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentTable, setCurrentTable] = useState(null); // 'Content Types', 'Categories', 'Crafts'
  const [currentItem, setCurrentItem] = useState(null); // The item being edited/deleted
  const [newItemName, setNewItemName] = useState(''); // Input value for Add/Edit modal
  const [modalError, setModalError] = useState(''); // Error message for modals

  // ! Context & Auth
  const { refreshKey } = useContext(DataRefreshContext); // * Used to trigger re-fetch on manual refresh
  const { session } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL; // Отримання базового URL

  // * A map to easily access state setters and table names
  const dataMap = useMemo(
    () => ({
      'Content Types': {
        data: contentTypes,
        setData: setContentTypes,
        // Використовуємо routeBase, як визначено в backend/server.js
        routeBase: 'content-types', 
      },
      Categories: {
        data: categories,
        setData: setCategories,
        routeBase: 'categories',
      },
      Crafts: { 
        data: crafts, 
        setData: setCrafts, 
        routeBase: 'crafts' 
      },
    }),
    [contentTypes, categories, crafts]
  ); 

  // ! Effect: Data Fetching (ОНОВЛЕНО: використовує бек-енд)
  useEffect(() => {
    const fetchAllData = async () => {
      // Перевіряємо сесію ПЕРЕД запитом
      if (!session?.access_token) { 
        console.warn('MetaDataManagement: No session token, skipping data fetch.');
        setLoading(false);
        setContentTypes([]); setCategories([]); setCrafts([]);
        setModalError("Please log in to view this page.");
        return;
      }
      const token = session.access_token;
      const headers = { Authorization: `Bearer ${token}` };

      setLoading(true);
      setModalError(''); // Скидаємо помилку сторінки

      const routeBases = ['content-types', 'categories', 'crafts'];
      const setters = [setContentTypes, setCategories, setCrafts];

      try {
        // Використовуємо Promise.allSettled для надійності
        const results = await Promise.allSettled(
          routeBases.map(route => fetch(`${API_BASE_URL}/${route}`, { headers }))
        );

        let fetchErrorOccurred = false;
        
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const route = routeBases[i];
            const setter = setters[i];

            if (result.status === 'fulfilled') {
                const response = result.value;
                if (!response.ok) {
                    console.error(`Failed to fetch ${route}: ${response.status}`);
                    fetchErrorOccurred = true;
                } else {
                    const data = await response.json();
                    setter(data || []);
                }
            } else {
                 console.error(`Request rejected for ${route}:`, result.reason);
                 fetchErrorOccurred = true;
                 setter([]); 
            }
        }

        if (fetchErrorOccurred) {
            setModalError('Failed to load some metadata. Please try refreshing.');
        }

      } catch (error) {
        console.error('Critical error fetching metadata via backend:', error);
        setModalError(`Critical error: ${error.message}`);
        setContentTypes([]); setCategories([]); setCrafts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [refreshKey, session, API_BASE_URL]);

  // ! Modal Handlers
  const openEditModal = useCallback((table, mode, item = null) => {
    setCurrentTable(table);
    setModalMode(mode);
    setModalError('');
    if (mode === 'edit' && item) {
      setCurrentItem(item);
      setNewItemName(item.name);
    } else {
      setCurrentItem(null);
      setNewItemName('');
    }
    setIsEditModalOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setTimeout(() => {
      setCurrentTable(null);
      setCurrentItem(null);
      setNewItemName('');
      setModalError('');
      setIsSubmitting(false); 
    }, 300);
  }, []);

  const openDeleteModal = useCallback((table, item) => {
    setCurrentTable(table);
    setCurrentItem(item);
    setModalError('');
    setIsDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setTimeout(() => {
      setCurrentTable(null);
      setCurrentItem(null);
      setModalError('');
      setIsSubmitting(false); 
    }, 300);
  }, []);

  // ! API Handlers (ОНОВЛЕНО: використовує бек-енд)
  const handleSave = async () => {
    if (!newItemName.trim() || !currentTable) return;

    const tableConfig = dataMap[currentTable];
    if (!tableConfig) {
        setModalError("Invalid table configuration.");
        return;
    }
    
    const { data: currentData, setData, routeBase } = tableConfig;
    const trimmedName = newItemName.trim();

    setIsSubmitting(true);
    setModalError('');

    const token = session?.access_token;
    if (!token) {
        setModalError("Authentication error. Please log in again.");
        setIsSubmitting(false);
        return;
    }
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };


    try {
      // 1. Клієнтська перевірка на дублікат
      const existingItem = currentData.find(
        (item) =>
          item.name.toLowerCase() === trimmedName.toLowerCase() &&
          (!currentItem || item.id !== currentItem.id)
      );
      if (existingItem) {
        throw new Error(`An item named "${trimmedName}" already exists.`);
      }

      // 2. Виконання запиту через бек-енд
      let url = '';
      let method = '';
      let payload = { name: trimmedName };

      if (modalMode === 'add') {
          method = 'POST';
          url = `${API_BASE_URL}/${routeBase}`;
      } else if (modalMode === 'edit' && currentItem) {
          method = 'PUT';
          url = `${API_BASE_URL}/${routeBase}/${currentItem.id}`;
      } else {
           throw new Error("Invalid operation state.");
      }

      const response = await fetch(url, { method, headers, body: JSON.stringify(payload) });

      if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
          // Бекенд повертає 409 при дублікаті
          if (response.status === 409) {
               throw new Error(errorData.error || `Item named "${trimmedName}" already exists.`);
          }
          throw new Error(errorData.error || `Failed to ${modalMode === 'add' ? 'add' : 'update'} item.`);
      }

      const resultData = await response.json();

      // 3. Оновлення локального стану
      if (modalMode === 'add') {
        setData((prevData) => [resultData, ...prevData]);
      } else {
        setData((prevData) =>
          prevData.map((item) => (item.id === currentItem.id ? resultData : item))
        );
      }
      closeEditModal();
      
    } catch (error) {
      console.error('Error saving item via backend:', error);
      setModalError(`${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentItem || !currentTable) return;

    const tableConfig = dataMap[currentTable];
    if (!tableConfig) {
        setModalError("Invalid table configuration for delete.");
        return;
    }
    const { setData, routeBase } = tableConfig;

    const token = session?.access_token;
    if (!token) {
        setModalError("Authentication error. Please log in again.");
        setIsSubmitting(false);
        return;
    }

    setIsSubmitting(true);
    setModalError('');
    const url = `${API_BASE_URL}/${routeBase}/${currentItem.id}`;

    try {
      // 1. Виконання запиту через бек-енд
      const response = await fetch(url, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

      // Бекенд повертає 200/204 при успіху
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
        throw new Error(errorData.error || 'Failed to delete item.');
      }
      
      // 2. Оновлення локального стану
      setData((prevData) =>
        prevData.filter((item) => item.id !== currentItem.id)
      );
      closeDeleteModal();
      
    } catch (error) {
      console.error('Error deleting item via backend:', error);
      setModalError(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ! Styles
  const inputClasses =
    'flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 disabled:opacity-50';

  // ! Render
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
        Metadata Management
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6 -mt-4">
        Manage content types, categories, and crafts for reels. (Admin only)
      </p>

      {/* --- Error Message Display --- */}
      {modalError && !loading && !isEditModalOpen && !isDeleteModalOpen && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{modalError}</span>
        </div>
      )}

      {/* --- Data Tables --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start">
        <DataTable
          title="Content Types"
          data={contentTypes}
          isLoading={loading}
          onAdd={() => openEditModal('Content Types', 'add')}
          onEdit={(item) => openEditModal('Content Types', 'edit', item)}
          onDelete={(item) => openDeleteModal('Content Types', item)}
        />
        <DataTable
          title="Categories"
          data={categories}
          isLoading={loading}
          onAdd={() => openEditModal('Categories', 'add')}
          onEdit={(item) => openEditModal('Categories', 'edit', item)}
          onDelete={(item) => openDeleteModal('Categories', item)}
        />
        <DataTable
          title="Crafts"
          data={crafts}
          isLoading={loading}
          onAdd={() => openEditModal('Crafts', 'add')}
          onEdit={(item) => openEditModal('Crafts', 'edit', item)}
          onDelete={(item) => openDeleteModal('Crafts', item)}
        />
      </div>

      {/* --- Add/Edit Modal --- */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onMouseDown={closeEditModal} // * Close on backdrop click
        >
          <div
            className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4"
            onMouseDown={(e) => e.stopPropagation()} // * Prevent closing when clicking inside modal
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {modalMode === 'add' ? 'Add' : 'Edit'}{' '}
                  {currentTable?.replace(/s$/, '')} {/* * Singularize title */}
                </h3>
                <button
                  onClick={closeEditModal}
                  disabled={isSubmitting} // Disable close button while submitting
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 -mt-1 -mr-1 disabled:opacity-50"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div>
                <label
                  htmlFor="itemName"
                  className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Name
                </label>
                <input
                  id="itemName"
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()} // * Save on Enter
                  className={inputClasses}
                  autoFocus // * Focus input on open
                  disabled={isSubmitting} // Disable input while submitting
                  required
                />
                {modalError && (
                  <p className="text-sm text-red-500 mt-2">{modalError}</p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={isSubmitting} // Disable cancel while submitting
                  className="px-4 py-2 text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSubmitting || !newItemName.trim()} // Disable save if submitting or name is empty
                  className="px-4 py-2 text-sm font-semibold rounded-md bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-300 disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : null}
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Delete Confirmation Modal --- */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onMouseDown={closeDeleteModal} // * Close on backdrop click
        >
          <div
            className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4"
            onMouseDown={(e) => e.stopPropagation()} // * Prevent closing when clicking inside modal
          >
            <div className="p-6">
              <div className="flex items-start">
                {/* Icon */}
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/40 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle
                    className="h-6 w-6 text-red-600 dark:text-red-400"
                    aria-hidden="true"
                  />
                </div>
                {/* Text Content */}
                <div className="ml-4 text-left">
                  <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-slate-50">
                    Delete Item
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Are you sure you want to delete{' '}
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        "{currentItem?.name}"
                      </span>
                      ? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              {/* Display error message if delete failed */}
              {modalError && (
                <p className="text-sm text-red-500 mt-4 text-center">
                  {modalError}
                </p>
              )}
              {/* Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={isSubmitting} // Disable cancel while submitting
                  className="px-4 py-2 text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isSubmitting} // Disable delete while submitting
                  className="px-4 py-2 text-sm font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center min-w-[90px]"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : null}
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaDataManagement;