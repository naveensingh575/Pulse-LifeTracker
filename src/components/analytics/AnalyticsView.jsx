import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import {
  getISTDateString,
  getISTDate,
  getISTWeekDays,
  getISTWeekBadge,
  getISTYearMonth,
  MONTH_NAMES_FULL,
  getISTDateDiffDays,
  formatISTDisplayDate
} from '../../utils/dateUtils';
import {
  calculateFinanceSummary,
  isLivingBudgetExpense,
  isSurplusDeductible,
  isSavingAccountCategory,
  isPreCommitmentsCategory,
  isSentCategory
} from '../../utils/financeUtils';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  Sparkles,
  Activity,
  Flame,
  Wallet,
  Target,
  TrendingUp,
  CheckCircle2,
  Dumbbell,
  BookOpen,
  Award,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  Check,
  Calendar as CalendarIcon,
  Layers,
  Zap,
  TrendingDown,
  Compass,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Gauge,
  Sun,
  CalendarDays,
  CheckSquare,
  ArrowRight
} from 'lucide-react';

const DISCIPLINE_COLORS = {
  Running: '#38bdf8',   // Sky Blue
  Gym: '#f43f5e',       // Rose
  Swimming: '#06b6d4',  // Cyan
  Reading: '#a855f7',   // Purple
  Sports: '#10b981'     // Emerald
};

export const AnalyticsView = () => {
  const dashboard = useDashboard() || {};
  const {
    transactions = [],
    habits = [],
    isHabitDoneOn = () => false,
    getMonthlyAllocation = () => ({ expenseBudget: 0, investmentGoal: 0 }),
    activities = [],
    goals = [],
    tasks = [],
    toggleTaskComplete = () => {},
    theme = 'dark'
  } = dashboard;

  // Unified 3-Header Timeframe Filter: 'day' | 'week' | 'month'
  const [timeframe, setTimeframe] = useState('month');

  // Task Tab Filter: 'all' | 'pending' | 'completed'
  const [taskTabFilter, setTaskTabFilter] = useState('all');

  // Day View Date Selector
  const today = getISTDate();
  const todayStr = getISTDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Week View Slide Offset (0 = current week, -1 = last week, +1 = next week)
  const [weekOffset, setWeekOffset] = useState(0);

  const getWeekRefDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + (weekOffset * 7));
    return d;
  };

  const activeWeekRef = getWeekRefDate();
  const activeWeekDays = getISTWeekDays(activeWeekRef) || [];
  const activeWeekBadge = getISTWeekBadge ? getISTWeekBadge(activeWeekRef) : 'W1';
  const isCurrentWeek = weekOffset === 0;
  const weekStartStr = activeWeekDays[0]?.dateStr || todayStr;
  const weekEndStr = activeWeekDays[6]?.dateStr || todayStr;

  // Month & Year Selector for Month view
  const currentISTYM = getISTYearMonth();
  const [selectedYear, setSelectedYear] = useState(currentISTYM.year);
  const [selectedMonth, setSelectedMonth] = useState(currentISTYM.month); // 1-12

  const years = [2025, 2026, 2027, 2028];

  // Selected Month Key (e.g. '2026-08')
  const selectedMonthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const activeAllocation = (getMonthlyAllocation && getMonthlyAllocation(selectedMonthKey)) || { expenseBudget: 0, investmentGoal: 0 };
  const monthlyBudgetCap = Number(activeAllocation?.expenseBudget) || 0;

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  // --- Strict Temporal Filtering Helper ---
  const isDateInTimeframe = (dateStr) => {
    if (!dateStr) return false;
    if (timeframe === 'day') {
      return dateStr === selectedDate;
    }
    if (timeframe === 'week') {
      return dateStr >= weekStartStr && dateStr <= weekEndStr;
    }
    // Month
    return dateStr.startsWith(selectedMonthKey);
  };

  const scopedTransactions = transactions.filter(t => isDateInTimeframe(t.date));
  const scopedActivities = activities.filter(a => isDateInTimeframe(a.date));

  // --- 1. Financial Calculations & Velocity ---
  const {
    totalIncome: periodIncome,
    livingExpenses: periodLivingExpenses,
    preCommitments: periodPreCommitments,
    savingTransfers: periodSavingTransfers,
    sentExpenses: periodSentExpenses,
    totalInvested: periodInvested,
    grossExpenses: periodGrossExpenses,
    surplusOutflow: periodSurplusOutflow,
    leftoverCash: leftoverSurplus
  } = calculateFinanceSummary(scopedTransactions, monthlyBudgetCap);

  const daysInMonth = 31;
  const currentDayNum = today.getDate();
  const dailyTargetBurn = monthlyBudgetCap > 0 ? (monthlyBudgetCap / daysInMonth) : 0;
  const weeklyBudgetLimit = monthlyBudgetCap > 0 ? ((monthlyBudgetCap / daysInMonth) * 7) : 0;

  // Actual living burn rate vs. safe pace (tracks living expenses + sent; excludes Saving Account & Pre Commitments)
  let actualDailyRate = 0;
  let safeDailyRate = dailyTargetBurn;
  let budgetHealthStatus = 'On Track';
  let budgetBufferRemaining = 0;
  let budgetVariancePct = 0;

  if (timeframe === 'day') {
    actualDailyRate = periodLivingExpenses;
    safeDailyRate = dailyTargetBurn;
    budgetBufferRemaining = safeDailyRate > 0 ? (safeDailyRate - periodLivingExpenses) : -periodLivingExpenses;
    budgetVariancePct = safeDailyRate > 0 ? Math.round(((periodLivingExpenses - safeDailyRate) / safeDailyRate) * 100) : 0;
  } else if (timeframe === 'week') {
    const daysCounted = isCurrentWeek
      ? Math.max(1, activeWeekDays.findIndex(w => w.dateStr === todayStr) + 1)
      : 7;
    actualDailyRate = Math.round(periodLivingExpenses / daysCounted);
    safeDailyRate = Math.round(weeklyBudgetLimit / 7);
    budgetBufferRemaining = weeklyBudgetLimit - periodLivingExpenses;
    budgetVariancePct = weeklyBudgetLimit > 0 ? Math.round(((periodLivingExpenses - weeklyBudgetLimit) / weeklyBudgetLimit) * 100) : 0;
  } else {
    // Month
    actualDailyRate = currentDayNum > 0 ? Math.round(periodLivingExpenses / currentDayNum) : 0;
    safeDailyRate = Math.round(dailyTargetBurn);
    budgetBufferRemaining = monthlyBudgetCap - periodLivingExpenses;
    budgetVariancePct = monthlyBudgetCap > 0 ? Math.round(((periodLivingExpenses - monthlyBudgetCap) / monthlyBudgetCap) * 100) : 0;
  }

  const isUnderBudget = budgetBufferRemaining >= 0;
  const periodExpenses = periodGrossExpenses;

  // Top spending category driver
  const categorySpendMap = {};
  scopedTransactions.filter(t => t.type === 'expense').forEach(t => {
    categorySpendMap[t.category] = (categorySpendMap[t.category] || 0) + (Number(t.amount) || 0);
  });
  let topCategory = 'Living Expenses';
  let topCategoryAmount = 0;
  Object.keys(categorySpendMap).forEach(cat => {
    if (categorySpendMap[cat] > topCategoryAmount) {
      topCategoryAmount = categorySpendMap[cat];
      topCategory = cat;
    }
  });
  const topCategoryPct = periodExpenses > 0 ? Math.round((topCategoryAmount / periodExpenses) * 100) : 0;

  // --- 2. Habit Consistency & Discipline Score ---
  let habitScore = 0;
  let habitRating = 'High Discipline';
  let habitDeltaText = '';

  if (timeframe === 'day') {
    const doneOnDate = habits.filter(h => isHabitDoneOn(h.id, selectedDate)).length;
    habitScore = habits.length > 0 ? Math.round((doneOnDate / habits.length) * 100) : 0;
    habitRating = habitScore >= 80 ? 'High Discipline 🔥' : habitScore >= 50 ? 'Moderate Consistency' : 'Needs Focus';
    habitDeltaText = `${doneOnDate} of ${habits.length} routines completed (${selectedDate === todayStr ? 'Today' : formatISTDisplayDate(selectedDate)})`;
  } else if (timeframe === 'week') {
    const totalSlots = habits.length * 7;
    let doneSlots = 0;
    habits.forEach(h => {
      activeWeekDays.forEach(d => {
        if (isHabitDoneOn(h.id, d.dateStr)) doneSlots += 1;
      });
    });
    habitScore = totalSlots > 0 ? Math.round((doneSlots / totalSlots) * 100) : 0;
    habitRating = habitScore >= 75 ? 'Strong Weekly Adherence 🟢' : habitScore >= 50 ? 'Moderate Pace 🟡' : 'Lagging Routines 🔴';
    habitDeltaText = `${doneSlots}/${totalSlots} check-ins logged (${isCurrentWeek ? 'This Week' : activeWeekBadge})`;
  } else {
    // Month
    let totalSlots = 0;
    let doneSlots = 0;
    const isCurrentMonth = selectedMonthKey === `${currentISTYM.year}-${String(currentISTYM.month).padStart(2, '0')}`;
    const daysToCount = isCurrentMonth ? currentDayNum : 30;

    habits.forEach(h => {
      for (let dayI = 1; dayI <= daysToCount; dayI++) {
        const dStr = `${selectedMonthKey}-${String(dayI).padStart(2, '0')}`;
        if (!h.createdAt || h.createdAt <= dStr) {
          totalSlots += 1;
          if (isHabitDoneOn(h.id, dStr)) doneSlots += 1;
        }
      }
    });

    habitScore = totalSlots > 0 ? Math.round((doneSlots / totalSlots) * 100) : 0;
    habitRating = habitScore >= 70 ? 'High Consistency 🟢' : habitScore >= 45 ? 'Moderate Index 🟡' : 'At Risk 🔴';
    habitDeltaText = `${doneSlots} completions in ${MONTH_NAMES_FULL[selectedMonth - 1]}`;
  }

  // Find lowest adherence habit
  let lowestHabit = null;
  let lowestHabitCount = 999;
  habits.forEach(h => {
    const c = activeWeekDays.filter(d => isHabitDoneOn(h.id, d.dateStr)).length;
    if (c < lowestHabitCount) {
      lowestHabitCount = c;
      lowestHabit = h;
    }
  });

  // --- 3. Scoped Activity & Physical Volume Output ---
  const runningActs = scopedActivities.filter(a => a.type === 'running');
  const totalRunningKm = runningActs.reduce((sum, a) => sum + (Number(a.distance) || 0), 0);
  const totalRunningMins = runningActs.reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
  const avgRunningPace = totalRunningKm > 0 ? (totalRunningMins / totalRunningKm).toFixed(2) : 0;

  const gymActs = scopedActivities.filter(a => a.type === 'gym');
  const totalGymSessions = gymActs.length;
  const totalGymMins = gymActs.reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
  const totalVolumeLiftedKg = gymActs.reduce((sum, a) => {
    if (Array.isArray(a.exercises)) {
      return sum + a.exercises.reduce((eSum, ex) => eSum + ((Number(ex.sets) || 1) * (Number(ex.reps) || 1) * (Number(ex.weightKg) || 0)), 0);
    }
    return sum + ((Number(a.sets) || 1) * (Number(a.reps) || 1) * (Number(a.weightKg) || 0));
  }, 0);

  const swimActs = scopedActivities.filter(a => a.type === 'swimming');
  const sportsActs = scopedActivities.filter(a => a.type === 'sports');
  const totalSwimLaps = swimActs.reduce((sum, a) => sum + (Number(a.laps) || 0), 0);
  const totalSwimMins = swimActs.reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
  const totalSportsHours = (sportsActs.reduce((sum, a) => sum + (Number(a.duration) || 0), 0) / 60).toFixed(1);

  const readingActs = scopedActivities.filter(a => a.type === 'reading');
  const totalPagesRead = readingActs
    .filter(a => a.subType === 'book' || !a.subType)
    .reduce((sum, a) => sum + (Number(a.pagesRead) || 0), 0);
  const totalLearningMins = readingActs.reduce((sum, a) => sum + (Number(a.duration) || 0), 0);

  const totalActiveOutputMins = totalRunningMins + totalGymMins + totalSwimMins + Math.round(Number(totalSportsHours) * 60) + totalLearningMins;

  // Target baseline comparisons (prorated by timeframe)
  const targetKm = timeframe === 'day' ? 3.0 : timeframe === 'week' ? 15.0 : 40.0;
  const runningTargetPct = Math.min(100, Math.round((totalRunningKm / targetKm) * 100));

  // --- 4. Goal Completion Velocity ---
  let goalsOnTrackCount = 0;
  let goalsNeedsFocusCount = 0;
  let goalsAtRiskCount = 0;

  goals.forEach(g => {
    const pct = Math.round((g.currentAmount / g.targetAmount) * 100);
    const daysLeft = getISTDateDiffDays(todayStr, g.deadline);
    if (pct >= 50 || daysLeft > 90) {
      goalsOnTrackCount += 1;
    } else if (daysLeft < 30 && pct < 40) {
      goalsAtRiskCount += 1;
    } else {
      goalsNeedsFocusCount += 1;
    }
  });

  // --- 5. Task & To-Do List Analytics ---
  const isTaskInTimeframe = (task) => {
    if (!task) return false;
    if (task.dueDate && isDateInTimeframe(task.dueDate)) return true;
    if (task.completedAt && isDateInTimeframe(task.completedAt.slice(0, 10))) return true;
    if (task.createdAt && isDateInTimeframe(task.createdAt.slice(0, 10))) return true;
    if (task.created_at && isDateInTimeframe(task.created_at.slice(0, 10))) return true;
    if (!task.dueDate && !task.completedAt && !task.createdAt && !task.created_at) return true;
    return false;
  };

  const scopedTasks = tasks.filter(isTaskInTimeframe);
  const completedScopedTasks = scopedTasks.filter(t => t.completed);
  const pendingScopedTasks = scopedTasks.filter(t => !t.completed);
  const taskCompletionPct = scopedTasks.length > 0 ? Math.round((completedScopedTasks.length / scopedTasks.length) * 100) : 0;

  const highPriorityTasks = scopedTasks.filter(t => t.priority === 'high');
  const highPriorityCompleted = highPriorityTasks.filter(t => t.completed).length;
  const medPriorityTasks = scopedTasks.filter(t => t.priority === 'medium');
  const medPriorityCompleted = medPriorityTasks.filter(t => t.completed).length;
  const lowPriorityTasks = scopedTasks.filter(t => t.priority === 'low');
  const lowPriorityCompleted = lowPriorityTasks.filter(t => t.completed).length;

  const displayTasks = scopedTasks.filter(task => {
    if (taskTabFilter === 'pending') return !task.completed;
    if (taskTabFilter === 'completed') return task.completed;
    return true;
  });

  // --- 6. Smart Contextual Diagnostics (4 Concrete Insights) ---
  const getContextualDiagnostics = () => {
    // 1. Financial Health Insight
    const isOverPace = actualDailyRate > safeDailyRate && safeDailyRate > 0;
    const finInsight = {
      title: 'Financial Health & Burn Pace',
      icon: Wallet,
      color: isOverPace ? 'amber' : 'emerald',
      badge: isOverPace ? 'Pace Alert ⚠️' : 'Within Safe Pace 🟢',
      headline: isOverPace
        ? `Burn rate is ₹${actualDailyRate.toLocaleString('en-IN')}/day vs. max safe pace of ₹${Math.round(safeDailyRate).toLocaleString('en-IN')}/day.`
        : `Burn rate is ₹${actualDailyRate.toLocaleString('en-IN')}/day (safe ceiling: ₹${Math.round(safeDailyRate).toLocaleString('en-IN')}/day).`,
      advice: topCategoryAmount > 0
        ? `${topCategory} accounts for ${topCategoryPct}% of expenses (₹${topCategoryAmount.toLocaleString('en-IN')}). Capping discretionary ${topCategory.toLowerCase()} preserves your ₹${Math.max(0, budgetBufferRemaining).toLocaleString('en-IN')} buffer.`
        : `Cashflow runway is healthy with ₹${Math.max(0, budgetBufferRemaining).toLocaleString('en-IN')} unspent budget buffer.`
    };

    // 2. Habit Formation Nudge
    const habitInsight = {
      title: 'Habit Formation Nudge',
      icon: Flame,
      color: habitScore >= 70 ? 'emerald' : 'amber',
      badge: `${habitScore}% Discipline Score`,
      headline: lowestHabit
        ? `'${lowestHabit.name}' has ${lowestHabitCount}/7 completions this week (${Math.round((lowestHabitCount / 7) * 100)}%).`
        : 'Habits consistency on track.',
      advice: lowestHabit && lowestHabitCount < 4
        ? `Anchor '${lowestHabit.name}' immediately after your morning planning routine before 10 AM to double consistency.`
        : `Strong execution consistency across all ${habits.length} daily habits. Keep daily streaks unbroken.`
    };

    // 3. Activity & Recovery Balance
    const actInsight = {
      title: 'Physical & Mental Output Balance',
      icon: Activity,
      color: 'cyan',
      badge: `${totalActiveOutputMins} Mins Output`,
      headline: `${totalRunningKm.toFixed(1)} km run (${runningTargetPct}% of ${targetKm}km target) • ${totalGymSessions} workouts (${totalVolumeLiftedKg.toLocaleString('en-IN')} kg).`,
      advice: totalRunningKm === 0 && totalGymSessions > 1
        ? `Running mileage is below target while strength training is active. Schedule a 20-min cardio or recovery run.`
        : totalPagesRead > 0
        ? `Excellent physical & cognitive balance with ${totalPagesRead} book pages read and ${(totalLearningMins / 60).toFixed(1)} hrs deep study.`
        : `Maintain balanced cadence between strength training, cardio intervals, and deep reading.`
    };

    // 4. Execution Strategy
    const execInsight = {
      title: 'Execution Strategy',
      icon: Zap,
      color: 'indigo',
      badge: 'High Impact',
      headline: `${goalsOnTrackCount} goals on track, ${goalsNeedsFocusCount} need focus, ${goalsAtRiskCount} at risk.`,
      advice: goalsNeedsFocusCount > 0 || goalsAtRiskCount > 0
        ? `Focus on your top lagging milestone sub-goals today to prevent deadline compression.`
        : `Execution momentum is strong across all horizons. Maintain daily check-in cadence.`
    };

    return [finInsight, habitInsight, actInsight, execInsight];
  };

  const smartDiagnostics = getContextualDiagnostics();

  // --- 6. DYNAMIC X-AXIS & CHART SCALING ENGINE ---

  // A. FINANCIAL GRAPH DATA PER TIMEFRAME
  let financeChartData = [];
  let financeXAxisKey = 'label';

  if (timeframe === 'day') {
    // Intra-day hourly intervals
    const hours = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '23:59'];
    let runningSpend = 0;
    financeChartData = hours.map((hr, idx) => {
      // Progressive distribution for selected day's living spend
      const fraction = (idx + 1) / hours.length;
      runningSpend = Math.round(periodLivingExpenses * fraction);
      return {
        label: hr,
        actualSpend: runningSpend,
        burnAllowance: Math.round(dailyTargetBurn * fraction)
      };
    });
  } else if (timeframe === 'week') {
    // 7 discrete weekday names with dates for active week (e.g. 'Mon 24')
    financeChartData = activeWeekDays.map(w => {
      const dayExpense = transactions
        .filter(t => t.date === w.dateStr && isLivingBudgetExpense(t))
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      return {
        label: `${w.dayNameShort} ${w.dayNumber}`,
        actualSpend: dayExpense,
        safePaceAvg: Math.round(weeklyBudgetLimit / 7)
      };
    });
  } else {
    // Month: Calendar days with 5-day intervals
    let cumulative = 0;
    financeChartData = Array.from({ length: daysInMonth }, (_, idx) => {
      const dayNum = idx + 1;
      const dStr = `${selectedMonthKey}-${String(dayNum).padStart(2, '0')}`;
      const dayExpense = transactions
        .filter(t => t.date === dStr && isLivingBudgetExpense(t))
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const isCurrentMonth = selectedMonthKey === `${currentISTYM.year}-${String(currentISTYM.month).padStart(2, '0')}`;
      const isPastOrToday = !isCurrentMonth || (dayNum <= currentDayNum);

      if (isPastOrToday) {
        cumulative += dayExpense;
      }

      return {
        label: `Day ${dayNum}`,
        actualSpend: isPastOrToday ? cumulative : null,
        idealPace: monthlyBudgetCap > 0 ? Math.round((monthlyBudgetCap / daysInMonth) * dayNum) : 0,
        budgetCap: monthlyBudgetCap > 0 ? monthlyBudgetCap : null
      };
    });
  }

  // B. HABIT GRAPH DATA PER TIMEFRAME
  let habitChartData = [];
  if (timeframe === 'day') {
    const hours = ['08:00', '12:00', '16:00', '20:00', '23:00'];
    const doneOnDate = habits.filter(h => isHabitDoneOn(h.id, selectedDate)).length;
    habitChartData = hours.map((hr, idx) => {
      const currentDone = Math.min(doneOnDate, Math.ceil((doneOnDate / hours.length) * (idx + 1)));
      return {
        label: hr,
        completionPct: habits.length > 0 ? Math.round((currentDone / habits.length) * 100) : 0,
        doneCount: currentDone
      };
    });
  } else if (timeframe === 'week') {
    habitChartData = activeWeekDays.map(w => {
      const doneCount = habits.filter(h => isHabitDoneOn(h.id, w.dateStr)).length;
      const pct = habits.length > 0 ? Math.round((doneCount / habits.length) * 100) : 0;
      return {
        label: `${w.dayNameShort} ${w.dayNumber}`,
        completionPct: pct,
        doneCount
      };
    });
  } else {
    // Month: grouped by 5-day intervals or daily trend
    habitChartData = Array.from({ length: Math.ceil(daysInMonth / 3) }, (_, idx) => {
      const startDay = idx * 3 + 1;
      const endDay = Math.min(daysInMonth, (idx + 1) * 3);
      let periodDone = 0;
      let periodPossible = 0;

      for (let d = startDay; d <= endDay; d++) {
        const dStr = `${selectedMonthKey}-${String(d).padStart(2, '0')}`;
        habits.forEach(h => {
          if (!h.createdAt || h.createdAt <= dStr) {
            periodPossible += 1;
            if (isHabitDoneOn(h.id, dStr)) periodDone += 1;
          }
        });
      }

      const pct = periodPossible > 0 ? Math.round((periodDone / periodPossible) * 100) : 0;
      return {
        label: `D${startDay}–${endDay}`,
        completionPct: pct,
        doneCount: periodDone
      };
    });
  }

  // C. Discipline Effort Breakdown Data
  const disciplineEffortData = [
    { name: 'Running / Cardio', mins: totalRunningMins, color: DISCIPLINE_COLORS.Running },
    { name: 'Gym / Strength', mins: totalGymMins, color: DISCIPLINE_COLORS.Gym },
    { name: 'Swimming & Sports', mins: totalSwimMins + Math.round(Number(totalSportsHours) * 60), color: DISCIPLINE_COLORS.Swimming },
    { name: 'Reading & Learning', mins: totalLearningMins, color: DISCIPLINE_COLORS.Reading }
  ].filter(d => d.mins > 0);

  const displayDisciplineData = disciplineEffortData.length > 0
    ? disciplineEffortData
    : [
        { name: 'Running', mins: 45, color: DISCIPLINE_COLORS.Running },
        { name: 'Gym', mins: 60, color: DISCIPLINE_COLORS.Gym },
        { name: 'Reading', mins: 30, color: DISCIPLINE_COLORS.Reading }
      ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 🌟 1. UNIFIED 3-HEADER TIME TOGGLE & DYNAMIC DATE / WEEK / MONTH CONTROLS */}
      <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-md">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Executive Pulse Insights
            </h2>
          </div>
        </div>

        {/* 3-Toggle Navigation Bar & Dynamic Controls: [ Day | Week | Month ] */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            {[
              { id: 'day', label: 'Day', icon: Sun },
              { id: 'week', label: 'Week', icon: CalendarDays },
              { id: 'month', label: 'Month', icon: CalendarIcon }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTimeframe(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    timeframe === tab.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Date Picker (Day View Only) */}
          {timeframe === 'day' && (
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs animate-in fade-in duration-150">
              <span className="font-bold text-slate-500 dark:text-slate-400 pl-1.5">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
              />
              <span className="text-slate-400 pr-1.5 text-[11px] hidden sm:inline">
                {selectedDate === todayStr ? '(Today)' : formatISTDisplayDate(selectedDate)}
              </span>
            </div>
          )}

          {/* Week Slide Navigator (Week View Only) */}
          {timeframe === 'week' && (
            <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs animate-in fade-in duration-150">
              <button
                onClick={() => setWeekOffset(prev => prev - 1)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer transition"
                title="Previous Week"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="px-2 py-0.5 font-mono font-bold text-indigo-700 dark:text-cyan-300 text-xs">
                {activeWeekBadge}
              </span>

              {!isCurrentWeek && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="px-1.5 py-0.5 text-[10px] font-extrabold text-indigo-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  Current
                </button>
              )}

              <button
                onClick={() => setWeekOffset(prev => prev + 1)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer transition"
                title="Next Week"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Month & Year Selectors (Month View Only) */}
          {timeframe === 'month' && (
            <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs animate-in fade-in duration-150">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {MONTH_NAMES_FULL.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer font-mono"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <button
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 📊 2. HIGH-DENSITY, CONTEXTUAL METRIC CARDS (What the numbers mean) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        
        {/* 1. Financial Velocity & Burn Rate Card */}
        <div className="glass-card-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Financial Velocity & Runway</span>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>

          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                ₹{actualDailyRate.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-400">/day</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                (Safe: ₹{Math.round(safeDailyRate).toLocaleString('en-IN')})
              </span>
            </div>

            <div className="mt-1 flex items-center gap-1.5">
              <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded font-mono ${
                isUnderBudget
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}>
                {isUnderBudget ? `Under by ${Math.abs(budgetVariancePct)}%` : `Over by ${budgetVariancePct}%`}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                (₹{Math.max(0, budgetBufferRemaining).toLocaleString('en-IN')} buffer)
              </span>
            </div>
          </div>
        </div>

        {/* 2. Habit Reliability & Consistency Index */}
        <div className="glass-card-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Habit Consistency Index</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>

          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                {habitScore}%
              </span>
              <span className="text-[10px] font-bold text-amber-500">
                {habitRating}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">{habitDeltaText}</p>
          </div>
        </div>

        {/* 3. Physical & Mental Output Gauge */}
        <div className="glass-card-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Physical & Learning Output</span>
            <Activity className="w-4 h-4 text-cyan-500" />
          </div>

          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
                {totalActiveOutputMins} <span className="text-xs font-normal">mins</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                ({runningTargetPct}% Cardio Target)
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {totalRunningKm.toFixed(1)}km run • {totalGymSessions} workouts • {totalPagesRead}p read
            </p>
          </div>
        </div>

        {/* 4. To-Do Execution Velocity Card */}
        <div className="glass-card-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">To-Do Execution Velocity</span>
            <CheckSquare className="w-4 h-4 text-emerald-500" />
          </div>

          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {taskCompletionPct}%
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                ({completedScopedTasks.length}/{scopedTasks.length} Done)
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono">
              <span className="text-rose-500 font-bold">{highPriorityTasks.length - highPriorityCompleted} High</span>
              <span>•</span>
              <span className="text-amber-500 font-bold">{medPriorityTasks.length - medPriorityCompleted} Med</span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">{completedScopedTasks.length} Done</span>
            </div>
          </div>
        </div>

        {/* 5. Strategic Goal Velocity Breakdown */}
        <div className="glass-card-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Goal Completion Velocity</span>
            <Compass className="w-4 h-4 text-indigo-500" />
          </div>

          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {goalsOnTrackCount} / {goals.length}
              </span>
              <span className="text-[10px] font-bold text-emerald-500">On Track</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] font-mono">
              <span className="text-emerald-600 font-bold">{goalsOnTrackCount} Track</span>
              <span>•</span>
              <span className="text-amber-500 font-bold">{goalsNeedsFocusCount} Focus</span>
              <span>•</span>
              <span className="text-rose-500 font-bold">{goalsAtRiskCount} Risk</span>
            </div>
          </div>
        </div>

      </div>

      {/* 🧠 3. SMART CONTEXT INSIGHTS ENGINE */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Smart Context Insights
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {smartDiagnostics.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="glass-card-dark rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <IconComp className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{item.title}</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.color === 'rose'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        : item.color === 'amber'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        : item.color === 'cyan'
                        ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    }`}>
                      {item.badge}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                    {item.headline}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                  <span className="text-indigo-500 font-bold">💡</span>
                  <span className="leading-tight">{item.advice}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📈 4. DYNAMIC X-AXIS FINANCIAL TRAJECTORY GRAPH */}
      <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-500" />
              <span>
                {timeframe === 'day'
                  ? 'Daily Expense Tracker'
                  : timeframe === 'week'
                  ? 'Weekly Expense Tracker'
                  : 'Monthly Expense Tracker'}
              </span>
            </h3>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            {timeframe === 'month' && (
              <>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-0.5 bg-rose-500 inline-block" />
                  <span className="text-slate-500">Budget Cap</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-0.5 border-t-2 border-dashed border-amber-500 inline-block" />
                  <span className="text-slate-500">Ideal Run-Rate</span>
                </div>
              </>
            )}
            {timeframe === 'week' && (
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-0.5 border-t-2 border-dashed border-amber-500 inline-block" />
                <span className="text-slate-500">7-Day Safe Avg</span>
              </div>
            )}
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-1.5 bg-emerald-500 rounded inline-block" />
              <span className="text-slate-500 font-bold">Actual Spend</span>
            </div>
          </div>
        </div>

        {/* Dynamic Multi-Scale Financial Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {timeframe === 'week' ? (
              <BarChart data={financeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} opacity={0.5} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    borderColor: theme === 'dark' ? '#1e293b' : '#cbd5e1',
                    borderRadius: '0.75rem',
                    fontSize: '11px'
                  }}
                  formatter={(val, name) => [`₹${Number(val).toLocaleString('en-IN')}`, name === 'actualSpend' ? 'Daily Spend' : 'Safe Daily Avg']}
                />
                <Bar dataKey="actualSpend" fill="#10b981" radius={[6, 6, 0, 0]} name="Daily Spend" />
                {safeDailyRate > 0 && (
                  <Line type="monotone" dataKey="safePaceAvg" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Safe Daily Avg" />
                )}
              </BarChart>
            ) : (
              <AreaChart data={financeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} opacity={0.5} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }}
                  interval={timeframe === 'month' ? 4 : 0}
                />
                <YAxis tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                    borderColor: theme === 'dark' ? '#1e293b' : '#cbd5e1',
                    borderRadius: '0.75rem',
                    fontSize: '11px'
                  }}
                  formatter={(val, name) => [
                    `₹${Number(val).toLocaleString('en-IN')}`,
                    name === 'actualSpend' ? 'Actual Cumulative Spend' : name === 'idealPace' ? 'Ideal Daily Pace' : name === 'burnAllowance' ? 'Intra-Day Allowance' : 'Monthly Budget Cap'
                  ]}
                />
                {timeframe === 'month' && monthlyBudgetCap > 0 && (
                  <Line type="monotone" dataKey="budgetCap" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Budget Cap" />
                )}
                {timeframe === 'month' && monthlyBudgetCap > 0 && (
                  <Line type="monotone" dataKey="idealPace" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="2 2" dot={false} name="Ideal Linear Pace" />
                )}
                {timeframe === 'day' && dailyTargetBurn > 0 && (
                  <Line type="monotone" dataKey="burnAllowance" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="2 2" dot={false} name="Burn Allowance" />
                )}
                <Area type="monotone" dataKey="actualSpend" stroke="#10b981" strokeWidth={2.5} fill="url(#spendGrad)" name="Actual Cumulative Spend" connectNulls={false} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Capital Flow Breakdown Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">Capital Flow Allocation</span>
            <span className="font-mono text-slate-500 text-[11px]">Period Inflow: ₹{periodIncome.toLocaleString('en-IN')}</span>
          </div>

          <div className="w-full h-2 bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden flex">
            <div
              className="bg-rose-500 transition-all duration-300"
              style={{ width: `${periodIncome > 0 ? Math.min(100, Math.round((periodExpenses / periodIncome) * 100)) : 0}%` }}
              title={`Expenses: ₹${periodExpenses}`}
            />
            <div
              className="bg-indigo-500 transition-all duration-300"
              style={{ width: `${periodIncome > 0 ? Math.min(100, Math.round((periodInvested / periodIncome) * 100)) : 0}%` }}
              title={`Investments: ₹${periodInvested}`}
            />
            <div
              className="bg-emerald-500 transition-all duration-300"
              style={{ width: `${periodIncome > 0 ? Math.max(0, Math.round((leftoverSurplus / periodIncome) * 100)) : 0}%` }}
              title={`Surplus: ₹${leftoverSurplus}`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-500 pt-0.5">
            <span>Expenses: ₹{periodExpenses.toLocaleString('en-IN')}</span>
            <span>Investments: ₹{periodInvested.toLocaleString('en-IN')}</span>
            <span>Leftover Surplus: ₹{Math.max(0, leftoverSurplus).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 🏋️ 5. ACTIVITY & PHYSICAL OUTPUT PULSE SECTION */}
      <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-500" />
              <span>Activity Pulse</span>
            </h3>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            {scopedActivities.length} Session{scopedActivities.length !== 1 ? 's' : ''} in Scope
          </span>
        </div>

        {/* 4 Discipline Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* 1. Cardio / Running */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">🏃 Cardio / Running</span>
              <span className="text-[10px] font-mono text-slate-400">{runningActs.length} runs</span>
            </div>
            <p className="text-lg font-extrabold text-sky-600 dark:text-sky-400 font-mono">
              {totalRunningKm.toFixed(1)} <span className="text-xs font-normal">km</span>
            </p>
            <p className="text-[10px] text-slate-500 flex justify-between">
              <span>Avg Pace: {avgRunningPace > 0 ? `${avgRunningPace} min/km` : '—'}</span>
              <span>{totalRunningMins} mins</span>
            </p>
          </div>

          {/* 2. Gym / Strength */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">🏋️ Gym & Strength</span>
              <span className="text-[10px] font-mono text-slate-400">{totalGymSessions} workouts</span>
            </div>
            <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400 font-mono">
              {totalVolumeLiftedKg.toLocaleString('en-IN')} <span className="text-xs font-normal">kg</span>
            </p>
            <p className="text-[10px] text-slate-500 flex justify-between">
              <span>Tonnage Volume</span>
              <span>{totalGymMins} mins</span>
            </p>
          </div>

          {/* 3. Swimming & Sports */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">🏊 Swim & Sports</span>
              <span className="text-[10px] font-mono text-slate-400">{swimActs.length + sportsActs.length} logs</span>
            </div>
            <p className="text-lg font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
              {totalSwimLaps} <span className="text-xs font-normal">laps</span>
            </p>
            <p className="text-[10px] text-slate-500 flex justify-between">
              <span>Sports: {totalSportsHours} hrs</span>
              <span>{totalSwimMins} mins</span>
            </p>
          </div>

          {/* 4. Reading & Learning */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">📚 Books & Learning</span>
              <span className="text-[10px] font-mono text-slate-400">{readingActs.length} sessions</span>
            </div>
            <p className="text-lg font-extrabold text-purple-600 dark:text-purple-400 font-mono">
              {totalPagesRead} <span className="text-xs font-normal">pages</span>
            </p>
            <p className="text-[10px] text-slate-500 flex justify-between">
              <span>Deep Study</span>
              <span>{totalLearningMins} mins</span>
            </p>
          </div>

        </div>

        {/* Discipline Distribution Chart */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Discipline Effort Allocation (% of active minutes in scope)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {displayDisciplineData.map((item, idx) => {
              const pct = totalActiveOutputMins > 0 ? Math.round((item.mins / totalActiveOutputMins) * 100) : 25;
              return (
                <div key={idx} className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-mono font-extrabold text-slate-900 dark:text-slate-100">{item.mins}m ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ⚡ 6. DYNAMIC X-AXIS HABIT ADHERENCE GRAPH */}
      <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>
                {timeframe === 'day'
                  ? 'Daily Habit Tracker'
                  : timeframe === 'week'
                  ? 'Weekly Habit Tracker'
                  : 'Monthly Habit Tracker'}
              </span>
            </h3>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {habitScore}% Score
          </span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={habitChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} opacity={0.5} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} tickFormatter={v => `${v}%`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                  borderColor: theme === 'dark' ? '#1e293b' : '#cbd5e1',
                  borderRadius: '0.75rem',
                  fontSize: '11px'
                }}
                formatter={(val, name, props) => [`${val}% (${props.payload.doneCount} routines)`, 'Adherence']}
              />
              <Bar dataKey="completionPct" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📋 7. TO-DO LIST & TASK EXECUTION */}
      <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-500" />
              <span>
                {timeframe === 'day'
                  ? 'Daily To-Do List'
                  : timeframe === 'week'
                  ? 'Weekly To-Do List'
                  : 'Monthly To-Do List'}
              </span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {taskCompletionPct}% Score
            </span>

            {/* Filter Tabs: All | Pending | Completed */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setTaskTabFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  taskTabFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                All ({scopedTasks.length})
              </button>
              <button
                onClick={() => setTaskTabFilter('pending')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  taskTabFilter === 'pending'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Pending ({pendingScopedTasks.length})
              </button>
              <button
                onClick={() => setTaskTabFilter('completed')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  taskTabFilter === 'completed'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Completed ({completedScopedTasks.length})
              </button>
            </div>

            <Link
              to="/tasks"
              className="p-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold"
              title="Open full Tasks Page"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Priority Execution Breakdown Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">High Priority</span>
            </div>
            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
              {highPriorityCompleted} / {highPriorityTasks.length}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Medium Priority</span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
              {medPriorityCompleted} / {medPriorityTasks.length}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Low Priority</span>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
              {lowPriorityCompleted} / {lowPriorityTasks.length}
            </span>
          </div>
        </div>

        {/* Task Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Execution Completion</span>
            <span>{taskCompletionPct}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${taskCompletionPct}%` }}
            />
          </div>
        </div>

        {/* Task List Feed */}
        {displayTasks.length === 0 ? (
          <div className="text-center p-6 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800/60 text-xs text-slate-500 italic">
            {taskTabFilter === 'completed'
              ? 'No completed tasks in this timeframe yet.'
              : taskTabFilter === 'pending'
              ? 'No pending tasks in this timeframe. Everything is complete!'
              : 'No tasks scheduled in this timeframe.'}
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {displayTasks.map(task => (
              <div
                key={task.id}
                onClick={() => toggleTaskComplete(task.id)}
                className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer group ${
                  task.completed
                    ? 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-200/50 dark:border-slate-800/40 opacity-70'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskComplete(task.id);
                    }}
                    className={`p-1 rounded-lg transition shrink-0 ${
                      task.completed
                        ? 'bg-emerald-500 text-white'
                        : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>

                  <div className="min-w-0">
                    <p className={`text-xs font-medium truncate ${
                      task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {task.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px]">
                      {task.category && (
                        <span className="text-slate-400 font-mono">{task.category}</span>
                      )}
                      {task.dueDate && (
                        <span className="text-slate-400 font-mono">• Due: {task.dueDate}</span>
                      )}
                      {task.linkedGoalTitle && (
                        <span className="text-indigo-500 dark:text-indigo-400 font-mono">• 🧭 {task.linkedGoalTitle}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Priority Badge */}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  task.priority === 'high'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    : task.priority === 'medium'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                }`}>
                  {task.priority === 'high' ? '🔴 High' : task.priority === 'medium' ? '🟡 Medium' : '🔵 Low'}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* 🎯 8. CONSOLIDATED STRATEGIC GOAL PROGRESS & MILESTONES */}
      <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-500" />
              <span>Goal Progress</span>
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {goals.length} Active Objectives
          </span>
        </div>

        {goals.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center p-6">No goals defined yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
              const daysLeft = getISTDateDiffDays(todayStr, g.deadline);
              const isAhead = pct >= 50;
              const subGoals = g.subGoals || [];
              const completedSubs = subGoals.filter(s => s.completed).length;

              return (
                <div
                  key={g.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{g.title}</h4>
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20">
                          {g.category}
                        </span>
                        <span>•</span>
                        <span>{g.horizon === 'short' ? '⚡ Short-Term' : '🏔️ Long-Term'}</span>
                        <span>•</span>
                        <span className="font-mono">{daysLeft} days left</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isAhead
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}>
                      {pct}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>{g.unit === '₹' ? `₹${Number(g.currentAmount).toLocaleString('en-IN')}` : `${g.currentAmount} ${g.unit}`}</span>
                      <span>{g.unit === '₹' ? `₹${Number(g.targetAmount).toLocaleString('en-IN')}` : `${g.targetAmount} ${g.unit}`}</span>
                    </div>
                  </div>

                  {/* Sub-Goals Counter */}
                  {subGoals.length > 0 && (
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-indigo-500" />
                        <span>Milestones:</span>
                      </span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {completedSubs} of {subGoals.length} completed
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
