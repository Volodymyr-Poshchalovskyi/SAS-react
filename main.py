import os
import tempfile
import subprocess
from google.cloud import storage
from supabase import create_client, Client
import re # Потрібен для regex

# Ініціалізуємо клієнти один раз
storage_client = storage.Client()

# --- Ініціалізація клієнта Supabase ---
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if supabase_url and supabase_key:
    supabase: Client = create_client(supabase_url, supabase_key)
else:
    supabase = None

def generate_video_preview(event, context):
    """
    Хмарна функція, що запускається при створенні master.m3u8.
    Генерує прев'ю з першого .ts сегмента та оновлює Supabase.
    Має логіку для повторних спроб у разі збою.
    """
    bucket_name = event['bucket']
    file_path = event['name'] # Шлях до master.m3u8

    # --- 1. Фільтруємо непотрібні виклики ---
    if not file_path.startswith('back-end/transcoded_videos/'):
        print(f"Файл '{file_path}' не в цільовій директорії. Пропускаємо.")
        return
    if not file_path.endswith('master.m3u8'):
        print(f"Файл '{file_path}' не є 'master.m3u8'. Пропускаємо.")
        return
    
    print(f"✅ Отримано новий HLS-плейлист: gs://{bucket_name}/{file_path}")
    bucket = storage_client.bucket(bucket_name)

    # --- ✨ ПОЧАТОК: Загальний блок try...except для ввімкнення --retry ---
    # Вся логіка тепер всередині одного 'try', щоб будь-яка помилка
    # (ffmpeg, 404, Supabase) призвела до повторного запуску.
    try:
        # --- 2. Знаходимо оригінальний ВІДЕОфайл ---
        video_name_folder = os.path.basename(os.path.dirname(file_path))
        original_video_path_prefix = f"back-end/videos/{video_name_folder}"
        
        # --- ✅ ВИПРАВЛЕННЯ 1: Шукаємо саме відео, а не перший-ліпший файл ---
        blobs = storage_client.list_blobs(bucket_name, prefix=original_video_path_prefix)
        video_extensions = ['.mp4', '.mov', '.webm', '.mkv', '.avi']
        original_blob = None
        for blob in blobs:
            if any(blob.name.lower().endswith(ext) for ext in video_extensions):
                original_blob = blob
                break # Знайшли наше відео, зупиняємо пошук

        if not original_blob:
            # Це не помилка, а нормальна ситуація (напр., завантажився .DS_Store)
            # Тому 'print' і тихий 'return', а не 'raise'.
            print(f"Не вдалося знайти оригінальний *відеофайл* (mp4, mov...) для '{video_name_folder}'. Пропускаємо.")
            return
        # --- Кінець виправлення 1 ---

        original_file_path = original_blob.name
        print(f"Знайдено оригінальний відеофайл: {original_file_path}")
        
        # --- 3. Генеруємо прев'ю ---
        preview_file_name = f"{os.path.basename(original_file_path)}.jpg"
        preview_gcs_path = f"back-end/previews/{preview_file_name}"
        destination_blob = bucket.blob(preview_gcs_path)

        if destination_blob.exists():
            print(f"Прев'ю вже існує в '{preview_gcs_path}'. Пропускаємо.")
            return

        with tempfile.TemporaryDirectory() as temp_dir:
            # Крок 3a: Завантажуємо master.m3u8
            master_manifest_blob = bucket.blob(file_path)
            master_manifest_content = master_manifest_blob.download_as_text()
            
            # Крок 3b: Шукаємо в ньому плейлист якості (напр., hls-720p.m3u8)
            variant_playlists = re.findall(r'^[^\#].*?\.m3u8$', master_manifest_content, re.MULTILINE)
            if not variant_playlists:
                raise ValueError("Не знайдено плейлистів якості (*.m3u8) всередині master.m3u8.")
            
            first_variant_playlist_name = variant_playlists[0]
            variant_playlist_gcs_path = os.path.join(os.path.dirname(file_path), first_variant_playlist_name)
            print(f"Знайдено плейлист якості: {first_variant_playlist_name}")

            # Крок 3c: Завантажуємо плейлист якості, щоб знайти .ts файл
            variant_blob = bucket.blob(variant_playlist_gcs_path)
            variant_content = variant_blob.download_as_text()
            
            # --- ✅ ВИПРАВЛЕННЯ 2: Більш точний пошук .ts файлу ---
            ts_files = re.findall(r'^[^\#].*?\.ts$', variant_content, re.MULTILINE)
            if not ts_files:
                raise ValueError(f"Не знайдено .ts файлів у плейлисті якості '{first_variant_playlist_name}'.")
            
            first_ts_filename = ts_files[0].strip() # .strip() видаляє зайві пробіли/переноси
            # --- Кінець виправлення 2 ---
            
            ts_gcs_path = os.path.join(os.path.dirname(file_path), first_ts_filename)
            ts_blob = bucket.blob(ts_gcs_path)
            local_ts_path = os.path.join(temp_dir, "segment.ts") # Універсальне ім'я
            local_preview_path = os.path.join(temp_dir, preview_file_name)
            
            print(f"Завантаження першого сегмента: gs://{bucket_name}/{ts_gcs_path}...")
            ts_blob.download_to_filename(local_ts_path)
            
            # Крок 3d: Запускаємо ffmpeg
            command = ['ffmpeg', '-ss', '00:00:01', '-i', local_ts_path, '-vframes', '1', '-q:v', '2', '-y', local_preview_path]
            subprocess.run(command, check=True, capture_output=True, text=True)
            print("FFmpeg: Кадр успішно вилучено з 1-ї секунди.")
            
            # Крок 3e: Завантажуємо прев'ю
            destination_blob.upload_from_filename(local_preview_path, content_type='image/jpeg')
            print(f"Прев'ю завантажено в {preview_gcs_path}")

        # --- 4. Оновлюємо Supabase ---
        if not supabase:
            print("Клієнт Supabase не налаштований. Пропускаю оновлення БД.")
            return # Успішне завершення

        print(f"Оновлення запису Supabase для '{original_file_path}'")
        response = supabase.from_('media_items').update({'preview_gcs_path': preview_gcs_path}).eq('video_gcs_path', original_file_path).execute()
        
        if response.data and len(response.data) > 0:
            print(f"✅ Базу даних успішно оновлено.")
        else:
            # Це помилка, яку треба повторити, бо запис в БД міг ще не з'явитися
            raise Exception(f"Запис для відео '{original_file_path}' ще не знайдено в Supabase.")

    # --- ✨ КІНЕЦЬ: Блок 'except' для --retry ---
    except Exception as e:
        # Цей 'except' ловить ВСІ помилки (404, ffmpeg, Supabase, ліміт підключень)
        print(f"❌ КРИТИЧНА ПОМИЛКА (спробуємо повторити): {e}")
        # Повторно "кидаємо" помилку, щоб Google Cloud міг її зловити і повторити
        raise e

    print("Роботу функції успішно завершено.")