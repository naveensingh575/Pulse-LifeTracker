import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  getISTWeekDays,
  getISTWeekBadge,
  getISTDateString,
  formatISTDisplayDate,
  isDateEditable
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
  Edit2
} from 'lucide-react';

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
    deleteHabit
  } = useDashboard();

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

  // Case-insensitive category filtering
  const filteredHabits = !activeCategory || activeCategory === 'All'
    ? habits
    : habits.filter(h => h.category && h.category.toLowerCase() === activeCategory.toLowerCase());

  const handleOpenAdd = () => {
    setEditingHabit(null);
    setNewHabitName('');
    setNewHabitCategory('Health');
    setNewHabitStartDate(getISTDateString());
    setShowAddModal(true);
  };

  const handleOpenEdit = (habit) => {
    setEditingHabit(habit);
    setNewHabitName(habit.name || '');
    setNewHabitCategory(habit.category || 'Health');
    setNewHabitStartDate(habit.createdAt || getISTDateString());
    setShowAddModal(true);
  };

  const handleSaveHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    if (editingHabit) {
      updateHabit(editingHabit.id, {
        name: newHabitName.trim(),
        category: newHabitCategory,
        createdAt: newHabitStartDate || getISTDateString()
      });
    } else {
      addHabit({
        name: newHabitName.trim(),
        category: newHabitCategory,
        icon: 'Smile',
        createdAt: newHabitStartDate || getISTDateString()
      });
    }
    setNewHabitName('');
    setNewHabitStartDate(getISTDateString());
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

            // Calculate completions for the currently visible 7-day week
            const weekCompletedCount = weekDays.filter(d => isHabitDoneOn(habit.id, d.dateStr)).length;
            const progressPercent = Math.round((weekCompletedCount / 7) * 100);

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
                          <span className="flex items-center space-x-0.5 px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                            <Flame className="w-2.5 h-2.5 fill-amber-500" />
                            <span>{habit.streak}d</span>
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{habit.category}</span>
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
                    const editable = day.isEditable && !isPriorToCreation;

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
                      {weekCompletedCount}/7
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
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 pt-20 sm:pt-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl text-slate-900 dark:text-slate-100">

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
        </div>
      )}

    </div>
  );
};
