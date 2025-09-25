// 1. Імпортуємо бібліотеки
const express = require('express');
const cors = require('cors');
const { Storage } = require('@google-cloud/storage');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

// 2. Ініціалізація
const app = express();
const PORT = process.env.PORT || 3001;

// Декодуємо ключ GCS з Base64
const keyJson = Buffer.from(process.env.GCS_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf-8');
const credentials = JSON.parse(keyJson);

// Ініціалізуємо клієнт GCS
const storage = new Storage({ credentials });
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

// Ініціалізуємо клієнт Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("FATAL ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in your .env file.");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

// 3. Налаштування Express (Middleware)
app.use(cors());
app.use(express.json());

// --- Допоміжна функція для генерації унікального ID ---
function generateShortId(length = 5) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ========================================================================== //
// 4. API-ЕНДПОІНТИ ДЛЯ GOOGLE CLOUD STORAGE
// ========================================================================== //

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

// Ендпоінт для генерації URL для ЧИТАННЯ (read)
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
      expires: Date.now() + 10 * 60 * 1000, // 10 хвилин
    };

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


/* ========================================================================== */
/* ЕНДПОІНТИ ДЛЯ РІЛСІВ (АДМІН ПАНЕЛЬ)                                       */
/* ========================================================================== */

// --- Створення нового рілса ---
app.post('/reels', async (req, res) => {
  const { title, media_item_ids, user_id } = req.body;

  if (!title || !media_item_ids || !user_id || media_item_ids.length === 0) {
    return res.status(400).json({ error: 'Title, user_id, and at least one media_item_id are required.' });
  }

  try {
    let shortLink;
    let isUnique = false;
    while (!isUnique) {
      shortLink = generateShortId();
      const { data, error } = await supabase.from('reels').select('id').eq('short_link', shortLink).single();
      if (!data) isUnique = true;
      if (error && error.code !== 'PGRST116') throw error;
    }

    const { data: newReel, error: reelError } = await supabase
      .from('reels')
      .insert({
        title,
        short_link: shortLink,
        status: 'Active', // ВИПРАВЛЕНО: рілс створюється одразу активним
        created_by_user_id: user_id,
      })
      .select()
      .single();

    if (reelError) throw reelError;

    const reelMediaItemsData = media_item_ids.map((mediaId, index) => ({
      reel_id: newReel.id,
      media_item_id: mediaId,
      display_order: index + 1,
    }));

    const { error: itemsError } = await supabase.from('reel_media_items').insert(reelMediaItemsData);

    if (itemsError) throw itemsError;

    res.status(201).json(newReel);
  } catch (error) {
    console.error('Error creating reel:', error);
    res.status(500).json({ error: 'Failed to create reel.', details: error.message });
  }
});

// --- Отримання списку всіх рілсів для сторінки аналітики ---
app.get('/reels', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reels')
      .select(`
        id,
        title,
        created_at,
        short_link,
        status,
        reel_media_items (
          media_items (
            preview_gcs_path
          )
        )
      `)
      .eq('reel_media_items.display_order', 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const flattenedData = data.map(reel => {
        const preview_path = reel.reel_media_items[0]?.media_items?.preview_gcs_path || null;
        const { reel_media_items, ...rest } = reel;
        return {
            ...rest,
            preview_gcs_path: preview_path,
        };
    });

    res.status(200).json(flattenedData);
  } catch (error) {
    console.error('Error fetching reels:', error);
    res.status(500).json({ error: 'Failed to fetch reels.', details: error.message });
  }
});


// --- Оновлення статусу рілса ---
app.put('/reels/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ error: 'A valid status ("Active" or "Inactive") is required.' });
  }

  try {
    const { data, error } = await supabase
      .from('reels')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error(`Error updating reel ${id}:`, error);
    res.status(500).json({ error: 'Failed to update reel status.', details: error.message });
  }
});


/* ========================================================================== */
/* ПУБЛІЧНИЙ ЕНДПОІНТ ДЛЯ СТОРІНКИ РІЛСА (ПОВНІСТЮ ВИПРАВЛЕНО)              */
/* ========================================================================== */

app.get('/reels/public/:short_link', async (req, res) => {
    const { short_link } = req.params;

    try {
        // 1. Знаходимо рілс за посиланням та пов'язані медіа-елементи через проміжну таблицю
        const { data: reel, error: reelError } = await supabase
            .from('reels')
            .select(`
                id, 
                title, 
                status, 
                reel_media_items (
                    display_order,
                    media_items (
                        id, title, client, artists, categories, video_gcs_path, preview_gcs_path
                    )
                )
            `)
            .eq('short_link', short_link)
            .single();

        if (reelError || !reel) {
            console.error(`Reel lookup failed for ${short_link}:`, reelError?.message);
            throw new Error("Reel not found.");
        }
        if (reel.status !== 'Active') throw new Error("This reel is not active.");
        
        // 2. Обробляємо та сортуємо отримані медіа-елементи
        const sortedMediaItems = (reel.reel_media_items || [])
            .map(item => item.media_items) // Витягуємо вкладений об'єкт media_items
            .filter(Boolean) // Видаляємо можливі null значення
            .sort((a, b) => a.display_order - b.display_order); // Сортуємо за порядком

        if (sortedMediaItems.length === 0) {
            console.warn(`Reel ${short_link} is active but has no media items.`);
        }
        
        // 3. Генеруємо підписані URL для GCS
        const readOptions = {
            version: 'v4',
            action: 'read',
            expires: Date.now() + 20 * 60 * 1000, // 20 хвилин
        };

        const mediaItemsWithUrls = await Promise.all(sortedMediaItems.map(async (item) => {
            let videoUrl = null;
            let previewUrl = null;

            try {
                if(item.video_gcs_path) {
                    const [signedVideoUrl] = await bucket.file(item.video_gcs_path).getSignedUrl(readOptions);
                    videoUrl = signedVideoUrl;
                }
                if(item.preview_gcs_path) {
                    const [signedPreviewUrl] = await bucket.file(item.preview_gcs_path).getSignedUrl(readOptions);
                    previewUrl = signedPreviewUrl;
                }
            } catch (urlError) {
                console.error(`Failed to get signed URL for ${item.video_gcs_path || item.preview_gcs_path}:`, urlError.message);
            }
            
            return {
                ...item,
                videoUrl,
                previewUrl: previewUrl || videoUrl, // Якщо немає прев'ю, використовуємо відео
            };
        }));
        
        // 4. Формуємо фінальну відповідь
        const publicData = {
            reelTitle: reel.title,
            mediaItems: mediaItemsWithUrls,
        };

        res.status(200).json(publicData);

    } catch (error) {
        console.error(`Error fetching public reel data for ${short_link}:`, error.message);
        const statusCode = error.message === "Reel not found." ? 404 : 500;
        res.status(statusCode).json({ error: 'Failed to fetch reel data.', details: error.message });
    }
});


// 5. Запускаємо сервер
app.listen(PORT, () => {
  console.log(`✅ Backend server is running on http://localhost:${PORT}`);
});