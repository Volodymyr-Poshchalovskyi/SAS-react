// src/AdminComponents/Layout/DateRangePicker.jsx

import { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';

const DateRangePicker = ({ initialRange, onRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [range, setRange] = useState(initialRange);
  const [currentMonth, setCurrentMonth] = useState(
    initialRange.to || new Date()
  );
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDayClick = (day) => {
    let newRange = { ...range };
    if (!newRange.from || newRange.to) {
      newRange = { from: day, to: null };
    } else if (day < newRange.from) {
      newRange = { from: day, to: null };
    } else {
      newRange.to = day;
      onRangeChange(newRange);
      setIsOpen(false);
    }
    setRange(newRange);
  };

  const renderDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelectedStart =
        range.from && date.toDateString() === range.from.toDateString();
      const isSelectedEnd =
        range.to && date.toDateString() === range.to.toDateString();
      const isInRange =
        range.from && range.to && date > range.from && date < range.to;

      let classes = 'w-10 h-10 flex items-center justify-center rounded-lg transition-colors cursor-pointer';
      if (isSelectedStart || isSelectedEnd) {
        classes += ' bg-white text-slate-900';
      } else if (isInRange) {
        classes += ' bg-slate-700 rounded-none';
      } else {
        classes += ' hover:bg-slate-700';
      }
      if (isToday && !isSelectedStart && !isSelectedEnd && !isInRange) {
        classes += ' border border-slate-500';
      }

      days.push(
        <button key={day} onClick={() => handleDayClick(date)} className={classes}>
          {day}
        </button>
      );
    }
    return days;
  };

  const formatDate = (date) => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => {
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

      {isOpen && (
        <div className="absolute top-12 right-0 z-10 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-4 text-white">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-700">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold text-sm">
              {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-700">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center text-xs text-slate-400 mb-2">
            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-sm">{renderDays()}</div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;