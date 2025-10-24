//backend/server.js

// ========================================================================== //
// ! SECTION 1: IMPORTS & INITIALIZATION
// ========================================================================== //

const path = require('path');
const express = require('express');
const cors = require('cors');
const { Storage } = require('@google-cloud/storage');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

// * Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // * Bind to 0.0.0.0 to be accessible on the local network
app.use(express.json({ limit: '10mb' })); // Збільште ліміт до 10MB (або більше)
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// * Initialize Google Cloud Storage
// * We are loading the key from a Base64 environment variable (common for PaaS)
const keyJson = Buffer.from(
  process.env.GCS_SERVICE_ACCOUNT_KEY_BASE64,
  'base64'
).toString('utf-8');
const credentials = JSON.parse(keyJson);
const storage = new Storage({ credentials });
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

// * Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ! Fatal error check: Ensure Supabase credentials are provided
if (!supabaseUrl || !supabaseKey) {
  console.error(
    'FATAL ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in your .env file.'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ========================================================================== //
// ! SECTION 2: EXPRESS MIDDLEWARE
// ========================================================================== //

// * Define allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://192.168.0.123:5173',
  'http://192.168.1.103:5173',
  'http://192.168.1.106:5173',
  'http://192.168.1.105:5173',
  'http://192.168.1.109:5173',
  'http://192.168.1.110:5173',
  'http://192.168.1.112:5173',
  'https://sas-frontend-zhgs.onrender.com',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// * Body Parsers
// ! Important: We need express.text() to handle 'text/plain' payloads from navigator.sendBeacon
app.use(express.text());
app.use(express.json());

// ========================================================================== //
// ! SECTION 3: UTILITY FUNCTIONS
// ========================================================================== //

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access Denied: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res
      .status(401)
      .json({ error: 'Access Denied: Invalid token format' });
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      console.warn('Token validation error:', error.message);
      return res.status(401).json({ error: `Access Denied: ${error.message}` });
    }

    if (!user) {
      return res.status(401).json({ error: 'Access Denied: Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Critical error in requireAuth:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Generates a short random ID.
 * @param {number} length - The desired length of the ID.
 * @returns {string} A random alphanumeric string.
 */
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
// ! SECTION 4: GOOGLE CLOUD STORAGE ENDPOINTS
// ========================================================================== //

/**
 * Generates a v4 signed URL for uploading a file to GCS.
 * * Dynamically sets the destination folder based on `destination` and `role` params.
 */
app.post('/generate-upload-url', requireAuth, async (req, res) => {
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
      // * Default fallback logic
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
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: fileType,
    };
    const [signedUrl] = await file.getSignedUrl(options);
    res.status(200).json({ signedUrl, gcsPath: filePath });
  } catch (error) {
    console.error('Error generating signed UPLOAD URL:', error);
    res.status(500).json({
      error: 'Failed to generate upload URL.',
      details: error.message,
    });
  }
});

/**
 * Generates v4 signed URLs for reading multiple files from GCS.
 * * Accepts an array of GCS paths and returns a map of { path: url }.
 */
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
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    };

    // * Process all URL requests in parallel
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

    // * Convert array of results into a key-value map
    const signedUrlsMap = results.reduce((acc, result) => {
      if (result.url) acc[result.path] = result.url;
      return acc;
    }, {});

    res.status(200).json(signedUrlsMap);
  } catch (error) {
    console.error('Error generating signed READ URLs:', error);
    res.status(500).json({
      error: 'Failed to generate read URLs.',
      details: error.message,
    });
  }
});

// ========================================================================== //
// ! SECTION 5: ARTISTS ENDPOINTS
// ========================================================================== //

/**
 * Fetches artist details (photo path) by an array of names.
 */
app.post('/artists/details-by-names', requireAuth, async (req, res) => {
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
    res.status(500).json({
      error: 'Failed to fetch artist details.',
      details: error.message,
    });
  }
});

/**
 * Updates an artist's details.
 * * Also deletes the old GCS photo if a new one is provided.
 */
app.put('/artists/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, description, photo_gcs_path } = req.body;

  try {
    // * Step 1: Get the current item to check for an old photo
    const { data: currentItem, error: fetchError } = await supabase
      .from('artists')
      .select('photo_gcs_path')
      .eq('id', id)
      .single();
    if (fetchError)
      throw new Error('Could not fetch current artist to compare photo.');

    // * Step 2: Update the artist record in Supabase
    const { data: updatedArtist, error: updateError } = await supabase
      .from('artists')
      .update({ name, description, photo_gcs_path })
      .eq('id', id)
      .select()
      .single();
    if (updateError) throw updateError;

    // * Step 3: Clean up the old GCS file if it's different
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

/**
 * Deletes an artist.
 * * Also deletes the associated photo from GCS.
 */
app.delete('/artists/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    // * Step 1: Get the GCS path *before* deleting the record
    const { data: item, error: fetchError } = await supabase
      .from('artists')
      .select('photo_gcs_path')
      .eq('id', id)
      .single();

    // * PGRST116: No rows found (already deleted, which is fine)
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    // * Step 2: Delete the database record
    const { error: deleteError } = await supabase
      .from('artists')
      .delete()
      .eq('id', id);
    if (deleteError) throw deleteError;

    // * Step 3: Clean up the GCS file
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
// ! SECTION 6: ANALYTICS ENDPOINTS (REELS)
// ========================================================================== //

/**
 * Logs a reel view event (e.g., 'start', 'completion', 'session_duration').
 * ! This endpoint must handle both JSON (from fetch) and text/plain (from sendBeacon).
 */
app.post('/reels/log-event', async (req, res) => {
  try {
    // * Handle different content types
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { reel_id, session_id, event_type, media_item_id, duration_seconds } =
      body;

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

    const { error } = await supabase.from('reel_views').insert({
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
// ! SECTION 7: ANALYTICS ENDPOINTS (DASHBOARD)
// ========================================================================== //

/**
 * Fetches daily view counts (media_completion) for a date range.
 * * Fills in missing days with 0 views, which is required for charting.
 */
app.get('/analytics/views-over-time', requireAuth, async (req, res) => {
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

    // * Aggregate counts by day
    const countsByDay = events.reduce((acc, event) => {
      const date = event.created_at.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // * Create a complete date range, filling in zeros
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
    res.status(500).json({
      error: 'Failed to fetch daily view counts.',
      details: error.message,
    });
  }
});

/**
 * Fetches the top N trending media items based on 'completion' events.
 * * This uses an "aggregate, then fetch" pattern for efficiency.
 */
app.get('/analytics/trending-media', requireAuth, async (req, res) => {
  const { startDate, endDate, limit = 4 } = req.query;
  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ error: 'startDate and endDate query parameters are required.' });
  }
  const fullEndDate = new Date(endDate);
  fullEndDate.setUTCHours(23, 59, 59, 999);

  try {
    // * Step 1: Get all completion events in the range
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

    // * Step 2: Aggregate counts in application code
    const countsByMediaItem = completionEvents.reduce(
      (acc, { media_item_id }) => {
        acc[media_item_id] = (acc[media_item_id] || 0) + 1;
        return acc;
      },
      {}
    );

    // * Step 3: Get the top N IDs
    const topMediaItemIds = Object.entries(countsByMediaItem)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, Number(limit))
      .map(([mediaItemId]) => mediaItemId);

    if (topMediaItemIds.length === 0) {
      return res.status(200).json([]);
    }

    // * Step 4: Fetch details for *only* the top N items
    const { data: trendingItems, error: itemsError } = await supabase
      .from('media_items')
      .select(`id, title, client, preview_gcs_path, artists`)
      .in('id', topMediaItemIds);

    if (itemsError) throw itemsError;

    // * Step 5: Combine details with view counts and sort
    const result = trendingItems.map((item) => ({
      ...item,
      views: countsByMediaItem[item.id] || 0,
    }));

    result.sort((a, b) => b.views - a.views);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching trending media:', error);
    res.status(500).json({
      error: 'Failed to fetch trending media.',
      details: error.message,
    });
  }
});

/**
 * Fetches recently created reels and enriches them with data (client, preview)
 * from their *first* media item.
 */
app.get('/analytics/recent-activity', requireAuth, async (req, res) => {
  const { limit = 5 } = req.query;
  try {
    // * Step 1: Get recent reels
    const { data: reels, error: reelsError } = await supabase
      .from('reels')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(Number(limit));
    if (reelsError) throw reelsError;

    // * Step 2: Enrich each reel in parallel
    const enrichedReels = await Promise.all(
      reels.map(async (reel) => {
        // * Get the first item in the reel (by display_order)
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
    res.status(500).json({
      error: 'Failed to fetch recent activity.',
      details: error.message,
    });
  }
});

// ========================================================================== //
// ! SECTION 8: REELS ENDPOINTS (ADMIN)
// ========================================================================== //

/**
 * Creates a new reel.
 * * Generates a unique `short_link` for the reel.
 * * Inserts associated media items into the `reel_media_items` join table.
 */
app.post('/reels', requireAuth, async (req, res) => {
  const { title, media_item_ids } = req.body;
  const user_id = req.user.id;
  if (!title || !media_item_ids || !user_id || media_item_ids.length === 0)
    return res.status(400).json({
      error: 'Title, user_id, and at least one media_item_id are required.',
    });
  try {
    // * Step 1: Generate a unique short_link, retrying if a collision occurs
    let shortLink;
    let isUnique = false;
    while (!isUnique) {
      shortLink = generateShortId();
      const { data, error } = await supabase
        .from('reels')
        .select('id')
        .eq('short_link', shortLink)
        .single();
      if (!data) isUnique = true; // No record found, the link is unique
      if (error && error.code !== 'PGRST116') throw error; // 'PGRST116' is "No rows found"
    }

    // * Step 2: Create the main reel record
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

    // * Step 3: Create the join table entries
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

/**
 * Fetches all reels with calculated analytics.
 * ! This uses an efficient "fetch all, join in app" strategy to avoid N+1 queries.
 */
app.get('/reels', requireAuth, async (req, res) => {
  try {
    // * Step 1: Fetch all primary reel data
    const { data: reels, error: reelsError } = await supabase
      .from('reels')
      .select('*, user_profiles(first_name, last_name, email)')
      .order('created_at', { ascending: false });
    if (reelsError) throw reelsError;

    // * Step 2: Fetch all join table links
    const { data: allLinks, error: linksError } = await supabase
      .from('reel_media_items')
      .select(
        'reel_id, media_item_id, display_order, media_items(preview_gcs_path)'
      );
    if (linksError) throw linksError;

    // * Step 3: Fetch all analytics data
    const { data: allViews, error: viewsError } = await supabase
      .from('reel_views')
      .select('reel_id, session_id, event_type, duration_seconds');
    if (viewsError) throw viewsError;

    // * Step 4: Process links into lookup maps
    const mediaIdsByReel = allLinks.reduce((acc, link) => {
      if (!acc[link.reel_id]) acc[link.reel_id] = [];
      acc[link.reel_id].push({
        id: link.media_item_id,
        order: link.display_order,
      });
      return acc;
    }, {});
    // Sort the media items for each reel
    for (const reelId in mediaIdsByReel) {
      mediaIdsByReel[reelId].sort((a, b) => a.order - b.order);
      mediaIdsByReel[reelId] = mediaIdsByReel[reelId].map((item) => item.id);
    }
    // Get the first preview path for each reel
    const previewPathByReelId = allLinks
      .sort((a, b) => a.display_order - b.display_order)
      .reduce((acc, link) => {
        if (!acc[link.reel_id] && link.media_items) {
          acc[link.reel_id] = link.media_items.preview_gcs_path;
        }
        return acc;
      }, {});

    // * Step 5: Process analytics data into a lookup map
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

    // * Step 6: Combine all data
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

/**
 * Updates an existing reel.
 * * Updates reel metadata (title, status, etc.).
 * * Replaces the `reel_media_items` using a "delete all, insert new" strategy.
 */
app.put('/reels/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { title, artists, status, media_item_ids } = req.body;

  try {
    // * Step 1: Update main reel metadata (if provided)
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

    // * Step 2: Update media item links (if provided)
    if (media_item_ids && Array.isArray(media_item_ids)) {
      // * Delete all existing links for this reel
      const { error: deleteError } = await supabase
        .from('reel_media_items')
        .delete()
        .eq('reel_id', id);
      if (deleteError) throw deleteError;

      // * Insert new links
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

    // * Step 3: Fetch the final updated reel data to return to the client
    const { data: finalReel, error: finalFetchError } = await supabase
      .from('reels')
      .select('*, user_profiles(first_name, last_name)')
      .eq('id', id)
      .single();
    if (finalFetchError) throw finalFetchError;

    // * Step 4: Fetch basic analytics to return (for UI consistency)
    // ? This could be optimized, but is fine for a single PUT request.
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
      media_item_ids: media_item_ids || [], // Return the new set of IDs
    });
  } catch (error) {
    console.error(`Error updating reel ${id}:`, error);
    res
      .status(500)
      .json({ error: 'Failed to update reel.', details: error.message });
  }
});

/**
 * Deletes a reel and all its associated data (links, analytics).
 */
app.delete('/reels/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    // * Manually cascade deletes (Supabase doesn't do this by default on links/views)
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
// ! SECTION 9: REELS ENDPOINT (PUBLIC)
// ========================================================================== //

/**
 * Fetches all data needed to display a public reel page.
 * * Fetches the reel by its `short_link`.
 * * Fetches all associated media items, sorted by `display_order`.
 * * Enriches media items with artist details (name, description, photo).
 */
app.get('/reels/public/:short_link', async (req, res) => {
  try {
    // * Step 1: Fetch the reel and its nested media items
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

    // * Step 2: Sort and filter media items
    const sortedMediaItems = (reel.reel_media_items || [])
      .sort((a, b) => a.display_order - b.display_order)
      .map((item) => item.media_items)
      .filter(Boolean); // Filter out any null/undefined items

    const defaultDirectorImagePath = 'back-end/artists/director.jpg';

    // * Step 3: Enrich each media item with full artist details
    const mediaItemsWithPaths = await Promise.all(
      sortedMediaItems.map(async (item) => {
        const artistNames = (item.artists || '')
          .split(',')
          .map((name) => name.trim())
          .filter(Boolean);

        let enrichedArtists = [];
        if (artistNames.length > 0) {
          // * Fetch details for all artists in this item in one query
          const { data: artistRecords, error: artistsError } = await supabase
            .from('artists')
            .select('name, description, photo_gcs_path')
            .in('name', artistNames);

          if (artistsError)
            console.error('Error fetching artists:', artistsError.message);

          // * Create a map for easy lookup
          const artistMap = (artistRecords || []).reduce((acc, artist) => {
            acc[artist.name] = artist;
            return acc;
          }, {});

          // * Build the final artist array, subbing in defaults
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
          ...item, // ! Keep all original media_item fields
          videoGcsPath: item.video_gcs_path,
          video_hls_path: item.video_hls_path,
          previewGcsPath: item.preview_gcs_path || item.video_gcs_path,
          artists: enrichedArtists,
        };
      })
    );

    // * Step 4: Assemble final public data object
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
// ! SECTION 10: MEDIA ITEMS ENDPOINTS
// ========================================================================== //

/**
 * Fetches a single media item by its ID.
 */
app.get('/media-items/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    if (!data) return res.status(4404).json({ error: 'Media item not found.' });
    res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching media item ${id}:`, error);
    res
      .status(500)
      .json({ error: 'Failed to fetch media item.', details: error.message });
  }
});

/**
 * Fetches multiple media items by an array of IDs.
 * * Used by the reel editor to get item details.
 */
app.get('/media-items', requireAuth, async (req, res) => {
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

/**
 * Updates a media item.
 * * Also cleans up old GCS files (video, preview) if they are replaced.
 */
app.put('/media-items/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  try {
    // * Step 1: Get current file paths for cleanup
    const { data: currentItem, error: fetchError } = await supabase
      .from('media_items')
      .select('video_gcs_path, preview_gcs_path')
      .eq('id', id)
      .single();
    if (fetchError)
      throw new Error('Could not fetch current item to compare files.');

    // * Step 2: Update the database record
    const { error: updateError } = await supabase
      .from('media_items')
      .update(updatedData)
      .eq('id', id);
    if (updateError) throw updateError;

    // * Step 3: Delete old GCS files if they changed
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

/**
 * ! CRITICAL: Deletes a media item and all its associated data.
 * * 1. Deletes GCS files (original video, preview).
 * * 2. Deletes the *entire* GCS transcoded folder (HLS files).
 * * 3. Deletes links from `reel_media_items`.
 * * 4. Deletes any `reels` that become empty as a result.
 * * 5. Deletes the `media_items` record itself.
 */
app.delete('/media-items/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    // * Step 1: Get file paths from the DB *before* deleting the record
    const { data: item, error: fetchError } = await supabase
      .from('media_items')
      .select('video_gcs_path, preview_gcs_path')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      return res
        .status(200)
        .json({ message: 'Item not found, assumed already deleted.' });
    }
    if (fetchError) {
      throw new Error(
        `Could not fetch media item to delete: ${fetchError.message}`
      );
    }
    if (!item) {
      return res
        .status(404)
        .json({ error: `Media item with id ${id} not found.` });
    }

    // * Step 2: Attempt to delete all associated files from GCS
    const deletePromises = [];

    // * Add original video and preview to delete queue
    if (item.video_gcs_path)
      deletePromises.push(bucket.file(item.video_gcs_path).delete());
    if (item.preview_gcs_path)
      deletePromises.push(bucket.file(item.preview_gcs_path).delete());

    // * Add the *entire transcoded folder* to delete queue
    if (item.video_gcs_path) {
      const originalVideoPath = item.video_gcs_path;
      // e.g., "uuid-my-video" from "back-end/videos/uuid-my-video.mp4"
      const fileNameWithoutExt = path.basename(
        originalVideoPath,
        path.extname(originalVideoPath)
      );
      // e.g., "back-end/transcoded_videos/uuid-my-video/"
      const transcodedPrefix = `back-end/transcoded_videos/${fileNameWithoutExt}/`;

      console.log(
        `Adding transcoded folder to deletion queue: ${transcodedPrefix}`
      );
      // * This deletes all files matching the prefix (the whole folder)
      deletePromises.push(bucket.deleteFiles({ prefix: transcodedPrefix }));
    }

    // * Step 2.5: Execute GCS deletion
    // ! Use Promise.allSettled to ensure we continue even if a file (e.g., preview)
    // ! doesn't exist (404 error). We still want to delete the DB record.
    if (deletePromises.length > 0) {
      console.log(
        `Attempting ${deletePromises.length} GCS deletion operations for item ${id}.`
      );
      const results = await Promise.allSettled(deletePromises);

      results.forEach((result) => {
        if (result.status === 'rejected') {
          const error = result.reason;
          // * Log errors that are *not* "Not Found"
          if (error.code !== 404) {
            console.error(
              `Failed to delete a GCS file (continuing anyway):`,
              error.message
            );
          } else {
            console.warn(
              `GCS file not found during deletion (skipping): ${error.message}`
            );
          }
        }
      });
      console.log('GCS cleanup tasks finished. Continuing with DB deletion.');
    }

    // * Step 3: Clean up database links (find affected reels)
    const { data: affectedReelLinks, error: linksError } = await supabase
      .from('reel_media_items')
      .select('reel_id')
      .eq('media_item_id', id);
    if (linksError) throw linksError;

    // * Delete the links
    const { error: deleteLinksError } = await supabase
      .from('reel_media_items')
      .delete()
      .eq('media_item_id', id);
    if (deleteLinksError) throw deleteLinksError;

    // * Step 4: Check for and delete "orphan" reels
    if (affectedReelLinks && affectedReelLinks.length > 0) {
      const affectedReelIds = affectedReelLinks.map((link) => link.reel_id);

      // * Check which of the affected reels *still* have items
      const { data: remainingLinks, error: checkError } = await supabase
        .from('reel_media_items')
        .select('reel_id')
        .in('reel_id', affectedReelIds);
      if (checkError) throw checkError;

      const reelsThatStillHaveItems = new Set(
        (remainingLinks || []).map((link) => link.reel_id)
      );

      // * Find reels that are now empty
      const reelsToDeleteIds = affectedReelIds.filter(
        (reelId) => !reelsThatStillHaveItems.has(reelId)
      );

      if (reelsToDeleteIds.length > 0) {
        console.log(`Deleting ${reelsToDeleteIds.length} orphan reels...`);
        await supabase.from('reels').delete().in('id', reelsToDeleteIds);
      }
    }

    // * Step 5: Finally, delete the media item record itself
    const { error: deleteItemError } = await supabase
      .from('media_items')
      .delete()
      .eq('id', id);
    if (deleteItemError) {
      throw new Error(
        `Failed to delete database record after cleaning storage: ${deleteItemError.message}`
      );
    }

    // * Step 6: Success
    res.status(200).json({
      message:
        'Media item and all associated files/reels deleted successfully.',
    });
  } catch (error) {
    // * General error handler
    console.error(
      `FATAL: Error during deletion process for media item ${id}:`,
      error
    );
    res.status(500).json({
      error: 'Failed to complete the deletion process.',
      details: error.message,
    });
  }
});

// ========================================================================== //
// ! SECTION 11: FEATURE: PDF PASSWORD ENDPOINTS
// ========================================================================== //

/**
 * Gets the *current* (most recent) PDF password.
 */
app.get('/feature-pdf-password/current', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('feature_pdf_password')
      .select('value')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    res.status(200).json({ value: data ? data.value : null });
  } catch (error) {
    console.error('Error fetching current PDF password:', error);
    res
      .status(500)
      .json({ error: 'Failed to fetch password.', details: error.message });
  }
});

/**
 * Sets a *new* PDF password (creates a new row).
 */
app.post('/feature-pdf-password', requireAuth, async (req, res) => {
  const { value } = req.body;
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return res.status(400).json({
      error: 'Password value is required and must be a non-empty string.',
    });
  }

  try {
    const { data, error } = await supabase
      .from('feature_pdf_password')
      .insert({ value: value })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({
      message: 'Password updated successfully.',
      newValue: data.value,
    });
  } catch (error) {
    console.error('Error setting new PDF password:', error);
    res
      .status(500)
      .json({ error: 'Failed to set new password.', details: error.message });
  }
});

/**
 * Verifies a submitted password against the *current* password.
 */
app.post('/feature-pdf-password/verify', async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res
      .status(400)
      .json({ success: false, error: 'Password is required.' });
  }

  try {
    const { data: correctPasswordRecord, error } = await supabase
      .from('feature_pdf_password')
      .select('value, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (correctPasswordRecord && correctPasswordRecord.value === password) {
      // * Return success and the `created_at` timestamp as a "version"
      return res
        .status(200)
        .json({ success: true, version: correctPasswordRecord.created_at });
    } else {
      return res
        .status(401)
        .json({ success: false, error: 'Invalid password.' });
    }
  } catch (error) {
    console.error('Error verifying PDF password:', error);
    res
      .status(500)
      .json({ success: false, error: 'An internal error occurred.' });
  }
});

/**
 * Gets the *version* (created_at) of the current password.
 * * Used by the client to check if its cached password is stale.
 */
app.get('/feature-pdf-password/version', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('feature_pdf_password')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.status(200).json({ version: data ? data.created_at : null });
  } catch (error) {
    console.error('Error fetching password version:', error);
    res.status(500).json({ error: 'Failed to fetch password version.' });
  }
});

// ========================================================================== //
// ! SECTION 12: FEATURE: PDF FILE ENDPOINTS
// ========================================================================== //

/**
 * Gets the *current* (most recent) PDF file record.
 */
app.get('/feature-pdf/current', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('feature_pdf_file')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching current PDF file:', error);
    res.status(500).json({
      error: 'Failed to fetch PDF file info.',
      details: error.message,
    });
  }
});

/**
 * Sets a *new* PDF file.
 * * This creates a new DB row and deletes the *old* file from GCS.
 */
app.post('/feature-pdf', requireAuth, async (req, res) => {
  const { title, gcs_path } = req.body;
  if (!title || !gcs_path) {
    return res.status(400).json({ error: 'Title and gcs_path are required.' });
  }

  try {
    // * Step 1: Get the path of the *current* file for cleanup
    const { data: currentFile, error: fetchError } = await supabase
      .from('feature_pdf_file')
      .select('gcs_path')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // * Step 2: Insert the new file record
    const { data: newFile, error: insertError } = await supabase
      .from('feature_pdf_file')
      .insert({ title, gcs_path })
      .select()
      .single();
    if (insertError) throw insertError;

    // * Step 3: Delete the old file from GCS
    if (currentFile && currentFile.gcs_path) {
      await bucket
        .file(currentFile.gcs_path)
        .delete()
        .catch((err) => {
          console.warn(
            `Could not delete old PDF file from GCS: ${currentFile.gcs_path}`,
            err.message
          );
        });
    }

    res
      .status(201)
      .json({ message: 'PDF file updated successfully.', newFile });
  } catch (error) {
    console.error('Error setting new PDF file:', error);
    res
      .status(500)
      .json({ error: 'Failed to set new PDF file.', details: error.message });
  }
});

// ========================================================================== //
// ! SECTION 13: FEATURE: PDF STATS ENDPOINTS
// ========================================================================== //

/**
 * Gets the history of PDF files along with their aggregated stats.
 * * This calls a Supabase RPC function (Database Function) for efficiency.
 */
app.get('/feature-pdf/history-with-stats', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_pdf_history_with_stats');
    if (error) {
      throw error;
    }
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching PDF history with stats:', error);
    res.status(500).json({
      error: 'Failed to fetch PDF history.',
      details: error.message,
    });
  }
});

/**
 * Logs a PDF view event (scroll depth).
 * ! This endpoint must handle both JSON (from fetch) and text/plain (from sendBeacon).
 */
app.post('/feature-pdf/log-view', async (req, res) => {
  try {
    // * Handle different content types
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { pdf_file_id, completion_percentage } = body;

    if (pdf_file_id == null || completion_percentage == null) {
      return res
        .status(400)
        .json({ error: 'pdf_file_id and completion_percentage are required.' });
    }

    const { error } = await supabase.from('pdf_file_stats').insert({
      pdf_file_id: Number(pdf_file_id),
      completion_percentage: Number(completion_percentage),
    });
    if (error) {
      throw error;
    }

    res.status(201).json({ message: 'View logged successfully.' });
  } catch (error) {
    console.error('Error logging PDF view:', error);
    res.status(500).json({
      error: 'Failed to log view.',
      details: error.message,
    });
  }
});

// ========================================================================== //
// ! SECTION 14: START SERVER
// ========================================================================== //

app.listen(PORT, HOST, () => {
  console.log(`✅ Backend server is running on http://${HOST}:${PORT}`);
  console.log(
    `✅ Accessible on your network (e.g., http://192.168.1.103:${PORT})`
  );
});
