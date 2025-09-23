// 1. Імпортуємо бібліотеки
const express = require('express');
const cors = require('cors');
const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

// 2. Ініціалізація
const app = express();
const PORT = process.env.PORT || 3001;

// Декодуємо ключ з Base64
const keyJson = Buffer.from(process.env.GCS_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf-8');
const credentials = JSON.parse(keyJson);

// Ініціалізуємо клієнт GCS
const storage = new Storage({ credentials });
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

// 3. Налаштування Express (Middleware)
app.use(cors());
app.use(express.json());

// 4. API-ендпоінти

// Ендпоінт для генерації URL для ЗАВАНТАЖЕННЯ (write)
app.post('/generate-upload-url', async (req, res) => {
  console.log('Received request to generate UPLOAD URL');
  try {
    const { fileName, fileType } = req.body;
    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'fileName and fileType are required.' });
    }

    const destinationFolder = fileType.startsWith('video/') ? 'back-end/videos' : 'back-end/previews';
    const uniqueFileName = `${crypto.randomUUID()}-${fileName}`;
    const filePath = `${destinationFolder}/${uniqueFileName}`;
    const file = bucket.file(filePath);

    const options = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 хвилин
      contentType: fileType,
    };

    const [signedUrl] = await file.getSignedUrl(options);
    res.status(200).json({ signedUrl, gcsPath: filePath });

  } catch (error) {
    console.error('Error generating signed UPLOAD URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL.', details: error.message });
  }
});

// 🚀 НОВИЙ ЕНДПОІНТ для генерації URL для ЧИТАННЯ (read)
app.post('/generate-read-urls', async (req, res) => {
  console.log('Received request to generate READ URLs');
  try {
    const { gcsPaths } = req.body;
    if (!gcsPaths || !Array.isArray(gcsPaths) || gcsPaths.length === 0) {
      return res.status(400).json({ error: 'gcsPaths must be a non-empty array.' });
    }

    const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 10 * 60 * 1000, // 10 хвилин (коротший час життя для читання)
    };

    // Генеруємо URL для кожного шляху паралельно
    const signedUrlsPromises = gcsPaths.map(async (path) => {
      if (typeof path !== 'string' || path.trim() === '') {
        return { path, url: null, error: 'Invalid path' };
      }
      try {
        const file = bucket.file(path);
        const [url] = await file.getSignedUrl(options);
        return { path, url };
      } catch (fileError) {
        console.error(`Could not get signed URL for ${path}:`, fileError.message);
        return { path, url: null, error: fileError.message };
      }
    });

    const results = await Promise.all(signedUrlsPromises);
    
    // Перетворюємо масив результатів у зручний об'єкт { path: url }
    const signedUrlsMap = results.reduce((acc, result) => {
      if (result.url) {
        acc[result.path] = result.url;
      }
      return acc;
    }, {});
    
    res.status(200).json(signedUrlsMap);

  } catch (error) {
    console.error('Error generating signed READ URLs:', error);
    res.status(500).json({ error: 'Failed to generate read URLs.', details: error.message });
  }
});


// 5. Запускаємо сервер
app.listen(PORT, () => {
  console.log(`✅ Backend server is running on http://localhost:${PORT}`);
});