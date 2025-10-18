import os
import tempfile
import cv2  # OpenCV для обробки відео
from google.cloud import storage
from collections import defaultdict

# --- НАЛАШТУВАННЯ: Вкажіть ваші дані ---
PROJECT_ID = "new-sas-472103"
BUCKET_NAME = "new-sas-media-storage"
# Базова папка, де знаходяться папки ВСІХ режисерів
BASE_TRANSCODED_DIRECTORY = "front-end/01-Directors/TRANSCODED/"
# Базова папка, куди будемо складати всі прев'ю
DESTINATION_BASE_DIRECTORY = "front-end/01-Directors/VIDEO_PREVIEW"
# ----------------------------------------------------

# Ініціалізація клієнтів
try:
    storage_client = storage.Client(project=PROJECT_ID)
    bucket = storage_client.bucket(BUCKET_NAME)
except Exception as e:
    print(f"Помилка ініціалізації Google Cloud Storage. Перевірте автентифікацію.")
    print(f"Деталі: {e}")
    exit()

def generate_preview_from_video(video_blob, temp_dir_path):
    """
    Завантажує відео, створює з нього прев'ю та повертає шлях до локального файлу прев'ю.
    """
    base_filename = os.path.basename(video_blob.name)
    local_video_path = os.path.join(temp_dir_path, base_filename)
    
    try:
        print(f"  -> Завантаження '{base_filename}' для обробки...")
        video_blob.download_to_filename(local_video_path)

        vidcap = cv2.VideoCapture(local_video_path)

        # Не виставляємо час — беремо перший кадр
        success, image = vidcap.read()


        if not success:
            print("  -> Не вдалося взяти кадр на 1-й секунді, пробую перший кадр...")
            vidcap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            success, image = vidcap.read()

        if success:
            video_filename_without_ext = os.path.splitext(base_filename)[0]
            local_preview_path = os.path.join(temp_dir_path, f"{video_filename_without_ext}_{os.urandom(4).hex()}.jpg")
            cv2.imwrite(local_preview_path, image)
            print(f"  -> Прев'ю успішно створено локально.")
            vidcap.release()
            return local_preview_path
        else:
            print(f"  -> ПОМИЛКА: Не вдалося зчитати кадри з відео '{base_filename}'.")
            vidcap.release()
            return None
    except Exception as e:
        print(f"  -> КРИТИЧНА ПОМИЛКА під час обробки '{base_filename}': {e}")
        return None
    finally:
        if os.path.exists(local_video_path):
            os.remove(local_video_path)

def process_director_folder(source_directory):
    """
    Обробляє одну папку режисера: знаходить усі відео, групує їх,
    створює та завантажує прев'ю.
    """
    source_subfolder_name = source_directory.strip('/').split('/')[-1]
    destination_preview_folder = f"{DESTINATION_BASE_DIRECTORY.strip('/')}/{source_subfolder_name}/"
    
    print(f"🎬 Обробка папки режисера: {source_subfolder_name}")
    print(f"   -> Джерело: gs://{BUCKET_NAME}/{source_directory}")
    print(f"   -> Призначення: gs://{BUCKET_NAME}/{destination_preview_folder}\n")

    blobs = bucket.list_blobs(prefix=source_directory)
    video_extensions = ['.mp4', '.mov', '.mkv', '.avi', '.webm', '.ts']
    
    video_groups = defaultdict(list)
    for blob in blobs:
        if blob.name.endswith('/') or not any(blob.name.lower().endswith(ext) for ext in video_extensions):
            continue
        parent_dir_path = os.path.dirname(blob.name)
        video_groups[parent_dir_path].append(blob)

    if not video_groups:
        print("   -> Відео для обробки в цій папці не знайдено.\n")
        return

    with tempfile.TemporaryDirectory() as temp_dir:
        for parent_dir, blob_list in video_groups.items():
            video_base_name = os.path.basename(parent_dir)
            print(f"Знайдено групу відео: '{video_base_name}'")

            preview_blob_name = f"{destination_preview_folder}{video_base_name}.jpg"
            preview_blob = bucket.blob(preview_blob_name)

            if preview_blob.exists():
                print("  -> Прев'ю для цієї групи вже існує. Пропускаємо.\n")
                continue

            target_blob = None
            for blob in blob_list:
                if '1080p' in blob.name.lower():
                    target_blob = blob
                    break
            
            if not target_blob:
                target_blob = blob_list[0]

            print(f"  -> Обрано файл для генерації: '{os.path.basename(target_blob.name)}'")
            local_preview_path = generate_preview_from_video(target_blob, temp_dir)

            if local_preview_path:
                print(f"  -> Завантаження прев'ю в gs://{BUCKET_NAME}/{preview_blob_name}...")
                preview_blob.upload_from_filename(local_preview_path)
                print("  -> ✅ Успішно завантажено!\n")
                os.remove(local_preview_path)
            else:
                 print("  -> ❌ Не вдалося створити прев'ю для цього файлу.\n")

def main():
    """
    Головна функція: знаходить усі папки режисерів і запускає обробку для кожної.
    """
    print(f"🚀 Починаю сканування всіх режисерів у: gs://{BUCKET_NAME}/{BASE_TRANSCODED_DIRECTORY}")
    
    all_blobs = bucket.list_blobs(prefix=BASE_TRANSCODED_DIRECTORY)
    director_folders = set() 

    for blob in all_blobs:
        if blob.name.endswith('/'):
            continue
            
        relative_path = blob.name[len(BASE_TRANSCODED_DIRECTORY):]
        director_name = relative_path.split('/')[0]
        
        if director_name:
            full_director_path = f"{BASE_TRANSCODED_DIRECTORY}{director_name}/"
            director_folders.add(full_director_path)

    if not director_folders:
        print("❌ Не знайдено жодної папки режисерів для обробки.")
        return

    print(f"Знайдено {len(director_folders)} папок режисерів. Починаю обробку...")
    print("-" * 60)

    for director_path in sorted(list(director_folders)):
        process_director_folder(director_path)
        print("-" * 60)

    print("🏁 Роботу по всім режисерам завершено.")

if __name__ == "__main__":
    main()