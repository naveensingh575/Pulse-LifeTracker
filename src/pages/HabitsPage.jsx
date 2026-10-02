import React, { useState } from 'react';
import { HabitTracker } from '../components/habits/HabitTracker';
import { DayCalendarNavigator } from '../components/common/DayCalendarNavigator';
import { useDashboard } from '../context/DashboardContext';
import { isHabitActiveOnDate, encodeActiveDays } from '../context/DashboardContext';
import {
  getISTYearMonth,
  getISTDateString,
  getISTWeekDays,
  getMonthCalendarGrid,
  formatISTDisplayDate,
  getWeekdayIndex,
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
  Sun,
  Download,
  Plus,
  X
} from 'lucide-react';
import { exportHabitsToCSV } from '../utils/exportUtils';
import { HABIT_CATEGORIES, HABIT_FILTER_CATEGORIES, getHabitIconForCategory } from '../utils/habitCategories';

export const HabitsPage = () => {
  const {
    habits,
    isHabitDoneOn,
    toggleHabitForDate,
    getDayCompletionStats,
    addHabit,
    canAddHabit = true,
    quotaStatus,
    canViewMonthOnPage,
    recordMonthlyView,
    recordMonthlyCalendarView,
    openPricingModal
  } = useDashboard();

  const [gridMode, setGridMode] = useState('day'); // 'day' | '7day' | 'monthly'
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Month & Year Selector State in IST
  const currentISTYM = getISTYearMonth();
  const [selectedYear, setSelectedYear] = useState(currentISTYM.year);
  const [selectedMonth, setSelectedMonth] = useState(currentISTYM.month); // 1-12

  const todayStr = getISTDateString();
  const [selectedDayDate, setSelectedDayDate] = useState(todayStr);

  // Add Habit Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('Health');
  const [newHabitStartDate, setNewHabitStartDate] = useState(todayStr);
  const [newHabitActiveDays, setNewHabitActiveDays] = useState([0, 1, 2, 3, 4, 5, 6]);

  const handleOpenAdd = () => {
    if (!canAddHabit) {
      openPricingModal();
      return;
    }
    setNewHabitName('');
    setNewHabitCategory(selectedCategory !== 'All' ? selectedCategory : 'Health');
    setNewHabitStartDate(getISTDateString());
    setNewHabitActiveDays([0, 1, 2, 3, 4, 5, 6]);
    setShowAddModal(true);
  };

  const handleSaveHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const habitIcon = getHabitIconForCategory(newHabitCategory);

    addHabit({
      name: newHabitName.trim(),
      category: newHabitCategory,
      icon: habitIcon,
      createdAt: newHabitStartDate || getISTDateString(),
      activeDays: newHabitActiveDays
    });

    setNewHabitName('');
    setNewHabitStartDate(getISTDateString());
    setNewHabitActiveDays([0, 1, 2, 3, 4, 5, 6]);
    setShowAddModal(false);
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

  const categories = HABIT_FILTER_CATEGORIES;
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
              <span>Habits Tracker</span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                {habits.length} Habits
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
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
              onClick={() => {
                if (!quotaStatus?.isPremium) {
                  if (canViewMonthOnPage && !canViewMonthOnPage('habits')) {
                    openPricingModal();
                    return;
                  }
                  if (gridMode !== 'monthly') {
                    if (recordMonthlyView) recordMonthlyView('habits');
                    else recordMonthlyCalendarView();
                  }
                }
                setGridMode('monthly');
              }}
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

          {/* Export CSV Button — Gated for Pro/Founder */}
          <button
            onClick={() => {
              if (!quotaStatus?.isPremium) {
                openPricingModal();
                return;
              }
              let dates = [];
              let label = '';
              if (gridMode === 'day') {
                dates = [selectedDayDate];
                label = `Day_${selectedDayDate}`;
              } else if (gridMode === '7day') {
                const weekDays = getISTWeekDays();
                dates = weekDays.map(d => d.dateStr);
                label = `Week_${dates[0]}_to_${dates[dates.length - 1]}`;
              } else {
                const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
                dates = Array.from({ length: daysInMonth }, (_, i) => `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`);
                label = `Month_${selectedYear}_${String(selectedMonth).padStart(2, '0')}`;
              }
              exportHabitsToCSV(filteredHabits, isHabitDoneOn, dates, label);
            }}
            className="flex items-center space-x-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-800 transition cursor-pointer ml-auto sm:ml-0 shrink-0"
            title={`Download ${gridMode === '7day' ? 'weekly' : gridMode} habits report`}
            aria-label="Download Report"
          >
            <Download className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
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
                  {formatISTDisplayDate(selectedDayDate)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {dayStats.completed} of {dayStats.total} habits completed ({dayStats.percentage}% daily consistency score)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Date Navigation & Calendar Picker */}
              <DayCalendarNavigator
                selectedDate={selectedDayDate}
                onDateChange={setSelectedDayDate}
                accentColor="amber"
              />

              {/* Progress Bar & Counter */}
              <div className="hidden sm:block text-right pl-2 border-l border-slate-200 dark:border-slate-800">
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
            {/* Add New Habit Card — Placed on top so it's instantly accessible without scrolling */}
            <div
              onClick={handleOpenAdd}
              className="p-4 rounded-xl border border-dashed border-amber-500/40 dark:border-amber-500/30 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 text-slate-700 dark:text-slate-300 flex items-center justify-between transition-all cursor-pointer min-h-[68px] group"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                  <Plus className="w-4 h-4 text-amber-500" />
                  Add New Habit
                </p>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Create a habit to track daily
                </span>
              </div>

              <div className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                + Add
              </div>
            </div>

            {filteredHabits
              .filter(habit => isHabitActiveOnDate(habit, selectedDayDate))
              .map((habit) => {
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                          {habit.category}
                        </span>
                        {habit.activeDays && habit.activeDays.length < 7 && (
                          <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/15">
                            {habit.activeDays.map(d => DAY_NAMES_SHORT[d]).join(', ')}
                          </span>
                        )}
                      </div>
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
                  <span>Monthly Habit Tracker</span>
                  {quotaStatus && (
                    <button
                      onClick={() => !quotaStatus.isPremium && openPricingModal()}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                        quotaStatus.isPremium
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : (quotaStatus.monthViews.byPage?.habits?.isLimitReached || quotaStatus.monthViews.isLimitReached)
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/30 cursor-pointer'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                      title={quotaStatus.isPremium ? 'Unlimited Monthly History Views' : `${quotaStatus.monthViews.byPage?.habits?.remaining ?? quotaStatus.monthViews.remaining} monthly calendar views remaining this month.`}
                    >
                      {quotaStatus.isPremium ? '✨ Unlimited Views' : `${quotaStatus.monthViews.byPage?.habits?.remaining ?? quotaStatus.monthViews.remaining} / ${quotaStatus.monthViews.max} Monthly Views Left`}
                    </button>
                  )}
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

          {/* Frosted Glass Lock if 3/3 views reached on free tier */}
          {!quotaStatus?.isPremium && ((canViewMonthOnPage && !canViewMonthOnPage('habits')) || quotaStatus?.monthViews?.byPage?.habits?.isLimitReached || quotaStatus?.monthViews?.isLimitReached) ? (
            <div className="relative rounded-2xl p-8 border border-amber-500/30 bg-gradient-to-b from-amber-500/5 via-slate-900/40 to-slate-950 text-center space-y-4 my-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/10">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  Monthly Historical Archive Locked
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  You have used your 3 free monthly calendar views for this month. Upgrade to Pro or Founder for unlimited historical heatmaps, calendar archives, and full CSV exports.
                </p>
              </div>
              <button
                onClick={openPricingModal}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                Unlock Unlimited Historical Archive
              </button>
            </div>
          ) : (
          /* Heatmap Grid Section */
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
                      <span className={`text-xs font-mono font-bold ${cell.isToday ? 'underline font-extrabold text-indigo-600 dark:text-indigo-400' : ''}`}>
                        {cell.dayNumber}
                      </span>
                    </div>

                    {cell.isCurrentMonth && stats.total > 0 && (
                      <div className="flex items-center justify-between text-[10px] pt-1">
                        <span className="font-mono text-[9px] opacity-80">
                          {stats.completed}/{stats.total}
                        </span>
                        <span className="hidden sm:inline font-mono font-bold text-[9px]">
                          {stats.percentage}%
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
          )}
        </div>
      )}

      {/* Add Habit Modal */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-x-hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[90vh] min-w-0 overflow-x-hidden overscroll-x-none animate-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100"
          >
            {/* Pinned Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-amber-500" />
                <span>Add New Habit</span>
              </h4>

              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHabit} className="p-4 sm:p-5 space-y-3 overflow-y-auto overflow-x-hidden overscroll-x-none flex-1 min-w-0">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Habit Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read 20 Mins"
                  value={newHabitName}
                  onChange={e => setNewHabitName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={newHabitCategory}
                  onChange={e => setNewHabitCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {HABIT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  {!HABIT_CATEGORIES.includes(newHabitCategory) && (
                    <option value={newHabitCategory}>{newHabitCategory}</option>
                  )}
                </select>
              </div>

              {/* Weekly Schedule Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Schedule</label>
                <div className="flex items-center gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => setNewHabitActiveDays([0, 1, 2, 3, 4, 5, 6])}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      newHabitActiveDays.length === 7
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewHabitActiveDays([0, 1, 2, 3, 4])}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      newHabitActiveDays.length === 5 && [0,1,2,3,4].every(d => newHabitActiveDays.includes(d))
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Weekdays
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, idx) => {
                    const isActive = newHabitActiveDays.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setNewHabitActiveDays(prev =>
                            isActive
                              ? prev.filter(d => d !== idx)
                              : [...prev, idx].sort((a, b) => a - b)
                          );
                        }}
                        className={`w-8 h-8 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center justify-center ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 shadow-sm border border-amber-500'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:border-amber-500/50'
                        }`}
                        title={DAY_NAMES_SHORT[idx]}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  {newHabitActiveDays.length === 7 ? 'Tracked every day' : `Tracked ${newHabitActiveDays.length} days/week: ${newHabitActiveDays.map(d => DAY_NAMES_SHORT[d]).join(', ')}`}
                </p>
              </div>

              <div className="space-y-1 min-w-0">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Start Tracking From</span>
                </label>
                <input
                  type="date"
                  required
                  value={newHabitStartDate}
                  onChange={e => setNewHabitStartDate(e.target.value)}
                  className="w-full min-w-0 max-w-full box-border px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 font-mono block"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Defaults to Today ({getISTDateString()}). Prior dates won't count against your completion %.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};


