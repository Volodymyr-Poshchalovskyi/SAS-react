import { useState, useEffect, useRef, useCallback } from 'react';

// Визначаємо, скільки прев'ю можна генерувати одночасно.
// `navigator.hardwareConcurrency` - це кількість ядер процесора.
// Це дозволяє не перевантажувати слабкі машини.
const MAX_CONCURRENT_TASKS = navigator.hardwareConcurrency || 2;

export const usePreviewQueue = (onPreviewGenerated) => {
  const workerRef = useRef(null);
  const [queue, setQueue] = useState([]);
  const [processing, setProcessing] = useState(new Set());

  // Ініціалізація та очищення воркера
  useEffect(() => {
    // Створюємо екземпляр воркера. Шлях /previewWorker.js веде до папки public
    workerRef.current = new Worker('/previewWorker.js');

    // Обробник повідомлень від воркера
    workerRef.current.onmessage = (event) => {
      const { status, reelId, previewFile, error } = event.data;

      if (status === 'success') {
        onPreviewGenerated(reelId, previewFile);
      } else {
        console.error(`Failed to generate preview for reel ${reelId}:`, error);
      }
      
      // Видаляємо завдання зі списку активних, щоб звільнити місце
      setProcessing(prev => {
        const next = new Set(prev);
        next.delete(reelId);
        return next;
      });
    };

    // Очищення при демонтажі компонента
    return () => {
      workerRef.current.terminate();
    };
  }, [onPreviewGenerated]);

  // Ефект, який стежить за чергою і запускає завдання
  useEffect(() => {
    // Якщо є вільні "слоти" і є завдання в черзі
    if (processing.size < MAX_CONCURRENT_TASKS && queue.length > 0) {
      const itemsToProcess = queue.slice(0, MAX_CONCURRENT_TASKS - processing.size);
      
      for (const item of itemsToProcess) {
        // Додаємо до списку активних
        setProcessing(prev => new Set(prev).add(item.reelId));
        // Відправляємо завдання у воркер
        workerRef.current.postMessage(item);
      }
      
      // Видаляємо запущені завдання з черги
      setQueue(prev => prev.slice(itemsToProcess.length));
    }
  }, [queue, processing]);

  const addToQueue = useCallback((reelId, file) => {
    setQueue(prev => [...prev, { reelId, file }]);
  }, []);

  return { addToQueue, processingReelIds: processing };
};