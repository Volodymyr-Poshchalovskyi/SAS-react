// cleanup-function/index.js
require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const { createClient } = require('@supabase/supabase-js');

// Ініціалізація клієнтів (використовує змінні середовища, які ми передамо при розгортанні)
const storage = new Storage();
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const VIDEO_PREFIX = 'back-end/videos/';
const PREVIEW_PREFIX = 'back-end/previews/';

/**
 * HTTP Cloud Function, що знаходить і видаляє "осиротілі" файли з GCS.
 * @param {express.Request} req The request object.
 * @param {express.Response} res The response object.
 */
exports.cleanupOrphanedFiles = async (req, res) => {
  console.log('🚀 Starting cleanup of orphaned GCS files...');

  try {
    // 1. Отримати всі файли відео з GCS
    const [gcsFiles] = await bucket.getFiles({ prefix: VIDEO_PREFIX });
    const gcsVideoPaths = gcsFiles.map(file => file.name).filter(name => !name.endsWith('/'));
    
    if (gcsVideoPaths.length === 0) {
      const msg = '✅ No video files in GCS to check. Exiting.';
      console.log(msg);
      res.status(200).send(msg);
      return;
    }

    // 2. Отримати всі шляхи відео з бази даних Supabase
    const { data: dbRecords, error: dbError } = await supabase
      .from('media_items')
      .select('video_gcs_path');

    if (dbError) throw new Error(`Supabase error: ${dbError.message}`);
    const dbVideoPaths = new Set(dbRecords.map(r => r.video_gcs_path).filter(Boolean));

    // 3. Знайти "осиротілі" файли
    const orphanedVideoPaths = gcsVideoPaths.filter(gcsPath => !dbVideoPaths.has(gcsPath));
    
    if (orphanedVideoPaths.length === 0) {
      const msg = '✅ No orphaned files found. Everything is in sync!';
      console.log(msg);
      res.status(200).send(msg);
      return;
    }

    console.log(`🚨 Found ${orphanedVideoPaths.length} orphaned files to delete.`);

    // 4. Видалити "осиротілі" відео та їхні прев'ю
    for (const videoPath of orphanedVideoPaths) {
      const fileName = videoPath.split('/').pop();
      // Пре-вигляд може мати розширення .jpg, навіть якщо оригінал - .mp4, тому враховуємо це
      const previewName = fileName.includes('.') ? `${fileName.split('.').slice(0, -1).join('.')}.jpg` : `${fileName}.jpg`;
      const previewPath = `${PREVIEW_PREFIX}${previewName}`;
      
      await bucket.file(videoPath).delete();
      console.log(`   👍 Deleted video: ${videoPath}`);
      await bucket.file(previewPath).delete({ ignoreNotFound: true });
      console.log(`   👍 Deleted preview: ${previewPath}`);
    }

    const finalMsg = `✅ Cleanup complete! Deleted ${orphanedVideoPaths.length} orphaned items.`;
    console.log(finalMsg);
    res.status(200).send(finalMsg);

  } catch (error) {
    console.error('❌ An error occurred during the cleanup process:', error);
    res.status(500).send(`Error during cleanup: ${error.message}`);
  }
};