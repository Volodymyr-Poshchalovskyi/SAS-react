import sys
# --- ЗМІНА 1: Змінено стиль імпорту, щоб бути більш явним ---
from google.cloud import videointelligence_v1
from google.cloud.videointelligence_v1 import types

def analyze_celebrities(gcs_uri: str):
    """
    Аналізує відео в GCS на наявність знаменитостей
    та виводить ім'я та впевненість.
    """
    
    # --- ЗМІНА 2: Використовуємо videointelligence_v1 напряму ---
    client = videointelligence_v1.VideoIntelligenceServiceClient()

    print(f"Запускаємо аналіз знаменитостей для: {gcs_uri}")
    print("Це може зайняти кілька хвилин...")

    # --- ЗМІНА 3: Використовуємо types напряму ---
    features = [types.Feature.CELEBRITY_RECOGNITION]
    
    # Створюємо запит
    operation = client.annotate_video(
        request={
            "features": features,
            "input_uri": gcs_uri
        }
    )

    # Чекаємо на завершення операції (тайм-аут 15 хвилин)
    try:
        response = operation.result(timeout=900)
    except Exception as e:
        print(f"Помилка під час аналізу: {e}")
        return

    print("\n--- РЕЗУЛЬТАТИ АНАЛІЗУ ---")

    # Отримуємо результати
    results = response.annotation_results[0]
    
    if not results.celebrity_recognition_annotations.celebrity_recognitions:
        print("Жодної знаменитості не знайдено.")
        return

    # Використовуємо 'set' для відстеження вже виведених імен
    found_celebrities_names = set()

    # Проходимо по всіх знайдених знаменитостях
    for recognition in results.celebrity_recognition_annotations.celebrity_recognitions:
        
        celebrity_name = recognition.celebrity.display_name
        
        # Виводимо ім'я, лише якщо ми не бачили його раніше
        if celebrity_name not in found_celebrities_names:
            found_celebrities_names.add(celebrity_name)
            
            confidence = 0.0
            if recognition.tracks:
                confidence = recognition.tracks[0].confidence
            
            print(f"Ім'я:        {celebrity_name}")
            print(f"Впевненість: {confidence*100:.1f}%")
            print("-" * 20)

    if not found_celebrities_names:
        print("Аналіз завершено, але знаменитостей не ідентифіковано.")

# --- ГОЛОВНИЙ БЛОК ДЛЯ ЗАПУСКУ ---
if __name__ == "__main__":
    
    # --- ЗМІНА 4 (КРИТИЧНА): Потрібно вказати gs:// шлях, а НЕ https:// ---
    
    video_gcs_uri = "gs://new-sas-media-storage/front-end/01-Directors/10-Beedy/1-AUSR4494H_SA_2025_LAUNCH_DAVIDANDDAVE__STREAMING_60.mov"
    
    # -------------------------------------
    
    if "gs://" not in video_gcs_uri:
        print("ПОМИЛКА: 'video_gcs_uri' має починатися з 'gs://', а не 'https://'", 
              file=sys.stderr)
    else:
        analyze_celebrities(video_gcs_uri)