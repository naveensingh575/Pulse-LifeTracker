/**
 * Cross-Pillar Correlation Engine for Pulse Life Tracker
 * Uncovers empirical cause-and-effect relationships across Habits, Physical Output,
 * Financial Spending, and Task Execution.
 */

export const generateSmartCorrelations = ({
  activities = [],
  tasks = [],
  habits = [],
  transactions = [],
  isHabitDoneOn = () => false,
  currency = '₹'
}) => {
  const insights = [];

  // 1. Physical Activity vs Task Completion
  const activityDates = new Set((activities || []).map(a => a.date).filter(Boolean));
  const tasksWithDate = (tasks || []).filter(t => t.due_date || t.dueDate || t.created_at);

  let activeDayTasks = 0;
  let activeDayCompleted = 0;
  let restDayTasks = 0;
  let restDayCompleted = 0;

  tasksWithDate.forEach(t => {
    const d = (t.due_date || t.dueDate || t.created_at || '').split('T')[0];
    if (activityDates.has(d)) {
      activeDayTasks++;
      if (t.completed) activeDayCompleted++;
    } else {
      restDayTasks++;
      if (t.completed) restDayCompleted++;
    }
  });

  const activeRate = activeDayTasks > 0 ? Math.round((activeDayCompleted / activeDayTasks) * 100) : 0;
  const restRate = restDayTasks > 0 ? Math.round((restDayCompleted / restDayTasks) * 100) : 0;

  if (activeDayTasks >= 3 && activeRate > restRate) {
    const diff = activeRate - restRate;
    insights.push({
      id: 'activity_task',
      type: 'positive',
      pillar: 'Physical Output ⚡ Productivity',
      headline: `+${diff}% Higher Task Velocity on Active Days`,
      detail: `On days you log workouts or cardio sessions, your task execution rate reaches ${activeRate}% (vs. ${restRate}% on rest days). Physical momentum directly primes your focus.`,
      tag: 'Empirical Correlation',
      icon: 'Zap',
      color: 'indigo'
    });
  } else {
    insights.push({
      id: 'activity_task_baseline',
      type: 'nudge',
      pillar: 'Physical Output ⚡ Focus',
      headline: 'Cardio & Strength as Cognitive Anchors',
      detail: 'Scheduling physical training early in the day elevates dopamine and executive function, creating a natural tailwind to complete your top 3 daily priorities.',
      tag: 'Strategic Nudge',
      icon: 'Activity',
      color: 'cyan'
    });
  }

  // 2. Keystone Habit Analysis
  if (habits && habits.length > 0) {
    let topHabit = habits[0];
    let maxStreak = -1;
    habits.forEach(h => {
      const s = Number(h.streak || 0);
      if (s > maxStreak) {
        maxStreak = s;
        topHabit = h;
      }
    });

    if (maxStreak >= 3) {
      insights.push({
        id: 'keystone_habit',
        type: 'positive',
        pillar: 'Habits ⚡ Momentum',
        headline: `'${topHabit.name}' is Your Keystone Discipline Anchor`,
        detail: `With an active ${maxStreak}-day streak, '${topHabit.name}' serves as your behavioral anchor. Protecting this streak creates effortless compound discipline across all other routines.`,
        tag: 'Keystone Habit',
        icon: 'Flame',
        color: 'amber'
      });
    } else {
      insights.push({
        id: 'habit_rhythm',
        type: 'nudge',
        pillar: 'Habits ⚡ System',
        headline: 'Habit Stacking & Morning Routines',
        detail: `Stacking your primary habit immediately after waking or during your morning planning session doubles 30-day adherence consistency.`,
        tag: 'System Design',
        icon: 'Flame',
        color: 'amber'
      });
    }
  }

  // 3. Financial Inflow vs Safe Discretionary Pace
  const expenseTransactions = (transactions || []).filter(t => t.type === 'expense');
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  if (expenseTransactions.length >= 5) {
    // Find top discretionary spend category
    const catMap = {};
    expenseTransactions.forEach(t => {
      const c = t.category || 'Other';
      catMap[c] = (catMap[c] || 0) + (Number(t.amount) || 0);
    });

    let topCat = 'Expenses';
    let topCatAmt = 0;
    Object.keys(catMap).forEach(cat => {
      if (catMap[cat] > topCatAmt) {
        topCatAmt = catMap[cat];
        topCat = cat;
      }
    });

    const pct = totalExpense > 0 ? Math.round((topCatAmt / totalExpense) * 100) : 0;
    insights.push({
      id: 'finance_velocity',
      type: 'insight',
      pillar: 'Cashflow ⚡ Habit Control',
      headline: `${topCat} Drives ${pct}% of Discretionary Outflow`,
      detail: `${topCat} represents ${currency}${Number(topCatAmt).toLocaleString()} of total logged expenses. Capping weekend discretionary outlays keeps your monthly net surplus cash maximized.`,
      tag: 'Budget Optimization',
      icon: 'Wallet',
      color: 'emerald'
    });
  } else {
    insights.push({
      id: 'finance_velocity_baseline',
      type: 'nudge',
      pillar: 'Cashflow ⚡ Wealth Building',
      headline: 'Income-First Allocation Philosophy',
      detail: 'Logging transactions promptly maintains real-time living budget health and prevents unallocated surplus leakages before month-end.',
      tag: 'Wealth Principle',
      icon: 'Wallet',
      color: 'emerald'
    });
  }

  return insights;
};
