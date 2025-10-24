// src/AdminComponents/Layout/MetaDataManagement.jsx

// ! React & Core Hooks
import React, { useState, useMemo, useEffect, useContext } from 'react';

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

// ! Local Imports (Supabase & Context)
import { supabase } from '../../lib/supabaseClient';
import { DataRefreshContext } from './AdminLayout'; // * Context for triggering manual data refresh
import { useAuth } from '../../hooks/useAuth';
// NOTE: No need to import useAuth here unless specifically needed for user ID/role checks
// The Supabase client handles authentication automatically based on the logged-in user state from AuthContext.

// ========================================================================== //
// ! HELPER COMPONENT: Highlight
// ========================================================================== //

/**
 * ? Highlight
 * A component to highlight search terms within a string of text.
 */
const Highlight = ({ text, highlight }) => {
  if (!highlight?.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${highlight})`, 'gi');
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
// ! HELPER COMPONENT: DataTable
// ========================================================================== //

/**
 * ? DataTable
 * A reusable card component that displays a searchable, paginated list of items
 * with add, edit, and delete functionality. Used for Content Types, Categories, Crafts.
 */
const DataTable = ({ title, data, onAdd, onEdit, onDelete }) => {
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
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 rounded-md hover:bg-slate-700 dark:hover:bg-slate-300 transition-colors w-full sm:w-auto justify-center"
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
            className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent pl-9 pr-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500"
          />
        </div>
      </div>

      {/* Item List */}
      <div className="p-2 overflow-y-auto flex-1">
        {dataToDisplay.length > 0 ? (
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
      {filteredData.length > visibleCount && (
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

  // ! Context
  const { refreshKey } = useContext(DataRefreshContext); // * Used to trigger re-fetch on manual refresh
  const { session } = useAuth();

  // * A map to easily access state setters and table names
  const dataMap = {
    'Content Types': {
      data: contentTypes,
      setData: setContentTypes,
      tableName: 'content_types',
    },
    Categories: {
      data: categories,
      setData: setCategories,
      tableName: 'categories',
    },
    Crafts: { data: crafts, setData: setCrafts, tableName: 'crafts' },
  };

  // ! Effect: Data Fetching
  // * Fetches all metadata types on initial mount and on manual refresh (via refreshKey)

  useEffect(() => {
    const fetchAllData = async () => {
      // * Чекаємо на сесію, перш ніж робити запит
      if (!session) {
        setLoading(false); // Якщо сесії немає, не завантажуємо
        return;
      }

      setLoading(true); // Сесія є, починаємо завантаження
      try {
        // --- ОСЬ ЦЕЙ КОД БУЛО ВТРАЧЕНО ---
        const [typesRes, categoriesRes, craftsRes] = await Promise.all([
          supabase
            .from('content_types')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('categories')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('crafts')
            .select('*')
            .order('created_at', { ascending: false }),
        ]);

        // * Обробка помилок для кожного запиту
        if (typesRes.error) throw typesRes.error;
        if (categoriesRes.error) throw categoriesRes.error;
        if (craftsRes.error) throw craftsRes.error;

        // * Оновлення стану даними
        setContentTypes(typesRes.data);
        setCategories(categoriesRes.data);
        setCrafts(craftsRes.data);
        // --- КІНЕЦЬ ВТРАЧЕНОГО КОДУ ---
      } catch (error) {
        console.error('Error fetching metadata:', error);
       
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [refreshKey, session]); // * Залежність від refreshKey та session// * Dependency on refreshKey triggers re-fetch

  // ! Modal Handlers
  /**
   * Opens the Add/Edit modal.
   * @param {string} table - The name of the table ('Content Types', 'Categories', 'Crafts').
   * @param {string} mode - 'add' or 'edit'.
   * @param {object|null} item - The item to edit (null if adding).
   */
  const openEditModal = (table, mode, item = null) => {
    setCurrentTable(table);
    setModalMode(mode);
    setModalError(''); // Clear previous errors
    if (mode === 'edit' && item) {
      setCurrentItem(item);
      setNewItemName(item.name); // * Pre-fill input with current name
    } else {
      setCurrentItem(null);
      setNewItemName(''); // * Clear input for adding
    }
    setIsEditModalOpen(true);
  };

  /**
   * Closes the Add/Edit modal and resets related state.
   */
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    // * Reset state after a short delay to allow modal fade-out
    setTimeout(() => {
      setCurrentTable(null);
      setCurrentItem(null);
      setNewItemName('');
      setModalError('');
    }, 300); // * Adjust delay as needed
  };

  /**
   * Opens the Delete confirmation modal.
   * @param {string} table - The name of the table.
   * @param {object} item - The item to be deleted.
   */
  const openDeleteModal = (table, item) => {
    setCurrentTable(table);
    setCurrentItem(item);
    setModalError(''); // Clear previous errors
    setIsDeleteModalOpen(true);
  };

  /**
   * Closes the Delete confirmation modal.
   */
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    // * Reset state after a short delay
    setTimeout(() => {
      setCurrentTable(null);
      setCurrentItem(null);
      setModalError('');
    }, 300);
  };

  // ! API Handlers
  /**
   * Handles saving a new or edited item via Supabase.
   */
  const handleSave = async () => {
    if (!newItemName.trim() || !currentTable) return;

    // *** ЗМІНА: Отримуємо 'data' і перейменовуємо на 'currentData' ***
    const { data: currentData, setData, tableName } = dataMap[currentTable];
    const trimmedName = newItemName.trim();

    setIsSubmitting(true);
    setModalError(''); // Clear previous error

    try {
      // NOTE: Supabase client automatically includes the user's token if logged in.
      // Ensure RLS policies are set up in Supabase to allow authenticated users
      // to insert/update these tables.
      if (modalMode === 'add') {
        // * --- START: DUPLICATE CHECK (ADD) ---
        // *** ЗМІНА: Перевіряємо, чи існує елемент з такою ж назвою (без урахування регістру) ***
        const existingItem = currentData.find(
          (item) => item.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (existingItem) {
          setModalError(`An item named "${trimmedName}" already exists.`);
          setIsSubmitting(false);
          return; // Зупиняємо виконання
        }
        // * --- END: DUPLICATE CHECK ---

        // * --- ADD LOGIC ---
        const { data, error } = await supabase
          .from(tableName)
          .insert({ name: trimmedName }) // *** ЗМІНА: Використовуємо trimmedName ***
          .select() // * Return the newly created record
          .single(); // * Expecting a single record back
        if (error) throw error;
        setData((prevData) => [data, ...prevData]); // * Add new item to the beginning of the list
      } else if (modalMode === 'edit' && currentItem) {
        // * --- START: DUPLICATE CHECK (EDIT) ---
        // *** ЗМІНА: Перевіряємо, чи існує ІНШИЙ елемент з такою ж назвою ***
        const existingItem = currentData.find(
          (item) =>
            item.name.toLowerCase() === trimmedName.toLowerCase() &&
            item.id !== currentItem.id // <-- Важливо: виключаємо поточний елемент
        );
        if (existingItem) {
          setModalError(`Another item named "${trimmedName}" already exists.`);
          setIsSubmitting(false);
          return; // Зупиняємо виконання
        }
        // * --- END: DUPLICATE CHECK ---

        // * --- EDIT LOGIC ---
        const { data, error } = await supabase
          .from(tableName)
          .update({ name: trimmedName }) // *** ЗМІНА: Використовуємо trimmedName ***
          .eq('id', currentItem.id)
          .select()
          .single();
        if (error) throw error;
        // * Update the item in the local state array
        setData((prevData) =>
          prevData.map((item) => (item.id === currentItem.id ? data : item))
        );
      }
      closeEditModal(); // * Close modal on success
    } catch (error) {
      console.error('Error saving item:', error);
      // *** ЗМІНА: Обробка помилки унікальності з бази даних ***
      if (error.code === '23505') {
        // 23505 - код помилки унікальності Postgres
        setModalError(
          `An item named "${trimmedName}" already exists (database error).`
        );
      } else {
        setModalError(`Error: ${error.message}`); // Set error message for the modal
      }
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  /**
   * Handles confirming the deletion of an item via Supabase.
   */
  const handleDeleteConfirm = async () => {
    if (!currentItem || !currentTable) return;
    const { setData, tableName } = dataMap[currentTable];

    setIsSubmitting(true);
    setModalError(''); // Clear previous error

    try {
      // NOTE: Supabase client automatically includes the user's token if logged in.
      // Ensure RLS policies are set up in Supabase to allow authenticated users
      // to delete from these tables.
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', currentItem.id); // * Delete based on the item's ID
      if (error) throw error;
      // * Remove the item from the local state array
      setData((prevData) =>
        prevData.filter((item) => item.id !== currentItem.id)
      );
      closeDeleteModal(); // * Close modal on success
    } catch (error) {
      console.error('Error deleting item:', error);
      setModalError(`Error: ${error.message}`); // Set error message for the modal
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  // ! Styles
  const inputClasses =
    'flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500';

  // ! Render
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
        Metadata Management
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6 -mt-4">
        Manage content types, categories, and crafts for reels. (Admin only)
      </p>

      {loading ? (
        // * --- Loading State ---
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        // * --- Loaded State ---
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start">
          <DataTable
            title="Content Types"
            data={contentTypes}
            onAdd={() => openEditModal('Content Types', 'add')}
            onEdit={(item) => openEditModal('Content Types', 'edit', item)}
            onDelete={(item) => openDeleteModal('Content Types', item)}
          />
          <DataTable
            title="Categories"
            data={categories}
            onAdd={() => openEditModal('Categories', 'add')}
            onEdit={(item) => openEditModal('Categories', 'edit', item)}
            onDelete={(item) => openDeleteModal('Categories', item)}
          />
          <DataTable
            title="Crafts"
            data={crafts}
            onAdd={() => openEditModal('Crafts', 'add')}
            onEdit={(item) => openEditModal('Crafts', 'edit', item)}
            onDelete={(item) => openDeleteModal('Crafts', item)}
          />
        </div>
      )}

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
                />
                {modalError && (
                  <p className="text-sm text-red-500 mt-2">{modalError}</p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeEditModal}
                  disabled={isSubmitting} // Disable cancel while submitting
                  className="px-4 py-2 text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting || !newItemName.trim()} // Disable save if submitting or name is empty
                  className="px-4 py-2 text-sm font-semibold rounded-md bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-300 disabled:opacity-50 flex items-center gap-2"
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
                  className="px-4 py-2 text-sm font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
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
