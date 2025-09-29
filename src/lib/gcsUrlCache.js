// src/lib/gcsUrlCache.js

// Створюємо Map для зберігання кешованих URL-адрес.
// Він буде існувати, доки користувач не оновить сторінку.
const urlCache = new Map();

/**
 * Отримує підписані URL-адреси для заданих шляхів GCS.
 * Спочатку перевіряє кеш, а потім запитує з сервера лише ті URL, яких немає.
 * @param {string[]} gcsPaths - Масив шляхів до файлів у Google Cloud Storage.
 * @returns {Promise<Object>} - Об'єкт, де ключ - це gcsPath, а значення - підписаний URL.
 */
export const getSignedUrls = async (gcsPaths) => {
  const finalUrls = {};
  const pathsToFetch = [];

  // 1. Розділяємо шляхи: ті, що вже є в кеші, і ті, які потрібно завантажити.
  for (const path of gcsPaths) {
    if (path) {
      if (urlCache.has(path)) {
        finalUrls[path] = urlCache.get(path);
      } else {
        pathsToFetch.push(path);
      }
    }
  }

  // 2. Якщо є нові шляхи для завантаження, робимо запит до сервера.
  if (pathsToFetch.length > 0) {
    try {
      const response = await fetch('http://localhost:3001/generate-read-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gcsPaths: [...new Set(pathsToFetch)] }), // Використовуємо Set для унікальності
      });

      if (!response.ok) {
        throw new Error('Failed to fetch signed URLs from server');
      }

      const newUrlsMap = await response.json();

      // 3. Зберігаємо нові URL-и в кеші та додаємо їх до фінального об'єкта.
      for (const path in newUrlsMap) {
        urlCache.set(path, newUrlsMap[path]);
        finalUrls[path] = newUrlsMap[path];
      }
    } catch (err) {
      console.error('Error fetching signed URLs:', err);
      // У випадку помилки повертаємо порожні URL для шляхів, що не завантажились
      pathsToFetch.forEach((path) => {
        finalUrls[path] = null;
      });
    }
  }

  return finalUrls;
};
