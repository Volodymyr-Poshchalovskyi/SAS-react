// 1. Імпортуємо бібліотеки
const path = require('path');
const express = require('express');
const cors = require('cors');
const { Storage } = require('@google-cloud/storage');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

// 2. Ініціалізація
const app = express();
const PORT = process.env.PORT || 3001;

const keyJson = Buffer.from(
  process.env.GCS_SERVICE_ACCOUNT_KEY_BASE64,
  'base64'
).toString('utf-8');
const credentials = JSON.parse(keyJson);
const storage = new Storage({ credentials });
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error(
    'FATAL ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in your .env file.'
  );
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

// 3. Налаштування Express (Middleware)
const allowedOrigins = [
  'http://localhost:5173',           // Для локальної розробки
  'http://192.168.0.123:5173',       // Адреса вашого Vite у локальній мережі
  'http://192.168.1.103:5173',
  'http://192.168.1.106:5173',    
  'http://192.168.1.110:5173',      // Можлива інша адреса у локальній мережі
  'https://sas-frontend-zhgs.onrender.com' // Для розгорнутого додатка
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// ✨ КІНЕЦЬ ЗМІН

app.use(express.json());

function generateShortId(length = 5) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ========================================================================== //
// API-ЕНДПОІНТИ ДЛЯ GOOGLE CLOUD STORAGE
// ========================================================================== //

app.post('/generate-upload-url', async (req, res) => {
  try {
    const { fileName, fileType, destination, role } = req.body;
    if (!fileName || !fileType)
      return res
        .status(400)
        .json({ error: 'fileName and fileType are required.' });

    let destinationFolder;

    if (destination === 'artists') {
      destinationFolder = 'back-end/artists';
    } else if (destination === 'feature_pdf') { 
      destinationFolder = 'back-end/feature_pdf';
    } else if (role === 'main') {
      destinationFolder = 'back-end/videos';
    } else if (role === 'preview') {
      destinationFolder = 'back-end/previews';
    } else {
      destinationFolder = fileType.startsWith('video/')
        ? 'back-end/videos'
        : 'back-end/previews';
    }

    const uniqueFileName = `${crypto.randomUUID()}-${fileName}`;
    const filePath = `${destinationFolder}/${uniqueFileName}`;
    const file = bucket.file(filePath);
    const options = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000,
      contentType: fileType,
    };
    const [signedUrl] = await file.getSignedUrl(options);
    res.status(200).json({ signedUrl, gcsPath: filePath });
  } catch (error) {
    console.error('Error generating signed UPLOAD URL:', error);
    res
      .status(500)
      .json({
        error: 'Failed to generate upload URL.',
        details: error.message,
      });
  }
});

app.post('/generate-read-urls', async (req, res) => {
  try {
    const { gcsPaths } = req.body;
    if (!gcsPaths || !Array.isArray(gcsPaths) || gcsPaths.length === 0)
      return res
        .status(400)
        .json({ error: 'gcsPaths must be a non-empty array.' });
    const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 10 * 60 * 1000,
    };
    const signedUrlsPromises = gcsPaths.map(async (path) => {
      if (typeof path !== 'string' || path.trim() === '')
        return { path, url: null, error: 'Invalid path' };
      try {
        const [url] = await bucket.file(path).getSignedUrl(options);
        return { path, url };
      } catch (fileError) {
        return { path, url: null, error: fileError.message };
      }
    });
    const results = await Promise.all(signedUrlsPromises);
    const signedUrlsMap = results.reduce((acc, result) => {
      if (result.url) acc[result.path] = result.url;
      return acc;
    }, {});
    res.status(200).json(signedUrlsMap);
  } catch (error) {
    console.error('Error generating signed READ URLs:', error);
    res
      .status(500)
      .json({ error: 'Failed to generate read URLs.', details: error.message });
  }
});

// ========================================================================== //
// ЕНДПОІНТИ ДЛЯ АРТИСТІВ
// ========================================================================== //

app.post('/artists/details-by-names', async (req, res) => {
  const { names } = req.body;
  if (!names || !Array.isArray(names) || names.length === 0) {
    return res.status(400).json({ error: 'An array of names is required.' });
  }

  try {
    const { data, error } = await supabase
      .from('artists')
      .select('name, photo_gcs_path')
      .in('name', names);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching artists by names:', error);
    res
      .status(500)
      .json({
        error: 'Failed to fetch artist details.',
        details: error.message,
      });
  }
});

app.put('/artists/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, photo_gcs_path } = req.body;

  try {
    const { data: currentItem, error: fetchError } = await supabase
      .from('artists')
      .select('photo_gcs_path')
      .eq('id', id)
      .single();
    if (fetchError)
      throw new Error('Could not fetch current artist to compare photo.');

    const { data: updatedArtist, error: updateError } = await supabase
      .from('artists')
      .update({ name, description, photo_gcs_path })
      .eq('id', id)
      .select()
      .single();
    if (updateError) throw updateError;

    if (
      currentItem.photo_gcs_path &&
      currentItem.photo_gcs_path !== photo_gcs_path
    ) {
      await bucket
        .file(currentItem.photo_gcs_path)
        .delete()
        .catch((err) =>
          console.error(
            `Failed to delete old artist photo ${currentItem.photo_gcs_path}:`,
            err.message
          )
        );
    }

    res.status(200).json(updatedArtist);
  } catch (error) {
    console.error(`Error updating artist ${id}:`, error);
    res
      .status(500)
      .json({ error: 'Failed to update artist.', details: error.message });
  }
});

app.delete('/artists/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: item, error: fetchError } = await supabase
      .from('artists')
      .select('photo_gcs_path')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const { error: deleteError } = await supabase
      .from('artists')
      .delete()
      .eq('id', id);
    if (deleteError) throw deleteError;

    if (item && item.photo_gcs_path) {
      await bucket
        .file(item.photo_gcs_path)
        .delete()
        .catch((err) =>
          console.warn(
            `Could not delete artist photo ${item.photo_gcs_path}`,
            err.message
          )
        );
    }

    res.status(200).json({ message: 'Artist deleted successfully.' });
  } catch (error) {
    console.error(`Error deleting artist ${id}:`, error);
    res
      .status(500)
      .json({ error: 'Failed to delete artist.', details: error.message });
  }
});

// ========================================================================== //
// ЕНДПОІНТИ ДЛЯ АНАЛІТИКИ
// ========================================================================== //

app.post('/reels/log-event', async (req, res) => {
  const { reel_id, session_id, event_type, media_item_id, duration_seconds } =
    req.body;
  if (!reel_id || !session_id || !event_type) {
    return res
      .status(400)
      .json({ error: 'Missing required fields for logging.' });
  }
  if (event_type === 'completion' && !media_item_id) {
    return res
      .status(400)
      .json({ error: 'media_item_id is required for completion events.' });
  }
  try {
    const { error } = await supabase
      .from('reel_views')
      .insert({
        reel_id,
        session_id,
        event_type,
        media_item_id: media_item_id || null,
        duration_seconds: duration_seconds || null,
      });
    if (error) throw error;
    res.status(201).json({ message: 'Event logged successfully.' });
  } catch (error) {
    console.error('Error logging analytics event:', error);
    res
      .status(500)
      .json({ error: 'Failed to log event.', details: error.message });
  }
});

// ========================================================================== //
// ЕНДПОІНТИ ДЛЯ АНАЛІТИКИ ДАШБОРДУ
// ========================================================================== //

app.get('/analytics/views-over-time', async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: 'startDate and endDate query parameters are required.' });
  }

  try {
    const { data: events, error } = await supabase
      .from('reel_views')
      .select('created_at')
      .eq('event_type', 'media_completion')
      .gte('created_at', new Date(startDate).toISOString())
      .lte(
        'created_at',
        new Date(new Date(endDate).setUTCHours(23, 59, 59, 999)).toISOString()
      );

    if (error) throw error;

    const countsByDay = events.reduce((acc, event) => {
      const date = event.created_at.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const result = [];
    let currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        views: countsByDay[dateStr] || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching views over time:', error);
    res
      .status(500)
      .json({
        error: 'Failed to fetch daily view counts.',
        details: error.message,
      });
  }
});

app.get('/analytics/trending-media', async (req, res) => {
  const { startDate, endDate, limit = 4 } = req.query;
  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: 'startDate and endDate query parameters are required.' });
  }
  const fullEndDate = new Date(endDate);
  fullEndDate.setUTCHours(23, 59, 59, 999);

  try {
    const { data: completionEvents, error: viewError } = await supabase
      .from('reel_views')
      .select('media_item_id')
      .eq('event_type', 'media_completion')
      .not('media_item_id', 'is', null)
      .gte('created_at', startDate)
      .lte('created_at', fullEndDate.toISOString());

    if (viewError) throw viewError;
    if (!completionEvents || completionEvents.length === 0) {
      return res.status(200).json([]);
    }

    const countsByMediaItem = completionEvents.reduce(
      (acc, { media_item_id }) => {
        acc[media_item_id] = (acc[media_item_id] || 0) + 1;
        return acc;
      },
      {}
    );

    const topMediaItemIds = Object.entries(countsByMediaItem)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, Number(limit))
      .map(([mediaItemId]) => mediaItemId);

    if (topMediaItemIds.length === 0) {
      return res.status(200).json([]);
    }

    const { data: trendingItems, error: itemsError } = await supabase
      .from('media_items')
      .select(`id, title, client, preview_gcs_path, artists`)
      .in('id', topMediaItemIds);

    if (itemsError) throw itemsError;

    const result = trendingItems.map((item) => ({
      ...item,
      views: countsByMediaItem[item.id] || 0,
    }));

    result.sort((a, b) => b.views - a.views);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching trending media:', error);
    res
      .status(500)
      .json({
        error: 'Failed to fetch trending media.',
        details: error.message,
      });
  }
});

app.get('/analytics/recent-activity', async (req, res) => {
  const { limit = 5 } = req.query;
  try {
    const { data: reels, error: reelsError } = await supabase
      .from('reels')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(Number(limit));
    if (reelsError) throw reelsError;
    const enrichedReels = await Promise.all(
      reels.map(async (reel) => {
        const { data: firstItem, error: itemError } = await supabase
          .from('reel_media_items')
          .select('media_items(client, preview_gcs_path)')
          .eq('reel_id', reel.id)
          .order('display_order', { ascending: true })
          .limit(1)
          .single();
        return {
          ...reel,
          client: itemError ? 'N/A' : firstItem.media_items.client,
          preview_gcs_path: itemError
            ? null
            : firstItem.media_items.preview_gcs_path,
        };
      })
    );
    res.status(200).json(enrichedReels);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res
      .status(500)
      .json({
        error: 'Failed to fetch recent activity.',
        details: error.message,
      });
  }
});

// ========================================================================== //
// ЕНДПОІНТИ ДЛЯ РІЛСІВ (АДМІН ПАНЕЛЬ)
// ========================================================================== //

app.post('/reels', async (req, res) => {
  const { title, media_item_ids, user_id } = req.body;
  if (!title || !media_item_ids || !user_id || media_item_ids.length === 0)
    return res
      .status(400)
      .json({
        error: 'Title, user_id, and at least one media_item_id are required.',
      });
  try {
    let shortLink;
    let isUnique = false;
    while (!isUnique) {
      shortLink = generateShortId();
      const { data, error } = await supabase
        .from('reels')
        .select('id')
        .eq('short_link', shortLink)
        .single();
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
    const { error: itemsError } = await supabase
      .from('reel_media_items')
      .insert(reelMediaItemsData);
    if (itemsError) throw itemsError;
    res.status(201).json(newReel);
  } catch (error) {
    console.error('Error creating reel:', error);
    res
      .status(500)
      .json({ error: 'Failed to create reel.', details: error.message });
  }
});

app.get('/reels', async (req, res) => {
  try {
    const { data: reels, error: reelsError } = await supabase
      .from('reels')
      .select('*, user_profiles(first_name, last_name)')
      .order('created_at', { ascending: false });

    if (reelsError) throw reelsError;

    const { data: allLinks, error: linksError } = await supabase
      .from('reel_media_items')
      .select(
        'reel_id, media_item_id, display_order, media_items(preview_gcs_path)'
      );
    if (linksError) throw linksError;

    const { data: allViews, error: viewsError } = await supabase
      .from('reel_views')
      .select('reel_id, session_id, event_type, duration_seconds');
    if (viewsError) throw viewsError;

    const mediaIdsByReel = allLinks.reduce((acc, link) => {
      if (!acc[link.reel_id]) acc[link.reel_id] = [];
      acc[link.reel_id].push({
        id: link.media_item_id,
        order: link.display_order,
      });
      return acc;
    }, {});
    for (const reelId in mediaIdsByReel) {
      mediaIdsByReel[reelId].sort((a, b) => a.order - b.order);
      mediaIdsByReel[reelId] = mediaIdsByReel[reelId].map((item) => item.id);
    }
    const previewPathByReelId = allLinks
      .sort((a, b) => a.display_order - b.display_order)
      .reduce((acc, link) => {
        if (!acc[link.reel_id] && link.media_items) {
          acc[link.reel_id] = link.media_items.preview_gcs_path;
        }
        return acc;
      }, {});

    const analyticsByReel = allViews.reduce((acc, view) => {
      const { reel_id, session_id, event_type, duration_seconds } = view;
      if (!acc[reel_id]) {
        acc[reel_id] = {
          sessions: new Set(),
          completions: 0,
          durations: [],
        };
      }
      acc[reel_id].sessions.add(session_id);
      if (event_type === 'completion') {
        acc[reel_id].completions++;
      }
      if (event_type === 'session_duration' && duration_seconds != null) {
        acc[reel_id].durations.push(duration_seconds);
      }
      return acc;
    }, {});

    const analyticsData = reels.map((reel) => {
      const reelAnalytics = analyticsByReel[reel.id] || {
        sessions: new Set(),
        completions: 0,
        durations: [],
      };
      const total_views = reelAnalytics.sessions.size;
      const completed_views = reelAnalytics.completions;
      const completion_rate =
        total_views > 0 ? (completed_views / total_views) * 100 : 0;
      const durations = reelAnalytics.durations;
      const avg_watch_duration =
        durations.length > 0
          ? durations.reduce((sum, d) => sum + d, 0) / durations.length
          : 0;

      return {
        ...reel,
        media_item_ids: mediaIdsByReel[reel.id] || [],
        preview_gcs_path: previewPathByReelId[reel.id] || null,
        total_views,
        completed_views,
        completion_rate,
        avg_watch_duration,
      };
    });

    res.status(200).json(analyticsData);
  } catch (error) {
    console.error('Error fetching reels with analytics:', error);
    res
      .status(500)
      .json({ error: 'Failed to fetch reels.', details: error.message });
  }
});

app.put('/reels/:id', async (req, res) => {
  const { id } = req.params;
  const { title, artists, status, media_item_ids } = req.body;

  try {
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (artists !== undefined) updateData.artists = artists;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length > 0) {
      const { error: updateReelError } = await supabase
        .from('reels')
        .update(updateData)
        .eq('id', id);
      if (updateReelError) throw updateReelError;
    }

    if (media_item_ids && Array.isArray(media_item_ids)) {
      const { error: deleteError } = await supabase
        .from('reel_media_items')
        .delete()
        .eq('reel_id', id);
      if (deleteError) throw deleteError;

      if (media_item_ids.length > 0) {
        const newReelMediaItems = media_item_ids.map((mediaId, index) => ({
          reel_id: id,
          media_item_id: mediaId,
          display_order: index + 1,
        }));
        const { error: insertError } = await supabase
          .from('reel_media_items')
          .insert(newReelMediaItems);
        if (insertError) throw insertError;
      }
    }

    const { data: finalReel, error: finalFetchError } = await supabase
      .from('reels')
      .select('*, user_profiles(first_name, last_name)')
      .eq('id', id)
      .single();

    if (finalFetchError) throw finalFetchError;

    const { data: views, error: viewsError } = await supabase
      .from('reel_views')
      .select('session_id, event_type')
      .eq('reel_id', id);
    if (viewsError)
      console.warn(
        'Could not fetch views for updated reel, analytics data might be incomplete.'
      );

    const total_views = views
      ? new Set(views.map((v) => v.session_id)).size
      : 0;
    const completed_views = views
      ? views.filter((v) => v.event_type === 'completion').length
      : 0;

    res.status(200).json({
      ...finalReel,
      total_views,
      completed_views,
      completion_rate:
        total_views > 0 ? (completed_views / total_views) * 100 : 0,
      media_item_ids: media_item_ids || [],
    });
  } catch (error) {
    console.error(`Error updating reel ${id}:`, error);
    res
      .status(500)
      .json({ error: 'Failed to update reel.', details: error.message });
  }
});

app.delete('/reels/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await supabase.from('reel_media_items').delete().eq('reel_id', id);
    await supabase.from('reel_views').delete().eq('reel_id', id);
    await supabase.from('reels').delete().eq('id', id);
    res.status(200).json({ message: 'Reel deleted successfully.' });
  } catch (error) {
    console.error(`Error deleting reel ${id}:`, error);
    res
      .status(500)
      .json({ error: 'Failed to delete reel.', details: error.message });
  }
});

// ========================================================================== //
// ПУБЛІЧНИЙ ЕНДПОІНТ ДЛЯ СТОРІНКИ РІЛСА
// ========================================================================== //

app.get('/reels/public/:short_link', async (req, res) => {
  try {
    const { data: reel, error: reelError } = await supabase
      .from('reels')
      .select(
        `id, title, status, reel_media_items(display_order, media_items(id, title, client, artists, video_gcs_path, video_hls_path, preview_gcs_path, craft, allow_download))`
      )
      .eq('short_link', req.params.short_link)
      .single();

    if (reelError || !reel)
      return res.status(404).json({ details: 'Reel not found.' });
    if (reel.status !== 'Active')
      return res.status(403).json({ details: 'This reel is not active.' });

    const sortedMediaItems = (reel.reel_media_items || [])
      .sort((a, b) => a.display_order - b.display_order)
      .map((item) => item.media_items)
      .filter(Boolean);

    const defaultDirectorImagePath = 'back-end/artists/director.jpg';

    const mediaItemsWithPaths = await Promise.all(
      sortedMediaItems.map(async (item) => {
        const artistNames = (item.artists || '')
          .split(',')
          .map((name) => name.trim())
          .filter(Boolean);
        let enrichedArtists = [];
        if (artistNames.length > 0) {
          const { data: artistRecords, error: artistsError } = await supabase
            .from('artists')
            .select('name, description, photo_gcs_path')
            .in('name', artistNames);

          if (artistsError)
            console.error('Error fetching artists:', artistsError.message);

          const artistMap = (artistRecords || []).reduce((acc, artist) => {
            acc[artist.name] = artist;
            return acc;
          }, {});

          enrichedArtists = artistNames.map((name) => {
            const record = artistMap[name];
            const photoPath =
              record && record.photo_gcs_path
                ? record.photo_gcs_path
                : defaultDirectorImagePath;
            return {
              name: record ? record.name : name,
              description: record ? record.description : null,
              photoGcsPath: photoPath,
            };
          });
        }

        return {
            ...item, // ✨ ДОДАНО ЦЕЙ ВАЖЛИВИЙ РЯДОК
          videoGcsPath: item.video_gcs_path,
          video_hls_path: item.video_hls_path, 
          previewGcsPath: item.preview_gcs_path || item.video_gcs_path,
          artists: enrichedArtists,
        };
      })
    );
    
    const publicData = {
      reelDbId: reel.id,
      reelTitle: reel.title,
      mediaItems: mediaItemsWithPaths,
    };
    res.status(200).json(publicData);
  } catch (error) {
    console.error(
      `Error fetching public reel data for ${req.params.short_link}:`,
      error.message
    );
    res
      .status(500)
      .json({ error: 'Failed to fetch reel data.', details: error.message });
  }
});

// ========================================================================== //
// ЕНДПОІНТИ ДЛЯ МЕДІА-АЙТЕМІВ
// ========================================================================== //

app.get('/media-items/:id', async (req, res) => {
  const { id } = req.params;
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
    res
      .status(500)
      .json({ error: 'Failed to fetch media item.', details: error.message });
  }
});

app.get('/media-items', async (req, res) => {
  const ids = req.query.id;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ error: 'An array of media item IDs is required.' });
  }
  try {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .in('id', ids);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching media items by IDs:', error);
    res
      .status(500)
      .json({ error: 'Failed to fetch media items.', details: error.message });
  }
});

app.put('/media-items/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  try {
    const { data: currentItem, error: fetchError } = await supabase
      .from('media_items')
      .select('video_gcs_path, preview_gcs_path')
      .eq('id', id)
      .single();
    if (fetchError)
      throw new Error('Could not fetch current item to compare files.');
    const { error: updateError } = await supabase
      .from('media_items')
      .update(updatedData)
      .eq('id', id);
    if (updateError) throw updateError;
    const filesToDelete = [];
    if (
      currentItem.video_gcs_path &&
      currentItem.video_gcs_path !== updatedData.video_gcs_path
    )
      filesToDelete.push(currentItem.video_gcs_path);
    if (
      currentItem.preview_gcs_path &&
      currentItem.preview_gcs_path !== updatedData.preview_gcs_path
    )
      filesToDelete.push(currentItem.preview_gcs_path);
    if (filesToDelete.length > 0) {
      await Promise.all(
        filesToDelete.map((path) =>
          bucket
            .file(path)
            .delete()
            .catch((err) =>
              console.error(`Failed to delete old file ${path}:`, err.message)
            )
        )
      );
    }
    res.status(200).json({ message: 'Media item updated successfully.' });
  } catch (error) {
    console.error(`Error updating media item ${id}:`, error);
    res
      .status(500)
      .json({ error: 'Failed to update media item.', details: error.message });
  }
});

app.delete('/media-items/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Крок 1: Отримуємо шляхи до файлів з БД ПЕРЕД видаленням запису
    const { data: item, error: fetchError } = await supabase
      .from('media_items')
      .select('video_gcs_path, preview_gcs_path')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      return res.status(200).json({ message: 'Item not found, assumed already deleted.' });
    }
    if (fetchError) {
      throw new Error(`Could not fetch media item to delete: ${fetchError.message}`);
    }
    if (!item) {
      return res.status(404).json({ error: `Media item with id ${id} not found.` });
    }
    
    // Крок 2: Намагаємось видалити файли з Google Cloud Storage
    // Це найкритичніший крок.
    const deletePromises = [];

    // Додаємо оригінальне відео та прев'ю до списку на видалення
    if (item.video_gcs_path) deletePromises.push(bucket.file(item.video_gcs_path).delete());
    if (item.preview_gcs_path) deletePromises.push(bucket.file(item.preview_gcs_path).delete());

    // ✨ ПОЧАТОК НОВОЇ ЛОГІКИ ✨
    // Якщо є оригінальне відео, конструюємо шлях до папки транскодування
    if (item.video_gcs_path) {
      const originalVideoPath = item.video_gcs_path;
      // Отримуємо ім'я файлу без розширення (напр., "uuid-my-video")
      const fileNameWithoutExt = path.basename(originalVideoPath, path.extname(originalVideoPath));
      // Формуємо префікс папки, яку треба очистити
      const transcodedPrefix = `back-end/transcoded_videos/${fileNameWithoutExt}/`;
      
      console.log(`Adding transcoded folder to deletion queue: ${transcodedPrefix}`);
      // Додаємо обіцянку видалення всіх файлів у цій папці
      deletePromises.push(bucket.deleteFiles({ prefix: transcodedPrefix }));
    }
    // ✨ КІНЕЦЬ НОВОЇ ЛОГІКИ ✨

    if (deletePromises.length > 0) {
      console.log(`Attempting to delete ${deletePromises.length} GCS operations for item ${id}.`);
      try {
        await Promise.all(deletePromises);
        console.log('Successfully deleted all associated files from GCS.');
      } catch (gcsError) {
        // Якщо помилка під час видалення з GCS, зупиняємось і повертаємо помилку
        console.error(`CRITICAL: Failed to delete one or more files from GCS for item ${id}.`, gcsError);
        throw new Error(`Failed to delete files from storage. Database record was NOT deleted. Details: ${gcsError.message}`);
      }
    }

    // Крок 3: Видаляємо всі пов'язані записи (з `reel_media_items`).
    const { data: affectedReelLinks, error: linksError } = await supabase
      .from('reel_media_items')
      .select('reel_id')
      .eq('media_item_id', id);
    if (linksError) throw linksError;

    const { error: deleteLinksError } = await supabase
      .from('reel_media_items')
      .delete()
      .eq('media_item_id', id);
    if (deleteLinksError) throw deleteLinksError;

    // Перевіряємо та видаляємо рілси, що стали порожніми
    if (affectedReelLinks && affectedReelLinks.length > 0) {
      const affectedReelIds = affectedReelLinks.map((link) => link.reel_id);
      const { data: remainingLinks, error: checkError } = await supabase
        .from('reel_media_items')
        .select('reel_id')
        .in('reel_id', affectedReelIds);
      if (checkError) throw checkError;
      
      const reelsThatStillHaveItems = new Set((remainingLinks || []).map((link) => link.reel_id));
      const reelsToDeleteIds = affectedReelIds.filter(reelId => !reelsThatStillHaveItems.has(reelId));
      
      if (reelsToDeleteIds.length > 0) {
        await supabase.from('reels').delete().in('id', reelsToDeleteIds);
      }
    }

    // Крок 4: Тільки після успішного видалення файлів з GCS, видаляємо запис з БД
    const { error: deleteItemError } = await supabase
      .from('media_items')
      .delete()
      .eq('id', id);
    if (deleteItemError) {
      throw new Error(`Failed to delete database record after cleaning storage: ${deleteItemError.message}`);
    }

    // Крок 5: Повідомляємо про успіх
    res.status(200).json({
      message: 'Media item and all associated files/reels deleted successfully.',
    });

  } catch (error) {
    // Загальний блок для відлову всіх помилок
    console.error(`FATAL: Error during deletion process for media item ${id}:`, error);
    res.status(500).json({ 
      error: 'Failed to complete the deletion process.', 
      details: error.message 
    });
  }
});

// ========================================================================== //
// ЕНДПОІНТИ ДЛЯ Feature: PDF Password
// ========================================================================== //

// Отримати поточний (останній) пароль
app.get('/feature-pdf-password/current', async (req, res) => {
  try {
    // Робимо запит до таблиці, сортуємо за датою створення в спадному порядку
    // і беремо тільки один, найновіший запис.
    const { data, error } = await supabase
      .from('feature_pdf_password')
      .select('value')
      .order('created_at', { ascending: false })
      .limit(1)
      .single(); // .single() поверне null, якщо нічого не знайдено, замість порожнього масиву

    if (error && error.code !== 'PGRST116') {
      // Ігноруємо помилку 'PGRST116', яка означає "рядок не знайдено"
      throw error;
    }

    // Якщо data === null, значить пароль ще не встановлено
    res.status(200).json({ value: data ? data.value : null });
  } catch (error) {
    console.error('Error fetching current PDF password:', error);
    res
      .status(500)
      .json({ error: 'Failed to fetch password.', details: error.message });
  }
});

// Встановити новий пароль
app.post('/feature-pdf-password', async (req, res) => {
  const { value } = req.body;

  if (!value || typeof value !== 'string' || value.trim() === '') {
    return res.status(400).json({ error: 'Password value is required and must be a non-empty string.' });
  }

  try {
    // Просто додаємо новий запис. Завдяки сортуванню на GET, він стане поточним.
    const { data, error } = await supabase
      .from('feature_pdf_password')
      .insert({ value: value })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Password updated successfully.', newValue: data.value });
  } catch (error) {
    console.error('Error setting new PDF password:', error);
    res
      .status(500)
      .json({ error: 'Failed to set new password.', details: error.message });
  }
});




// ========================================================================== //
// ЕНДПОІНТИ ДЛЯ Feature: PDF File
// ========================================================================== //

// Отримати поточний (останній) PDF файл
app.get('/feature-pdf/current', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('feature_pdf_file')
      .select('id, title, gcs_path')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.status(200).json(data); // Поверне об'єкт або null
  } catch (error) {
    console.error('Error fetching current PDF file:', error);
    res
      .status(500)
      .json({ error: 'Failed to fetch PDF file info.', details: error.message });
  }
});

// Завантажити новий PDF файл (і видалити старий з GCS)
app.post('/feature-pdf', async (req, res) => {
  const { title, gcs_path } = req.body;

  if (!title || !gcs_path) {
    return res.status(400).json({ error: 'Title and gcs_path are required.' });
  }

  try {
    // 1. Знаходимо поточний файл, щоб потім видалити його з GCS
    const { data: currentFile, error: fetchError } = await supabase
      .from('feature_pdf_file')
      .select('gcs_path')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // 2. Додаємо новий запис в базу даних
    const { data: newFile, error: insertError } = await supabase
      .from('feature_pdf_file')
      .insert({ title, gcs_path })
      .select()
      .single();

    if (insertError) throw insertError;

    // 3. Якщо був старий файл, видаляємо його з Google Cloud Storage
    if (currentFile && currentFile.gcs_path) {
      await bucket.file(currentFile.gcs_path).delete().catch(err => {
        // Логуємо помилку, але не перериваємо процес, бо головне - запис в БД
        console.warn(`Could not delete old PDF file from GCS: ${currentFile.gcs_path}`, err.message);
      });
    }

    res.status(201).json({ message: 'PDF file updated successfully.', newFile });
  } catch (error) {
    console.error('Error setting new PDF file:', error);
    res
      .status(500)
      .json({ error: 'Failed to set new PDF file.', details: error.message });
  }
});



// 5. Запускаємо сервер
const HOST = '0.0.0.0'; // ✨ ЗМІНА: Додано хост для доступу з мережі

app.listen(PORT, HOST, () => {
  // ✨ ЗМІНА: Оновлено повідомлення в консолі
  console.log(`✅ Backend server is running on http://${HOST}:${PORT}`);
  console.log(
    `✅ Accessible on your network at http://192.168.1.103:${PORT}`
  );
});