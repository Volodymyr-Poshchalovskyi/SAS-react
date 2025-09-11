// src/components/ApplicationsForAdmin.jsx

import React, { useState, useEffect } from 'react';
// Переконайтесь, що шлях до вашого файлу supabase правильний
import { supabase } from '../lib/supabaseClient'; 

const ApplicationsForAdmin = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setApplications(data);
    } catch (error) {
      console.error('Помилка при отриманні заявок:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Помилка при оновленні статусу:', error.message);
      alert('Не вдалося оновити статус. Спробуйте ще раз.');
    } else {
      setApplications(currentApps =>
        currentApps.map(app =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      );
    }
  };

  // Функція тепер повертає класи Tailwind CSS для кращого вигляду статусів
  const getStatusClasses = (status) => {
    const baseClasses = 'py-1 px-3 rounded-full text-xs font-semibold inline-block';
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'denied':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case 'in progress':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      default:
        return `${baseClasses} bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    }
  };

  if (loading) {
    return <div className="p-4">Завантаження заявок... ⏳</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Помилка: {error} ❌</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Applications
      </h1>
      
      {/* Огортаємо таблицю для тіні, заокруглених кутів та горизонтального скролу на малих екранах */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Текст заявки</th>
              <th className="py-3 px-6 text-center">Статус</th>
              <th className="py-3 px-6 text-center">Дії</th>
            </tr>
          </thead>
          <tbody className="text-gray-800 dark:text-gray-200 text-sm font-light">
            {applications.map((app) => (
              <tr key={app.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {app.email}
                </td>
                <td className="py-3 px-6 text-left">
                  {app.text}
                </td>
                <td className="py-3 px-6 text-center">
                  <span className={getStatusClasses(app.status)}>
                    {app.status}
                  </span>
                </td>
                <td className="py-3 px-6 text-center">
                  {app.status === 'in progress' && (
                    <div className="flex item-center justify-center">
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'approved')}
                        className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300 mr-2"
                      >
                        Прийняти
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'denied')}
                        className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-300"
                      >
                        Відхилити
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationsForAdmin;