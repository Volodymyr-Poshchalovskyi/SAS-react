import os
import time
from google.cloud import storage
from google.cloud.video import transcoder_v1
from google.cloud.video.transcoder_v1.services.transcoder_service import TranscoderServiceClient
from google.api_core.exceptions import ResourceExhausted

# --- НАЛАШТУВАННЯ: ОНОВЛЕНО ШЛЯХИ ---
PROJECT_ID = "new-sas-472103"
LOCATION = "us-central1"
BUCKET_NAME = "new-sas-media-storage"
# <--- ЗМІНА 1: Нова папка з вихідними відео ---
SOURCE_DIRECTORY = "front-end/07-Tabletop Studio/01-Raphael Hache"
# <--- ЗМІНА 2: Нова папка для результатів ---
DESTINATION_DIRECTORY = "front-end/07-Tabletop Studio/01-Raphael Hache/TRANSCODED"
# ----------------------------------------------------

storage_client = storage.Client()
transcoder_client = TranscoderServiceClient()

def create_adaptive_bitrate_job(input_uri, output_uri):
    """
    Створює завдання на транскодування з трьома потоками: 720p, 1080p та 1440p (2K),
    ЗБЕРІГАЮЧИ вихідне співвідношення сторін.
    """
    parent = f"projects/{PROJECT_ID}/locations/{LOCATION}"
    job = transcoder_v1.types.Job()
    job.input_uri = input_uri
    job.output_uri = output_uri

    # --- ОНОВЛЕНА КОНФІГУРАЦІЯ ---
    config = transcoder_v1.types.JobConfig(
        elementary_streams=[
            {
                "key": "video-stream-720p",
                "video_stream": {
                    "h264": {
                        "height_pixels": 720,
                        "width_pixels": 0,  
                        "bitrate_bps": 2500000,
                        "frame_rate": 30
                    }
                }
            },
            {
                "key": "video-stream-1080p",
                "video_stream": {
                    "h264": {
                        "height_pixels": 1080,
                        "width_pixels": 0,  # <--- ЗМІНА: Встановлено 0 для збереження пропорцій
                        "bitrate_bps": 5000000,
                        "frame_rate": 30
                    }
                }
            },
            {
                "key": "video-stream-1440p",
                "video_stream": {
                    "h264": {
                        "height_pixels": 1440,
                        "width_pixels": 0,  # <--- ЗМІНА: Встановлено 0 для збереження пропорцій
                        "bitrate_bps": 10000000,
                        "frame_rate": 30
                    }
                }
            },
            {
                "key": "audio-stream-stereo",
                "audio_stream": {
                    "codec": "aac",
                    "bitrate_bps": 128000
                }
            },
        ],
        mux_streams=[
            {"key": "hls-720p", "container": "ts", "elementary_streams": ["video-stream-720p", "audio-stream-stereo"], "segment_settings": {"segment_duration": "6s"}},
            {"key": "hls-1080p", "container": "ts", "elementary_streams": ["video-stream-1080p", "audio-stream-stereo"], "segment_settings": {"segment_duration": "6s"}},
            {"key": "hls-1440p", "container": "ts", "elementary_streams": ["video-stream-1440p", "audio-stream-stereo"], "segment_settings": {"segment_duration": "6s"}},
        ],
        manifests=[{"file_name": "master.m3u8", "type_": "HLS", "mux_streams": ["hls-720p", "hls-1080p", "hls-1440p"]}]
    )
    # ------------------------------------

    job.config = config

    while True:
        try:
            response = transcoder_client.create_job(parent=parent, job=job)
            print(f"  -> Завдання створено: {response.name}")
            break
        except ResourceExhausted as e:
            if 'ConcurrentJobCountPerProjectPerRegion' in str(e):
                print("  -> Квоту вичерпано. Чекаю 60 секунд перед повторною спробою...")
                time.sleep(60)
            else:
                print(f"  -> Невідома помилка ресурсів: {e}")
                break
        except Exception as e:
            print(f"  -> Критична помилка створення завдання: {e}")
            break

def main():
    """
    Головна функція: сканує бакет та запускає транскодування.
    (Ця функція залишається без змін, логіка працює універсально)
    """
    print(f"Сканування бакету '{BUCKET_NAME}' в папці '{SOURCE_DIRECTORY}'...")
    blobs = storage_client.list_blobs(BUCKET_NAME, prefix=SOURCE_DIRECTORY)
    video_extensions = ['.mp4', '.mov', '.mkv', '.avi']

    for blob in blobs:
        if DESTINATION_DIRECTORY in blob.name or not any(blob.name.lower().endswith(ext) for ext in video_extensions):
            continue

        source_path_without_prefix = blob.name.replace(SOURCE_DIRECTORY, '')
        file_name_without_ext = os.path.splitext(os.path.basename(source_path_without_prefix))[0]
        # Для плоскої структури папок 'director_folder' буде порожнім, що є правильним
        director_folder = os.path.dirname(source_path_without_prefix)
        output_subpath = os.path.join(director_folder, file_name_without_ext)
        output_uri = f"gs://{BUCKET_NAME}/{DESTINATION_DIRECTORY}{output_subpath}/"
        
        manifest_path = f"{DESTINATION_DIRECTORY}{output_subpath}/master.m3u8"
        manifest_blob = storage_client.bucket(BUCKET_NAME).blob(manifest_path)

        if manifest_blob.exists():
            print(f"\nВідео '{blob.name}' вже було оброблено. Пропускаємо.")
            continue
            
        print(f"\nЗнайдено нове відео: {blob.name}")
        input_uri = f"gs://{BUCKET_NAME}/{blob.name}"
        print(f"  -> Вихідна папка: {output_uri}")
        create_adaptive_bitrate_job(input_uri, output_uri)
    
    print("\nВсі завдання на транскодування відправлено.")

if __name__ == "__main__":
    main()