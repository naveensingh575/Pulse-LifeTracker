import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { isHabitActiveOnDate, encodeActiveDays, parseActiveDays } from '../../context/DashboardContext';
import {
  getISTWeekDays,
  getISTWeekBadge,
  getISTDateString,
  formatISTDisplayDate,
  isDateEditable,
  DAY_NAMES_SHORT
} from '../../utils/dateUtils';
import {
  Flame,
  Plus,
  Trash2,
  Droplets,
  BookOpen,
  Dumbbell,
  Smile,
  Code,
  CheckCircle2,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  Lock,
  Calendar,
  Edit2,
  Share2,
  Shield
} from 'lucide-react';
import { triggerHaptic } from '../../utils/hapticUtils';
import { DisciplineShareModal } from '../analytics/DisciplineShareModal';

const habitIconMap = {
  Droplets: Droplets,
  BookOpen: BookOpen,
  Dumbbell: Dumbbell,
  Smile: Smile,
  Code: Code
};

export const HabitTracker = ({ activeCategoryProp }) => {
  const {
    habits,
    isHabitDoneOn,
    toggleHabitForDate,
    addHabit,
    updateHabit,
    deleteHabit,
    canAddHabit,
    quotaStatus,
    openPricingModal,
    theme
  } = useDashboard();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedStreakHabit, setSelectedStreakHabit] = useState(null);

  const [internalCategory, setInternalCategory] = useState('All');
  const activeCategory = activeCategoryProp !== undefined ? activeCategoryProp : internalCategory;

  // Week navigation offset (0 = current week, -1 = last week, +1 = next week)
  const [weekOffset, setWeekOffset] = useState(0);

  // Compute reference date for the active week view in IST
  const getReferenceDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + (weekOffset * 7));
    return d;
  };

  const currentWeekRef = getReferenceDate();
  const weekDays = getISTWeekDays(currentWeekRef);
  const weekBadge = getISTWeekBadge(currentWeekRef);
  const isCurrentWeek = weekOffset === 0;

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('Health');
  const [newHabitStartDate, setNewHabitStartDate] = useState(getISTDateString());
  const [newHabitActiveDays, setNewHabitActiveDays] = useState([0, 1, 2, 3, 4, 5, 6]);

  // Case-insensitive category filtering
  const filteredHabits = !activeCategory || activeCategory === 'All'
    ? habits
    : habits.filter(h => h.category && h.category.toLowerCase() === activeCategory.toLowerCase());

  const handleOpenAdd = () => {
    if (!canAddHabit) {
      openPricingModal();
      return;
    }
    setEditingHabit(null);
    setNewHabitName('');
    setNewHabitCategory('Health');
    setNewHabitStartDate(getISTDateString());
    setNewHabitActiveDays([0, 1, 2, 3, 4, 5, 6]);
    setShowAddModal(true);
  };

  const handleOpenEdit = (habit) => {
    setEditingHabit(habit);
    setNewHabitName(habit.name || '');
    setNewHabitCategory(habit.category || 'Health');
    setNewHabitStartDate(habit.createdAt || getISTDateString());
    setNewHabitActiveDays(habit.activeDays || [0, 1, 2, 3, 4, 5, 6]);
    setShowAddModal(true);
  };

  const handleSaveHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    if (editingHabit) {
      updateHabit(editingHabit.id, {
        name: newHabitName.trim(),
        category: newHabitCategory,
        createdAt: newHabitStartDate || getISTDateString(),
        activeDays: newHabitActiveDays
      });
    } else {
      addHabit({
        name: newHabitName.trim(),
        category: newHabitCategory,
        icon: 'Smile',
        createdAt: newHabitStartDate || getISTDateString(),
        activeDays: newHabitActiveDays
      });
    }
    setNewHabitName('');
    setNewHabitStartDate(getISTDateString());
    setNewHabitActiveDays([0, 1, 2, 3, 4, 5, 6]);
    setEditingHabit(null);
    setShowAddModal(false);
  };

  const categories = ['All', 'Health', 'Mind', 'Fitness', 'Skill', 'Productivity'];

  return (
    <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
      
      {/* Header Controls & Week Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Weekly Habit Tracker</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-cyan-300 border border-indigo-500/20">
                Week
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>{weekBadge}</span>
              {!isCurrentWeek && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                  ({weekOffset === -1 ? 'Last Week' : weekOffset < 0 ? `${Math.abs(weekOffset)}w ago` : `${weekOffset}w ahead`})
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-2">
          {/* Week Navigation Controls */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-900 transition"
              title="Previous Week"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {!isCurrentWeek && (
              <button
                onClick={() => setWeekOffset(0)}
                className="px-2 py-1 text-[10px] font-extrabold text-indigo-600 dark:text-cyan-400 hover:underline"
              >
                This Week
              </button>
            )}

            <button
              onClick={() => setWeekOffset(prev => prev + 1)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-900 transition"
              title="Next Week"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-amber-600/10 hover:bg-amber-600/20 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-500/30 transition shrink-0 ml-auto sm:ml-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Habit</span>
          </button>
        </div>

      </div>

      {/* Category Tabs */}
      {activeCategoryProp === undefined && (
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {categories.map((cat) => {
            const count = cat === 'All'
              ? habits.length
              : habits.filter(h => h.category && h.category.toLowerCase() === cat.toLowerCase()).length;
            
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setInternalCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 rounded-full ${isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Week Header Labels with Date & "Today" Indicator */}
      <div className="hidden sm:grid grid-cols-12 gap-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800/60">
        <div className="col-span-5 text-left pl-2">
          <span>Habit ({filteredHabits.length})</span>
        </div>

        <div className="col-span-5 grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            return (
              <div
                key={day.dateStr}
                className={`flex flex-col items-center justify-center p-1 rounded-lg transition ${
                  day.isToday
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                title={formatISTDisplayDate(day.dateStr)}
              >
                <span className="text-[10px] uppercase font-bold">{day.dayNameShort}</span>
                <span className={`text-xs font-mono font-extrabold ${day.isToday ? 'text-amber-600 dark:text-amber-400 underline' : ''}`}>
                  {day.dayNumber}
                </span>
                {day.isToday && (
                  <span className="text-[8px] font-bold px-1 bg-amber-500 text-slate-950 rounded uppercase leading-none mt-0.5">
                    Today
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="col-span-2 text-right pr-2">
          <span>Week Progress</span>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-2.5">
        {filteredHabits.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-4 text-center">
            No habits found for "{activeCategory}". Click "New Habit" to add one.
          </p>
        ) : (
          filteredHabits.map((habit) => {
            const IconComp = habitIconMap[habit.icon] || Smile;

            // Calculate completions for the currently visible week, only for scheduled days
            const scheduledDays = weekDays.filter(d => isHabitActiveOnDate(habit, d.dateStr));
            const weekCompletedCount = scheduledDays.filter(d => isHabitDoneOn(habit.id, d.dateStr)).length;
            const weekScheduledCount = scheduledDays.length;
            const progressPercent = weekScheduledCount > 0 ? Math.round((weekCompletedCount / weekScheduledCount) * 100) : 0;

            return (
              <div
                key={habit.id}
                className="group bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800/80 transition-all flex flex-col sm:grid sm:grid-cols-12 gap-3 items-center"
              >
                {/* Habit Name & Category */}
                <div className="sm:col-span-5 flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {habit.name}
                        {habit.streak > 0 && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerHaptic('light');
                                setSelectedStreakHabit(habit);
                                setIsShareModalOpen(true);
                              }}
                              title={`Share ${habit.streak}-day streak milestone!`}
                              className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:border-amber-500/40 text-[10px] font-bold cursor-pointer transition shadow-xs group"
                            >
                              <Flame className="w-2.5 h-2.5 fill-amber-500 group-hover:scale-110 transition-transform" />
                              <span>{habit.streak}d</span>
                              <Share2 className="w-2 h-2 ml-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                            </button>
                            {habit.shieldActive && (
                              <span
                                title="Streak Shield active: 1-day grace applied to preserve your momentum"
                                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[9px] font-bold"
                              >
                                <Shield className="w-2.5 h-2.5 fill-indigo-500/20" />
                                <span>Shield</span>
                              </span>
                            )}
                          </div>
                        )}
                      </h4>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{habit.category}</span>
                        {habit.activeDays && habit.activeDays.length < 7 && (
                          <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/15">
                            {habit.activeDays.map(d => DAY_NAMES_SHORT[d]).join(', ')}
                          </span>
                        )}
                        {habit.createdAt && (
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                            • from {habit.createdAt}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 sm:hidden">
                    <button
                      onClick={() => handleOpenEdit(habit)}
                      className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition"
                      title="Edit Habit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                      title="Delete Habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 7-Day Grid Buttons: Last Week (Mon-Sun) & This Week (Mon-Today) are fully checkable */}
                <div className="sm:col-span-5 w-full grid grid-cols-7 gap-1">
                  {weekDays.map((day) => {
                    const isDone = isHabitDoneOn(habit.id, day.dateStr);
                    const isPriorToCreation = habit.createdAt && day.dateStr < habit.createdAt;
                    const isNotScheduled = !isHabitActiveOnDate(habit, day.dateStr) && !isPriorToCreation;
                    const editable = day.isEditable && !isPriorToCreation && !isNotScheduled;

                    // PRIOR TO CREATION DATE: Display subtle N/A dash
                    if (isPriorToCreation) {
                      return (
                        <div
                          key={day.dateStr}
                          className="h-8 sm:h-7 rounded-lg flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-600 bg-slate-100/50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 cursor-not-allowed select-none"
                          title={`${formatISTDisplayDate(day.dateStr)}: Prior to habit start date (${habit.createdAt})`}
                        >
                          -
                        </div>
                      );
                    }

                    // NOT SCHEDULED on this weekday: Display subtle off-day indicator
                    if (isNotScheduled) {
                      return (
                        <div
                          key={day.dateStr}
                          className="h-8 sm:h-7 rounded-lg flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-600 bg-slate-100/50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 cursor-not-allowed select-none"
                          title={`${formatISTDisplayDate(day.dateStr)}: Rest day (not scheduled)`}
                        >
                          ·
                        </div>
                      );
                    }

                    // EDITABLE RANGE (Last Week Mon-Sun & This Week Mon-Today)
                    if (editable) {
                      return (
                        <button
                          key={day.dateStr}
                          onClick={() => toggleHabitForDate(habit.id, day.dateStr)}
                          className={`h-8 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all transform active:scale-95 cursor-pointer ${
                            day.isToday ? 'ring-2 ring-amber-500/40' : ''
                          } ${
                            isDone
                              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                              : 'bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                          }`}
                          title={`${formatISTDisplayDate(day.dateStr)}: ${isDone ? 'Completed (Click to uncheck)' : 'Pending (Click to check off)'}`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-slate-400 hover:text-amber-500 font-semibold">✓</span>}
                        </button>
                      );
                    }

                    // LOCKED PAST DAYS (2+ weeks ago)
                    if (day.isPast) {
                      return (
                        <div
                          key={day.dateStr}
                          className={`h-8 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold select-none cursor-not-allowed opacity-90 ${
                            isDone
                              ? 'bg-amber-500/80 text-slate-950 shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-950/80 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-800/80'
                          }`}
                          title={`${formatISTDisplayDate(day.dateStr)} (Past Date - Locked): ${isDone ? 'Completed' : 'Missed'}`}
                        >
                          {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3 text-slate-400" />}
                        </div>
                      );
                    }

                    // FUTURE DAYS (Tomorrow onward)
                    return (
                      <div
                        key={day.dateStr}
                        className="h-8 sm:h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-300 dark:text-slate-700 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 opacity-40 cursor-not-allowed select-none"
                        title={`${formatISTDisplayDate(day.dateStr)} (Future Date - Disabled)`}
                      >
                        {day.dayNameShort[0]}
                      </div>
                    );
                  })}
                </div>

                {/* Fraction Progress & Actions */}
                <div className="sm:col-span-2 w-full flex items-center justify-between sm:justify-end space-x-2">
                  <div className="text-right">
                    <span className="text-xs font-extrabold font-mono text-slate-900 dark:text-slate-200">
                      {weekCompletedCount}/{weekScheduledCount}
                    </span>
                    <div className="w-12 h-1 bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden mt-0.5 border border-slate-300 dark:border-slate-800">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleOpenEdit(habit)}
                      className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition"
                      title="Edit Habit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                      title="Delete Habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Habit Modal with Track From Date Selector */}
      {showAddModal && (
        <>
          {/* Backdrop: Clicking closes modal */}
          <div
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => {
              setShowAddModal(false);
              setEditingHabit(null);
            }}
          />

          {/* Modal Card: FIXED at top of screen on mobile (top-20), centered on sm */}
          <div className="fixed top-20 sm:top-1/2 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 max-w-sm mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-150 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                {editingHabit ? <Edit2 className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-amber-500" />}
                <span>{editingHabit ? 'Edit Habit' : 'Add New Habit'}</span>
              </h4>


              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingHabit(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHabit} className="space-y-3">
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
                  <option value="Health">Health</option>
                  <option value="Mind">Mind</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Skill">Skill</option>
                  <option value="Productivity">Productivity</option>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>Start Tracking From</span>
                </label>
                <input
                  type="date"
                  required
                  value={newHabitStartDate}
                  onChange={e => setNewHabitStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Defaults to Today ({getISTDateString()}). Prior dates won't count against your completion %.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingHabit(null);
                  }}
                  className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer"
                >
                  {editingHabit ? 'Save Changes' : 'Save Habit'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* 🚀 HABIT STREAK MILESTONE SHARE MODAL */}
      <DisciplineShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSelectedStreakHabit(null);
        }}
        disciplineScore={Math.min(100, Math.round(((selectedStreakHabit?.streak || 1) / 30) * 100))}
        operatingArchetype={selectedStreakHabit ? `Master of ${selectedStreakHabit.name}` : 'The Habitual Titan'}
        archetypeIcon="🔥"
        topStreak={selectedStreakHabit?.streak || 1}
        totalActiveMins={habits.length * 20}
        tasksCompleted={selectedStreakHabit?.streak || 1}
        timeframe="week"
        timeframeLabel={`${selectedStreakHabit?.streak || 1}-Day Streak`}
        theme={theme}
      />

    </div>
  );
};

