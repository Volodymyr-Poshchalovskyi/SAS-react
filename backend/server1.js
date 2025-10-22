// scan-gcs.js

// 1. Імпортуємо бібліотеки
const { Storage } = require('@google-cloud/storage');
const fs = require('fs/promises');
require('dotenv').config(); // Завантажуємо змінні з .env

// 2. Налаштування
const BUCKET_NAME = process.env.GCS_BUCKET_NAME;
const KEY_BASE64 = process.env.GCS_SERVICE_ACCOUNT_KEY_BASE64;
const TARGET_FOLDER = 'front-end/08-about/01-New Team Photos'; // Папка, яку скануємо
const OUTPUT_FILE = 'gcs_file_list.json'; // Назва файлу з результатом

// 3. Перевірка наявності змінних
if (!BUCKET_NAME || !KEY_BASE64) {
  console.error('❌ Помилка: Переконайся, що GCS_BUCKET_NAME та GCS_SERVICE_ACCOUNT_KEY_BASE64 є у твоєму .env файлі.');
  process.exit(1); // Зупиняємо виконання, якщо чогось не вистачає
}


const keyJson = Buffer.from(KEY_BASE64, 'base64').toString('utf-8');
const credentials = JSON.parse(keyJson);
const storage = new Storage({ credentials });


async function scanBucket() {
  try {
    console.log(`🚀 Починаємо сканування папки '${TARGET_FOLDER}' у бакеті '${BUCKET_NAME}'...`);

    // 5. Отримуємо список файлів з GCS
    const [files] = await storage.bucket(BUCKET_NAME).getFiles({ prefix: TARGET_FOLDER });

    // 6. Фільтруємо "папки" і форматуємо дані
    const fileData = files
      .filter(file => !file.name.endsWith('/')) // Виключаємо об'єкти, що є папками
      .map(file => ({
        path: file.name,
        size: file.metadata.size, // Розмір у байтах
        updated: file.metadata.updated, // Дата останнього оновлення
      }));

    if (fileData.length === 0) {
      console.warn('⚠️ Увага: Не знайдено жодного файлу в зазначеній папці.');
    } else {
      console.log(`✅ Знайдено ${fileData.length} файлів.`);
    }

    // 7. Зберігаємо дані в локальний JSON-файл
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(fileData, null, 2));
    console.log(`✨ Успіх! Список файлів збережено у файлі: ${OUTPUT_FILE}`);

  } catch (error) {
    console.error('❌ Сталася критична помилка під час виконання скрипта:', error.message);
  }
}

// 8. Запускаємо функцію
scanBucket();