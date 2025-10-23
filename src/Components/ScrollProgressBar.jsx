// src/Components/ScrollProgressBar.jsx

// ! React Import
import React from 'react';

// ========================================================================== //
// ! COMPONENT DEFINITION: ScrollProgressBar
// ========================================================================== //

/**
 * ? ScrollProgressBar Component
 * Displays a fixed vertical progress bar on the right side of the screen,
 * indicating the user's scroll progress through a series of items (e.g., videos, sections).
 * Also shows the current item number out of the total.
 *
 * @param {object} props - Component props.
 * @param {number} props.currentIndex - The index of the currently viewed item (zero-based).
 * @param {number} props.totalItems - The total number of items.
 * @returns {JSX.Element} The scroll progress bar component.
 */
const ScrollProgressBar = ({ currentIndex, totalItems }) => {
  // * Calculate the percentage height for the filled part of the progress bar.
  // * Add 1 to currentIndex because it's zero-based.
  const progressHeight =
    totalItems > 0 ? ((currentIndex + 1) / totalItems) * 100 : 0;

  // * Calculate the number to display (1-based index).
  const displayNumber = currentIndex + 1;

  return (
    // * Fixed container positioned on the right, vertically centered.
    // * `pointer-events-none` prevents it from interfering with mouse interactions.
    <div className="fixed top-1/2 right-6 md:right-10 transform -translate-y-1/2 z-50 flex items-center space-x-4 pointer-events-none">
      {/* --- Current/Total Item Display --- */}
      <div className="text-white text-sm font-mono">
        <span>{displayNumber}</span>
        <span className="mx-1">/</span>
        <span>{totalItems}</span>
      </div>

      {/* --- Vertical Progress Bar --- */}
      <div className="relative w-0.5 h-48 bg-white/20 rounded-full">
        {' '}
        {/* // * Outer bar (track) */}
        {/* // * Inner bar (filled progress) */}
        <div
          className="absolute top-0 left-0 w-full bg-white rounded-full"
          style={{
            height: `${progressHeight}%`, // * Dynamic height based on progress
            transition: 'height 0.4s ease-out', // * Smooth animation for height changes
          }}
          aria-valuenow={progressHeight} // * Accessibility attributes
          aria-valuemin="0"
          aria-valuemax="100"
          role="progressbar"
          aria-label="Scroll progress"
        />
      </div>
    </div>
  );
};

export default ScrollProgressBar;
