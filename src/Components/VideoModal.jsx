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
    // Оверлей, який затемнює фон.
    // 1. z-index підвищено до z-[9999] для гарантованого відображення поверх усього.
    // 2. Відступи реалізовано через padding (p-[50px]), щоб контент не прилягав до країв екрана.
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex flex-col justify-center items-center p-[50px] box-border"
      onClick={onClose} // Закривати модалку при кліку на фон
    >
      {/* Кнопка закриття тепер позиціонується відносно всього екрана */}
      <button
        onClick={onClose}
        className="absolute top-5 right-7 text-white text-5xl hover:text-gray-300 transition-colors z-[10000]"
        aria-label="Close video player"
      >
        &times;
      </button>

      {/* Контейнер для контенту, який займає всю доступну область всередині padding */}
      <div
        className="w-full h-full flex flex-col"
        onClick={(e) => e.stopPropagation()} // Зупиняємо клік, щоб він не закривав вікно
      >
        {/* Обгортка для відео, що дозволяє йому гнучко розтягуватися */}
        <div className="w-full flex-grow relative">
          <video
            src={video.src}
            // object-contain зберігає пропорції відео, вписуючи його в контейнер
            className="absolute top-0 left-0 w-full h-full object-contain"
            controls // Вмикає стандартні елементи керування
            autoPlay // Відео почне відтворюватися автоматично
          />
        </div>
        
        {/* Назва відео */}
        <p className="text-white text-center pt-4 text-xl flex-shrink-0">
          {video.title}
        </p>
      </div>
    </div>
  );
}