// public/previewWorker.js

// Функції-хелпери, скопійовані з вашого компонента.
// Вони будуть виконуватися у фоновому потоці.

const compressImage = (file, maxSize = 800) => {
  return new Promise((resolve, reject) => {
    // Конвертуємо File/Blob в object URL, оскільки FileReader недоступний у воркерах напряму
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const { width, height } = img;
      if (width <= maxSize && height <= maxSize) {
        resolve(file);
        URL.revokeObjectURL(img.src);
        return;
      }

      let newWidth, newHeight;
      if (width > height) {
        newWidth = maxSize;
        newHeight = (height * maxSize) / width;
      } else {
        newHeight = maxSize;
        newWidth = (width * maxSize) / height;
      }

      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      URL.revokeObjectURL(img.src);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Не вдалося створити blob з canvas.'));
            return;
          }
          const compressedFile = new File([blob], `preview_${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        'image/jpeg',
        0.9
      );
    };
    img.onerror = reject;
  });
};

const generateVideoPreview = (videoFile) => {
    return new Promise((resolve, reject) => {
        const videoElement = document.createElement('video');
        videoElement.src = URL.createObjectURL(videoFile);
        videoElement.muted = true;

        videoElement.onloadeddata = () => {
            // Шукаємо кадр на 1-й секунді або на середині, якщо відео коротке
            videoElement.currentTime = Math.min(1, videoElement.duration / 2);
        };
        
        videoElement.onseeked = async () => {
            const canvas = document.createElement('canvas');
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const capturedFile = new File([blob], `preview_capture.jpg`, { type: 'image/jpeg' });
                    try {
                        const compressedPreview = await compressImage(capturedFile);
                        resolve(compressedPreview);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject(new Error('Failed to create blob from canvas.'));
                }
                URL.revokeObjectURL(videoElement.src);
            }, 'image/jpeg', 0.95);
        };
        
        videoElement.onerror = (e) => {
            reject(new Error('Error loading video for preview generation.'));
            URL.revokeObjectURL(videoElement.src);
        };
    });
};


// Головний слухач повідомлень для воркера
self.onmessage = async (event) => {
  const { reelId, file } = event.data;

  try {
    const previewFile = await generateVideoPreview(file);
    // Надсилаємо результат назад в основний потік
    self.postMessage({
      status: 'success',
      reelId,
      previewFile,
    });
  } catch (error) {
    console.error('Error in preview worker:', error);
    self.postMessage({
      status: 'error',
      reelId,
      error: error.message,
    });
  }
};