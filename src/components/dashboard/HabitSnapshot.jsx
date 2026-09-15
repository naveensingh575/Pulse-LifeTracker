import React from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import { getISTDateString } from '../../utils/dateUtils';
import {
  Flame,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react';
import { checkAndCelebrateHabits } from '../../utils/celebrationUtils';

export const HabitSnapshot = () => {
  const { habits, isHabitDoneOn, toggleHabitForDate } = useDashboard();
  const todayStr = getISTDateString();

  // Active habits for today
  const activeHabits = habits.filter(h => !h.createdAt || h.createdAt <= todayStr);
  const totalHabits = activeHabits.length;
  const completedHabits = activeHabits.filter(h => isHabitDoneOn(h.id, todayStr));
  const completedCount = completedHabits.length;
  const pendingHabits = activeHabits.filter(h => !isHabitDoneOn(h.id, todayStr));

  const handleToggleHabit = (habitId) => {
    toggleHabitForDate(habitId, todayStr);
    if (pendingHabits.length === 1 && pendingHabits[0].id === habitId) {
      checkAndCelebrateHabits(todayStr, true);
    }
  };

  const percent = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

  // Find top active streak
  let topStreakHabit = null;
  let maxStreak = 0;
  habits.forEach(h => {
    if (h.streak > maxStreak) {
      maxStreak = h.streak;
      topStreakHabit = h;
    }
  });

  return (
    <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between">
      
      {/* Header with deep-link */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Habit Rhythm Snapshot</h3>
          </div>
        </div>

        <Link
          to="/habits"
          className="flex items-center space-x-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition group"
        >
          <span>Open Habit Hub</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Completion Meter & Streak Highlight */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {completedCount} <span className="text-sm font-normal text-slate-400">/ {totalHabits}</span>
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              ({percent}% Done)
            </span>
          </div>

          {topStreakHabit && maxStreak > 0 && (
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[10px] font-bold">
              <span>🔥 {maxStreak}-day streak on '{topStreakHabit.name}'</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Immediate Check-Off Strip (Remaining Pending Habits for Today) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
          <span>{pendingHabits.length > 0 ? 'Tap to complete for today:' : 'All habits completed for today! 🎉'}</span>
          {pendingHabits.length > 0 && (
            <span className="text-slate-400 font-normal">{pendingHabits.length} remaining</span>
          )}
        </div>

        {totalHabits === 0 ? (
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>No daily habits created yet.</span>
            <Link
              to="/habits"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              + Create Habit
            </Link>
          </div>
        ) : pendingHabits.length === 0 ? (
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>100% daily discipline achieved today!</span>
            </span>
            <span className="text-[10px] font-bold font-mono">ALL DONE</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
            {pendingHabits.map((habit) => (
              <button
                key={habit.id}
                onClick={() => handleToggleHabit(habit.id)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-emerald-500/15 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 text-xs font-semibold text-slate-700 dark:text-slate-300 transition group cursor-pointer"
                title={`Mark '${habit.name}' as completed for today`}
              >
                <Circle className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition" />
                <span>{habit.name}</span>
                {habit.category && (
                  <span className="text-[9px] text-slate-400 opacity-80">({habit.category})</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
