import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import { getISTDateString } from '../../utils/dateUtils';
import { Circle, CheckCircle2, Plus, Zap, Flame, Target, ArrowRight, Shield, Share2 } from 'lucide-react';
import { checkAndCelebrateTasks, checkAndCelebrateHabits } from '../../utils/celebrationUtils';
import { playNotificationChime } from '../../utils/notificationUtils';
import { triggerHaptic } from '../../utils/hapticUtils';
import { DisciplineShareModal } from '../analytics/DisciplineShareModal';

export const ActionableToday = () => {
  const { 
    habits, tasks, 
    isHabitDoneOn, isHabitActiveOnDate, toggleHabitForDate, 
    toggleTask, addTask, theme 
  } = useDashboard();

  // Tasks Section Data
  const highPriorityTasks = tasks.filter(t => !t.completed && t.priority === 'high');
  const otherActiveTasks = tasks.filter(t => !t.completed && t.priority !== 'high');
  const displayTasks = [...highPriorityTasks, ...otherActiveTasks].slice(0, 3);
  const completedCount = tasks.filter(t => t.completed).length;
  const openCount = tasks.filter(t => !t.completed).length;

  const handleToggleTask = (task) => {
    toggleTask(task.id);
    if (!task.completed && highPriorityTasks.length === 1 && highPriorityTasks[0].id === task.id) {
      checkAndCelebrateTasks(new Date().toISOString().split('T')[0], true);
    }
  };

  const [quickTitle, setQuickTitle] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    addTask({ title: quickTitle.trim(), priority: 'high', category: 'Work', completed: false });
    setQuickTitle('');
    setShowQuickAdd(false);
  };

  // Habits Section Data
  const todayStr = getISTDateString();
  const activeHabits = habits.filter(h => isHabitActiveOnDate ? isHabitActiveOnDate(h, todayStr) : true);
  const totalHabits = activeHabits.length;
  const completedHabits = activeHabits.filter(h => isHabitDoneOn(h.id, todayStr));
  const pendingHabits = activeHabits.filter(h => !isHabitDoneOn(h.id, todayStr));
  const habitPercent = totalHabits > 0 ? Math.round((completedHabits.length / totalHabits) * 100) : 0;

  let topStreakHabit = null;
  let maxStreak = 0;
  habits.forEach(h => { if (h.streak > maxStreak) { maxStreak = h.streak; topStreakHabit = h; } });

  const handleToggleHabit = (habitId) => {
    toggleHabitForDate(habitId, todayStr);
    if (pendingHabits.length === 1 && pendingHabits[0].id === habitId) {
      checkAndCelebrateHabits(todayStr, true);
      playNotificationChime();
      triggerHaptic('heavy');
    } else {
      triggerHaptic('light');
    }
  };

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
      {/* Tasks Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Must-Win Tasks</h3>
          </div>
          <div className="hidden sm:block">
            {showQuickAdd ? (
              <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="Task title..."
                  className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none"
                  style={{ fontSize: '16px' }}
                  autoFocus
                />
                <button type="submit" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Save
                </button>
                <button type="button" onClick={() => setShowQuickAdd(false)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowQuickAdd(true)}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            )}
          </div>
        </div>

        {displayTasks.length === 0 ? (
          <div className="flex items-center justify-center py-6 px-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
            <div className="flex flex-col items-center text-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Action board is clear!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {displayTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                <div className="flex items-center gap-3">
                  <button onClick={() => handleToggleTask(task)} className="text-slate-400 hover:text-emerald-500 transition-colors">
                    <Circle className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{task.title}</span>
                    {task.goalTag && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                        <Target className="w-3 h-3" />
                        {task.goalTag}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.priority === 'high' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                      Urgent
                    </span>
                  )}
                  {task.category && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {task.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center px-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {openCount} open · {completedCount} done today
          </p>
          <Link to="/tasks" className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            All tasks <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200 dark:border-slate-800" />

      {/* Habits Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Habit Rhythm</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {completedHabits.length}/{totalHabits}
            </span>
            <span className="px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
              {habitPercent}%
            </span>
          </div>
        </div>

        {maxStreak > 0 && topStreakHabit && (
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-700/30 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-400">
              <span>🔥 {maxStreak}d streak on '{topStreakHabit.name}'</span>
              {topStreakHabit.shieldActive && <Shield className="w-3.5 h-3.5 text-blue-500" />}
            </div>
            <Share2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
          </button>
        )}

        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${habitPercent}%` }}
          />
        </div>

        {totalHabits === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">No habits yet</p>
            <Link to="/habits" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              Create one
            </Link>
          </div>
        ) : pendingHabits.length === 0 ? (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              100% daily discipline! ALL DONE
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 max-h-28 overflow-y-auto pr-1">
            {pendingHabits.map(habit => (
              <button
                key={habit.id}
                onClick={() => handleToggleHabit(habit.id)}
                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-left hover:bg-emerald-500/15 hover:border-emerald-500/30 transition-all group"
              >
                <Circle className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                  {habit.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <DisciplineShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        disciplineScore={habitPercent}
        operatingArchetype={topStreakHabit ? `Master of ${topStreakHabit.name}` : 'The Habitual Titan'}
        archetypeIcon="🔥"
        topStreak={maxStreak}
        totalActiveMins={habits.length * 20}
        tasksCompleted={completedHabits.length}
        timeframe="day"
        timeframeLabel={`Today • ${maxStreak}d Streak`}
        theme={theme}
      />
    </div>
  );
};
