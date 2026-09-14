import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Plus,
  Zap,
  Target
} from 'lucide-react';

export const PrioritizedTasks = () => {
  const { tasks, toggleTask, addTask } = useDashboard();
  const [quickTitle, setQuickTitle] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Filter tasks: High-priority uncompleted tasks first, then other uncompleted
  const highPriorityTasks = tasks.filter(t => !t.completed && t.priority === 'high');
  const otherActiveTasks = tasks.filter(t => !t.completed && t.priority !== 'high');
  const displayTasks = [...highPriorityTasks, ...otherActiveTasks].slice(0, 5);
  const completedCount = tasks.filter(t => t.completed).length;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    addTask({
      title: quickTitle.trim(),
      priority: 'high',
      category: 'Work',
      completed: false
    });
    setQuickTitle('');
    setShowQuickAdd(false);
  };

  return (
    <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between">
      
      {/* Header with deep-link */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Prioritized Action Board</h3>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showQuickAdd ? 'Cancel' : 'Add Task'}</span>
          </button>

          <Link
            to="/tasks"
            className="flex items-center space-x-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition group"
          >
            <span>View All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Quick Add Form */}
      {showQuickAdd && (
        <form onSubmit={handleQuickAdd} className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-500/30 flex items-center space-x-2 animate-in fade-in duration-150">
          <input
            type="text"
            required
            autoFocus
            placeholder="Urgent action title..."
            value={quickTitle}
            onChange={e => setQuickTitle(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-sm transition cursor-pointer"
          >
            Add
          </button>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {displayTasks.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Action board is clear!</p>
            <p className="text-[10px] text-slate-500">All high-priority tasks completed.</p>
          </div>
        ) : (
          displayTasks.map(task => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 border border-slate-200 dark:border-slate-800/80 transition cursor-pointer group"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <button className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition shrink-0">
                  <Circle className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {task.title}
                  </p>
                  {task.goalTag && (
                    <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 flex items-center gap-0.5">
                      <Target className="w-2.5 h-2.5" />
                      <span>{task.goalTag}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                {task.priority === 'high' && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    Urgent
                  </span>
                )}
                {task.category && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {task.category}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800/80">
        <span>{tasks.filter(t => !t.completed).length} open tasks remaining</span>
        <span className="font-mono">{completedCount} completed today</span>
      </div>

    </div>
  );
};
