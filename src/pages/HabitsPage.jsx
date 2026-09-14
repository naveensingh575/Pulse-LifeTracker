import React, { useState } from 'react';
import { HabitTracker } from '../components/habits/HabitTracker';
import { useDashboard } from '../context/DashboardContext';
import {
  getISTYearMonth,
  getISTDateString,
  getMonthCalendarGrid,
  formatISTDisplayDate,
  MONTH_NAMES_FULL,
  DAY_NAMES_SHORT
} from '../utils/dateUtils';
import {
  Flame,
  Calendar as CalendarIcon,
  Filter,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  CalendarDays,
  Sun
} from 'lucide-react';

export const HabitsPage = () => {
  const {
    habits,
    isHabitDoneOn,
    toggleHabitForDate,
    getDayCompletionStats
  } = useDashboard();

  const [gridMode, setGridMode] = useState('7day'); // 'day' | '7day' | 'monthly'
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Month & Year Selector State in IST
  const currentISTYM = getISTYearMonth();
  const [selectedYear, setSelectedYear] = useState(currentISTYM.year);
  const [selectedMonth, setSelectedMonth] = useState(currentISTYM.month); // 1-12

  const todayStr = getISTDateString();
  const [selectedDayDate, setSelectedDayDate] = useState(todayStr);

  const shiftDayDate = (days) => {
    const parts = selectedDayDate.split('-');
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDayDate(`${yyyy}-${mm}-${dd}`);
  };

  const dayStats = getDayCompletionStats(selectedDayDate);
  const isDayToday = selectedDayDate === todayStr;

  // Normalized case-insensitive category filtering
  const filteredHabits = selectedCategory === 'All'
    ? habits
    : habits.filter(h => h.category && h.category.toLowerCase() === selectedCategory.toLowerCase());

  // Calculate actual total completed ticks across all habits from date-keyed dictionary
  const totalCompletions = habits.reduce((acc, h) => {
    const keysCount = h.completions ? Object.values(h.completions).filter(Boolean).length : 0;
    return acc + keysCount;
  }, 0);

  const categories = ['All', 'Health', 'Mind', 'Fitness', 'Skill', 'Productivity'];
  const years = [2025, 2026, 2027, 2028];

  // Generate calendar grid for the selected month/year
  const calendarCells = getMonthCalendarGrid(selectedYear, selectedMonth);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    setSelectedYear(currentISTYM.year);
    setSelectedMonth(currentISTYM.month);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="glass-panel-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-500/10">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Habits Tracker
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* 3-View Mode Switcher: Day | Week | Month */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setGridMode('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                gridMode === 'day'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Day</span>
            </button>
            
            <button
              onClick={() => setGridMode('7day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                gridMode === '7day'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Week</span>
            </button>

            <button
              onClick={() => setGridMode('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                gridMode === 'monthly'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Month</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" /> Category:
        </span>
        {categories.map(cat => {
          const count = cat === 'All'
            ? habits.length
            : habits.filter(h => h.category && h.category.toLowerCase() === cat.toLowerCase()).length;
          
          const isActive = selectedCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border border-amber-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 rounded-full ${isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ☀️ 1. DAY HABIT CHECKLIST VIEW */}
      {gridMode === 'day' && (
        <div className="glass-panel-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-5 bg-white dark:bg-slate-900 shadow-md animate-in fade-in duration-200">
          
          {/* Header & Date Navigation Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {isDayToday ? 'Today' : 'Day'} • {formatISTDisplayDate(selectedDayDate)}
                  {isDayToday && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold uppercase">
                      Today
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {dayStats.completed} of {dayStats.total} habits completed ({dayStats.percentage}% daily consistency score)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Date Navigation & Calendar Picker */}
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  onClick={() => shiftDayDate(-1)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer transition"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center space-x-1.5 px-2 py-0.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
                  <input
                    type="date"
                    value={selectedDayDate}
                    onChange={(e) => setSelectedDayDate(e.target.value)}
                    className="bg-transparent text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => shiftDayDate(1)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer transition"
                  title="Next Day"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {!isDayToday && (
                  <button
                    onClick={() => setSelectedDayDate(todayStr)}
                    className="px-2.5 py-1 ml-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[11px] transition cursor-pointer"
                  >
                    Today
                  </button>
                )}
              </div>

              {/* Progress Bar & Counter */}
              <div className="text-right pl-2 border-l border-slate-200 dark:border-slate-800">
                <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-slate-100">
                  {dayStats.completed}/{dayStats.total} Done
                </span>
                <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 mt-1">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${dayStats.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Day Habit Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredHabits.map((habit) => {
              const isDone = isHabitDoneOn(habit.id, selectedDayDate);

              return (
                <div
                  key={habit.id}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                    isDone
                      ? 'bg-amber-500/10 border-amber-500/30 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      {habit.name}
                      {habit.streak > 0 && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-extrabold flex items-center gap-0.5">
                          <Flame className="w-3 h-3 fill-amber-500" />
                          {habit.streak}d
                        </span>
                      )}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                      {habit.category}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleHabitForDate(habit.id, selectedDayDate)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all transform active:scale-95 shadow-sm cursor-pointer ${
                      isDone
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : null}
                    <span>{isDone ? 'Done' : 'Mark Done'}</span>
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* 📅 2. 7-DAY WEEKLY GRID VIEW */}
      {gridMode === '7day' && (
        <HabitTracker activeCategoryProp={selectedCategory} />
      )}

      {/* 🗓️ 3. DYNAMIC MONTHLY HEATMAP VIEW */}
      {gridMode === 'monthly' && (
        <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
          
          {/* Month & Year Selectors Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Monthly Habit Tracker
                </h3>
              </div>
            </div>

            {/* Month / Year Dropdowns & Navigation */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Month Dropdown */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {MONTH_NAMES_FULL.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>

              {/* Year Dropdown */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer font-mono"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {(selectedMonth !== currentISTYM.month || selectedYear !== currentISTYM.year) && (
                <button
                  onClick={handleJumpToToday}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-cyan-300 border border-indigo-500/20 text-xs font-bold transition"
                >
                  Jump to Today
                </button>
              )}
            </div>
          </div>

          {/* Heatmap Grid Section */}
          <div className="pt-2">
            
            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">
              {DAY_NAMES_SHORT.map((name) => (
                <span key={name} className="uppercase tracking-wider">
                  {name}
                </span>
              ))}
            </div>

            {/* 7-Column Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((cell, idx) => {
                const stats = getDayCompletionStats(cell.dateStr);

                // Intensity class calculation dynamically based on actual active habits
                let intensityClass = 'bg-slate-100 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400';
                
                if (cell.isCurrentMonth && stats.completed > 0) {
                  if (stats.percentage === 100) {
                    intensityClass = 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-md shadow-amber-500/25';
                  } else if (stats.percentage >= 50) {
                    intensityClass = 'bg-amber-500/65 text-slate-950 border-amber-500/80 font-bold';
                  } else {
                    intensityClass = 'bg-amber-500/25 text-amber-900 dark:text-amber-300 border-amber-500/40 font-semibold';
                  }
                }

                return (
                  <div
                    key={`${cell.dateStr}-${idx}`}
                    className={`relative min-h-[58px] sm:min-h-[64px] p-2 rounded-xl border flex flex-col justify-between transition-all ${intensityClass} ${
                      !cell.isCurrentMonth ? 'opacity-25' : 'hover:scale-[1.02]'
                    } ${cell.isToday ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
                    title={`${formatISTDisplayDate(cell.dateStr)}: ${stats.completed}/${stats.total} habits (${stats.percentage}%)`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono font-bold ${cell.isToday ? 'underline font-extrabold' : ''}`}>
                        {cell.dayNumber}
                      </span>
                      {cell.isToday && (
                        <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-indigo-600 text-white uppercase leading-none">
                          Today
                        </span>
                      )}
                    </div>

                    {cell.isCurrentMonth && stats.total > 0 && (
                      <div className="flex items-center justify-between text-[10px] pt-1">
                        <span className="font-mono text-[9px] opacity-80">
                          {stats.completed}/{stats.total}
                        </span>
                        <span className="font-mono font-bold text-[9px]">
                          {stats.percentage > 0 ? `${stats.percentage}%` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Intensity Legend */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Completion Intensity:</span>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px]">0%</span>
                  <span className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" title="0% Completed" />
                  <span className="w-3.5 h-3.5 rounded bg-amber-500/25 border border-amber-500/40" title="1-49% Completed" />
                  <span className="w-3.5 h-3.5 rounded bg-amber-500/65 border border-amber-500/80" title="50-99% Completed" />
                  <span className="w-3.5 h-3.5 rounded bg-amber-500 border border-amber-500 shadow-sm" title="100% Completed" />
                  <span className="text-[10px]">100%</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[11px]">
                <span className="inline-block w-2.5 h-2.5 rounded-full ring-2 ring-indigo-500" />
                <span>Highlighted Border = Today</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
