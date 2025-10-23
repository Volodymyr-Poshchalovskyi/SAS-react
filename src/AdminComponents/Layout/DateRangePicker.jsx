// src/AdminComponents/Layout/DateRangePicker.jsx
// ! React & Libraries
import { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';

/**
 * ? DateRangePicker
 * A custom, self-contained date range picker component.
 *
 * @param {object} initialRange - The initial { from, to } date range.
 * @param {function} onRangeChange - Callback function executed when a new range is selected.
 */
const DateRangePicker = ({ initialRange, onRangeChange }) => {
  // ! State
  // * Controls the visibility of the calendar dropdown
  const [isOpen, setIsOpen] = useState(false);
  // * Stores the currently selected { from, to } range
  const [range, setRange] = useState(initialRange);
  // * Stores the month/year currently being viewed in the calendar
  const [currentMonth, setCurrentMonth] = useState(
    initialRange.to || new Date()
  );

  // ! Refs
  // * Ref for the main component wrapper, used for click-outside detection
  const pickerRef = useRef(null);

  // ! Effect: Click Outside Handler
  // * Adds an event listener to close the dropdown when clicking outside of it.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    // * Cleanup the event listener on unmount
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ! Handlers
  /**
   * Navigates the calendar view to the previous month.
   */
  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  /**
   * Navigates the calendar view to the next month.
   */
  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  /**
   * Core logic for handling a day click to select a date range.
   */
  const handleDayClick = (day) => {
    let newRange = { ...range };

    if (!newRange.from || newRange.to) {
      // * Case 1: Start a new selection (no 'from' date, or range is already complete)
      newRange = { from: day, to: null };
    } else if (day < newRange.from) {
      // * Case 2: Selected day is *before* the 'from' date, so start a new selection
      newRange = { from: day, to: null };
    } else {
      // * Case 3: Selected day is *after* the 'from' date, completing the range
      newRange.to = day;
      onRangeChange(newRange); // * Fire the parent callback
      setIsOpen(false); // * Close the picker
    }
    setRange(newRange); // * Update the local state
  };

  // ! Render Logic
  /**
   * Generates the grid of days for the `currentMonth`.
   * @returns {Array<JSX.Element>} An array of divs and buttons representing the calendar grid.
   */
  const renderDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    // * getDay() returns 0 for Sunday, 1 for Monday, etc.
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // * Add empty divs to offset the start of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }

    // * Render each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);

      // * Check the state of the current day
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelectedStart =
        range.from && date.toDateString() === range.from.toDateString();
      const isSelectedEnd =
        range.to && date.toDateString() === range.to.toDateString();
      const isInRange =
        range.from && range.to && date > range.from && date < range.to;

      // * Dynamically build the CSS classes for the day
      let classes =
        'w-10 h-10 flex items-center justify-center rounded-lg transition-colors cursor-pointer';

      if (isSelectedStart || isSelectedEnd) {
        // * Start or End of the selected range
        classes += ' bg-white text-slate-900';
      } else if (isInRange) {
        // * A day *between* the start and end
        classes += ' bg-slate-700 rounded-none';
      } else {
        // * A normal, unselected day
        classes += ' hover:bg-slate-700';
      }

      if (isToday && !isSelectedStart && !isSelectedEnd && !isInRange) {
        // * Add a border for "today" if it's not part of the selection
        classes += ' border border-slate-500';
      }

      days.push(
        <button
          key={day}
          onClick={() => handleDayClick(date)}
          className={classes}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  /**
   * Formats a Date object into a readable string (e.g., "Oct 23, 2025").
   * @param {Date} date - The date to format.
   * @returns {string} The formatted date string.
   */
  const formatDate = (date) => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // ! Render
  return (
    <div className="relative" ref={pickerRef}>
      {/* --- Trigger Button --- */}
      <button
        onClick={() => {
          // * When opening, set the calendar view to the end of the current range
          if (!isOpen && range.to) {
            setCurrentMonth(new Date(range.to));
          }
          setIsOpen(!isOpen);
        }}
        className="flex items-center justify-center gap-2 h-10 px-4 rounded-md text-sm font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <CalendarIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <span>
          {formatDate(range.from)} - {formatDate(range.to)}
        </span>
      </button>

      {/* --- Calendar Dropdown --- */}
      {isOpen && (
        <div className="absolute top-12 right-0 z-10 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-4 text-white">
          {/* Calendar Header (Month/Year Navigation) */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-full hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold text-sm">
              {currentMonth.toLocaleString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-full hover:bg-slate-700"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-slate-400 mb-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-y-1 text-sm">{renderDays()}</div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
