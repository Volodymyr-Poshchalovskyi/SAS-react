# main.py для функції generate-video-preview
import os
import tempfile
import subprocess
from google.cloud import storage
from supabase import create_client, Client
import re

storage_client = storage.Client()

# --- НОВИЙ БЛОК: Ініціалізація клієнта Supabase ---
# Функція буде шукати ці змінні в налаштуваннях середовища під час деплою
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

# ✨ ВИПРАВЛЕНО: Просто передаємо URL та ключ, без зайвих опцій
if supabase_url and supabase_key:
    supabase: Client = create_client(supabase_url, supabase_key)
else:
    supabase = None # Встановлюємо None, якщо змінні не знайдені

def generate_video_preview(event, context):
    bucket_name = event['bucket']
    file_path = event['name'] # Шлях до master.m3u8

    if not file_path.startswith('back-end/transcoded_videos/'):
        return
    if not file_path.endswith('master.m3u8'):
        return
    
    print(f"✅ Отримано новий HLS-плейлист: gs://{bucket_name}/{file_path}")

    video_name_folder = os.path.basename(os.path.dirname(file_path))
    original_video_path_prefix = f"back-end/videos/{video_name_folder}"
    blobs = storage_client.list_blobs(bucket_name, prefix=original_video_path_prefix)
    original_blob = next(blobs, None)

    if not original_blob:
        print(f"ПОМИЛКА: Не вдалося знайти оригінальний відеофайл для '{video_name_folder}'.")
        return
        
    original_file_path = original_blob.name
    print(f"Знайдено оригінальний відеофайл: {original_file_path}")
    preview_file_name = f"{os.path.basename(original_file_path)}.jpg"
    preview_gcs_path = f"back-end/previews/{preview_file_name}"
    bucket = storage_client.bucket(bucket_name)
    destination_blob = bucket.blob(preview_gcs_path)

    if destination_blob.exists():
        print(f"Прев'ю вже існує в '{preview_gcs_path}'. Пропускаємо.")
        return

    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            # --- ✨ ПОЧАТОК ЗМІН ---
            # Крок 1: Завантажуємо головний плейлист (master.m3u8)
            master_manifest_blob = bucket.blob(file_path)
            master_manifest_content = master_manifest_blob.download_as_text()
            
            # Крок 2: Шукаємо в ньому посилання на плейлист якості (напр., hls-720p.m3u8)
            # Ми беремо перший знайдений плейлист, зазвичай цього достатньо.
            variant_playlists = re.findall(r'.*\.m3u8', master_manifest_content)
            if not variant_playlists:
                raise ValueError("Не знайдено плейлистів якості (*.m3u8) всередині master.m3u8.")
            
            first_variant_playlist_name = variant_playlists[0]
            variant_playlist_gcs_path = os.path.join(os.path.dirname(file_path), first_variant_playlist_name)
            
            print(f"Знайдено плейлист якості: {first_variant_playlist_name}")

            # Крок 3: Завантажуємо плейлист якості, щоб знайти .ts файл
            variant_blob = bucket.blob(variant_playlist_gcs_path)
            variant_content = variant_blob.download_as_text()
            
            ts_files = re.findall(r'.*\.ts', variant_content)
            if not ts_files:
                raise ValueError(f"Не знайдено .ts файлів у плейлисті якості '{first_variant_playlist_name}'.")
            
            first_ts_filename = ts_files[0]
            # --- ✨ КІНЕЦЬ ЗМІН ---

            ts_gcs_path = os.path.join(os.path.dirname(file_path), first_ts_filename)
            ts_blob = bucket.blob(ts_gcs_path)
            local_ts_path = os.path.join(temp_dir, first_ts_filename)
            local_preview_path = os.path.join(temp_dir, preview_file_name)
            
            print(f"Завантаження першого сегмента: gs://{bucket_name}/{ts_gcs_path}...")
            ts_blob.download_to_filename(local_ts_path)
            
            # ---
            # --- ✨ ОСЬ ЦЯ СТРОКА ЗМІНЕНА ✨ ---
            # ---
            # Додано '-ss', '00:00:01' для перемотки на 1 секунду вперед
            command = ['ffmpeg', '-ss', '00:00:01', '-i', local_ts_path, '-vframes', '1', '-q:v', '2', '-y', local_preview_path]
            
            subprocess.run(command, check=True, capture_output=True, text=True)
            print("FFmpeg: Кадр успішно вилучено з 1-ї секунди.") # Оновлене повідомлення
            destination_blob.upload_from_filename(local_preview_path, content_type='image/jpeg')
            print("Завантаження прев'ю завершено.")
        except Exception as e:
            print(f"КРИТИЧНА ПОМИЛКА: Не вдалося згенерувати прев'ю. Деталі: {e}")
            return

    # ... (решта коду для оновлення Supabase залишається без змін)
    if not supabase: return
    try:
        print(f"Оновлення запису Supabase для '{original_file_path}'")
        response = supabase.from_('media_items').update({'preview_gcs_path': preview_gcs_path}).eq('video_gcs_path', original_file_path).execute()
        if response.data and len(response.data) > 0:
            print(f"Успішно оновлено запис.")
        else:
            print(f"УВАГА: Запис для відео '{original_file_path}' не знайдено.")
    except Exception as e:
        print(f"КРИТИЧНА ПОМИЛКА: Не вдалося зв'язатися з Supabase. Деталі: {e}")

    print("Роботу функції успішно завершено.")