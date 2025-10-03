import os
import tempfile
import cv2  # OpenCV для обробки відео
from google.cloud import storage

# --- НАЛАШТУВАННЯ: Вкажіть ваші дані ---
PROJECT_ID = "new-sas-472103"
BUCKET_NAME = "new-sas-media-storage"
# Папка, з якої беремо відео
SOURCE_DIRECTORY = "front-end/04-Service/"
# Базова папка, куди будемо складати всі прев'ю
DESTINATION_BASE_DIRECTORY = "front-end/04-Service/VIDEO_PREVIEW/"
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
        # 1. Завантажуємо відеофайл у тимчасову директорію
        print(f"  -> Завантаження '{base_filename}' для обробки...")
        video_blob.download_to_filename(local_video_path)

        # 2. Відкриваємо відео за допомогою OpenCV
        vidcap = cv2.VideoCapture(local_video_path)
        
        # Встановлюємо позицію на 1000 мілісекунду (1 секунда)
        vidcap.set(cv2.CAP_PROP_POS_MSEC, 1000)
        success, image = vidcap.read()

        # Якщо на 1 секунді кадру немає (напр. відео коротше), беремо найперший кадр
        if not success:
            print("  -> Не вдалося взяти кадр на 1-й секунді, пробую перший кадр...")
            vidcap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            success, image = vidcap.read()

        if success:
            # 3. Зберігаємо кадр як JPG файл
            video_filename_without_ext = os.path.splitext(base_filename)[0]
            local_preview_path = os.path.join(temp_dir_path, f"{video_filename_without_ext}.jpg")
            
            cv2.imwrite(local_preview_path, image)
            print(f"  -> Прев'ю успішно створено: '{os.path.basename(local_preview_path)}'")
            
            vidcap.release() # Звільняємо ресурс
            return local_preview_path
        else:
            print(f"  -> ПОМИЛКА: Не вдалося зчитати кадри з відео '{base_filename}'.")
            vidcap.release()
            return None

    except Exception as e:
        print(f"  -> КРИТИЧНА ПОМИЛКА під час обробки '{base_filename}': {e}")
        return None
    finally:
        # Видаляємо тимчасовий відеофайл, щоб не займати місце
        if os.path.exists(local_video_path):
            os.remove(local_video_path)


def main():
    """
    Головна функція для сканування, створення та завантаження прев'ю.
    """
    # Визначаємо назву підпапки з вихідного шляху (напр. '01-SUPERNOVA')
    source_subfolder_name = SOURCE_DIRECTORY.strip('/').split('/')[-1]
    
    # Формуємо повний шлях до папки призначення для прев'ю
    destination_preview_folder = f"{DESTINATION_BASE_DIRECTORY.strip('/')}/{source_subfolder_name}/"
    
    print(f"🔍 Сканування папки: gs://{BUCKET_NAME}/{SOURCE_DIRECTORY}")
    print(f"🖼️  Папка для прев'ю: gs://{BUCKET_NAME}/{destination_preview_folder}\n")

    blobs = bucket.list_blobs(prefix=SOURCE_DIRECTORY)
    video_extensions = ['.mp4', '.mov', '.mkv', '.avi', '.webm']
    
    # Використовуємо тимчасову директорію, яка автоматично очиститься після завершення
    with tempfile.TemporaryDirectory() as temp_dir:
        for blob in blobs:
            # Пропускаємо об'єкти, що є папками, та файли, що не є відео
            if blob.name.endswith('/') or not any(blob.name.lower().endswith(ext) for ext in video_extensions):
                continue

            print(f"Знайдено відео: {blob.name}")

            # Формуємо ім'я для файлу прев'ю
            video_filename_without_ext = os.path.splitext(os.path.basename(blob.name))[0]
            preview_blob_name = f"{destination_preview_folder}{video_filename_without_ext}.jpg"
            
            # Перевіряємо, чи прев'ю вже існує в бакеті
            preview_blob = bucket.blob(preview_blob_name)
            if preview_blob.exists():
                print("  -> Прев'ю вже існує. Пропускаємо.\n")
                continue

            # Генеруємо прев'ю
            local_preview_path = generate_preview_from_video(blob, temp_dir)

            # Якщо прев'ю було успішно створено, завантажуємо його
            if local_preview_path:
                print(f"  -> Завантаження прев'ю в gs://{BUCKET_NAME}/{preview_blob_name}...")
                preview_blob.upload_from_filename(local_preview_path)
                print("  -> ✅ Успішно завантажено!\n")
                # Видаляємо локальний файл прев'ю
                os.remove(local_preview_path)
            else:
                 print("  -> ❌ Не вдалося створити прев'ю для цього файлу.\n")

    print("🏁 Роботу завершено.")

if __name__ == "__main__":
    main()