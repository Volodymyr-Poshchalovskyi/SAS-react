// src/AdminComponents/Layout/Management.jsx

// ! React & Core Hooks
import React,
{
  useState,
  useMemo,
  useEffect,
  useRef,
  useContext
} from 'react';

// ! Lucide Icons
import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  AlertTriangle,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';

// ! Local Imports (Supabase & Context)
import { supabase } from '../../lib/supabaseClient';
import { DataRefreshContext } from './AdminLayout';
import { useAuth } from '../../hooks/useAuth'; // Import useAuth hook

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
 * with add, edit, and delete functionality.
 */
const DataTable = ({ title, data, onAdd, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(10); // * "Show More" pagination

  // * Memoized search filter
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
// ! MAIN COMPONENT: ManagementPage
// ========================================================================== //

const ManagementPage = () => {
  // ! State
  const [artists, setArtists] = useState([]);
  const [clients, setClients] = useState([]);
  const [celebrities, setCelebrities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // * Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentTable, setCurrentTable] = useState(null); // 'Artists', 'Clients', etc.
  const [currentItem, setCurrentItem] = useState(null); // The item being edited/deleted

  // * Form State
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // ! Refs & Context
  const fileInputRef = useRef(null);
  const { refreshKey } = useContext(DataRefreshContext); // * Get refresh trigger
  const { session } = useAuth(); // Get session from context
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // * A map to easily access state and table info by name
  const dataMap = {
    Artists: {
      data: artists,
      setData: setArtists,
      tableName: 'artists',
      hasDetails: true, // * Artists table has photo/description
    },
    Clients: {
      data: clients,
      setData: setClients,
      tableName: 'clients',
      hasDetails: false,
    },
    'Featured Celebrity': {
      data: celebrities,
      setData: setCelebrities,
      tableName: 'celebrities',
      hasDetails: false,
    },
  };

  // ! Effect: Data Fetching
  // * Fetches data on initial mount AND when 'refreshKey' changes
  useEffect(() => {
    const fetchAllData = async () => {
      console.log('Fetching management data...');
      setLoading(true);
      try {
        const [artistsRes, clientsRes, celebritiesRes] = await Promise.all([
          supabase
            .from('artists')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('celebrities')
            .select('*')
            .order('created_at', { ascending: false }),
        ]);

        if (artistsRes.error) throw artistsRes.error;
        if (clientsRes.error) throw clientsRes.error;
        if (celebritiesRes.error) throw celebritiesRes.error;

        setArtists(artistsRes.data);
        setClients(clientsRes.data);
        setCelebrities(celebritiesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [refreshKey]); // * Dependency on refreshKey

  // ! Effect: Photo Preview
  // * Creates a blob URL for a selected photo file and cleans it up
  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(objectUrl);
    // * Cleanup function
    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  // ! Modal Handlers
  /**
   * Resets all modal and form state to default.
   */
  const resetModalState = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentTable(null);
    setCurrentItem(null);
    setFormData({ name: '', description: '' });
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsSubmitting(false);
    setErrorMsg('');
  };

  /**
   * Opens the Add/Edit modal, populating it with item data if in 'edit' mode.
   */
  const openEditModal = async (table, mode, item = null) => {
    setCurrentTable(table);
    setModalMode(mode);
    const token = session?.access_token; // Get token

    if (mode === 'edit' && item) {
      setCurrentItem(item);
      setFormData({ name: item.name, description: item.description || '' });
      // * If item has a photo, fetch a signed URL to display it
      if (item.photo_gcs_path) {
          if (!token) {
              console.error("Cannot fetch photo preview: User not authenticated.");
              setPhotoPreview(null); // Or show a placeholder/error
          } else {
              try {
                  const response = await fetch(`${API_BASE_URL}/generate-read-urls`, {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}` // Add auth header
                      },
                      body: JSON.stringify({ gcsPaths: [item.photo_gcs_path] }),
                  });
                  if (!response.ok) throw new Error('Could not get photo preview.');
                  const urlMap = await response.json();
                  setPhotoPreview(urlMap[item.photo_gcs_path]);
              } catch (e) {
                  console.error('Failed to get signed URL for preview:', e);
                  setPhotoPreview(null);
              }
          }
      }
    }
    setIsEditModalOpen(true);
  };

  /**
   * Opens the Delete confirmation modal.
   */
  const openDeleteModal = (table, item) => {
    setCurrentTable(table);
    setCurrentItem(item);
    setIsDeleteModalOpen(true);
  };

  // ! API Handlers
  /**
   * Uploads a photo file to GCS via the backend.
   * @returns {Promise<string|null>} The GCS path of the uploaded file or null.
   */
  const uploadPhoto = async (file) => {
    if (!file) return null;
    const token = session?.access_token; // Get token
    if (!token) {
        throw new Error("Authentication required to upload photo.");
    }

    // * 1. Get a signed URL from the backend
    const response = await fetch(`${API_BASE_URL}/generate-upload-url`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add auth header
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        destination: 'artists', // * Specific destination for artist photos
      }),
    });
    if (!response.ok) throw new Error('Failed to get signed URL.');
    const { signedUrl, gcsPath } = await response.json();
    // * 2. Upload the file directly to GCS using the signed URL
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!uploadResponse.ok) throw new Error('Failed to upload to GCS.');
    return gcsPath;
  };

  /**
   * Handles the 'Save' button click in the Add/Edit modal.
   * Manages both 'add' and 'edit' logic.
   */
  const handleSave = async () => {
    if (!formData.name.trim() || !currentTable) return;
    setIsSubmitting(true);
    setErrorMsg('');
    
    // *** ЗМІНА: Отримуємо 'data' і перейменовуємо на 'currentData' ***
    const { data: currentData, setData, tableName, hasDetails } = dataMap[currentTable];
    const token = session?.access_token;
    const trimmedName = formData.name.trim(); // *** ЗМІНА: Використовуємо trimmedName ***

    try {
      if (modalMode === 'add') {
        // * --- START: DUPLICATE CHECK (ADD) ---
        // *** ЗМІНА: Перевіряємо, чи існує елемент з такою ж назвою (без урахування регістру) ***
        const existingItem = currentData.find(
          (item) => item.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (existingItem) {
          setErrorMsg(`An item named "${trimmedName}" already exists.`);
          setIsSubmitting(false);
          return; // Зупиняємо виконання
        }
        // * --- END: DUPLICATE CHECK ---

        // * --- ADD LOGIC ---
        let payload = { name: trimmedName }; // *** ЗМІНА: Використовуємо trimmedName ***
        if (hasDetails) {
          const photo_gcs_path = await uploadPhoto(photoFile);
          payload = {
            ...payload,
            description: formData.description.trim(),
            photo_gcs_path,
          };
        }
        // Supabase client uses service key, no need for user token here for insert
        const { data, error } = await supabase
          .from(tableName)
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setData((prev) => [data, ...prev]); // * Add to top of list
      } else if (modalMode === 'edit' && currentItem) {
        
        // * --- START: DUPLICATE CHECK (EDIT) ---
        // *** ЗМІНА: Перевіряємо, чи існує ІНШИЙ елемент з такою ж назвою ***
        const existingItem = currentData.find(
          (item) =>
            item.name.toLowerCase() === trimmedName.toLowerCase() &&
            item.id !== currentItem.id // <-- Важливо: виключаємо поточний елемент
        );
        if (existingItem) {
          setErrorMsg(`Another item named "${trimmedName}" already exists.`);
          setIsSubmitting(false);
          return; // Зупиняємо виконання
        }
        // * --- END: DUPLICATE CHECK ---

        // * --- EDIT LOGIC ---
        let payload = { name: trimmedName }; // *** ЗМІНА: Використовуємо trimmedName ***
        if (hasDetails) {
            if (!token) throw new Error("Authentication required for editing.");
          // * Artists table uses a special backend PUT route for file cleanup
          let photo_gcs_path = currentItem.photo_gcs_path;
          if (photoFile) {
            // * Upload new photo if one was selected
            photo_gcs_path = await uploadPhoto(photoFile);
          }
          payload = {
            ...payload,
            description: formData.description.trim(),
            photo_gcs_path,
          };
          const response = await fetch(
            `${API_BASE_URL}/artists/${currentItem.id}`,
            {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` // Add auth header
              },
              body: JSON.stringify(payload),
            }
          );
          if (!response.ok)
            throw new Error('Failed to update artist on server.');
          const data = await response.json();
          setData((prev) =>
            prev.map((item) => (item.id === currentItem.id ? data : item))
          );
        } else {
          // * Other tables (Clients, Celebrities) use a simple Supabase update
          // Supabase client uses service key, no need for user token here for update
          const { data, error } = await supabase
            .from(tableName)
            .update(payload) // *** ЗМІНА: payload вже містить trimmedName ***
            .eq('id', currentItem.id)
            .select()
            .single();
          if (error) throw error;
          setData((prev) =>
            prev.map((item) => (item.id === currentItem.id ? data : item))
          );
        }
      }
      resetModalState();
    } catch (error) {
      console.error('Error saving item:', error);
      // *** ЗМІНА: Обробка помилки унікальності з бази даних ***
      if (error.code === '23505') { // 23505 - код помилки унікальності Postgres
         setErrorMsg(`An item named "${trimmedName}" already exists (database error).`);
      } else {
         setErrorMsg(`Error: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles the 'Delete' confirmation click.
   */
  const handleDeleteConfirm = async () => {
    if (!currentItem || !currentTable) return;
    setIsSubmitting(true);
    const { setData, tableName, hasDetails } = dataMap[currentTable];
    const token = session?.access_token; // Get token

    try {
      if (hasDetails) {
        if (!token) throw new Error("Authentication required for deleting.");
        // * Artists use a special backend DELETE route for file cleanup
        const response = await fetch(
          `${API_BASE_URL}/artists/${currentItem.id}`,
          {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` } // Add auth header
          }
        );
        if (!response.ok) throw new Error('Failed to delete artist on server.');
      } else {
        // * Other tables use a simple Supabase delete
        // Supabase client uses service key, no need for user token here for delete
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', currentItem.id);
        if (error) throw error;
      }
      // * Remove from local state
      setData((prevData) =>
        prevData.filter((item) => item.id !== currentItem.id)
      );
      resetModalState();
    } catch (error) {
      console.error('Error deleting item:', error);
      setIsSubmitting(false);
      // * (Note: error message isn't shown here, modal just stays open)
      // * Optionally set an error message in the modal state if needed
       setErrorMsg(`Error: ${error.message}`); // Show error in modal instead of just console
    } finally {
      // Ensure submitting state is reset even if error occurs,
      // unless we want the modal to stay stuck on error.
      // Resetting allows user to retry or cancel.
       if(!isDeleteModalOpen) setIsSubmitting(false); // Only reset if modal is intended to close
    }
  };

  // ! Styles
  const inputClasses =
    'flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500';
  const textareaClasses =
    'flex min-h-[80px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500';

  // ! Render
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
        Artists / Clients / Featured Celebrity
      </h1>
      {loading ? (
        // * --- Loading Skeletons ---
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl p-4 min-h-[300px] animate-pulse"
            >
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full mb-4"></div>
              <div className="space-y-2">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // * --- Loaded Data Tables ---
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start">
          <DataTable
            title="Artists"
            data={artists}
            onAdd={() => openEditModal('Artists', 'add')}
            onEdit={(item) => openEditModal('Artists', 'edit', item)}
            onDelete={(item) => openDeleteModal('Artists', item)}
          />
          <DataTable
            title="Clients"
            data={clients}
            onAdd={() => openEditModal('Clients', 'add')}
            onEdit={(item) => openEditModal('Clients', 'edit', item)}
            onDelete={(item) => openDeleteModal('Clients', item)}
          />
          <DataTable
            title="Featured Celebrity"
            data={celebrities}
            onAdd={() => openEditModal('Featured Celebrity', 'add')}
            onEdit={(item) => openEditModal('Featured Celebrity', 'edit', item)}
            onDelete={(item) => openDeleteModal('Featured Celebrity', item)}
          />
        </div>
      )}

      {/* --- Add/Edit Modal --- */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onMouseDown={resetModalState} // * Click on backdrop to close
        >
          <div
            className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg m-4"
            onMouseDown={(e) => e.stopPropagation()} // * Prevent modal click from closing
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {modalMode === 'add' ? 'Add' : 'Edit'}{' '}
                  {currentTable?.replace(/s$/, '').replace('Featured ', '')}
                </h3>
                <button
                  onClick={resetModalState}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 -mt-1 -mr-1"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Artist Form (with details) */}
                {dataMap[currentTable]?.hasDetails && (
                  <div className="grid grid-cols-3 gap-4">
                    {/* Photo Uploader */}
                    <div className="col-span-1">
                      <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        Photo
                      </label>
                      <div
                        onClick={() => fileInputRef.current.click()}
                        className="cursor-pointer aspect-square w-full bg-slate-100 dark:bg-slate-700/50 rounded-md flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-teal-500 dark:hover:border-teal-500 transition-colors"
                      >
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="text-center p-2">
                            <ImageIcon size={24} />
                            <p className="text-xs mt-1">Click to upload</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => setPhotoFile(e.target.files[0])}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    {/* Name & Description */}
                    <div className="col-span-2 space-y-4">
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
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((f) => ({ ...f, name: e.target.value }))
                          }
                          className={inputClasses}
                          autoFocus
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="itemDesc"
                          className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                          Description
                        </label>
                        <textarea
                          id="itemDesc"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData((f) => ({
                              ...f,
                              description: e.target.value,
                            }))
                          }
                          className={textareaClasses}
                          rows="4"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {/* Simple Form (Client, Celebrity) */}
                {!dataMap[currentTable]?.hasDetails && (
                  <div>
                    <label
                      htmlFor="itemNameSimple"
                      className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Name
                    </label>
                    <input
                      id="itemNameSimple"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, name: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                      className={inputClasses}
                      autoFocus
                    />
                  </div>
                )}
                {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={resetModalState}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold rounded-md bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-300 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && (
                    <Loader2 className="animate-spin" size={16} />
                  )}
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Delete Modal --- */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onMouseDown={resetModalState}
        >
          <div
            className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/40 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle
                    className="h-6 w-6 text-red-600 dark:text-red-400"
                    aria-hidden="true"
                  />
                </div>
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
               {errorMsg && <p className="text-sm text-red-500 mt-4 text-center">{errorMsg}</p>}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={resetModalState}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && (
                    <Loader2 className="animate-spin" size={16} />
                  )}
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

export default ManagementPage;