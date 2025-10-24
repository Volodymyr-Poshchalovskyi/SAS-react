// src/AdminComponents/Layout/Management.jsx

// ! React & Core Hooks
import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useContext,
  useCallback, // Додаємо useCallback
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
// Видаляємо прямий імпорт supabase, бо всі запити йдуть через бекенд
// import { supabase } from '../../lib/supabaseClient';
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
  if (!highlight?.trim() || !text) return <span>{text}</span>; // Додано перевірку на text
  // Захист від некоректних регулярних виразів
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  try {
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = String(text).split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          part && part.toLowerCase() === highlight.toLowerCase() ? ( // Додано перевірку на part
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
    return <span>{text}</span>; // Повертаємо оригінальний текст при помилці
  }
};

// ========================================================================== //
// ! HELPER COMPONENT: DataTable
// ========================================================================== //

/**
 * ? DataTable
 * A reusable card component that displays a searchable, paginated list of items
 * with add, edit, and delete functionality.
 */
const DataTable = ({ title, data, onAdd, onEdit, onDelete, isLoading }) => { // Додано isLoading prop
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(10); // * "Show More" pagination

  // * Memoized search filter
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(
      (item) =>
        item.name && // Додано перевірку на item.name
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

  // --- DataTable Skeleton ---
  const SkeletonLoader = () => (
    <div className="p-4 animate-pulse">
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full mb-4"></div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl flex flex-col min-h-[300px]">
      {/* Card Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          {title}
        </h2>
        <button
          onClick={onAdd}
          disabled={isLoading} // Блокуємо кнопку під час завантаження
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
            disabled={isLoading} // Блокуємо пошук під час завантаження
            className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent pl-9 pr-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Item List or Skeleton */}
      <div className="p-2 overflow-y-auto flex-1">
        {isLoading ? (
          <SkeletonLoader />
        ) : dataToDisplay.length > 0 ? (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {dataToDisplay.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <span className="text-sm text-slate-700 dark:text-slate-300 truncate pr-2"> {/* Додано truncate */}
                  <Highlight text={item.name} highlight={searchTerm} />
                </span>
                <div className="flex items-center gap-2 flex-shrink-0"> {/* Додано flex-shrink-0 */}
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
// ! MAIN COMPONENT: ManagementPage
// ========================================================================== //

const ManagementPage = () => {
  // ! State
  const [artists, setArtists] = useState([]);
  const [clients, setClients] = useState([]);
  const [celebrities, setCelebrities] = useState([]);
  const [loading, setLoading] = useState(true); // Єдиний стан завантаження
  const [isSubmitting, setIsSubmitting] = useState(false); // Для модальних вікон
  const [errorMsg, setErrorMsg] = useState(''); // Глобальна помилка сторінки + помилки модалки

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
  const { refreshKey } = useContext(DataRefreshContext);
  const { session, user } = useAuth(); // Отримуємо session
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // * A map to easily access state and table info by name
  // Використовуємо useCallback для setData функцій, щоб мемоізувати їх
  const dataMap = useMemo(() => ({
    Artists: {
      data: artists,
      setData: setArtists, // useCallback не потрібен для setState з useState
      tableName: 'artists', // Використовуємо це для URL
      hasDetails: true,
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
      tableName: 'celebrities', // Змінено з 'featured_celebrity'
      hasDetails: false,
    },
  }), [artists, clients, celebrities]); // Залежності для useMemo


  // ! Effect: Data Fetching
  useEffect(() => {
    const fetchAllData = async () => {
      // Перевіряємо сесію ПЕРЕД запитом
      if (!session?.access_token) {
        console.warn('Management.jsx: No session token, skipping data fetch.');
        setLoading(false);
        setArtists([]); setClients([]); setCelebrities([]); // Очищуємо дані
        setErrorMsg("Please log in to view this page."); // Інформуємо користувача
        return;
      }
      const token = session.access_token;
      const headers = { Authorization: `Bearer ${token}` };

      console.log('Fetching management data via backend...');
      setLoading(true);
      setErrorMsg(''); // Скидаємо помилку перед новим запитом

      try {
        // Використовуємо Promise.allSettled для надійності
        const results = await Promise.allSettled([
          fetch(`${API_BASE_URL}/artists`, { headers }),
          fetch(`${API_BASE_URL}/clients`, { headers }),
          fetch(`${API_BASE_URL}/celebrities`, { headers }),
        ]);

        let fetchErrorOccurred = false;
        const data = { artists: [], clients: [], celebrities: [] };
        const keys = ['artists', 'clients', 'celebrities'];

        // Обробляємо результати
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const key = keys[i];
            if (result.status === 'fulfilled') {
                const response = result.value;
                if (!response.ok) {
                    console.error(`Failed to fetch ${key}: ${response.status}`);
                    fetchErrorOccurred = true;
                } else {
                    data[key] = await response.json();
                }
            } else {
                 console.error(`Request rejected for ${key}:`, result.reason);
                 fetchErrorOccurred = true;
            }
        }

        // Оновлюємо стани
        setArtists(data.artists);
        setClients(data.clients);
        setCelebrities(data.celebrities);

        if (fetchErrorOccurred) {
            setErrorMsg('Failed to load some data. Please try refreshing.');
        }

      } catch (error) { // Малоймовірно з allSettled, але про всяк випадок
        console.error('Critical error fetching data via backend:', error);
        setErrorMsg(`Critical error: ${error.message}`);
        setArtists([]); setClients([]); setCelebrities([]); // Очищуємо дані
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [refreshKey, session]); // Залежить від session

  // ! Effect: Photo Preview
  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }
    let objectUrl = null;
    try {
        objectUrl = URL.createObjectURL(photoFile);
        setPhotoPreview(objectUrl);
    } catch(e) {
        console.error("Error creating object URL:", e);
        setPhotoPreview(null); // Скидаємо прев'ю при помилці
    }

    // Cleanup function
    return () => {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }
    };
  }, [photoFile]);


  // ! Modal Handlers (використовуємо useCallback)
  const resetModalState = useCallback(() => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentTable(null);
    setCurrentItem(null);
    setFormData({ name: '', description: '' });
    setPhotoFile(null);
    // setPhotoPreview(null); // Не скидаємо тут, useEffect сам очистить
    setIsSubmitting(false);
    setErrorMsg(''); // Скидаємо помилку модалки при закритті
  }, []);

  const openEditModal = useCallback(async (table, mode, item = null) => {
    // Перевірка сесії перед відкриттям модалки, особливо для Edit
     if (mode === 'edit' && !session?.access_token) {
        setErrorMsg("Authentication expired. Please log in again to edit.");
        return; // Не відкриваємо модалку
     }

    setCurrentTable(table);
    setModalMode(mode);
    setErrorMsg(''); // Скидаємо помилку при відкритті
    const token = session?.access_token;

    if (mode === 'edit' && item) {
      setCurrentItem(item);
      setFormData({ name: item.name || '', description: item.description || '' }); // Додано fallback

      // Завантажуємо прев'ю фото, якщо воно є
      if (item.photo_gcs_path && token) { // Перевіряємо токен
          try {
              const response = await fetch(`${API_BASE_URL}/generate-read-urls`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ gcsPaths: [item.photo_gcs_path] }),
              });
              if (response.ok) {
                  const urlMap = await response.json();
                  setPhotoPreview(urlMap[item.photo_gcs_path] || null); // Додано fallback
              } else {
                  console.error('Could not get photo preview URL:', response.status);
                  setPhotoPreview(null);
              }
          } catch (e) {
              console.error('Failed to get signed URL for preview:', e);
              setPhotoPreview(null);
          }
      } else {
           setPhotoPreview(null); // Скидаємо прев'ю, якщо немає шляху або токена
      }
    } else {
        // Скидаємо стан для 'add'
        setCurrentItem(null);
        setFormData({ name: '', description: '' });
        setPhotoFile(null);
        setPhotoPreview(null);
    }
    setIsEditModalOpen(true);
  }, [session, API_BASE_URL]); // Додаємо залежності

  const openDeleteModal = useCallback((table, item) => {
    setCurrentTable(table);
    setCurrentItem(item);
    setErrorMsg(''); // Скидаємо помилку при відкритті
    setIsDeleteModalOpen(true);
  }, []); // Залежностей немає

  // ! API Handlers (використовуємо useCallback)

   const uploadPhoto = useCallback(async (file) => {
    if (!file) return null;
    const token = session?.access_token;
    if (!token) {
        throw new Error("Authentication required to upload photo.");
    }
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };

    try {
        // 1. Get Signed URL
        const signedUrlRes = await fetch(`${API_BASE_URL}/generate-upload-url`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
                destination: 'artists', // Завжди для артистів
            }),
        });
        if (!signedUrlRes.ok) {
            const errorText = await signedUrlRes.text();
            throw new Error(`Could not get upload URL: ${errorText}`);
        }
        const { signedUrl, gcsPath } = await signedUrlRes.json();

        // 2. Upload to GCS
        const uploadResponse = await fetch(signedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
        });
        if (!uploadResponse.ok) {
            throw new Error(`Upload to GCS failed with status ${uploadResponse.status}.`);
        }
        return gcsPath;
    } catch (error) {
         console.error("Photo upload error:", error);
         // Перекидаємо помилку далі, щоб handleSave міг її обробити
         throw error;
    }
   }, [session, API_BASE_URL]); // Залежності для useCallback

  const handleSave = useCallback(async () => {
    const trimmedName = formData.name.trim(); // Отримуємо обрізане ім'я один раз
    if (!trimmedName || !currentTable) {
        setErrorMsg("Name cannot be empty."); // Повідомлення про помилку
        return;
    }
    setIsSubmitting(true);
    setErrorMsg('');

    const tableConfig = dataMap[currentTable];
    if (!tableConfig) {
        setErrorMsg("Invalid table configuration.");
        setIsSubmitting(false);
        return;
    }
    const { setData, tableName, hasDetails, data: currentData } = tableConfig; // Отримуємо currentData тут

    const token = session?.access_token;
    if (!token) {
        setErrorMsg("Authentication error. Please log in again.");
        setIsSubmitting(false);
        return;
    }
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    // --- Клієнтська перевірка на дублікати ---
    const existingItem = currentData.find(
      (item) =>
        item.name?.toLowerCase() === trimmedName.toLowerCase() && // Додано ?.
        (!currentItem || item.id !== currentItem.id)
    );
    if (existingItem) {
      setErrorMsg(`An item named "${trimmedName}" already exists.`);
      setIsSubmitting(false);
      return;
    }
    // --- Кінець перевірки ---

    let url = '';
    let method = '';
    let payload = {};

    try {
        if (modalMode === 'add') {
            method = 'POST';
            url = `${API_BASE_URL}/${tableName}`;
            payload = { name: trimmedName };
            if (hasDetails) {
                const photo_gcs_path = await uploadPhoto(photoFile); // Може кинути помилку
                payload.description = formData.description.trim();
                payload.photo_gcs_path = photo_gcs_path;
            }
        } else if (modalMode === 'edit' && currentItem) {
            method = 'PUT';
            url = `${API_BASE_URL}/${tableName}/${currentItem.id}`;
            payload = { name: trimmedName };
            if (hasDetails) {
                let photo_gcs_path = currentItem.photo_gcs_path;
                if (photoFile) {
                    photo_gcs_path = await uploadPhoto(photoFile); // Може кинути помилку
                }
                payload.description = formData.description.trim();
                payload.photo_gcs_path = photo_gcs_path;
            }
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
            throw new Error(errorData.error || `Failed to ${modalMode} item.`);
        }

        const resultData = await response.json();

        // Оновлюємо стан на клієнті
        if (modalMode === 'add') {
            setData((prev) => [resultData, ...prev]);
        } else {
            setData((prev) =>
                prev.map((item) => (item.id === currentItem.id ? resultData : item))
            );
        }
        resetModalState();

    } catch (error) {
        console.error(`Error ${modalMode === 'add' ? 'adding' : 'updating'} item:`, error);
        setErrorMsg(`${error.message}`); // Показуємо помилку в модалці
        // isSubmitting залишиться true, щоб кнопка була заблокована до виправлення
    } finally {
        // Скидаємо isSubmitting ТІЛЬКИ якщо НЕ було помилки
        // Якщо була помилка, залишаємо isSubmitting=true, щоб користувач бачив помилку і не міг спамити
        if (!errorMsg && isSubmitting) { // Додано перевірку isSubmitting
             setIsSubmitting(false);
        }
    }
  }, [formData, currentTable, modalMode, currentItem, photoFile, session, dataMap, resetModalState, uploadPhoto, API_BASE_URL, errorMsg, isSubmitting]); // Додаємо залежності


   const handleDeleteConfirm = useCallback(async () => {
    if (!currentItem || !currentTable) return;

    const tableConfig = dataMap[currentTable];
     if (!tableConfig) {
        setErrorMsg("Invalid table configuration for delete.");
        return;
    }
    const { setData, tableName } = tableConfig;

    const token = session?.access_token;
    if (!token) {
        setErrorMsg("Authentication error. Please log in again.");
        setIsSubmitting(false); // Дозволяємо закрити модалку
        return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    const url = `${API_BASE_URL}/${tableName}/${currentItem.id}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        // Бекенд повертає 200 або 204 при успіху (навіть якщо вже видалено)
        if (response.status > 204) {
             const errorData = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
             throw new Error(errorData.error || 'Failed to delete item.');
        }

        // Видаляємо зі стану на клієнті
        setData((prevData) =>
            prevData.filter((item) => item.id !== currentItem.id)
        );
        resetModalState(); // Закриваємо модалку та скидаємо isSubmitting

    } catch (error) {
        console.error('Error deleting item via backend:', error);
        setErrorMsg(`Error: ${error.message}`);
        // isSubmitting залишається true, щоб користувач бачив помилку
    } finally {
        // Скидаємо isSubmitting тільки якщо НЕ було помилки, бо resetModalState вже це робить
         if (errorMsg && isSubmitting) { // Якщо була помилка, isSubmitting=true
             // Можна не скидати, щоб кнопка була заблокована
             // setIsSubmitting(false); // Або скинути, щоб дозволити спробувати ще раз/закрити
         }
    }
   }, [currentItem, currentTable, session, dataMap, resetModalState, API_BASE_URL, errorMsg, isSubmitting]); // Додаємо залежності

  // ! Styles
  const inputClasses =
    'flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 disabled:opacity-50'; // Додано disabled
  const textareaClasses =
    'flex min-h-[80px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 disabled:opacity-50'; // Додано disabled

  // ! Render
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
        Artists / Clients / Featured Celebrity
      </h1>
      {/* Повідомлення про помилку завантаження */}
      {errorMsg && !loading && !isEditModalOpen && !isDeleteModalOpen && ( // Показуємо тільки якщо модалки закриті
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMsg}</span>
        </div>
      )}

       {/* --- Data Tables --- */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start">
            <DataTable
                title="Artists"
                data={artists}
                isLoading={loading} // Передаємо стан завантаження
                onAdd={() => openEditModal('Artists', 'add')}
                onEdit={(item) => openEditModal('Artists', 'edit', item)}
                onDelete={(item) => openDeleteModal('Artists', item)}
            />
            <DataTable
                title="Clients"
                data={clients}
                isLoading={loading} // Передаємо стан завантаження
                onAdd={() => openEditModal('Clients', 'add')}
                onEdit={(item) => openEditModal('Clients', 'edit', item)}
                onDelete={(item) => openDeleteModal('Clients', item)}
            />
            <DataTable
                title="Featured Celebrity"
                data={celebrities}
                isLoading={loading} // Передаємо стан завантаження
                onAdd={() => openEditModal('Featured Celebrity', 'add')}
                onEdit={(item) => openEditModal('Featured Celebrity', 'edit', item)}
                onDelete={(item) => openDeleteModal('Featured Celebrity', item)}
            />
       </div>


      {/* --- Add/Edit Modal --- */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onMouseDown={resetModalState}
        >
          <div
            className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg m-4"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {modalMode === 'add' ? 'Add' : 'Edit'}{' '}
                  {/* Захист від null/undefined currentTable */}
                  {currentTable?.replace(/s$/, '').replace('Featured ', '') || 'Item'}
                </h3>
                <button
                  onClick={resetModalState}
                  disabled={isSubmitting} // Блокуємо закриття під час відправки
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 -mt-1 -mr-1 disabled:opacity-50"
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
                        onClick={() => !isSubmitting && fileInputRef.current.click()} // Заборона кліку під час відправки
                        className={`cursor-pointer aspect-square w-full bg-slate-100 dark:bg-slate-700/50 rounded-md flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-600 ${!isSubmitting && 'hover:border-teal-500 dark:hover:border-teal-500'} transition-colors ${isSubmitting && 'opacity-50 cursor-not-allowed'}`}
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
                        disabled={isSubmitting} // Блокування інпуту
                      />
                       {/* Кнопка видалення фото */}
                       {photoPreview && (
                            <button
                                type="button"
                                onClick={() => {
                                    setPhotoFile(null);
                                    setPhotoPreview(null);
                                    // Якщо це режим редагування і фото було з сервера,
                                    // можливо, потрібно буде очистити photo_gcs_path при збереженні
                                    // (але це складніше, поки що просто очищуємо прев'ю)
                                }}
                                disabled={isSubmitting}
                                className="mt-2 text-xs text-red-500 hover:underline disabled:opacity-50"
                            >
                                Remove photo
                            </button>
                        )}
                    </div>
                    {/* Name & Description */}
                    <div className="col-span-2 space-y-4">
                      <div>
                        <label
                          htmlFor="itemName"
                          className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="itemName"
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((f) => ({ ...f, name: e.target.value }))
                          }
                          className={inputClasses}
                          disabled={isSubmitting} // Блокування
                          autoFocus
                          required // Додано required
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
                          disabled={isSubmitting} // Блокування
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
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="itemNameSimple"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, name: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === 'Enter' && !isSubmitting && handleSave()} // Заборона Enter під час відправки
                      className={inputClasses}
                      disabled={isSubmitting} // Блокування
                      autoFocus
                      required // Додано required
                    />
                  </div>
                )}
                {/* Помилка модалки */}
                {errorMsg && <p className="text-sm text-red-500 mt-2">{errorMsg}</p>}
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button" // Важливо вказати type="button"
                  onClick={resetModalState}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button" // Важливо вказати type="button"
                  onClick={handleSave}
                  disabled={isSubmitting || !formData.name.trim()} // Перевірка на пусте ім'я
                  className="px-4 py-2 text-sm font-semibold rounded-md bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-300 disabled:opacity-50 flex items-center justify-center min-w-[80px]" // Додано min-w
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    'Save'
                  )}
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
          // Не закриваємо по кліку на фон, якщо йде видалення
          onMouseDown={!isSubmitting ? resetModalState : undefined}
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
              {/* Помилка модалки */}
              {errorMsg && <p className="text-sm text-red-500 mt-4 text-center">{errorMsg}</p>}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetModalState}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center min-w-[90px]" // Додано min-w
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                   'Delete'
                  )}
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