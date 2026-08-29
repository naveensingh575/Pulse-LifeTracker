import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { Sparkles, ArrowRight, CheckCircle2, Flame, Wallet, Target, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getISTDateString, getISTYearMonth } from '../../utils/dateUtils';

export const SmartFocusBanner = () => {
  const {
    transactions,
    getMonthlyAllocation,
    habits,
    isHabitDoneOn,
    tasks,
    goals
  } = useDashboard();

  const navigate = useNavigate();
  const todayStr = getISTDateString();
  const currentISTYM = getISTYearMonth();
  const currentMonthKey = `${currentISTYM.year}-${String(currentISTYM.month).padStart(2, '0')}`;
  const activeAllocation = getMonthlyAllocation(currentMonthKey);
  const monthlyBudgetCap = activeAllocation.expenseBudget;

  const insights = [];

  // 1. Task Priority Directive
  const highPriorityPending = tasks.filter(t => t.priority === 'high' && !t.completed);
  if (tasks.length === 0) {
    insights.push({
      id: 'task-directive',
      icon: Zap,
      badge: 'Action Board',
      color: 'indigo',
      title: 'No Action Tasks Yet',
      desc: 'Create your primary daily targets and priority tasks to focus your execution.',
      actionText: '+ Add Task',
      route: '/tasks'
    });
  } else if (highPriorityPending.length > 0) {
    insights.push({
      id: 'task-directive',
      icon: Zap,
      badge: 'Action Priority',
      color: 'rose',
      title: `${highPriorityPending.length} Urgent High-Priority Task${highPriorityPending.length > 1 ? 's' : ''}`,
      desc: `Focus on "${highPriorityPending[0].title}" before working on secondary backlog items.`,
      actionText: 'Execute Now',
      route: '/tasks'
    });
  } else {
    insights.push({
      id: 'task-directive',
      icon: CheckCircle2,
      badge: 'Action Board',
      color: 'emerald',
      title: 'Action Board Clear',
      desc: 'All high-priority tasks completed. Plan milestone goals or review weekly routines.',
      actionText: 'Open Tasks',
      route: '/tasks'
    });
  }

  // 2. Habit Consistency Directive
  const pendingTodayHabits = habits.filter(h => !isHabitDoneOn(h.id, todayStr));
  if (habits.length === 0) {
    insights.push({
      id: 'habit-directive',
      icon: Flame,
      badge: 'Habit Rhythm',
      color: 'amber',
      title: 'No Habits Created Yet',
      desc: 'Build your foundational routines (e.g. 2L Water, 15m Reading, Workout) in Habits Hub.',
      actionText: 'Create Habit',
      route: '/habits'
    });
  } else if (pendingTodayHabits.length > 0) {
    insights.push({
      id: 'habit-directive',
      icon: Flame,
      badge: 'Habit Rhythm',
      color: 'amber',
      title: `${pendingTodayHabits.length} Pending Habit${pendingTodayHabits.length > 1 ? 's' : ''} Today`,
      desc: `Complete '${pendingTodayHabits[0].name}' before evening to protect your consistency streak.`,
      actionText: 'Log Habits',
      route: '/habits'
    });
  } else {
    insights.push({
      id: 'habit-directive',
      icon: Flame,
      badge: '100% Complete',
      color: 'emerald',
      title: 'Daily Discipline On Fire 🔥',
      desc: 'All daily habits logged for today! Outstanding routine execution.',
      actionText: 'Habit Hub',
      route: '/habits'
    });
  }

  // 3. Finance & Runway Directive
  const monthExpenses = transactions
    .filter(t => t.type === 'expense' && t.date && t.date.startsWith(currentMonthKey))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const remainingBudget = monthlyBudgetCap - monthExpenses;
  const spentPct = monthlyBudgetCap > 0 ? Math.round((monthExpenses / monthlyBudgetCap) * 100) : 0;

  if (monthlyBudgetCap === 0) {
    insights.push({
      id: 'finance-directive',
      icon: Wallet,
      badge: 'Budgeting',
      color: 'indigo',
      title: 'Set Monthly Budget',
      desc: 'Define your monthly expense ceiling in Financial Pulse to track safe daily burn rates.',
      actionText: 'Configure Budget',
      route: '/finance'
    });
  } else if (spentPct >= 80) {
    insights.push({
      id: 'finance-directive',
      icon: Wallet,
      badge: 'Runway Alert',
      color: 'rose',
      title: `${spentPct}% Monthly Budget Consumed`,
      desc: `₹${Math.max(0, remainingBudget).toLocaleString('en-IN')} remaining. Slow discretionary dining and shopping.`,
      actionText: 'Review Cashflow',
      route: '/finance'
    });
  } else {
    insights.push({
      id: 'finance-directive',
      icon: Wallet,
      badge: 'Healthy Runway',
      color: 'emerald',
      title: `₹${Math.max(0, remainingBudget).toLocaleString('en-IN')} Budget Buffer`,
      desc: `Spending pace is healthy with ${100 - spentPct}% budget available.`,
      actionText: 'Finance Pulse',
      route: '/finance'
    });
  }

  return (
    <div className="space-y-3">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>"Where To Focus" Smart Directives</span>
              <span className="text-[10px] text-slate-400 font-normal lowercase">• today's top 3 priorities</span>
            </h2>
          </div>
        </div>

        <button
          onClick={() => navigate('/analytics')}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Executive Diagnostics</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 3 Proactive Directives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {insights.map((item) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => navigate(item.route)}
              className="glass-card-dark rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                    <IconComp className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{item.title}</span>
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                    item.color === 'rose'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      : item.color === 'amber'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  }`}>
                    {item.badge}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  {item.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                <span>{item.actionText}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
