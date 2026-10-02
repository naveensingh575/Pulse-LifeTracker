import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { getISTDateString, formatISTDisplayDate } from '../../utils/dateUtils';

/**
 * Reusable Day Calendar Navigator
 * Standardized across Habits, Finance, Analytics, Activity, and Journal.
 * Matches the unified, compact design from HabitsPage.
 *
 * Props:
 * - selectedDate: string ('YYYY-MM-DD')
 * - onDateChange: (newDateStr: string) => void
 * - accentColor: 'amber' | 'emerald' | 'indigo' | 'cyan' (default: 'indigo')
 * - showDateLabel: boolean (default: false) - renders readable formatted date alongside
 * - className: string (optional extra classes)
 */
export const DayCalendarNavigator = ({
  selectedDate,
  onDateChange,
  accentColor = 'indigo',
  showDateLabel = false,
  className = ''
}) => {
  const todayStr = getISTDateString();
  const currentDate = selectedDate || todayStr;
  const isToday = currentDate === todayStr;

  const shiftDay = (days) => {
    const parts = currentDate.split('-');
    if (parts.length !== 3) return;
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    onDateChange(`${yyyy}-${mm}-${dd}`);
  };

  const colorStyles = {
    amber: {
      icon: 'text-amber-500',
      todayBtn: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400'
    },
    emerald: {
      icon: 'text-emerald-500',
      todayBtn: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
    },
    indigo: {
      icon: 'text-indigo-500',
      todayBtn: 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
    },
    cyan: {
      icon: 'text-cyan-500',
      todayBtn: 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
    }
  };

  const dateInputRef = React.useRef(null);

  const handleDateContainerClick = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        try {
          dateInputRef.current.showPicker();
        } catch {
          dateInputRef.current.focus();
        }
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  const currentStyle = colorStyles[accentColor] || colorStyles.indigo;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Sleek Integrated Calendar Pill */}
      <div className="inline-flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => shiftDay(-1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer transition shrink-0"
          title="Previous Day"
          aria-label="Previous Day"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div
          onClick={handleDateContainerClick}
          className="h-7 flex items-center space-x-1.5 px-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition shrink-0 cursor-pointer"
        >
          <CalendarIcon className={`w-3.5 h-3.5 shrink-0 ${currentStyle.icon}`} />
          <input
            ref={dateInputRef}
            type="date"
            value={currentDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="day-calendar-date-input font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
          />
        </div>

        <button
          type="button"
          onClick={() => shiftDay(1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer transition shrink-0"
          title="Next Day"
          aria-label="Next Day"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {!isToday && (
          <button
            type="button"
            onClick={() => onDateChange(todayStr)}
            className={`h-7 px-2.5 flex items-center justify-center rounded-lg font-bold text-[11px] leading-none transition cursor-pointer shrink-0 ${currentStyle.todayBtn}`}
            title="Jump to Today"
          >
            Today
          </button>
        )}
      </div>

      {/* Clean Formatted Date Label */}
      {showDateLabel && (
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 hidden sm:inline">
          {formatISTDisplayDate(currentDate)}
        </span>
      )}
    </div>
  );
};
