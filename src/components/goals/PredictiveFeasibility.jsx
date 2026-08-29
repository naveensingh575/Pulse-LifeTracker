import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  Sparkles,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  Check,
  Target,
  Zap
} from 'lucide-react';
import { getISTDate, getISTDateString, getISTDateDiffDays } from '../../utils/dateUtils';

export const PredictiveFeasibility = () => {
  const { goals, addTask, totalIncome, totalSpent } = useDashboard();
  const [addedTasks, setAddedTasks] = useState({});

  const todayStr = getISTDateString();
  const today = getISTDate();

  const handleAddTask = (actionText, goal) => {
    addTask({
      title: actionText,
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

  // Algorithmic Run-Rate & Prescribed Advisory Engine
  const goalPredictions = goals.map(goal => {
    const remainingNeeded = Math.max(0, goal.targetAmount - goal.currentAmount);
    const targetDate = new Date(goal.deadline);
    const daysToDeadline = Math.max(1, getISTDateDiffDays(todayStr, goal.deadline));
    const completionPct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

    // Required daily pace to hit target on time
    const requiredDailyPace = remainingNeeded / daysToDeadline;

    // 1. FINANCIAL GOAL PREDICTOR
    if (goal.category === 'Financial') {
      const estimatedMonthlySavings = Math.max(5000, totalIncome - totalSpent);
      const estimatedDailyPace = estimatedMonthlySavings / 30;
      const isAhead = estimatedDailyPace >= requiredDailyPace || completionPct >= 90;
      const isAtRisk = daysToDeadline < 30 && completionPct < 50;

      let status = 'On Track';
      let statusColor = 'emerald';
      if (isAtRisk) {
        status = 'At Risk ⚠️';
        statusColor = 'rose';
      } else if (!isAhead) {
        status = 'Requires Acceleration';
        statusColor = 'amber';
      }

      const suggestions = [
        `Increase weekly SIP allocation by ₹${Math.round(Math.max(1000, requiredDailyPace * 7)).toLocaleString('en-IN')}`,
        'Trim monthly dining out & entertainment budget by 15%',
        'Transfer surplus unallocated salary to liquid savings reserve'
      ];

      return {
        ...goal,
        daysToDeadline,
        remainingNeeded,
        requiredDailyPace,
        status,
        statusColor,
        velocityText: `Target: ₹${Number(goal.targetAmount).toLocaleString('en-IN')} by ${goal.deadline} (${daysToDeadline} days remaining). Required pace: ₹${Math.round(requiredDailyPace).toLocaleString('en-IN')}/day.`,
        suggestions
      };
    }

    // 2. HEALTH & FITNESS GOAL PREDICTOR
    if (goal.category === 'Health') {
      const requiredRunsPerWeek = Math.max(2, Math.ceil((remainingNeeded / Math.max(1, daysToDeadline / 7))));
      const isAhead = completionPct >= 60;
      const isAtRisk = daysToDeadline < 20 && completionPct < 30;

      let status = isAhead ? 'On Track' : 'Requires Acceleration';
      let statusColor = isAhead ? 'emerald' : 'amber';
      if (isAtRisk) {
        status = 'At Risk ⚠️';
        statusColor = 'rose';
      }

      const suggestions = [
        `Schedule ${requiredRunsPerWeek}x training sessions this week (Mon, Wed, Sat)`,
        'Add 15-minute tempo interval training for cardiovascular stamina',
        'Log hydration & active recovery in Daily Journal'
      ];

      return {
        ...goal,
        daysToDeadline,
        remainingNeeded,
        requiredDailyPace,
        status,
        statusColor,
        velocityText: `Remaining: ${remainingNeeded} ${goal.unit} with ${daysToDeadline} days runway. Recommended target frequency: ~${requiredRunsPerWeek} sessions/week.`,
        suggestions
      };
    }

    // 3. SKILL & TECH ARCHITECTURE PREDICTOR
    if (goal.category === 'Skill') {
      const modulesPerWeek = Math.max(1, (remainingNeeded / Math.max(1, daysToDeadline / 7)).toFixed(1));
      const isAhead = completionPct >= 50;

      return {
        ...goal,
        daysToDeadline,
        remainingNeeded,
        requiredDailyPace,
        status: isAhead ? 'On Track' : 'Requires Acceleration',
        statusColor: isAhead ? 'emerald' : 'amber',
        velocityText: `${remainingNeeded} ${goal.unit} remaining across ${daysToDeadline} days. Required pace: ~${modulesPerWeek} modules/week.`,
        suggestions: [
          `Complete ${Math.ceil(modulesPerWeek)} chapters/modules before Sunday`,
          'Dedicate 45-minute morning deep work block to technical practice',
          'Document architectural takeaways in Knowledge Base'
        ]
      };
    }

    // 4. GENERAL / DEFAULT GOAL PREDICTOR
    const isAhead = completionPct >= 50;
    return {
      ...goal,
      daysToDeadline,
      remainingNeeded,
      requiredDailyPace,
      status: isAhead ? 'On Track' : 'Requires Acceleration',
      statusColor: isAhead ? 'emerald' : 'amber',
      velocityText: `${remainingNeeded} ${goal.unit} left to complete before ${goal.deadline} (${daysToDeadline} days).`,
      suggestions: [
        `Execute 1 key milestone sub-goal this week`,
        'Schedule dedicated 30-min planning review in Smart Focus banner'
      ]
    };
  });

  return (
    <div className="glass-panel-dark rounded-2xl p-5 border border-indigo-500/30 space-y-4 shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-4 h-4 animate-pulse text-indigo-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Goal Feasibility & Predictive Advisory Engine</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-mono font-bold border border-indigo-500/20">
                Actionable Tasks Linked
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Runway velocity analysis, required daily pace & 1-click execution steps
            </p>
          </div>
        </div>
      </div>

      {/* Predictions Cards List */}
      {goalPredictions.length === 0 ? (
        <p className="text-xs text-slate-500 italic text-center p-6">No goals defined yet to run predictive analysis.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {goalPredictions.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-indigo-500" />
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

                {/* Velocity & Runway text */}
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

              {/* Prescribed Action Steps Engine with 1-Click Add to Tasks */}
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
                          <span className="text-indigo-500 font-bold">•</span>
                          <span className="text-slate-700 dark:text-slate-300 text-[11px] font-medium leading-tight">
                            {sug}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddTask(sug, item)}
                          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition shrink-0 cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-500 text-white'
                              : 'bg-indigo-600/10 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-300 border border-indigo-500/20'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Added!</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>+ Add to Tasks</span>
                            </>
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
