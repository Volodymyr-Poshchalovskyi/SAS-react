import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, AlertTriangle } from 'lucide-react';
// Make sure to import your configured Supabase client
import { supabase } from '../../lib/supabaseClient'; // Adjust the import path as needed

// --- Reusable Highlight Component for Search (No changes needed here) ---
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

// --- Reusable Data Table Component (No changes needed here) ---
const DataTable = ({ title, data, onAdd, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  return (
    <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl flex flex-col h-full min-h-[300px]">
      {/* Header */}
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

      {/* Search Input */}
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

      {/* Body */}
      <div className="p-2 overflow-y-auto flex-1">
        {filteredData.length > 0 ? (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredData.map((item) => (
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
    </div>
  );
};

// --- Main Page Component ---
const ManagementPage = () => {
  const [artists, setArtists] = useState([]);
  const [clients, setClients] = useState([]);
  const [celebrities, setCelebrities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [modalMode, setModalMode] = useState('add');
  const [currentTable, setCurrentTable] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [newItemName, setNewItemName] = useState('');

  // Map display titles to Supabase table names and state setters
  const dataMap = {
    Artists: { data: artists, setData: setArtists, tableName: 'artists' },
    Clients: { data: clients, setData: setClients, tableName: 'clients' },
    'Featured Celebrity': { data: celebrities, setData: setCelebrities, tableName: 'celebrities' },
  };

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [artistsRes, clientsRes, celebritiesRes] = await Promise.all([
          supabase.from('artists').select('*').order('created_at', { ascending: false }),
          supabase.from('clients').select('*').order('created_at', { ascending: false }),
          supabase.from('celebrities').select('*').order('created_at', { ascending: false }),
        ]);

        if (artistsRes.error) throw artistsRes.error;
        if (clientsRes.error) throw clientsRes.error;
        if (celebritiesRes.error) throw celebritiesRes.error;

        setArtists(artistsRes.data);
        setClients(clientsRes.data);
        setCelebrities(celebritiesRes.data);

      } catch (error) {
        console.error("Error fetching data:", error);
        // You could add a toast notification here for the user
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const openEditModal = (table, mode, item = null) => {
    setCurrentTable(table);
    setModalMode(mode);
    if (mode === 'edit' && item) {
      setCurrentItem(item);
      setNewItemName(item.name);
    } else {
      setCurrentItem(null);
      setNewItemName('');
    }
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentTable(null);
    setCurrentItem(null);
    setNewItemName('');
  };

  const openDeleteModal = (table, item) => {
    setCurrentTable(table);
    setCurrentItem(item);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentTable(null);
    setCurrentItem(null);
  };

  // --- CRUD Handlers ---
  const handleSave = async () => {
    if (!newItemName.trim() || !currentTable) return;
    
    const { setData, tableName } = dataMap[currentTable];
    const trimmedName = newItemName.trim();

    try {
      if (modalMode === 'add') {
        const { data, error } = await supabase
          .from(tableName)
          .insert({ name: trimmedName })
          .select()
          .single(); // Use .single() to get the object directly

        if (error) throw error;
        setData((prevData) => [data, ...prevData]); // Add new item to the top

      } else if (modalMode === 'edit' && currentItem) {
        const { data, error } = await supabase
          .from(tableName)
          .update({ name: trimmedName })
          .eq('id', currentItem.id)
          .select()
          .single();

        if (error) throw error;
        setData((prevData) =>
          prevData.map((item) => (item.id === currentItem.id ? data : item))
        );
      }
      closeEditModal();
    } catch (error) {
      console.error('Error saving item:', error);
      // Add user-facing error message (e.g., toast notification)
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentItem || !currentTable) return;
    const { setData, tableName } = dataMap[currentTable];

    try {
      const { error } = await supabase.from(tableName).delete().eq('id', currentItem.id);
      if (error) throw error;
      setData((prevData) => prevData.filter((item) => item.id !== currentItem.id));
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting item:', error);
      // Add user-facing error message
    }
  };

  const inputClasses =
    'flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500';

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
        Artists / Clients / Featured Celebrity
      </h1>

      {loading ? (
        <p className="text-center text-slate-500 dark:text-slate-400">Loading data...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

      {/* Modal for Add/Edit */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                  {modalMode === 'add' ? 'Add' : 'Edit'}{' '}
                  {currentTable?.replace(/s$/, '').replace('Featured ', '')}
                </h3>
                <button onClick={closeEditModal} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 -mt-1 -mr-1">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              <div>
                <label htmlFor="itemName" className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Name
                </label>
                <input id="itemName" type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSave()} className={inputClasses} autoFocus />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={closeEditModal} className="px-4 py-2 text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">
                  Cancel
                </button>
                <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold rounded-md bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-300">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Delete Confirmation */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4">
            <div className="p-6">
              <div className="flex items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/40 sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
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
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={closeDeleteModal} className="px-4 py-2 text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">
                  Cancel
                </button>
                <button onClick={handleDeleteConfirm} className="px-4 py-2 text-sm font-semibold rounded-md bg-red-600 text-white hover:bg-red-700">
                  Delete
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