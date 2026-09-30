import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Check,
  Compass,
  Zap,
  Target,
  Shield,
  Flame,
  Brain,
  Calendar,
  ListTodo,
  TrendingUp,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { getISTDate, getISTDateString, getISTDateDiffDays } from '../../utils/dateUtils';

const isCurrencyUnit = (unit) => {
  if (!unit) return false;
  const cleaned = String(unit).trim().toLowerCase();
  return ['₹', '$', '€', '£', '¥', 'cad', 'aud', 'inr', 'usd', 'eur', 'gbp', 'rs', 'rs.', 'rupees'].includes(cleaned);
};

export const PredictiveFeasibility = () => {
  const {
    goals = [],
    tasks = [],
    habits = [],
    activities = [],
    totalIncome = 0,
    totalSpent = 0,
    addTask,
    quotaStatus,
    openPricingModal,
    currency = '₹'
  } = useDashboard();

  const [addedTasks, setAddedTasks] = useState({});

  const todayStr = getISTDateString();
  const today = getISTDate();

  // 1. DYNAMIC BEHAVIORAL PERSONALITY PROFILING ENGINE
  // Analyzes real historical execution data: tasks completion, habits streaks, physical activity, and cashflow
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const overallTaskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingTasksCount = totalTasks - completedTasks;

  const highPriorityTasks = tasks.filter(t => t.priority === 'high');
  const highPriorityCompleted = highPriorityTasks.filter(t => t.completed).length;
  const highPriorityRate = highPriorityTasks.length > 0 ? Math.round((highPriorityCompleted / highPriorityTasks.length) * 100) : 0;

  const totalHabits = habits.length;
  const avgHabitStreak = totalHabits > 0
    ? Math.round(habits.reduce((sum, h) => sum + (Number(h.streak) || 0), 0) / totalHabits)
    : 0;

  const totalActiveMins = activities.reduce((sum, a) => sum + (Number(a.durationMins ?? a.duration) || 0), 0);
  const netSavings = totalIncome - totalSpent;
  const savingsRatePct = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Determine Operating Personality Archetype
  const getOperatingPersonality = () => {
    if (totalActiveMins >= 90 && overallTaskCompletionRate >= 60) {
      return {
        name: 'The Kinetic Sprinter',
        icon: '⚡',
        badge: 'Rapid Sprint Execution',
        color: 'cyan',
        summary: 'High stamina fueling rapid sprint execution',
        strategyGuide: 'High daily energy fuels focused milestone sprints and momentum.'
      };
    }
    if (avgHabitStreak >= 4 || (habits.length > 0 && overallTaskCompletionRate >= 70)) {
      return {
        name: 'The Systematic Compounder',
        icon: '🛡️',
        badge: 'High Routine Discipline',
        color: 'emerald',
        summary: 'Strong daily habit consistency and low behavioral churn',
        strategyGuide: 'Compound routines beat motivation; micro-quotas anchored to existing habits yield guaranteed results.'
      };
    }
    if (tasks.length > 0 && highPriorityRate >= 65) {
      return {
        name: 'The Focused Architect',
        icon: '🏗️',
        badge: 'Systematic Execution',
        color: 'purple',
        summary: 'High follow-through on critical-path priorities and milestone decomposition',
        strategyGuide: 'You thrive when goals are structured into clear sub-goals and unblocked sequentially.'
      };
    }
    if (pendingTasksCount > 8 && overallTaskCompletionRate < 50) {
      return {
        name: 'The High-Velocity Pivotter',
        icon: '🚀',
        badge: 'High Ambition / Backlog Compression',
        color: 'amber',
        summary: 'Sets ambitious targets; benefits from ruthless priority triage',
        strategyGuide: 'Overcoming task sprawl by strictly enforcing a Single-In-Progress WIP limit.'
      };
    }
    return {
      name: 'The Emerging Momentum Builder',
      icon: '🌱',
      badge: 'Building Keystone Rhythms',
      color: 'indigo',
      summary: 'Establishing dashboard consistency and early milestone momentum',
      strategyGuide: 'Lowering entry friction compounds into massive confidence within 14 days.'
    };
  };

  const userProfile = getOperatingPersonality();

  // 2. 1-CLICK TASK DISPATCHER
  const handleAddTask = (actionText, goal) => {
    // Strip strategy tag prefix if present to keep task title clean
    const cleanTitle = actionText.replace(/^\[Strategy:\s*[^\]]+\]\s*/, '');
    addTask({
      title: cleanTitle,
      priority: 'high',
      category: goal.category || 'Goal',
      dueDate: todayStr,
      linkedGoalTitle: goal.title
    });

    const key = `${goal.id}-${actionText}`;
    setAddedTasks(prev => ({ ...prev, [key]: true }));

    setTimeout(() => {
      setAddedTasks(prev => ({ ...prev, [key]: false }));
    }, 3000);
  };

  // 3. IN-DEPTH GOAL ADVISORY ENGINE
  const goalPredictions = goals.map(goal => {
    const remainingNeeded = Math.max(0, goal.targetAmount - goal.currentAmount);
    const isAchieved = goal.currentAmount >= goal.targetAmount;
    const completionPct = goal.targetAmount > 0
      ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
      : 100;

    // Accurate Days to Deadline: targetDate - todayStr
    const daysRemaining = goal.deadline ? getISTDateDiffDays(goal.deadline, todayStr) : 30;
    const isOverdue = daysRemaining < 0;
    const isDueToday = daysRemaining === 0;
    const activeDaysRunway = Math.max(1, daysRemaining);

    // Required Run-Rate
    const requiredDailyPace = remainingNeeded / activeDaysRunway;
    const requiredWeeklyPace = requiredDailyPace * 7;

    // Task Intelligence: Linked tasks & backlog
    const linkedTasks = tasks.filter(t => {
      if (!t) return false;
      if (t.linkedGoalTitle && t.linkedGoalTitle.trim().toLowerCase() === goal.title.trim().toLowerCase()) return true;
      if (t.title && goal.title && t.title.toLowerCase().includes(goal.title.toLowerCase())) return true;
      return false;
    });
    const completedLinkedTasks = linkedTasks.filter(t => t.completed);
    const pendingLinkedTasks = linkedTasks.filter(t => !t.completed);
    const overdueLinkedTasks = pendingLinkedTasks.filter(t => t.dueDate && t.dueDate < todayStr);
    const nextPendingTask = pendingLinkedTasks[0];

    // Sub-Goal Intelligence: Milestones checklist
    const subGoals = Array.isArray(goal.subGoals)
      ? goal.subGoals
      : Array.isArray(goal.sub_goals)
      ? goal.sub_goals
      : [];
    const completedSubGoals = subGoals.filter(sg => sg.completed);
    const pendingSubGoals = subGoals.filter(sg => !sg.completed);
    const nextPendingSubGoal = pendingSubGoals[0];

    // Feasibility Status & Color
    let status = 'On Track';
    let statusColor = 'emerald';

    if (isAchieved) {
      status = 'Achieved 🎉';
      statusColor = 'emerald';
    } else if (isOverdue) {
      status = `Overdue by ${Math.abs(daysRemaining)}d ⏰`;
      statusColor = 'rose';
    } else if (daysRemaining <= 14 && completionPct < 50) {
      status = 'At Risk ⚠️';
      statusColor = 'rose';
    } else if (goal.category === 'Financial') {
      const estimatedMonthlySavings = Math.max(0, totalIncome - totalSpent);
      const estimatedDailyPace = estimatedMonthlySavings / 30;
      if (estimatedDailyPace < requiredDailyPace && completionPct < 85) {
        status = 'Requires Acceleration';
        statusColor = 'amber';
      }
    } else if (completionPct < 40 && daysRemaining < 45) {
      status = 'Requires Acceleration';
      statusColor = 'amber';
    }

    // Determine effective unit and whether this goal tracks currency
    const rawUnit = (goal.unit || '').trim();
    const isFinancialCategory = (goal.category || '').toLowerCase() === 'financial';
    const isExplicitCurrencyUnit = isCurrencyUnit(rawUnit);
    // If unit is '₹' on a non-financial goal, it was an unwanted default
    const isUnwantedRupeeDefault = !isFinancialCategory && (rawUnit === '₹' || rawUnit.toLowerCase() === 'inr' || rawUnit.toLowerCase() === 'rs');
    const isCurrencyGoal = isFinancialCategory && (isExplicitCurrencyUnit || !rawUnit);

    let displayUnit = rawUnit;
    if (isCurrencyGoal) {
      displayUnit = isExplicitCurrencyUnit ? rawUnit : currency;
    } else if (!rawUnit || isUnwantedRupeeDefault) {
      displayUnit = '%';
    }

    // Velocity & Runway Diagnostics String
    let velocityText = '';
    const unitSymbolPrefix = isCurrencyGoal ? displayUnit : '';
    const unitSymbolSuffix = isCurrencyGoal ? '' : ` ${displayUnit}`;

    if (isAchieved) {
      velocityText = `Target reached! ${unitSymbolPrefix}${goal.currentAmount.toLocaleString()}${unitSymbolSuffix} / ${unitSymbolPrefix}${goal.targetAmount.toLocaleString()}${unitSymbolSuffix} completed (100%).`;
    } else if (isOverdue) {
      velocityText = `Deadline passed ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} ago (${goal.deadline || 'Overdue'}). Gap: ${unitSymbolPrefix}${remainingNeeded.toLocaleString()}${unitSymbolSuffix}. Immediate scope triage needed.`;
    } else if (isDueToday) {
      velocityText = `Deadline is TODAY! Remaining gap: ${unitSymbolPrefix}${remainingNeeded.toLocaleString()}${unitSymbolSuffix}. Final push required.`;
    } else {
      const paceStr = isCurrencyGoal
        ? `${displayUnit}${Math.round(requiredDailyPace).toLocaleString()}/day (${displayUnit}${Math.round(requiredWeeklyPace).toLocaleString()}/wk)`
        : `~${requiredDailyPace.toFixed(1)}${unitSymbolSuffix}/day (~${Math.round(requiredWeeklyPace)}${unitSymbolSuffix}/wk)`;

      velocityText = `Remaining: ${unitSymbolPrefix}${remainingNeeded.toLocaleString()}${unitSymbolSuffix} across ${daysRemaining} days runway (${goal.deadline || 'Scheduled'}). Required pace: ${paceStr}.`;
    }

    // 4. PRESCRIBED ACTION STEPS (PRACTICAL & PERSONALIZED)
    const suggestions = [];

    // STEP 1: Task / Milestone Action (understands next sub-goal or pending task)
    if (isAchieved) {
      suggestions.push(`Review milestones and archive or set a new follow-up stretch target for '${goal.title}'`);
    } else if (nextPendingSubGoal) {
      const dateNotice = nextPendingSubGoal.targetDate ? ` before ${nextPendingSubGoal.targetDate}` : '';
      suggestions.push(`Execute next milestone: "${nextPendingSubGoal.title}"${dateNotice}`);
    } else if (overdueLinkedTasks.length > 0) {
      suggestions.push(`Clear overdue task: "${overdueLinkedTasks[0].title}" to unblock goal velocity`);
    } else if (nextPendingTask) {
      suggestions.push(`Complete scheduled task: "${nextPendingTask.title}" (Priority: ${nextPendingTask.priority || 'high'})`);
    } else {
      if (isCurrencyGoal) {
        suggestions.push(`Set up weekly transfer of ${displayUnit}${Math.round(Math.max(500, requiredWeeklyPace)).toLocaleString()} toward '${goal.title}'`);
      } else if (goal.category === 'Financial') {
        suggestions.push(`Advance key milestones to gain ~${Math.max(1, Math.round(requiredWeeklyPace))}${unitSymbolSuffix}/week toward '${goal.title}'`);
      } else if (goal.category === 'Health' || goal.category === 'Fitness') {
        suggestions.push(`Schedule 3 targeted training sessions in calendar for '${goal.title}' this week`);
      } else if (goal.category === 'Skill') {
        suggestions.push(`Break '${goal.title}' into next 3 concrete study modules and log 1st session`);
      } else {
        suggestions.push(`Define next actionable milestone sub-goal for '${goal.title}' and start 25-min sprint`);
      }
    }

    // STEP 2: Rate & Cadence Calibration (understands how much done, remaining, and exact run-rate)
    if (isAchieved) {
      suggestions.push(`Document key lessons learned and compound this win into your next personal milestone`);
    } else if (isOverdue) {
      suggestions.push(`Extend deadline by ${Math.max(14, Math.round(remainingNeeded / Math.max(1, requiredDailyPace)))} days or re-scope target to match realistic pace`);
    } else if (isCurrencyGoal) {
      const weeklyAllocation = Math.round(requiredWeeklyPace);
      suggestions.push(`Allocate ${displayUnit}${weeklyAllocation.toLocaleString()}/week to reach ${displayUnit}${Number(goal.targetAmount).toLocaleString()} on schedule`);
    } else if (goal.category === 'Health' || goal.category === 'Fitness') {
      const isKm = (displayUnit || '').toLowerCase().includes('km');
      const sessionsPerWeek = Math.max(2, Math.min(6, Math.ceil(requiredWeeklyPace / (isKm ? 5 : 1))));
      suggestions.push(`Maintain ~${sessionsPerWeek} active sessions per week to hit ${goal.targetAmount}${unitSymbolSuffix} by ${goal.deadline || 'deadline'}`);
    } else if (goal.category === 'Skill') {
      const hoursOrModulesWeekly = Math.max(1, Math.round(requiredWeeklyPace));
      suggestions.push(`Dedicate ${hoursOrModulesWeekly} ${displayUnit || 'modules'}/week (~45 min daily focus) to finish by ${goal.deadline || 'deadline'}`);
    } else {
      suggestions.push(`Pace at ~${Math.max(1, Math.round(requiredWeeklyPace))}${unitSymbolSuffix}/week across remaining ${daysRemaining} days`);
    }

    // STEP 3: Personality-Anchored Practical Strategy (understands user's previous data & operating archetype)
    if (userProfile.name === 'The Systematic Compounder') {
      suggestions.push(`[Strategy: Compounder] Anchor '${goal.title}' to your highest streak daily habit for effortless consistency`);
    } else if (userProfile.name === 'The Kinetic Sprinter') {
      suggestions.push(`[Strategy: Focus] Tackle the highest-impact sub-goal or task for '${goal.title}' during your peak daily energy window`);
    } else if (userProfile.name === 'The Focused Architect') {
      suggestions.push(`[Strategy: Architect] Schedule a 60-min deep work block on calendar; turn off notifications to clear next milestone`);
    } else if (userProfile.name === 'The High-Velocity Pivotter') {
      suggestions.push(`[Strategy: Pivotter] Apply Rule of 1: pause non-essential side tasks until next sub-goal for '${goal.title}' is done`);
    } else {
      suggestions.push(`[Strategy: Momentum] Use 5-Minute Entry Rule: complete 1 small micro-action today to build momentum`);
    }

    return {
      ...goal,
      unit: displayUnit,
      daysRemaining,
      remainingNeeded,
      requiredDailyPace,
      completionPct,
      status,
      statusColor,
      velocityText,
      subGoalsCount: subGoals.length,
      completedSubGoalsCount: completedSubGoals.length,
      linkedTasksCount: linkedTasks.length,
      completedLinkedTasksCount: completedLinkedTasks.length,
      suggestions
    };
  });

  return (
    <div className="glass-panel-dark rounded-2xl p-5 border border-indigo-500/30 space-y-4 shadow-xl">
      
      {/* 🌟 1. HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm">
            <Brain className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Goal Advisory Engine</span>
            </h3>
          </div>
        </div>
      </div>

      {/* 📊 2. PREDICTIONS & PRESCRIBED ADVISORY CARDS */}
      {!quotaStatus?.isPremium ? (
        <div className="relative rounded-2xl p-6 sm:p-8 border border-indigo-500/30 bg-gradient-to-b from-indigo-500/10 via-slate-900/60 to-slate-950 text-center space-y-4 my-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <span>Predictive Feasibility Radar</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                👑 Pro Feature
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Unlock AI-driven goal outcome forecasting, milestone velocity diagnostics, automated risk alerts, and personalized behavioral action plans.
            </p>
          </div>
          <button
            onClick={openPricingModal}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition cursor-pointer"
          >
            Unlock Predictive Goal Intelligence
          </button>
        </div>
      ) : goalPredictions.length === 0 ? (
        <p className="text-xs text-slate-500 italic text-center p-6">No goals defined yet to run predictive analysis.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {goalPredictions.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Header: Title, Category, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{item.title}</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Category: {item.category} • {item.horizon === 'short' ? '⚡ Short-Term' : '🏔️ Long-Term'}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      item.statusColor === 'emerald'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : item.statusColor === 'amber'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Milestone & Task Progress Indicators */}
                <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {item.subGoalsCount > 0 && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800/80">
                      <Target className="w-3 h-3 text-indigo-500" />
                      <span>{item.completedSubGoalsCount}/{item.subGoalsCount} milestones</span>
                    </span>
                  )}
                  {item.linkedTasksCount > 0 && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800/80">
                      <ListTodo className="w-3 h-3 text-cyan-500" />
                      <span>{item.completedLinkedTasksCount}/{item.linkedTasksCount} tasks</span>
                    </span>
                  )}
                  <span className="ml-auto font-bold text-slate-700 dark:text-slate-300">
                    {item.completionPct}% Done
                  </span>
                </div>

                {/* Velocity & Runway diagnostics box */}
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                  <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-0.5">
                    <Clock className="w-3 h-3 text-indigo-500" />
                    <span>Runway & Velocity:</span>
                  </div>
                  <p className="text-[11px] text-slate-900 dark:text-slate-200 font-medium">
                    {item.velocityText}
                  </p>
                </div>
              </div>

              {/* 💡 3. PRESCRIBED ACTION STEPS WITH 1-CLICK ADD TO TASKS */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px]">
                <span className="font-bold text-indigo-600 dark:text-cyan-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>Prescribed Action Steps:</span>
                </span>
                
                <div className="space-y-1.5">
                  {item.suggestions.map((sug, idx) => {
                    const taskKey = `${item.id}-${sug}`;
                    const isAdded = Boolean(addedTasks[taskKey]);

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-950/80 hover:bg-indigo-50/50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition text-xs gap-2"
                      >
                        <div className="flex items-start space-x-1.5 flex-1">
                          <span className="text-indigo-500 font-bold shrink-0 mt-0.5">•</span>
                          <span className="text-slate-700 dark:text-slate-300 text-[11px] font-medium leading-tight">
                            {sug}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddTask(sug, item)}
                          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition shrink-0 cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-indigo-600/10 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-300 border border-indigo-500/20'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Added!</span>
                            </>
                          ) : (
                            <span>+ Add to Tasks</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
