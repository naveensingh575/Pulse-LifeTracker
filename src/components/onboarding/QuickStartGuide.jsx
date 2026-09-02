import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Plus, 
  ArrowRight, 
  Flame, 
  Wallet, 
  CheckSquare, 
  ChevronRight
} from 'lucide-react';

const HABIT_PRESETS = [
  { name: '💧 Drink 2.5L Water', category: 'Health', target: 1, unit: 'daily' },
  { name: '📖 Read 15 Minutes', category: 'Mind', target: 15, unit: 'mins' },
  { name: '🏋️‍♂️ Gym / Workout', category: 'Fitness', target: 1, unit: 'session' },
  { name: '🧘 Morning Mindfulness', category: 'Mind', target: 10, unit: 'mins' },
];

export const QuickStartGuide = ({ onDismiss }) => {
  const { 
    habits, 
    addHabit, 
    tasks, 
    addTask, 
    monthlyBudget, 
    setMonthlyBudget, 
    currency,
    formatCurrency 
  } = useDashboard();

  const [customHabit, setCustomHabit] = useState('');
  const [budgetInput, setBudgetInput] = useState(monthlyBudget || (currency === '₹' ? 30000 : 2500));
  const [taskInput, setTaskInput] = useState('');
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [isSettingBudget, setIsSettingBudget] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);

  const hasHabit = habits && habits.length > 0;
  const hasBudget = Number(monthlyBudget) > 0;
  const hasTask = tasks && tasks.length > 0;

  const completedSteps = (hasHabit ? 1 : 0) + (hasBudget ? 1 : 0) + (hasTask ? 1 : 0);

  const handleAddPresetHabit = async (preset) => {
    setIsAddingHabit(true);
    await addHabit({
      name: preset.name,
      category: preset.category,
      frequency: 'Daily',
      target_days: 7,
      target_value: preset.target,
      unit: preset.unit
    });
    setIsAddingHabit(false);
  };

  const handleAddCustomHabit = async (e) => {
    e.preventDefault();
    if (!customHabit.trim()) return;
    setIsAddingHabit(true);
    await addHabit({
      name: customHabit.trim(),
      category: 'General',
      frequency: 'Daily',
      target_days: 7,
      target_value: 1,
      unit: 'times'
    });
    setCustomHabit('');
    setIsAddingHabit(false);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    const val = Number(budgetInput);
    if (val > 0) {
      setIsSettingBudget(true);
      await setMonthlyBudget(val);
      setIsSettingBudget(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    setIsAddingTask(true);
    await addTask({
      title: taskInput.trim(),
      priority: 'high',
      status: 'pending'
    });
    setTaskInput('');
    setIsAddingTask(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/70 via-white to-cyan-50/70 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 rounded-3xl p-6 sm:p-8 border border-indigo-100 dark:border-slate-800 shadow-xl space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100/80 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Welcome to PULSE • Quick Start Launchpad
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Complete these 3 foundational steps to calibrate your personal daily operating rhythm.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-cyan-400">
              {completedSteps} of 3 Done
            </span>
            <div className="w-28 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${(completedSteps / 3) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            <span>Full Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3 Step Interactive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* STEP 1: HABITS */}
        <div className={`p-5 rounded-2xl border transition-all ${
          hasHabit 
            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/60 dark:border-emerald-500/30' 
            : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-indigo-300 shadow-sm'
        } space-y-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                Add 1st Daily Habit
              </h3>
            </div>
            {hasHabit ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
            )}
          </div>

          {hasHabit ? (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1">
              <p className="font-bold text-emerald-700 dark:text-emerald-400">✓ {habits[0].name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Ready to track on your 7-day strip!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-500 dark:text-slate-400">Pick a starter preset:</p>
              <div className="grid grid-cols-1 gap-1.5">
                {HABIT_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    disabled={isAddingHabit}
                    onClick={() => handleAddPresetHabit(preset)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 text-xs font-medium transition flex items-center justify-between group border border-transparent hover:border-indigo-200 cursor-pointer"
                  >
                    <span>{preset.name}</span>
                    <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition" />
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddCustomHabit} className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  placeholder="Or type custom..."
                  value={customHabit}
                  onChange={(e) => setCustomHabit(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!customHabit.trim() || isAddingHabit}
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Add
                </button>
              </form>
            </div>
          )}
        </div>

        {/* STEP 2: BUDGET */}
        <div className={`p-5 rounded-2xl border transition-all ${
          hasBudget 
            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/60 dark:border-emerald-500/30' 
            : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-indigo-300 shadow-sm'
        } space-y-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-500" />
                Monthly Budget Ceiling
              </h3>
            </div>
            {hasBudget ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
            )}
          </div>

          {hasBudget ? (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1">
              <p className="font-bold text-emerald-700 dark:text-emerald-400">
                ✓ {formatCurrency(monthlyBudget)} / Month
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Safe daily burn rate calibrated!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Set total monthly spending limit to compute safe daily runway:
              </p>
              <form onSubmit={handleSaveBudget} className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono font-bold border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder={`e.g. ${currency === '₹' ? '30000' : '2500'}`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSettingBudget || !budgetInput}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Set Budget
                </button>
              </form>
            </div>
          )}
        </div>

        {/* STEP 3: TOP PRIORITY TASK */}
        <div className={`p-5 rounded-2xl border transition-all ${
          hasTask 
            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/60 dark:border-emerald-500/30' 
            : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-indigo-300 shadow-sm'
        } space-y-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-cyan-500" />
                #1 Priority Action Task
              </h3>
            </div>
            {hasTask ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
            )}
          </div>

          {hasTask ? (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1">
              <p className="font-bold text-emerald-700 dark:text-emerald-400">
                ✓ {tasks[0].title}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Ready in your High-Priority board!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                What is the single most important task you must complete today?
              </p>
              <form onSubmit={handleAddTask} className="space-y-2">
                <input
                  type="text"
                  placeholder="e.g. Finish client proposal..."
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  type="submit"
                  disabled={isAddingTask || !taskInput.trim()}
                  className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Add Priority Task
                </button>
              </form>
            </div>
          )}
        </div>

      </div>

      {/* Completion CTA */}
      {completedSteps >= 1 && (
        <div className="p-4 bg-indigo-600 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-indigo-600/20">
          <div className="text-left">
            <p className="text-xs sm:text-sm font-bold">Great momentum! Your dashboard is now calibrated.</p>
            <p className="text-[11px] text-indigo-100">Click below to enter your full executive command center.</p>
          </div>
          <button
            onClick={onDismiss}
            className="px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5 cursor-pointer shrink-0"
          >
            <span>Enter Full Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
