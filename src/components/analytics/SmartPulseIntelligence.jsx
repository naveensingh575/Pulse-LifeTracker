import React from 'react';
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
  BookOpen
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
  // 1. Dynamic Active Timeframe Title Label
  const timeframeLabel =
    timeframe === 'day'
      ? `Selected Day (${selectedDate})`
      : timeframe === 'week'
      ? `Week (${activeWeekBadge})`
      : `${selectedMonthName} ${selectedYear}`;

  // 2. Compute 4-Pillar Balance Scores (0–100)
  // A. Physical Vitality
  let physicalScore = 0;
  if (timeframe === 'day') {
    physicalScore = totalActiveOutputMins >= 45 ? 100 : totalActiveOutputMins >= 30 ? 75 : totalActiveOutputMins > 0 ? 45 : 15;
  } else if (timeframe === 'week') {
    physicalScore = Math.min(100, Math.round((totalActiveOutputMins / 180) * 100)) || (scopedActivities.length > 0 ? 50 : 15);
  } else {
    physicalScore = Math.min(100, Math.round((totalActiveOutputMins / 700) * 100)) || (scopedActivities.length > 0 ? 50 : 15);
  }

  // B. Execution Velocity
  const executionScore = scopedTasks.length > 0
    ? tasksCompletionRate
    : 70; // baseline if no pending tasks

  // C. Financial Prudence
  let financialScore = 80;
  if (safeDailyRate > 0) {
    if (actualDailyRate <= safeDailyRate) {
      financialScore = Math.min(100, 85 + Math.round((budgetBufferRemaining / (safeDailyRate * 10 || 1)) * 15));
    } else {
      financialScore = Math.max(20, 80 - Math.min(60, budgetVariancePct));
    }
  }

  // D. Habit Discipline
  const disciplineScore = habits.length > 0 ? habitScore : 70;

  // 3. Dynamic Personality Archetype Map ("Operating Archetype")
  const getOperatingArchetype = () => {
    if (physicalScore >= 65 && executionScore >= 65 && financialScore >= 65 && disciplineScore >= 65) {
      return {
        title: 'The Sovereign High-Performer',
        icon: '👑',
        badge: 'Peak Equilibrium',
        color: 'indigo',
        desc: 'You maintain exceptional multi-pillar balance across physical vitality, sharp task execution, strict budget pace, and daily habit rhythm.',
        growthDirective: 'Guard against over-optimization fatigue. Schedule deliberate unstructured recovery intervals to sustain long-term compound momentum.'
      };
    }

    if (physicalScore >= 70 && executionScore >= 70) {
      return {
        title: 'The Kinetic Executor',
        icon: '⚡',
        badge: 'High Action & Output',
        color: 'cyan',
        desc: 'High physical stamina directly fuels your rapid task turnaround. You thrive on momentum and physical energy expenditure.',
        growthDirective: 'Pair your morning training sessions directly with your top 3 needle-moving tasks before checking incoming messages.'
      };
    }

    if (disciplineScore >= 75 && financialScore >= 75) {
      return {
        title: 'The Disciplined Compounder',
        icon: '🛡️',
        badge: 'Unshakable Habits & Capital',
        color: 'emerald',
        desc: 'You excel in daily routine consistency, low impulse friction, and steady financial cashflow preservation.',
        growthDirective: 'Channel your strong financial surplus into automated wealth investments and higher-leverage strategic goals.'
      };
    }

    if (executionScore >= 75 && disciplineScore >= 65) {
      return {
        title: 'The Focused Architect',
        icon: '🏗️',
        badge: 'Systematic Execution',
        color: 'purple',
        desc: 'You operate with strong system clarity, clearing action boards and methodically driving milestone sub-goals forward.',
        growthDirective: 'Ensure you maintain consistent physical cardio and sleep routines to prevent cognitive burnout during heavy sprint cycles.'
      };
    }

    if (totalPagesRead >= 30 || journalEntries.length >= 3) {
      return {
        title: 'The Mindful Scholar',
        icon: '📖',
        badge: 'Deep Cognitive Focus',
        color: 'amber',
        desc: 'Strong commitment to cognitive enrichment, reading sessions, and deliberate mindset reflections.',
        growthDirective: 'Translate your rich daily learning notes into concrete weekly action tasks to maximize practical execution.'
      };
    }

    if (financialScore < 50 && executionScore >= 60) {
      return {
        title: 'The High-Burn Sprinter',
        icon: '🚀',
        badge: 'Action-Heavy / Pacing Alert',
        color: 'rose',
        desc: 'High operational drive and output, but living expenses and discretionary burn rate are outpacing your safe ceiling.',
        growthDirective: `Enforce a strict 48-hour cooling-off rule on ${topCategory || 'Living Expenses'} and non-essential shopping to stabilize your runway.`
      };
    }

    return {
      title: 'The Emerging Builder',
      icon: '🌱',
      badge: 'Building Keystone Rhythms',
      color: 'emerald',
      desc: 'You are establishing baseline rhythm across your personal dashboard. Early consistency will quickly compound into high momentum.',
      growthDirective: 'Focus on 1 keystone habit and 2 daily priority tasks. Win small victories daily to establish effortless behavioral momentum.'
    };
  };

  const archetype = getOperatingArchetype();

  // 4. Dynamic "Where Lagging" (Friction Points)
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
  if (lowestHabit && lowestHabitCount < (timeframe === 'week' ? 4 : timeframe === 'day' ? 1 : 14)) {
    frictionPoints.push({
      pillar: 'Habit Adherence',
      icon: Flame,
      severity: 'medium',
      title: `'${lowestHabit.name}' is Lagging Behind Target`,
      detail: `Only ${lowestHabitCount} check-in${lowestHabitCount === 1 ? '' : 's'} logged in this horizon. Habits slipping below 50% adherence require immediate anchor pairing.`
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

  if (lowestHabit) {
    improvements.push({
      pillar: 'Habit Anchoring',
      icon: Flame,
      action: `Anchor '${lowestHabit.name}' immediately following your morning coffee or planning session before 10 AM.`,
      impact: `Habit stacking doubles 30-day consistency by piggybacking on an already established behavioral neural pathway.`
    });
  }

  improvements.push({
    pillar: 'Cross-Pillar Synergy',
    icon: Zap,
    action: `Complete a 30-minute workout or brisk run early in the day prior to tackling high-priority tasks.`,
    impact: `Aerobic and strength output elevates dopamine and prefrontal cortex oxygenation, driving +32% higher task completion.`
  });

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/20 via-slate-900/60 to-purple-950/20 border border-indigo-500/20 shadow-md space-y-5">
      
      {/* 🌟 1. HEADER: Synced with Page Timeframe */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-sm">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Smart Pulse Intelligence
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold">
                {timeframeLabel}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Pattern synthesis, friction diagnostics & operating personality map across all your logged data
            </p>
          </div>
        </div>
      </div>

      {/* 🎭 2. PERSONALITY MAP & OPERATING ARCHETYPE */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {archetype.icon}
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Operating Archetype</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {archetype.badge}
                </span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                {archetype.title}
              </h4>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md leading-relaxed">
            {archetype.desc}
          </p>
        </div>

        {/* 4-Pillar Balance Radar Metrics */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Multi-Pillar Balance Radar ({timeframeLabel})
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1. Physical */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Activity className="w-3 h-3 text-cyan-500" /> Vitality
                </span>
                <span className="font-bold font-mono text-cyan-600 dark:text-cyan-400">{physicalScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${physicalScore}%` }} />
              </div>
            </div>

            {/* 2. Execution */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3 text-indigo-500" /> Execution
                </span>
                <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">{executionScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${executionScore}%` }} />
              </div>
            </div>

            {/* 3. Financial */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-emerald-500" /> Prudence
                </span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{financialScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${financialScore}%` }} />
              </div>
            </div>

            {/* 4. Habits */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500" /> Discipline
                </span>
                <span className="font-bold font-mono text-amber-600 dark:text-amber-400">{disciplineScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${disciplineScore}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Growth Directive */}
        <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-500/20 text-xs flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-slate-700 dark:text-slate-300 leading-snug">
            <strong className="text-indigo-600 dark:text-indigo-400">Archetype Growth Directive:</strong> {archetype.growthDirective}
          </p>
        </div>
      </div>

      {/* ⚠️ 3. WHERE LAGGING vs 💡 WHAT CAN IMPROVE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Left: Where Lagging (Friction Points) */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Where Lagging (Friction Points)</span>
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
              <span>What Can Improve (Tactical Upgrades)</span>
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
