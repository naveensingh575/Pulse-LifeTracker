import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { isLivingBudgetExpense } from '../../utils/financeUtils';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Calendar,
  Wallet,
  Dumbbell,
  Compass,
  ArrowRight,
  Zap,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getISTDateString, getISTYearMonth } from '../../utils/dateUtils';

export const SmartFocusBanner = () => {
  const dashboard = useDashboard() || {};
  const {
    transactions = [],
    getMonthlyAllocation = () => ({ expenseBudget: 0, investmentGoal: 0 }),
    habits = [],
    isHabitDoneOn = () => false,
    isHabitActiveOnDate = () => true,
    tasks = [],
    activities = [],
    goals = [],
    currency = '₹',
    formatCurrency = (val) => `${currency}${Number(val || 0).toLocaleString()}`
  } = dashboard;

  const navigate = useNavigate();
  const todayStr = getISTDateString();
  const currentISTYM = getISTYearMonth();
  const currentMonthKey = `${currentISTYM.year}-${String(currentISTYM.month).padStart(2, '0')}`;
  const activeAllocation = (getMonthlyAllocation && getMonthlyAllocation(currentMonthKey)) || { expenseBudget: 0, investmentGoal: 0 };
  const monthlyBudgetCap = Number(activeAllocation?.expenseBudget) || 0;

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
  const activeTodayHabits = habits.filter(h => isHabitActiveOnDate(h, todayStr));
  const pendingTodayHabits = activeTodayHabits.filter(h => !isHabitDoneOn(h.id, todayStr));
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

  // 3. Finance & Runway Directive (tracks Living Budget; excludes Saving Account & Pre Commitments; includes Sent)
  const monthExpenses = transactions
    .filter(t => t.date && t.date.startsWith(currentMonthKey) && isLivingBudgetExpense(t))
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
      desc: `${formatCurrency(Math.max(0, remainingBudget))} remaining. Slow discretionary dining and shopping.`,
      actionText: 'Review Cashflow',
      route: '/finance'
    });
  } else {
    insights.push({
      id: 'finance-directive',
      icon: Wallet,
      badge: 'Healthy Runway',
      color: 'emerald',
      title: `${formatCurrency(Math.max(0, remainingBudget))} Budget Buffer`,
      desc: `Spending pace is healthy with ${100 - spentPct}% budget available.`,
      actionText: 'Finance Pulse',
      route: '/finance'
    });
  }

  // 4. Activity Discipline Directive
  const todayActivities = activities.filter(a => a.date === todayStr);
  if (activities.length === 0) {
    insights.push({
      id: 'activity-directive',
      icon: Dumbbell,
      badge: 'Activity',
      color: 'cyan',
      title: 'Track Daily Training',
      desc: 'Log your gym lifts, running distances, swimming laps, or reading hours.',
      actionText: '+ Log Activity',
      route: '/activity'
    });
  } else if (todayActivities.length > 0) {
    const firstAct = todayActivities[0];
    const disciplineName = firstAct.discipline || firstAct.type || 'Workout';
    insights.push({
      id: 'activity-directive',
      icon: Dumbbell,
      badge: 'Active Today',
      color: 'emerald',
      title: `${disciplineName} Logged 🔥`,
      desc: firstAct.notes || `Great job completing today's ${disciplineName.toLowerCase()} session! Energy and recovery on point.`,
      actionText: 'View Activity',
      route: '/activity'
    });
  } else {
    insights.push({
      id: 'activity-directive',
      icon: Dumbbell,
      badge: 'Movement',
      color: 'cyan',
      title: 'Plan Daily Session',
      desc: 'Commit to a gym, run, swimming or reading block today to maintain your energy.',
      actionText: 'Log Activity',
      route: '/activity'
    });
  }

  // 5. Strategic Goal & Milestone Directive
  if (goals.length === 0) {
    insights.push({
      id: 'goal-directive',
      icon: Compass,
      badge: 'Objectives',
      color: 'purple',
      title: 'Set Strategic Goal',
      desc: 'Define short & long-horizon milestones to align your daily tasks with life targets.',
      actionText: '+ Create Goal',
      route: '/goals'
    });
  } else {
    const pendingGoals = goals.filter(g => {
      const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
      return pct < 100;
    });

    if (pendingGoals.length > 0) {
      const topGoal = pendingGoals[0];
      const pct = Math.min(100, Math.round(((topGoal.currentAmount || 0) / (topGoal.targetAmount || 1)) * 100));
      insights.push({
        id: 'goal-directive',
        icon: Compass,
        badge: 'Milestone',
        color: 'purple',
        title: `${topGoal.title} (${pct}%)`,
        desc: topGoal.deadline 
          ? `Target date: ${topGoal.deadline}. Advance your key sub-goals and metric targets.`
          : 'Advance your key sub-goals and target metric milestones this week.',
        actionText: 'View Goals',
        route: '/goals'
      });
    } else {
      insights.push({
        id: 'goal-directive',
        icon: Compass,
        badge: '100% Crushed',
        color: 'emerald',
        title: 'All Goals Achieved 🏆',
        desc: 'Outstanding milestone execution! Review strategic objectives and set next horizon.',
        actionText: 'Open Goals',
        route: '/goals'
      });
    }
  }

  const iconColorMap = {
    rose: 'text-rose-500',
    amber: 'text-amber-500',
    cyan: 'text-cyan-500',
    purple: 'text-purple-500',
    emerald: 'text-emerald-500',
    indigo: 'text-indigo-500'
  };

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
              <span>Where to Focus</span>
              <span className="text-[10px] text-slate-400 font-normal lowercase">• 5-pillar strategic focus</span>
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

      {/* 5 Proactive Directives Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
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
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 truncate mr-1">
                    <IconComp className={`w-3.5 h-3.5 shrink-0 ${iconColorMap[item.color] || 'text-indigo-500'}`} />
                    <span className="truncate">{item.title}</span>
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                    item.color === 'rose'
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      : item.color === 'amber'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : item.color === 'cyan'
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
                      : item.color === 'purple'
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                      : item.color === 'indigo'
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
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
