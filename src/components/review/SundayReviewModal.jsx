import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/AuthContext';
import {
  getISTDateString,
  getISTWeekDays,
  getISTWeekBadge,
  getISTYearMonth
} from '../../utils/dateUtils';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  TrendingUp,
  Wallet,
  Activity,
  ArrowRight,
  Copy,
  Check,
  X,
  Target
} from 'lucide-react';
import { triggerConfetti } from '../../utils/celebrationUtils';
import { triggerHaptic } from '../../utils/hapticUtils';

export const SundayReviewModal = ({ isOpen, onClose }) => {
  const {
    habits = [],
    tasks = [],
    transactions = [],
    activities = [],
    currency = '₹',
    formatCurrency = (v) => `${currency}${Number(v || 0).toLocaleString()}`,
    getMonthlyAllocation = () => ({ expenseBudget: 0 }),
    isHabitDoneOn = () => false,
    isHabitActiveOnDate = () => true
  } = useDashboard();
  const { user } = useAuth();

  const [copied, setCopied] = useState(false);
  const todayStr = getISTDateString();
  const weekDays = getISTWeekDays();
  const weekBadge = getISTWeekBadge();
  const currentYM = getISTYearMonth();
  const currentMonthKey = `${currentYM.year}-${String(currentYM.month).padStart(2, '0')}`;

  // Next week's commitments state (stored per week key)
  const storageKey = `pulse_sunday_commitments_${weekBadge.replace(/\s+/g, '_')}`;
  const [commitments, setCommitments] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['', '', ''];
  });

  const handleCommitmentChange = (index, value) => {
    setCommitments(prev => {
      const updated = [...prev];
      updated[index] = value;
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // 1. Weekly Habit Discipline Score Calculation
  let totalScheduledSlots = 0;
  let completedSlots = 0;

  habits.forEach(habit => {
    weekDays.forEach(day => {
      if (isHabitActiveOnDate(habit, day.dateStr)) {
        totalScheduledSlots += 1;
        if (isHabitDoneOn(habit.id, day.dateStr)) {
          completedSlots += 1;
        }
      }
    });
  });

  const habitDisciplineScore = totalScheduledSlots > 0
    ? Math.round((completedSlots / totalScheduledSlots) * 100)
    : 100;

  // Active Streak Shield Count
  const shieldedHabitsCount = habits.filter(h => h.shieldActive).length;

  // 2. Financial Weekly Burn Rate
  const weekDateStrs = weekDays.map(d => d.dateStr);
  const weeklyExpenseTransactions = transactions.filter(
    t => t.type === 'expense' && weekDateStrs.includes(t.date || '')
  );
  const totalWeeklyExpense = weeklyExpenseTransactions.reduce(
    (acc, t) => acc + (Number(t.amount) || 0), 0
  );

  const monthlyAllocation = getMonthlyAllocation(currentMonthKey) || { expenseBudget: 0 };
  const monthlyExpenseBudget = Number(monthlyAllocation.expenseBudget) || 0;
  const weeklyExpenseCap = monthlyExpenseBudget > 0 ? Math.round(monthlyExpenseBudget / 4) : 0;
  const isBudgetSafe = weeklyExpenseCap === 0 || totalWeeklyExpense <= weeklyExpenseCap;

  // 3. Execution Velocity: Tasks
  const completedTasksThisWeek = tasks.filter(t => t.completed).length;
  const pendingHighPriority = tasks.filter(t => !t.completed && t.priority === 'high').length;

  // 4. Physical Vitality & Athletic Output
  const weeklyActivities = activities.filter(a => weekDateStrs.includes(a.date || ''));
  const totalActiveMinutes = weeklyActivities.reduce((acc, a) => acc + (Number(a.durationMins || a.duration) || 0), 0);

  // Copy Executive Summary
  const handleCopySummary = async () => {
    const textLines = [
      `📋 PULSE SUNDAY EXECUTIVE BRIEF (${weekBadge})`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `🛡️ Weekly Habit Rhythm: ${habitDisciplineScore}% (${completedSlots}/${totalScheduledSlots} check-ins)`,
      shieldedHabitsCount > 0 ? `   ↳ 🛡️ ${shieldedHabitsCount} Streak Shields currently protecting momentum` : null,
      `💳 Financial Weekly Burn: ${formatCurrency(totalWeeklyExpense)}${weeklyExpenseCap > 0 ? ` (Cap: ${formatCurrency(weeklyExpenseCap)})` : ''}`,
      `⚡ Tasks Executed: ${completedTasksThisWeek} completed (${pendingHighPriority} high-priority open)`,
      `🏃 Vitality Output: ${totalActiveMinutes} active minutes logged`,
      ``,
      `🎯 NEXT WEEK'S NON-NEGOTIABLES:`,
      commitments[0] ? `1. ${commitments[0]}` : null,
      commitments[1] ? `2. ${commitments[1]}` : null,
      commitments[2] ? `3. ${commitments[2]}` : null,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Operated with Pulse Life Tracker: https://pulse-life-tracker.vercel.app`
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(textLines);
      setCopied(true);
      triggerHaptic('light');
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const handleCompleteReview = () => {
    localStorage.setItem(`pulse_sunday_reviewed_${todayStr}`, 'true');
    triggerConfetti(0.4);
    triggerHaptic('medium');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 dark:bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-xl w-full rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 pr-8">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-amber-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Sparkles className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Sunday Executive Review
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-wider border border-indigo-500/20">
                Weekly Brief
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Reflect on <strong className="font-semibold text-slate-700 dark:text-slate-300">{weekBadge}</strong> and calibrate your focus for next week.
            </p>
          </div>
        </div>

        {/* 4-Pillar Scoreboard Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* 1. Habit Discipline */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Habits</span>
              </span>
            </div>
            <p className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">
              {habitDisciplineScore}%
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {completedSlots}/{totalScheduledSlots} completed
            </p>
          </div>

          {/* 2. Financial Burn */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                <span>Weekly Burn</span>
              </span>
            </div>
            <p className={`text-xl font-black font-mono ${isBudgetSafe ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
              {formatCurrency(totalWeeklyExpense)}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {weeklyExpenseCap > 0 ? `Target: <${formatCurrency(weeklyExpenseCap)}` : 'Logged expenses'}
            </p>
          </div>

          {/* 3. Tasks Done */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Execution</span>
              </span>
            </div>
            <p className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400">
              {completedTasksThisWeek}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {pendingHighPriority} urgent pending
            </p>
          </div>

          {/* 4. Physical Vitality */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-500" />
                <span>Vitality</span>
              </span>
            </div>
            <p className="text-xl font-black font-mono text-cyan-600 dark:text-cyan-400">
              {totalActiveMinutes}m
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {weeklyActivities.length} session{weeklyActivities.length !== 1 ? 's' : ''} logged
            </p>
          </div>
        </div>

        {/* Executive Synthesis Directive */}
        <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-3">
          <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <p className="font-bold text-slate-900 dark:text-white">
              {habitDisciplineScore >= 80 ? 'Exceptional Weekly Rhythm 🟢' : habitDisciplineScore >= 60 ? 'Solid Pace Maintained 🟡' : 'Calibration Required for Next Week 🔴'}
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {shieldedHabitsCount > 0 && `Your Streak Shield protected ${shieldedHabitsCount} habit${shieldedHabitsCount > 1 ? 's' : ''} from breaking this week. `}
              {isBudgetSafe ? 'Cash burn remained inside operating ceilings. ' : 'Weekly spend ran above target rate. '}
              Take 60 seconds to lock in your top 3 non-negotiables for the upcoming week below.
            </p>
          </div>
        </div>

        {/* 🎯 Next Week's 3 Non-Negotiables */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-500" />
              <span>Next Week's 3 Non-Negotiable Priorities</span>
            </label>
            <span className="text-[10px] text-slate-400">Auto-saved</span>
          </div>

          <div className="space-y-2">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  placeholder={
                    idx === 0
                      ? 'e.g. Ship Client Deliverable / Close MVP feature'
                      : idx === 1
                      ? 'e.g. Complete 4 Gym sessions + 10km run'
                      : 'e.g. Review living budget and cap discretionary burn'
                  }
                  value={commitments[idx] || ''}
                  onChange={(e) => handleCommitmentChange(idx, e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={handleCopySummary}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500">Executive Brief Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Weekly Brief</span>
              </>
            )}
          </button>

          <button
            onClick={handleCompleteReview}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Lock In & Start Week</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
