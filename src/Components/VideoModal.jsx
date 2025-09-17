import React, { useEffect } from 'react';

export default function VideoModal({ video, onClose }) {
  // Додаємо слухача подій, щоб закривати модальне вікно по натисканню на 'Escape'
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Прибираємо слухача, коли компонент демонтується
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    // Оверлей, який затемнює фон
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center"
      onClick={onClose} // Закривати модалку при кліку на фон
    >
      <div
        className="relative bg-black w-full max-w-4xl p-4 rounded-lg"
        onClick={(e) => e.stopPropagation()} // Зупиняємо клік, щоб він не закривав вікно
      >
        {/* Кнопка закриття */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white text-4xl hover:text-gray-300 transition-colors"
          aria-label="Close video player"
        >
          &times;
        </button>

        {/* Відео плеєр */}
        <video
          src={video.src}
          className="w-full h-auto"
          controls // Вмикає стандартні елементи керування: пауза, звук, перемотка
          autoPlay // Відео почне відтворюватися автоматично при відкритті
        />
        <p className="text-white text-center mt-4 text-xl">{video.title}</p>
      </div>
    </div>
  );
}