import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/AuthContext';
import { getISTDateString, formatDisplayDate } from '../../utils/dateUtils';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Flame,
  Zap,
  Target,
  X,
  ArrowRight,
  Sun,
  Moon,
  Clock
} from 'lucide-react';
import { playNotificationChime } from '../../utils/notificationUtils';
import { triggerConfetti } from '../../utils/celebrationUtils';
import { triggerHaptic } from '../../utils/hapticUtils';

export const DailyCockpitModal = ({ isOpen, onClose }) => {
  const {
    habits = [],
    tasks = [],
    isHabitDoneOn = () => false,
    toggleHabitForDate,
    toggleTask
  } = useDashboard();
  const { user } = useAuth();

  const todayStr = getISTDateString();
  const [autoOpen, setAutoOpen] = useState(() => {
    return localStorage.getItem('pulse_auto_open_cockpit') !== 'false';
  });

  if (!isOpen) return null;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12
    ? 'Good Morning'
    : currentHour < 17
    ? 'Good Afternoon'
    : 'Good Evening';

  const GreetingIcon = currentHour < 17 ? Sun : Moon;

  const displayName = user?.name || user?.email?.split('@')[0] || 'Builder';

  // Habits pending for today
  const pendingHabits = habits.filter(h => !isHabitDoneOn(h.id, todayStr));
  const completedHabitsCount = habits.length - pendingHabits.length;

  // High priority tasks
  const pendingTasks = tasks.filter(t => !t.completed);
  const highPriorityTasks = pendingTasks.filter(t => t.priority === 'high');
  const topTasks = (highPriorityTasks.length > 0 ? highPriorityTasks : pendingTasks).slice(0, 3);

  // Best streak
  const maxStreak = habits.reduce((acc, h) => Math.max(acc, h.streak || 0), 0);

  const handleLaunch = () => {
    localStorage.setItem('pulse_last_cockpit_date', todayStr);
    try {
      triggerConfetti(0.4);
      playNotificationChime();
      triggerHaptic('heavy');
    } catch (e) {
      console.warn('Launch celebration error', e);
    }
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleToggleHabit = (habitId) => {
    if (!toggleHabitForDate) return;
    const isDone = isHabitDoneOn(habitId, todayStr);
    toggleHabitForDate(habitId, todayStr);
    if (!isDone) {
      if (pendingHabits.length === 1 && pendingHabits[0].id === habitId) {
        triggerConfetti(0.3);
        playNotificationChime();
        triggerHaptic('heavy');
      } else {
        triggerHaptic('medium');
      }
    }
  };

  const handleAutoOpenToggle = (e) => {
    const val = e.target.checked;
    setAutoOpen(val);
    localStorage.setItem('pulse_auto_open_cockpit', val ? 'true' : 'false');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Badge */}
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-indigo-500 fill-indigo-500" />
            <span>30-Second Daily Cockpit</span>
          </span>
          {maxStreak > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold flex items-center gap-1 font-mono">
              <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{maxStreak}d Top Streak</span>
            </span>
          )}
        </div>

        {/* Hero Greeting */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <GreetingIcon className="w-6 h-6 text-amber-500" />
            <span>{greeting}, {displayName}!</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatDisplayDate(todayStr)} · 30-second standup to lock in your daily execution
          </p>
        </div>

        {/* Quick Habit Completion Strip */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Daily Habit Rhythm</span>
            </span>
            <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              {completedHabitsCount} / {habits.length} Done
            </span>
          </div>

          {habits.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No habits added yet. Add your core routines in Habits page.</p>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {habits.map((habit) => {
                const isDone = isHabitDoneOn(habit.id, todayStr);
                return (
                  <div
                    key={habit.id}
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={isDone ? 'line-through opacity-80' : ''}>{habit.name || habit.title}</span>
                    </div>
                    {habit.streak > 0 && (
                      <span className="text-[10px] font-mono font-bold flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                        <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {habit.streak}d
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Priority Focus Action Tasks */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-rose-500" />
              <span>Top Focus Priorities for Today</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Top 3 targets
            </span>
          </div>

          {topTasks.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No pending tasks today. All clear!</p>
          ) : (
            <div className="space-y-1.5">
              {topTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => toggleTask && toggleTask(t.id)}
                  className="flex items-center space-x-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer hover:border-indigo-400 transition"
                >
                  <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="flex-1 truncate">{t.title}</span>
                  {t.priority === 'high' && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 uppercase">
                      High
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button: Launch Day */}
        <div className="space-y-3 pt-1">
          <button
            onClick={handleLaunch}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:brightness-110 text-white text-xs font-black transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>🚀 Launch My Day</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Auto-Open Preference Toggle */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoOpen}
                onChange={handleAutoOpenToggle}
                className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Open 30s Check-In automatically on first visit each day</span>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};
