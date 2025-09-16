// src/AdminComponents/Layout/Library.jsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Check, ChevronLeft, ChevronRight, ArrowUpDown, FileText } from 'lucide-react';

// =======================
// Mock data (симуляція бібліотеки)
// =======================
const mockLibraryItems = [
  {
    id: 1,
    title: 'Burger King',
    subtitle: 'Fried Mozzarella King',
    artists: 'Rob Fiocca',
    client: 'Burger King',
    categories: 'Food',
    addedBy: 'Thomas Carrol',
    createdAt: '2025-09-11T14:48:00Z',
    views: 12543,
  },
  {
    id: 2,
    title: 'Cracker Barrel',
    subtitle: 'Lasagna',
    artists: 'Rob Fiocca',
    client: 'Cracker Barrel',
    categories: 'Food',
    addedBy: 'Thomas Carrol',
    createdAt: '2025-09-11T14:45:00Z',
    views: 8201,
  },
  {
    id: 3,
    title: 'Mountain Dew',
    subtitle: 'Kickstart',
    artists: 'John Doe',
    client: 'PepsiCo',
    categories: 'Beverage',
    addedBy: 'Jane Smith',
    createdAt: '2025-09-11T13:30:00Z',
    views: 22890,
  },
  {
    id: 4,
    title: 'Delissio',
    subtitle: 'No Crust Left Behind',
    artists: 'Rob Fiocca',
    client: 'Delissio',
    categories: 'Food',
    addedBy: 'Thomas Carrol',
    createdAt: '2025-09-11T12:39:00Z',
    views: 4500,
  },
  {
    id: 5,
    title: 'Nike',
    subtitle: 'Find Your Greatness',
    artists: 'Jane Roe',
    client: 'Nike',
    categories: 'Apparel',
    addedBy: 'Peter Jones',
    createdAt: '2025-09-10T18:00:00Z',
    views: 52300,
  },
  {
    id: 6,
    title: 'Apple',
    subtitle: 'Think Different',
    artists: 'Creative Minds',
    client: 'Apple Inc.',
    categories: 'Technology',
    addedBy: 'Susan Williams',
    createdAt: '2025-09-10T17:50:00Z',
    views: 102500,
  },
  {
    id: 7,
    title: 'Coca-Cola',
    subtitle: 'Open Happiness',
    artists: 'Studio Art',
    client: 'Coca-Cola',
    categories: 'Beverage',
    addedBy: 'Jane Smith',
    createdAt: '2025-09-10T16:45:00Z',
    views: 75000,
  },
  {
    id: 8,
    title: 'Toyota',
    subtitle: 'Lets Go Places',
    artists: 'Car Media',
    client: 'Toyota',
    categories: 'Automotive',
    addedBy: 'Peter Jones',
    createdAt: '2025-09-09T11:20:00Z',
    views: 42000,
  },
  {
    id: 9,
    title: 'Samsung',
    subtitle: 'Galaxy S25',
    artists: 'Tech Visuals',
    client: 'Samsung',
    categories: 'Technology',
    addedBy: 'Susan Williams',
    createdAt: '2025-09-09T10:10:00Z',
    views: 89000,
  },
  {
    id: 10,
    title: 'McDonalds',
    subtitle: 'Im Lovin It',
    artists: 'Rob Fiocca',
    client: 'McDonalds',
    categories: 'Food',
    addedBy: 'Thomas Carrol',
    createdAt: '2025-09-08T15:00:00Z',
    views: 150000,
  },
  {
    id: 11,
    title: 'Adidas',
    subtitle: 'Impossible is Nothing',
    artists: 'Jane Roe',
    client: 'Adidas',
    categories: 'Apparel',
    addedBy: 'Peter Jones',
    createdAt: '2025-09-08T14:00:00Z',
    views: 61000,
  },
  {
    id: 12,
    title: 'Google',
    subtitle: 'Pixel 9 Pro',
    artists: 'Creative Minds',
    client: 'Google',
    categories: 'Technology',
    addedBy: 'Susan Williams',
    createdAt: '2025-09-08T12:00:00Z',
    views: 95000,
  },
  {
    id: 13,
    title: 'KFC',
    subtitle: 'Finger Lickin Good',
    artists: 'Rob Fiocca',
    client: 'KFC',
    categories: 'Food',
    addedBy: 'Thomas Carrol',
    createdAt: '2025-09-07T16:00:00Z',
    views: 78000,
  },
  {
    id: 14,
    title: 'Ford',
    subtitle: 'Built Ford Tough',
    artists: 'Car Media',
    client: 'Ford',
    categories: 'Automotive',
    addedBy: 'Peter Jones',
    createdAt: '2025-09-07T13:00:00Z',
    views: 32000,
  },
  {
    id: 15,
    title: 'Subway',
    subtitle: 'Eat Fresh',
    artists: 'Rob Fiocca',
    client: 'Subway',
    categories: 'Food',
    addedBy: 'Thomas Carrol',
    createdAt: '2025-09-06T19:00:00Z',
    views: 45000,
  },
  {
    id: 16,
    title: 'Amazon',
    subtitle: 'Prime Day',
    artists: 'Creative Minds',
    client: 'Amazon',
    categories: 'E-commerce',
    addedBy: 'Susan Williams',
    createdAt: '2025-09-06T18:00:00Z',
    views: 250000,
  },
  {
    id: 17,
    title: 'Lays',
    subtitle: 'Betcha Cant Eat Just One',
    artists: 'John Doe',
    client: 'Frito-Lay',
    categories: 'Snacks',
    addedBy: 'Jane Smith',
    createdAt: '2025-09-05T14:00:00Z',
    views: 5000,
  },
  {
    id: 18,
    title: 'Honda',
    subtitle: 'The Power of Dreams',
    artists: 'Car Media',
    client: 'Honda',
    categories: 'Automotive',
    addedBy: 'Peter Jones',
    createdAt: '2025-09-05T11:00:00Z',
    views: 28000,
  },
  {
    id: 19,
    title: 'Starbucks',
    subtitle: 'Pumpkin Spice Latte',
    artists: 'Rob Fiocca',
    client: 'Starbucks',
    categories: 'Beverage',
    addedBy: 'Thomas Carrol',
    createdAt: '2025-09-04T10:00:00Z',
    views: 62000,
  },
  {
    id: 20,
    title: 'Microsoft',
    subtitle: 'Surface Pro 10',
    artists: 'Tech Visuals',
    client: 'Microsoft',
    categories: 'Technology',
    addedBy: 'Susan Williams',
    createdAt: '2025-09-04T09:00:00Z',
    views: 71000,
  },
  {
    id: 21,
    title: 'Puma',
    subtitle: 'Forever Faster',
    artists: 'Jane Roe',
    client: 'Puma',
    categories: 'Apparel',
    addedBy: 'Peter Jones',
    createdAt: '2025-09-03T17:00:00Z',
    views: 18000,
  },
  {
    id: 22,
    title: 'BMW',
    subtitle: 'The Ultimate Driving Machine',
    artists: 'Car Media',
    client: 'BMW',
    categories: 'Automotive',
    addedBy: 'Peter Jones',
    createdAt: '2025-09-03T16:00:00Z',
    views: 99000,
  },
  {
    id: 23,
    title: 'Taco Bell',
    subtitle: 'Live Más',
    artists: 'Rob Fiocca',
    client: 'Taco Bell',
    categories: 'Food',
    addedBy: 'Thomas Carrol',
    createdAt: '2025-09-02T15:00:00Z',
    views: 88000,
  },
  {
    id: 24,
    title: "Wendy's",
    subtitle: 'Quality is Our Recipe',
    artists: 'Rob Fiocca',
    client: "Wendy's",
    categories: 'Food',
    addedBy: 'Thomas Carrol',
    createdAt: '2025-09-02T14:00:00Z',
    views: 34000,
  },
].map((item) => ({
  ...item,
  preview:
    'https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
}));

// =======================
// Library Component
// =======================
const Library = () => {
  // ---------- State ----------
  const [items, setItems] = useState([]); // всі елементи бібліотеки
  const [loading, setLoading] = useState(true); // індикатор завантаження
  const [selectedItems, setSelectedItems] = useState(new Set()); // виділені елементи
  const [currentPage, setCurrentPage] = useState(1); // пагінація
  const [searchTerm, setSearchTerm] = useState(''); // пошук
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'descending',
  });

  const itemsPerPage = 10; // кількість рядків на сторінку
  const headerCheckboxRef = useRef(null);



  // ---------- Memoized Data ----------
  // Сортування
  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  // Фільтрація по пошуку
  const filteredItems = useMemo(() => {
    if (!searchTerm) return sortedItems;
    const term = searchTerm.toLowerCase();
    return sortedItems.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(term)
      )
    );
  }, [sortedItems, searchTerm]);

  // Пагінація
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredItems, currentPage]);

    // ---------- Effects ----------
  // Симуляція завантаження даних
  useEffect(() => {
    setTimeout(() => {
      setItems(mockLibraryItems);
      setLoading(false);
    }, 1000);
  }, []);

  // Скидання сторінки при зміні пошуку
  useEffect(() => {
    if (searchTerm) setCurrentPage(1);
  }, [searchTerm]);

  // Стан "індетермінейт" для головного чекбоксу
  useEffect(() => {
    if (headerCheckboxRef.current) {
      const numSelected = selectedItems.size;
      const numFiltered = filteredItems.length;
      headerCheckboxRef.current.checked =
        numSelected === numFiltered && numFiltered > 0;
      headerCheckboxRef.current.indeterminate =
        numSelected > 0 && numSelected < numFiltered;
    }
  }, [selectedItems, filteredItems]);

  // ---------- Handlers ----------
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(new Set(filteredItems.map((item) => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleRowCheck = (itemId) => {
    setSelectedItems((prev) => {
      const newSelected = new Set(prev);
      newSelected.has(itemId) ? newSelected.delete(itemId) : newSelected.add(itemId);
      return newSelected;
    });
  };

  // ---------- Helpers ----------
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatNumber = (num) => new Intl.NumberFormat().format(num);

  const checkboxClasses =
    'h-4 w-4 shrink-0 rounded-sm border border-slate-300 dark:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500 ring-offset-white dark:ring-offset-slate-900 accent-slate-900 dark:accent-slate-50 cursor-pointer';

  const inputClasses =
    'flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-50 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900';

  // ---------- Render ----------
  if (loading) {
    return (
      <div className="p-4 text-center text-slate-500 dark:text-slate-400">
        Loading library items... ⏳
      </div>
    );
  }

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto">
      {/* ---- Header ---- */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Media Library
        </h1>
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search library..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>

      {/* ---- Table or Empty State ---- */}
      {filteredItems.length === 0 ? (
        <div className="text-center p-8 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl bg-white dark:bg-slate-900/70">
          <p className="text-slate-500 dark:text-slate-400">
            {searchTerm
              ? `No items found for "${searchTerm}"`
              : 'Your library is empty.'}
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
          {/* ---- Table ---- */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              {/* Table head */}
              <thead className="text-slate-500 dark:text-slate-400">
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 w-12 text-left">
                    <input
                      type="checkbox"
                      ref={headerCheckboxRef}
                      onChange={handleSelectAll}
                      className={checkboxClasses}
                    />
                  </th>
                  {/* тут ідуть сортувальні хедери (можна винести окремо, але поки залишаю inline) */}
                  <th className="p-4 font-medium text-left w-[28%]">Title</th>
                  <th className="p-4 font-medium text-left w-[12%]">Artists</th>
                  <th className="p-4 font-medium text-left w-[12%]">Client</th>
                  <th className="p-4 font-medium text-left w-[12%]">Categories</th>
                  <th className="p-4 font-medium text-left w-[12%]">Added By</th>
                  <th className="p-4 font-medium text-left w-24">Views</th>
                  <th className="p-4 font-medium text-left w-32">Created At</th>
                </tr>
              </thead>

              {/* Table body */}
              <tbody className="text-slate-800 dark:text-slate-200">
                {currentItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-slate-100 dark:border-slate-800 transition-colors duration-150 cursor-pointer ${
                      selectedItems.has(item.id)
                        ? 'bg-slate-100 dark:bg-slate-800/50'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                    }`}
                    onClick={() => handleRowCheck(item.id)}
                  >
                    <td className="p-4 w-12 text-left">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRowCheck(item.id);
                        }}
                        className={checkboxClasses}
                      />
                    </td>
                    <td className="p-4 text-left">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.preview}
                          alt="preview"
                          className="w-14 h-9 object-cover rounded-md border border-slate-200 dark:border-slate-700"
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 dark:text-slate-50 truncate">
                            {item.title}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-xs truncate">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-left whitespace-nowrap truncate">
                      {item.artists}
                    </td>
                    <td className="p-4 text-left whitespace-nowrap truncate">
                      {item.client}
                    </td>
                    <td className="p-4 text-left whitespace-nowrap truncate">
                      {item.categories}
                    </td>
                    <td className="p-4 text-left whitespace-nowrap truncate">
                      {item.addedBy}
                    </td>
                    <td className="p-4 text-left whitespace-nowrap">
                      {formatNumber(item.views)}
                    </td>
                    <td className="p-4 text-left whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ---- Pagination ---- */}
          {totalPages > 1 && (
            <div className="p-4 flex items-center justify-between text-sm border-t border-slate-200 dark:border-slate-800">
              <div className="text-slate-600 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---- Footer Action (PDF) ---- */}
      {selectedItems.size > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-6 p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm shadow-lg">
          <p className="text-slate-700 dark:text-slate-200">
            <span className="font-semibold">{selectedItems.size}</span> item
            {selectedItems.size > 1 ? 's' : ''} selected
          </p>
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 rounded-md hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors">
            <FileText className="h-4 w-4" />
            Create PDF Statistic
          </button>
        </div>
      )}
    </div>
  );
};

export default Library;









































