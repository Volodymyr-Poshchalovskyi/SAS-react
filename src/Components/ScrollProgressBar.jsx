import React from 'react';

const ScrollProgressBar = ({ currentIndex, totalItems }) => {
  // Висота прогресу: ділимо реальний індекс на кількість айтемів
  const progressHeight = ((currentIndex + 1) / totalItems) * 100;

  // Номер для користувача: просто індекс + 1
  const displayNumber = currentIndex + 1;

  return (
    <div className="fixed top-1/2 right-6 md:right-10 transform -translate-y-1/2 z-50 flex items-center space-x-4 pointer-events-none">
      
      <div className="text-white text-sm font-mono">
        <span>{displayNumber}</span>
        <span className="mx-1">/</span>
        <span>{totalItems}</span>
      </div>

      <div className="relative w-0.5 h-48 bg-white/20 rounded-full">
        <div
          className="absolute top-0 left-0 w-full bg-white rounded-full"
          style={{
            height: `${progressHeight}%`,
            transition: 'height 0.4s ease-out',
          }}
        />
      </div>
    </div>
  );
};

export default ScrollProgressBar;
