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
        status: 'Active',
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
          display_order,
          media_items (
            preview_gcs_path
          )
        )
      `)
      .order('created_at', { ascending: false })
      .order('display_order', { referencedTable: 'reel_media_items', ascending: true }); 

    if (error) throw error;
    
    const flattenedData = data.map(reel => {
        const firstItem = reel.reel_media_items[0];
        const preview_path = firstItem?.media_items?.preview_gcs_path || null;
        
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

app.delete('/reels/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Received request to DELETE reel with id: ${id}`);

  try {
    const { error: linksError } = await supabase
      .from('reel_media_items')
      .delete()
      .eq('reel_id', id);

    if (linksError) throw linksError;
    console.log(`Deleted links for reel ${id} from reel_media_items.`);

    const { error: reelError } = await supabase
      .from('reels')
      .delete()
      .eq('id', id);

    if (reelError) throw reelError;
    console.log(`Deleted reel ${id} from reels table.`);

    res.status(200).json({ message: 'Reel deleted successfully.' });

  } catch (error) {
    console.error(`Error deleting reel ${id}:`, error);
    res.status(500).json({ error: 'Failed to delete reel.', details: error.message });
  }
});


/* ========================================================================== */
/* ПУБЛІЧНИЙ ЕНДПОІНТ ДЛЯ СТОРІНКИ РІЛСА                                     */
/* ========================================================================== */

app.get('/reels/public/:short_link', async (req, res) => {
    const { short_link } = req.params;

    try {
        const { data: reel, error: reelError } = await supabase
            .from('reels')
            .select(`
                id, title, status, 
                reel_media_items (
                    display_order,
                    media_items ( id, title, client, artists, categories, video_gcs_path, preview_gcs_path )
                )
            `)
            .eq('short_link', short_link)
            .single();

        if (reelError || !reel) {
            return res.status(404).json({ error: 'Failed to fetch reel data.', details: "Reel not found." });
        }
        if (reel.status !== 'Active') {
            return res.status(403).json({ error: 'Failed to fetch reel data.', details: "This reel is not active." });
        }
        
        const sortedMediaItemsRelations = (reel.reel_media_items || []).sort(
            (a, b) => a.display_order - b.display_order
        );
            
        const sortedMediaItems = sortedMediaItemsRelations
            .map(item => item.media_items)
            .filter(Boolean);

        if (sortedMediaItems.length === 0) {
            console.warn(`Reel ${short_link} is active but has no media items.`);
        }
        
        const readOptions = {
            version: 'v4', action: 'read', expires: Date.now() + 20 * 60 * 1000, 
        };

        const mediaItemsWithUrls = await Promise.all(sortedMediaItems.map(async (item) => {
            let videoUrl = null, previewUrl = null;
            try {
                if(item.video_gcs_path) [videoUrl] = await bucket.file(item.video_gcs_path).getSignedUrl(readOptions);
                if(item.preview_gcs_path) [previewUrl] = await bucket.file(item.preview_gcs_path).getSignedUrl(readOptions);
            } catch (urlError) {
                console.error(`Failed to get signed URL for item ${item.id}:`, urlError.message);
            }
            return { ...item, videoUrl, previewUrl: previewUrl || videoUrl };
        }));
        
        const publicData = { reelTitle: reel.title, mediaItems: mediaItemsWithUrls };
        res.status(200).json(publicData);

    } catch (error) {
        console.error(`Error fetching public reel data for ${short_link}:`, error.message);
        res.status(500).json({ error: 'Failed to fetch reel data.', details: error.message });
    }
});

/* ========================================================================== */
/* ЕНДПОІНТИ ДЛЯ МЕДІА-АЙТЕМІВ                                                */
/* ========================================================================== */

app.get('/media-items/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Received request to GET media item with id: ${id}`);
  try {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Media item not found.' });
    
    res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching media item ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch media item.', details: error.message });
  }
});

app.put('/media-items/:id', async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    console.log(`Received request to UPDATE media item with id: ${id}`);

    try {
        const { data: currentItem, error: fetchError } = await supabase
            .from('media_items')
            .select('video_gcs_path, preview_gcs_path')
            .eq('id', id)
            .single();

        if (fetchError) throw new Error('Could not fetch current item to compare files.');

        const { error: updateError } = await supabase
            .from('media_items')
            .update(updatedData)
            .eq('id', id);

        if (updateError) throw updateError;
        
        const filesToDelete = [];
        if (currentItem.video_gcs_path && currentItem.video_gcs_path !== updatedData.video_gcs_path) {
            filesToDelete.push(currentItem.video_gcs_path);
        }
        if (currentItem.preview_gcs_path && currentItem.preview_gcs_path !== updatedData.preview_gcs_path) {
            filesToDelete.push(currentItem.preview_gcs_path);
        }

        if (filesToDelete.length > 0) {
            console.log(`Deleting old GCS files: ${filesToDelete.join(', ')}`);
            await Promise.all(
                filesToDelete.map(path => bucket.file(path).delete().catch(err => console.error(`Failed to delete old file ${path}:`, err.message)))
            );
        }

        res.status(200).json({ message: 'Media item updated successfully.' });
    } catch (error) {
        console.error(`Error updating media item ${id}:`, error);
        res.status(500).json({ error: 'Failed to update media item.', details: error.message });
    }
});

app.delete('/media-items/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Received request to DELETE media item with id: ${id}`);

  try {
    const { data: item, error: fetchError } = await supabase
      .from('media_items')
      .select('video_gcs_path, preview_gcs_path')
      .eq('id', id)
      .single();

    if (fetchError || !item) {
      if (fetchError && fetchError.code === 'PGRST116') {
        return res.status(200).json({ message: 'Item not found, assumed already deleted.' });
      }
      throw new Error(fetchError?.message || `Media item with id ${id} not found.`);
    }

    const { data: affectedReelLinks, error: linksError } = await supabase
      .from('reel_media_items')
      .select('reel_id')
      .eq('media_item_id', id);
    if (linksError) throw linksError;
    const affectedReelIds = affectedReelLinks.map(link => link.reel_id);

    const { error: deleteLinksError } = await supabase
        .from('reel_media_items')
        .delete()
        .eq('media_item_id', id);
    if (deleteLinksError) throw deleteLinksError;
    console.log(`Removed links for item ${id} from reel_media_items table.`);

    if (affectedReelIds.length > 0) {
      console.log(`Item ${id} was part of reels: ${affectedReelIds.join(', ')}. Checking them for emptiness...`);

      const { data: remainingLinks, error: checkError } = await supabase
        .from('reel_media_items')
        .select('reel_id')
        .in('reel_id', affectedReelIds);
      
      if (checkError) throw checkError;
      
      const reelsThatStillHaveItems = new Set((remainingLinks || []).map(link => link.reel_id));
      const reelsToDeleteIds = affectedReelIds.filter(reelId => !reelsThatStillHaveItems.has(reelId));

      if (reelsToDeleteIds.length > 0) {
        console.log(`The following reels are now empty and will be deleted: ${reelsToDeleteIds.join(', ')}`);
        const { error: deleteReelsError } = await supabase
          .from('reels')
          .delete()
          .in('id', reelsToDeleteIds);
        if (deleteReelsError) throw deleteReelsError;
      }
    }

    const pathsToDelete = [item.video_gcs_path, item.preview_gcs_path].filter(Boolean);
    if (pathsToDelete.length > 0) {
      console.log(`Deleting GCS files: ${pathsToDelete.join(', ')}`);
      await Promise.all(
        pathsToDelete.map(async (path) => {
          try {
            await bucket.file(path).delete();
          } catch (gcsError) {
            if (gcsError.code !== 404) console.error(`Failed to delete GCS file ${path}:`, gcsError.message);
            else console.warn(`GCS file ${path} not found, skipping.`);
          }
        })
      );
    }

    console.log(`Deleting Supabase record for item id: ${id}`);
    const { error: deleteError } = await supabase.from('media_items').delete().eq('id', id);
    if (deleteError) throw deleteError;

    res.status(200).json({ message: 'Media item and related empty reels deleted successfully.' });

  } catch (error) {
    console.error(`Error deleting media item ${id}:`, error);
    res.status(500).json({ error: 'Failed to delete media item.', details: error.message });
  }
});


// 5. Запускаємо сервер
app.listen(PORT, () => {
  console.log(`✅ Backend server is running on http://localhost:${PORT}`);
});