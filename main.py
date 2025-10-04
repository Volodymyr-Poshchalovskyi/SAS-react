# main.py
import os
import tempfile
import subprocess
from google.cloud import storage
from supabase import create_client, Client

# Initialize clients once per function instance for efficiency
storage_client = storage.Client()

# Fetch Supabase config from environment variables during deployment
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

def generate_video_preview(event, context):
    """
    Cloud Function triggered by a new GCS object creation.
    It generates a preview for videos and updates the Supabase database.
    """
    bucket_name = event['bucket']
    file_path = event['name']
    
    # --- 1. Filter Triggers ---
    if not file_path.startswith('back-end/videos/'):
        print(f"File '{file_path}' is not in the target video directory. Skipping.")
        return
    if file_path.endswith('/'):
        print(f"Path '{file_path}' is a directory. Skipping.")
        return
    video_extensions = ['.mp4', '.mov', '.webm', '.mkv', '.avi']
    if not any(file_path.lower().endswith(ext) for ext in video_extensions):
        print(f"File '{file_path}' is not a video file. Skipping.")
        return

    print(f"Processing new video: gs://{bucket_name}/{file_path}")

    # --- 2. Define File Paths ---
    file_name = os.path.basename(file_path)
    # The preview will be a JPG with the same name as the video file
    preview_file_name = f"{file_name}.jpg"
    preview_gcs_path = f"back-end/previews/{preview_file_name}"

    bucket = storage_client.bucket(bucket_name)
    source_blob = bucket.blob(file_path)
    destination_blob = bucket.blob(preview_gcs_path)

    if destination_blob.exists():
        print(f"Preview already exists at '{preview_gcs_path}'. Skipping generation.")
        return

    # --- 3. Generate Preview with FFmpeg ---
    with tempfile.TemporaryDirectory() as temp_dir:
        local_video_path = os.path.join(temp_dir, file_name)
        local_preview_path = os.path.join(temp_dir, preview_file_name)

        try:
            print(f"Downloading video to temporary location...")
            source_blob.download_to_filename(local_video_path)
            
            # Command to extract a single frame from the 1-second mark
            command = [
                'ffmpeg', '-i', local_video_path, '-ss', '00:00:01.000',
                '-vframes', '1', '-q:v', '2', '-y', local_preview_path
            ]
            subprocess.run(command, check=True, capture_output=True, text=True)
            print("FFmpeg: Frame extracted successfully.")

        except subprocess.CalledProcessError as e:
            print(f"FFmpeg failed (video might be <1s). Retrying with the first frame. Error: {e.stderr}")
            try:
                # Fallback command to get the very first frame
                command = ['ffmpeg', '-i', local_video_path, '-vframes', '1', '-q:v', '2', '-y', local_preview_path]
                subprocess.run(command, check=True, capture_output=True, text=True)
                print("FFmpeg: First frame extracted successfully on retry.")
            except Exception as retry_e:
                print(f"CRITICAL: Retry with first frame also failed: {retry_e}")
                return # Stop if preview generation fails
        except Exception as e:
            print(f"CRITICAL: An error occurred during file processing: {e}")
            return

        # --- 4. Upload Preview to GCS ---
        print(f"Uploading preview to 'gs://{bucket_name}/{preview_gcs_path}'...")
        destination_blob.upload_from_filename(local_preview_path, content_type='image/jpeg')
        print("Upload complete.")

    # --- 5. Update Supabase Database ---
    if not supabase_url or not supabase_key:
        print("ERROR: Supabase environment variables not set. Cannot update database.")
        return

    try:
        print(f"Updating Supabase record where video_gcs_path = '{file_path}'")
        response = supabase.from_('media_items') \
            .update({'preview_gcs_path': preview_gcs_path}) \
            .eq('video_gcs_path', file_path) \
            .execute()
        
        if response.data and len(response.data) > 0:
            print(f"Successfully updated {len(response.data)} record(s) in 'media_items'.")
        else:
            print(f"WARNING: A database record for video '{file_path}' was not found. DB was not updated.")
            
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to communicate with Supabase. Details: {e}")

    print("Function execution finished successfully.")