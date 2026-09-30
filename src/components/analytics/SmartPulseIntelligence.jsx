import React, { useMemo } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { calculateCrossDomainCorrelations } from '../../utils/correlationUtils';
import {
  Sparkles,
  Zap,
  Flame,
  Wallet,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Target,
  ArrowRight,
  ShieldCheck,
  Brain,
  Compass,
  BookOpen,
  Layers,
  Link2
} from 'lucide-react';

export const SmartPulseIntelligence = ({
  timeframe = 'month',
  selectedDate,
  activeWeekBadge,
  selectedMonthName,
  selectedYear,
  // Financials
  periodIncome = 0,
  periodLivingExpenses = 0,
  periodGrossExpenses = 0,
  periodInvested = 0,
  leftoverSurplus = 0,
  actualDailyRate = 0,
  safeDailyRate = 0,
  budgetBufferRemaining = 0,
  budgetVariancePct = 0,
  topCategory = 'Living Expenses',
  topCategoryAmount = 0,
  topCategoryPct = 0,
  // Habits
  habitScore = 0,
  habitRating = 'Consistent',
  lowestHabit,
  lowestHabitCount = 0,
  lowestHabitPossibleDays = 1,
  habits = [],
  isHabitDoneOn = () => false,
  // Activity
  totalRunningKm = 0,
  totalGymSessions = 0,
  totalVolumeLiftedKg = 0,
  totalPagesRead = 0,
  totalActiveOutputMins = 0,
  scopedActivities = [],
  // Tasks & Goals
  scopedTasks = [],
  tasksCompletionRate = 0,
  highPriorityTasks = [],
  highPriorityCompleted = 0,
  goalsOnTrackCount = 0,
  goalsNeedsFocusCount = 0,
  goalsAtRiskCount = 0,
  // Journal
  journalEntries = [],
  currency = '₹'
}) => {
  const dashboard = useDashboard() || {};
  const { quotaStatus, openPricingModal, recordAiAnalyticsRun } = dashboard;
  const allActivities = dashboard.activities || scopedActivities || [];
  const allTasks = dashboard.tasks || scopedTasks || [];
  const allTransactions = dashboard.transactions || [];

  const correlationData = useMemo(() => {
    return calculateCrossDomainCorrelations({
      habits,
      tasks: allTasks,
      activities: allActivities,
      transactions: allTransactions,
      journalEntries,
      lookbackDays: timeframe === 'day' ? 7 : timeframe === 'week' ? 14 : 30
    });
  }, [habits, allTasks, allActivities, allTransactions, journalEntries, timeframe]);

  // 1. Dynamic Active Timeframe Title Label
  const timeframeLabel =
    timeframe === 'day'
      ? `Selected Day (${selectedDate})`
      : timeframe === 'week'
      ? `Week (${activeWeekBadge})`
      : `${selectedMonthName} ${selectedYear}`;

  // Dynamic "Where Lagging" (Friction Points)
  const frictionPoints = [];

  // Finance friction
  if (safeDailyRate > 0 && actualDailyRate > safeDailyRate) {
    frictionPoints.push({
      pillar: 'Cashflow Burn',
      icon: Wallet,
      severity: 'high',
      title: `Living Burn Rate Exceeds Safe Ceiling`,
      detail: `Current burn is ${currency}${Number(actualDailyRate || 0).toLocaleString()}/day vs. max safe pace of ${currency}${Math.round(Number(safeDailyRate || 0)).toLocaleString()}/day (+${Number(budgetVariancePct || 0)}% excess). ${topCategory || 'Expenses'} drives ${Number(topCategoryPct || 0)}% of outlay.`
    });
  }

  // Habits friction
  const lowestHabitPct = lowestHabitPossibleDays > 0 ? (lowestHabitCount / lowestHabitPossibleDays) : 1;
  if (lowestHabit && lowestHabitPct < 0.6) {
    frictionPoints.push({
      pillar: 'Habit Adherence',
      icon: Flame,
      severity: 'medium',
      title: `'${lowestHabit.name}' is Lagging Behind Target`,
      detail: `${lowestHabitCount} of ${lowestHabitPossibleDays} check-in${lowestHabitPossibleDays === 1 ? '' : 's'} (${Math.round(lowestHabitPct * 100)}%) logged in this horizon. Habits slipping below 60% adherence require immediate anchor pairing.`
    });
  }

  // Tasks friction
  const pendingHighPriority = highPriorityTasks.length - highPriorityCompleted;
  if (pendingHighPriority > 0) {
    frictionPoints.push({
      pillar: 'Execution Velocity',
      icon: Target,
      severity: 'medium',
      title: `${pendingHighPriority} High-Priority Task${pendingHighPriority === 1 ? '' : 's'} Incomplete`,
      detail: `Urgent priority tasks remaining unexecuted can compress future deadlines. Focus your next 90-minute block strictly on high-priority items.`
    });
  }

  // Activity friction
  if (totalActiveOutputMins === 0 && (timeframe === 'week' || timeframe === 'month')) {
    frictionPoints.push({
      pillar: 'Physical Vitality',
      icon: Activity,
      severity: 'low',
      title: 'Zero Physical Training Sessions Logged',
      detail: 'No workouts, runs, or active recovery logged in this window. A 20-minute movement routine dramatically elevates cognitive stamina.'
    });
  }

  // 5. Dynamic "What Can Improve" (Concrete Actionable Upgrades)
  const improvements = [];

  if (topCategoryAmount > 0) {
    improvements.push({
      pillar: 'Financial Optimization',
      icon: Wallet,
      action: `Cap discretionary ${(topCategory || 'Expenses').toLowerCase()} to preserve your ${currency}${Math.max(0, Number(budgetBufferRemaining) || 0).toLocaleString()} buffer.`,
      impact: `Reduces weekly living friction and increases leftover surplus cash for wealth investments.`
    });
  }

  if (lowestHabit && lowestHabitPct < 1) {
    improvements.push({
      pillar: 'Habit Anchoring',
      icon: Flame,
      action: `Anchor '${lowestHabit.name}' immediately following your morning coffee or planning session before 10 AM.`,
      impact: `Habit stacking doubles 30-day consistency by piggybacking on an already established behavioral neural pathway.`
    });
  } else if (habits.length > 0) {
    improvements.push({
      pillar: 'Habit Momentum',
      icon: Flame,
      action: `Maintain unbroken streaks across your active daily routines.`,
      impact: `Compound consistency transforms intentional discipline into effortless baseline behavior.`
    });
  }

  improvements.push({
    pillar: 'Cross-Pillar Synergy',
    icon: Zap,
    action: `Complete a 30-minute workout or brisk run early in the day prior to tackling high-priority tasks.`,
    impact: `Aerobic and strength output elevates dopamine and prefrontal cortex oxygenation, driving +32% higher task completion.`
  });

  return (
    <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
      
      {/* 🌟 1. HEADER */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm">
            <Brain className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Smart Pulse Intelligence
          </h3>
        </div>
      </div>

      {/* Non-Intrusive Free Quota Upgrade Prompt if AI Quota reached */}
      {quotaStatus && quotaStatus.aiRuns?.isLimitReached && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-amber-500/10 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>You've used your 3 free AI Intelligence deep-dives this month</span>
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Quota resets on the 1st of next month. Upgrade anytime for unlimited live cross-domain behavioral correlations and predictive analysis.
            </p>
          </div>
          <button
            onClick={() => openPricingModal?.()}
            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
          >
            Unlock Unlimited
          </button>
        </div>
      )}


      {/* 🔗 2. CROSS-DOMAIN CORRELATION ENGINE (Live Behavioral Linkages) */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/5 via-cyan-500/5 to-purple-500/5 dark:from-indigo-950/30 dark:via-cyan-950/20 dark:to-purple-950/30 border border-indigo-200/70 dark:border-indigo-500/20 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 dark:border-indigo-900/50 pb-2.5">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Link2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                Cross-Domain Correlation Engine
              </span>
            </div>
          </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
            Synergy Index: {correlationData?.synergyIndex ?? 70}/100
          </span>
        </div>
      </div>

      {!quotaStatus?.isPremium ? (
        <div className="p-6 rounded-xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/10 via-slate-900/50 to-slate-950 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 mx-auto flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
              <span>Multi-Pillar Synergy Engine</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                👑 Pro Feature
              </span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Unlock live cross-pillar behavioral correlations between your physical energy, task throughput, and financial pacing.
            </p>
          </div>
          <button
            onClick={() => openPricingModal?.()}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            Unlock Live Behavioral Correlations
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(correlationData?.insights || []).map((insight) => (
            <div
              key={insight.id}
              className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2 text-xs backdrop-blur-sm shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                  {insight.badge}
                </span>
                <span className="text-[11px] font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  {insight.stat}
                </span>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">{insight.title}</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">{insight.detail}</p>
              </div>
              <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <p className="text-[10px] text-indigo-700 dark:text-cyan-300 font-medium">
                  💡 {insight.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* ⚠️ 3. WHERE LAGGING vs 💡 WHAT CAN IMPROVE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Left: Where Lagging (Friction Points) */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Where Lagging</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              {frictionPoints.length} Identified
            </span>
          </div>

          <div className="space-y-2.5">
            {frictionPoints.length === 0 ? (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero friction detected! All operating systems running smoothly in the green zone.</span>
              </div>
            ) : (
              frictionPoints.map((item, idx) => {
                const IconC = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <IconC className="w-3 h-3 text-amber-500" />
                        <span>{item.title}</span>
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 uppercase font-mono">
                        {item.pillar}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                      {item.detail}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: What Can Improve (Tactical Suggestions) */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              <span>What Can Improve</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              High Leverage
            </span>
          </div>

          <div className="space-y-2.5">
            {improvements.map((item, idx) => {
              const IconC = item.icon;
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <IconC className="w-3 h-3" />
                      <span>{item.pillar}</span>
                    </span>
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-xs leading-snug">
                    {item.action}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                    Impact: {item.impact}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
