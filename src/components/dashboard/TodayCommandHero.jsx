import React, { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { getISTDateString, getISTYearMonth, formatISTDisplayDate } from '../../utils/dateUtils';
import { isLivingBudgetExpense } from '../../utils/financeUtils';
import { triggerHaptic } from '../../utils/hapticUtils';
import { playNotificationChime } from '../../utils/notificationUtils';
import { createGoogleCalendarUrl, downloadIcsFile } from '../routines/RoutineWidget';
import { Sun, Moon, Zap, Calendar, Download, CheckCircle, Circle, ArrowRight, Check, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TodayCommandHero = ({ onOpenCockpit }) => {
  const {
    habits = [], tasks = [], transactions = [],
    isHabitDoneOn = () => false,
    isHabitActiveOnDate = () => true,
    toggleHabitForDate,
    getJournalEntry = () => null,
    saveJournalEntry = async () => {},
    getMonthlyAllocation = () => ({ expenseBudget: 0, investmentGoal: 0 }),
    formatCurrency = (val) => `₹${Number(val || 0).toLocaleString()}`,
    currency = '₹',
    quotaStatus,
    openPricingModal
  } = useDashboard();

  const todayStr = getISTDateString();
  const displayDate = formatISTDisplayDate(todayStr);
  const currentHour = new Date().getHours();
  const isMorning = currentHour >= 5 && currentHour < 12;
  const isAfternoon = currentHour >= 12 && currentHour < 18;
  const isEvening = currentHour >= 18 || currentHour < 5;

  const [activeTab, setActiveTab] = useState(isEvening ? 'evening' : 'morning');

  // Greeting
  const greeting = isMorning ? 'Good Morning' : isAfternoon ? 'Good Afternoon' : 'Good Evening';

  // Pulse Score Calculation
  const totalHabits = habits.filter(h => isHabitActiveOnDate(h, todayStr)).length;
  const completedHabits = habits.filter(h => isHabitActiveOnDate(h, todayStr) && isHabitDoneOn(h.id, todayStr)).length;
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;

  const habitRatio = totalHabits > 0 ? (completedHabits / totalHabits) : 0;
  const taskRatio = totalTasks > 0 ? (completedTasks / totalTasks) : 0;
  
  const pulseScore = Math.round((habitRatio * 0.6 + taskRatio * 0.4) * 100);

  // Finance
  const currentISTYM = getISTYearMonth();
  const currentMonthKey = `${currentISTYM.year}-${String(currentISTYM.month).padStart(2, '0')}`;
  const activeAllocation = (getMonthlyAllocation && getMonthlyAllocation(currentMonthKey)) || { expenseBudget: 0, investmentGoal: 0 };
  const monthlyBudgetCap = Number(activeAllocation?.expenseBudget) || 0;
  const monthExpenses = transactions
    .filter(t => t.date && t.date.startsWith(currentMonthKey) && isLivingBudgetExpense(t))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const spentPct = monthlyBudgetCap > 0 ? Math.round((monthExpenses / monthlyBudgetCap) * 100) : 0;
  
  // Focus Directive
  const urgentTasks = tasks.filter(t => !t.completed && (t.priority === 'high' || t.priority === 'urgent'));
  const pendingHabitsCount = totalHabits - completedHabits;

  let directive = null;
  if (urgentTasks.length > 0) {
    directive = {
      type: 'urgent_tasks',
      badgeText: `${urgentTasks.length} Urgent Task${urgentTasks.length > 1 ? 's' : ''}`,
      badgeColor: 'bg-rose-500 text-white',
      text: urgentTasks[0].title
    };
  } else if (pendingHabitsCount > 0) {
    directive = {
      type: 'pending_habits',
      badgeText: `${pendingHabitsCount} Pending Habit${pendingHabitsCount > 1 ? 's' : ''}`,
      badgeColor: 'bg-amber-500 text-white',
      text: 'Keep the momentum going'
    };
  } else if (spentPct >= 80) {
    directive = {
      type: 'budget_alert',
      badgeText: 'Budget Alert',
      badgeColor: 'bg-rose-500 text-white',
      text: `Spent ${spentPct}% of monthly budget`
    };
  } else {
    directive = {
      type: 'all_clear',
      badgeText: 'All Clear',
      badgeColor: 'bg-emerald-500 text-white',
      text: 'You are on track today!'
    };
  }

  // Morning Mode: Focus Tasks
  const [focusTaskIds, setFocusTaskIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`pulse_focus_tasks_${todayStr}`) || '[]');
    } catch (e) {
      return [];
    }
  });

  const toggleFocusTask = (taskId) => {
    let newIds;
    if (focusTaskIds.includes(taskId)) {
      newIds = focusTaskIds.filter(id => id !== taskId);
    } else {
      if (focusTaskIds.length >= 3) {
        triggerHaptic('error');
        return;
      }
      newIds = [...focusTaskIds, taskId];
      triggerHaptic('selection');
    }
    setFocusTaskIds(newIds);
    localStorage.setItem(`pulse_focus_tasks_${todayStr}`, JSON.stringify(newIds));
  };

  const openIncompleteTasks = tasks.filter(t => !t.completed).slice(0, 5);

  // Evening Mode: Journaling
  const existingEntry = getJournalEntry(todayStr) || {};
  const [highlightInput, setHighlightInput] = useState(existingEntry.accomplished || '');
  const [selectedMood, setSelectedMood] = useState(existingEntry.mood || '');

  const handleSaveEvening = async () => {
    if (!highlightInput && !selectedMood) return;
    
    await saveJournalEntry(todayStr, {
      ...existingEntry,
      mood: selectedMood,
      accomplished: highlightInput
    });
    
    triggerHaptic('success');
    playNotificationChime();
  };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (pulseScore / 100) * circumference;

  return (
    <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-md overflow-hidden relative">
      {/* 1. Greeting + Pulse Score Ring + Focus Directive */}
      <div className="flex items-center space-x-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-slate-200 dark:text-slate-700 stroke-current"
              strokeWidth="8"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
            />
            <circle
              className="text-indigo-500 stroke-current"
              strokeWidth="8"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transition: 'stroke-dashoffset 0.5s ease-in-out'
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-none">{pulseScore}%</span>
            <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Pulse</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-1.5">
            {isEvening ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              {greeting}, User! • {displayDate}
            </h2>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-slate-400" />
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${directive.badgeColor}`}>
                {directive.badgeText}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 ml-5">
              {directive.text}
            </p>
          </div>

          <div className="pt-1">
            <button
              onClick={onOpenCockpit}
              className="flex items-center justify-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl px-3 py-1.5 shadow-md transition-colors w-full sm:w-auto"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>30s Check-In</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Morning/Evening Toggle */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
        <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit mb-3">
          <button
            onClick={() => { setActiveTab('morning'); triggerHaptic('light'); }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'morning'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Morning</span>
          </button>
          <button
            onClick={() => { setActiveTab('evening'); triggerHaptic('light'); }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'evening'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Evening</span>
          </button>
        </div>

        <div className="animate-in fade-in duration-200">
          {activeTab === 'morning' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Select up to 3 focus priorities for today:
                </p>
                <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                  {focusTaskIds.length}/3
                </span>
              </div>
              
              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                {openIncompleteTasks.length > 0 ? (
                  openIncompleteTasks.map(task => {
                    const isSelected = focusTaskIds.includes(task.id);
                    return (
                      <button
                        key={task.id}
                        onClick={() => toggleFocusTask(task.id)}
                        className={`w-full flex items-center space-x-3 p-2 rounded-xl border text-left transition-colors ${
                          isSelected 
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30' 
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-slate-600'
                        }`}
                      >
                        {isSelected ? (
                          <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                        )}
                        <span className={`text-xs flex-1 truncate ${isSelected ? 'text-indigo-900 dark:text-indigo-200 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                          {task.title} {task.category && <span className="opacity-50">({task.category})</span>}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-500 dark:text-slate-400">No pending tasks for today!</p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <a
                  href={createGoogleCalendarUrl({
                    title: 'Daily Pulse Timeblock',
                    details: 'Focus time for priority tasks',
                    date: todayStr
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Sync to Calendar</span>
                </a>
                <button
                  onClick={() => downloadIcsFile({
                    title: 'Daily Pulse Timeblock',
                    details: 'Focus time for priority tasks',
                    date: todayStr
                  })}
                  className="hidden md:flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <Download className="w-3 h-3" />
                  <span>.ics Download</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-1">
                  <span>{pulseScore}% Score Today</span>
                </h3>
                <Link to="/journal" className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                  Full Journal <ArrowRight className="w-3 h-3 ml-0.5" />
                </Link>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'high_energy', emoji: '⚡', label: 'High Energy' },
                  { id: 'productive', emoji: '😊', label: 'Productive' },
                  { id: 'calm', emoji: '🧘', label: 'Calm' },
                  { id: 'tired', emoji: '😴', label: 'Tired' }
                ].map(mood => (
                  <button
                    key={mood.id}
                    onClick={() => {
                      setSelectedMood(mood.id);
                      triggerHaptic('light');
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-colors ${
                      selectedMood === mood.id
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/50'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span className="text-lg mb-1">{mood.emoji}</span>
                    <span className="text-[9px] font-medium text-slate-600 dark:text-slate-300 text-center leading-tight">
                      {mood.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <input
                  type="text"
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  placeholder="Today's highlight..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  style={{ fontSize: '16px' }}
                />
              </div>
              
              <div className="flex items-center justify-between pt-1">
                <a
                  href={createGoogleCalendarUrl({
                    title: 'Evening Review',
                    details: 'Daily reflection time',
                    date: todayStr
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-[10px] text-slate-500 dark:text-slate-400 hover:underline"
                >
                  <Calendar className="w-3 h-3" />
                  <span>9 PM Reminder</span>
                </a>

                <button
                  onClick={handleSaveEvening}
                  disabled={!highlightInput && !selectedMood}
                  className="bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold py-1.5 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Log Win
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
