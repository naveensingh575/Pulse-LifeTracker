import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { DayCalendarNavigator } from '../common/DayCalendarNavigator';
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
  isLivingBudgetExpense
} from '../../utils/financeUtils';
import {
  ResponsiveContainer,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
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
  Share2,
  LineChart
} from 'lucide-react';
import { SmartPulseIntelligence } from './SmartPulseIntelligence';
import { DisciplineShareModal } from './DisciplineShareModal';
import { getOperatingPersonality } from '../../utils/correlationUtils';

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
    isHabitActiveOnDate = () => true,
    getMonthlyAllocation = () => ({ expenseBudget: 0, investmentGoal: 0 }),
    activities = [],
    goals = [],
    tasks = [],
    journalEntries = [],
    toggleTaskComplete = () => {},
    theme = 'dark'
  } = dashboard;

  // Unified 3-Header Timeframe Filter: 'day' | 'week' | 'month'
  const [timeframe, setTimeframe] = useState('day');

  // Pillar Segment Tab Filter: 'all' | 'finance' | 'habits' | 'vitality' | 'execution'
  const [activeTab, setActiveTab] = useState('all');

  // Day View Date Selector
  const today = getISTDate();
  const todayStr = getISTDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Week View Slide Offset (0 = current week, -1 = last week, +1 = next week)
  const [weekOffset, setWeekOffset] = useState(0);

  // Discipline Proof of Work Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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
    const activeHabitsOnDate = habits.filter(h => isHabitActiveOnDate(h, selectedDate));
    const doneOnDate = activeHabitsOnDate.filter(h => isHabitDoneOn(h.id, selectedDate)).length;
    const totalPossible = activeHabitsOnDate.length;
    habitScore = totalPossible > 0 ? Math.round((doneOnDate / totalPossible) * 100) : 0;
    habitRating = habitScore >= 80 ? 'High Discipline 🔥' : habitScore >= 50 ? 'Moderate Consistency' : 'Needs Focus';
    habitDeltaText = `${doneOnDate} of ${totalPossible} scheduled routines completed (${selectedDate === todayStr ? 'Today' : formatISTDisplayDate(selectedDate)})`;
  } else if (timeframe === 'week') {
    let totalSlots = 0;
    let doneSlots = 0;
    habits.forEach(h => {
      activeWeekDays.forEach(d => {
        if (isHabitActiveOnDate(h, d.dateStr)) {
          totalSlots += 1;
          if (isHabitDoneOn(h.id, d.dateStr)) doneSlots += 1;
        }
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
        if (isHabitActiveOnDate(h, dStr)) {
          totalSlots += 1;
          if (isHabitDoneOn(h.id, dStr)) doneSlots += 1;
        }
      }
    });

    habitScore = totalSlots > 0 ? Math.round((doneSlots / totalSlots) * 100) : 0;
    habitRating = habitScore >= 70 ? 'High Consistency 🟢' : habitScore >= 45 ? 'Moderate Index 🟡' : 'At Risk 🔴';
    habitDeltaText = `${doneSlots} completions in ${MONTH_NAMES_FULL[selectedMonth - 1]}`;
  }

  // Find lowest adherence habit across selected timeframe
  let lowestHabit = null;
  let lowestHabitCount = 999;
  let lowestHabitPossibleDays = 1;

  if (habits.length > 0) {
    if (timeframe === 'day') {
      lowestHabitPossibleDays = 1;
      habits.forEach(h => {
        const done = isHabitDoneOn(h.id, selectedDate) ? 1 : 0;
        if (done < lowestHabitCount) {
          lowestHabitCount = done;
          lowestHabit = h;
        }
      });
    } else if (timeframe === 'week') {
      lowestHabitPossibleDays = 7;
      habits.forEach(h => {
        const c = activeWeekDays.filter(d => isHabitDoneOn(h.id, d.dateStr)).length;
        if (c < lowestHabitCount) {
          lowestHabitCount = c;
          lowestHabit = h;
        }
      });
    } else {
      // Month
      const isCurrentMonth = selectedMonthKey === `${currentISTYM.year}-${String(currentISTYM.month).padStart(2, '0')}`;
      const daysToCount = Math.max(1, isCurrentMonth ? currentDayNum : 30);
      lowestHabitPossibleDays = daysToCount;
      habits.forEach(h => {
        let c = 0;
        for (let dayI = 1; dayI <= daysToCount; dayI++) {
          const dStr = `${selectedMonthKey}-${String(dayI).padStart(2, '0')}`;
          if (isHabitDoneOn(h.id, dStr)) c += 1;
        }
        if (c < lowestHabitCount) {
          lowestHabitCount = c;
          lowestHabit = h;
        }
      });
    }
  }
  if (lowestHabitCount === 999) lowestHabitCount = 0;

  // --- 3. Scoped Activity & Physical Volume Output ---
  const getActivityMins = (a) => Number(a.durationMins ?? a.duration) || 0;

  const runningActs = scopedActivities.filter(a => a.type === 'running');
  const totalRunningKm = runningActs.reduce((sum, a) => sum + (Number(a.distance) || 0), 0);
  const totalRunningMins = runningActs.reduce((sum, a) => sum + getActivityMins(a), 0);
  const avgRunningPace = totalRunningKm > 0 ? (totalRunningMins / totalRunningKm).toFixed(2) : 0;

  const gymActs = scopedActivities.filter(a => a.type === 'gym');
  const totalGymSessions = gymActs.length;
  const totalGymMins = gymActs.reduce((sum, a) => sum + getActivityMins(a), 0);
  const totalVolumeLiftedKg = gymActs.reduce((sum, a) => {
    if (Array.isArray(a.exercises)) {
      return sum + a.exercises.reduce((eSum, ex) => eSum + ((Number(ex.sets) || 1) * (Number(ex.reps) || 1) * (Number(ex.weightKg) || 0)), 0);
    }
    return sum + ((Number(a.sets) || 1) * (Number(a.reps) || 1) * (Number(a.weightKg) || 0));
  }, 0);

  const swimActs = scopedActivities.filter(a => a.type === 'swimming');
  const sportsActs = scopedActivities.filter(a => a.type === 'sports');
  const totalSwimLaps = swimActs.reduce((sum, a) => sum + (Number(a.laps) || 0), 0);
  const totalSwimMins = swimActs.reduce((sum, a) => sum + getActivityMins(a), 0);
  const totalSportsMins = sportsActs.reduce((sum, a) => sum + getActivityMins(a), 0);
  const totalSportsHours = (totalSportsMins / 60).toFixed(1);

  const readingActs = scopedActivities.filter(a => a.type === 'reading');
  const totalPagesRead = readingActs
    .filter(a => a.subType === 'book' || !a.subType)
    .reduce((sum, a) => sum + (Number(a.pagesRead) || 0), 0);
  const totalLearningMins = readingActs.reduce((sum, a) => sum + getActivityMins(a), 0);

  const totalActiveOutputMins = totalRunningMins + totalGymMins + totalSwimMins + totalSportsMins + totalLearningMins;

  // Target baseline comparisons (prorated by timeframe)
  const targetKm = timeframe === 'day' ? 3.0 : timeframe === 'week' ? 15.0 : 40.0;
  const runningTargetPct = Math.min(100, Math.round((totalRunningKm / targetKm) * 100));

  // --- 4. Goal Completion Velocity ---
  let goalsOnTrackCount = 0;
  let goalsNeedsFocusCount = 0;
  let goalsAtRiskCount = 0;

  (goals || []).forEach(g => {
    const currentAmt = Number(g.currentAmount ?? g.current_amount ?? 0) || 0;
    const targetAmt = Number(g.targetAmount ?? g.target_amount ?? 1) || 1;
    const pct = targetAmt > 0 ? Math.min(100, Math.round((currentAmt / targetAmt) * 100)) : 0;
    const deadlineStr = g.deadline || g.targetDate || g.target_date || todayStr;
    const daysLeft = getISTDateDiffDays(deadlineStr, todayStr);
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


  // Top Habit Streak & Operating Archetype Calculation for Proof of Work
  const topStreak = habits.length > 0 ? Math.max(0, ...habits.map(h => Number(h.streak) || 0)) : 0;
  const avgHabitStreak = habits.length > 0 ? Math.round(habits.reduce((acc, h) => acc + (Number(h.streak) || 0), 0) / habits.length) : 0;
  const userArchetype = getOperatingPersonality({
    totalActiveMins: totalActiveOutputMins,
    overallTaskCompletionRate: taskCompletionPct,
    avgHabitStreak,
    habitsLength: habits.length,
    tasksLength: scopedTasks.length,
    highPriorityRate: highPriorityTasks.length > 0 ? Math.round((highPriorityCompleted / highPriorityTasks.length) * 100) : 0,
    savingsRatePct: periodIncome > 0 ? Math.round(((periodIncome - periodLivingExpenses) / periodIncome) * 100) : 0
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
    const lowestHabitPct = lowestHabitPossibleDays > 0 ? Math.round((lowestHabitCount / lowestHabitPossibleDays) * 100) : 0;
    const habitHeadline = !lowestHabit
      ? 'Habits consistency on track.'
      : timeframe === 'day'
      ? `${lowestHabit.name} is ${lowestHabitCount === 1 ? 'completed today' : 'not yet completed today'}.`
      : timeframe === 'week'
      ? `'${lowestHabit.name}' has ${lowestHabitCount}/7 completions this week (${lowestHabitPct}%).`
      : `'${lowestHabit.name}' has ${lowestHabitCount}/${lowestHabitPossibleDays} completions this month (${lowestHabitPct}%).`;

    const habitAdvice = lowestHabit && (lowestHabitCount / lowestHabitPossibleDays < 0.6)
      ? `Anchor '${lowestHabit.name}' immediately after your morning planning routine before 10 AM to double consistency.`
      : `Strong execution consistency across all ${habits.length} daily habits. Keep daily streaks unbroken.`;

    const habitInsight = {
      title: 'Habit Formation Nudge',
      icon: Flame,
      color: habitScore >= 70 ? 'emerald' : 'amber',
      badge: `${habitScore}% Discipline Score`,
      headline: habitHeadline,
      advice: habitAdvice
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
    const activeHabitsOnDate = habits.filter(h => isHabitActiveOnDate(h, selectedDate));
    const doneOnDate = activeHabitsOnDate.filter(h => isHabitDoneOn(h.id, selectedDate)).length;
    const totalDayHabits = activeHabitsOnDate.length;
    habitChartData = hours.map((hr, idx) => {
      const currentDone = Math.min(doneOnDate, Math.ceil((doneOnDate / hours.length) * (idx + 1)));
      return {
        label: hr,
        completionPct: totalDayHabits > 0 ? Math.round((currentDone / totalDayHabits) * 100) : 0,
        doneCount: currentDone
      };
    });
  } else if (timeframe === 'week') {
    habitChartData = activeWeekDays.map(w => {
      const activeForDay = habits.filter(h => isHabitActiveOnDate(h, w.dateStr));
      const doneCount = activeForDay.filter(h => isHabitDoneOn(h.id, w.dateStr)).length;
      const pct = activeForDay.length > 0 ? Math.round((doneCount / activeForDay.length) * 100) : 0;
      return {
        label: `${w.dayNameShort} ${w.dayNumber}`,
        completionPct: pct,
        doneCount
      };
    });
  } else {
    // Month: grouped by 3-day intervals
    habitChartData = Array.from({ length: Math.ceil(daysInMonth / 3) }, (_, idx) => {
      const startDay = idx * 3 + 1;
      const endDay = Math.min(daysInMonth, (idx + 1) * 3);
      let periodDone = 0;
      let periodPossible = 0;

      for (let d = startDay; d <= endDay; d++) {
        const dStr = `${selectedMonthKey}-${String(d).padStart(2, '0')}`;
        habits.forEach(h => {
          if (isHabitActiveOnDate(h, dStr)) {
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
    { name: 'Swimming', mins: totalSwimMins, color: DISCIPLINE_COLORS.Swimming },
    { name: 'Sports & Games', mins: totalSportsMins, color: DISCIPLINE_COLORS.Sports },
    { name: 'Reading & Learning', mins: totalLearningMins, color: DISCIPLINE_COLORS.Reading }
  ].filter(d => d.mins > 0);

  const displayDisciplineData = disciplineEffortData;

  // 4-Pillar Normalized Balance Scores (0–100)
  let physicalScore = 0;
  if (totalActiveOutputMins > 0 || scopedActivities.length > 0) {
    if (timeframe === 'day') {
      physicalScore = totalActiveOutputMins >= 45 ? 100 : totalActiveOutputMins >= 30 ? 75 : totalActiveOutputMins > 0 ? 50 : 30;
    } else if (timeframe === 'week') {
      physicalScore = Math.min(100, Math.max(scopedActivities.length > 0 ? 30 : 0, Math.round((totalActiveOutputMins / 180) * 100)));
    } else {
      physicalScore = Math.min(100, Math.max(scopedActivities.length > 0 ? 30 : 0, Math.round((totalActiveOutputMins / 700) * 100)));
    }
  }

  const executionScore = scopedTasks.length > 0 ? taskCompletionPct : 100;

  let financialScore = 100;
  if (safeDailyRate > 0) {
    if (actualDailyRate <= safeDailyRate) {
      const savingsRatio = (safeDailyRate - actualDailyRate) / safeDailyRate;
      financialScore = Math.min(100, 80 + Math.round(savingsRatio * 20));
    } else {
      financialScore = Math.max(10, 80 - Math.min(70, budgetVariancePct));
    }
  } else if (periodLivingExpenses > 0) {
    financialScore = 80;
  }

  const disciplineScore = habits.length > 0 ? habitScore : 100;
  const overallPulseScore = Math.round((physicalScore * 0.25) + (disciplineScore * 0.25) + (financialScore * 0.25) + (executionScore * 0.25));

  const PILLAR_TABS = [
    { id: 'all', label: 'Overview', icon: Compass },
    { id: 'finance', label: 'Financial Runway', icon: Wallet },
    { id: 'habits', label: 'Habits & Routines', icon: Flame },
    { id: 'vitality', label: 'Physical Vitality', icon: Activity },
    { id: 'execution', label: 'Execution & Goals', icon: CheckSquare }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 🌟 1. UNIFIED 3-HEADER TIME TOGGLE & DYNAMIC DATE / WEEK / MONTH CONTROLS */}
      <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-md">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Pulse Insights
              </h2>
            </div>
          </div>

          {/* Share button (Mobile only - parallel to Pulse Insights on right corner side) */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="md:hidden flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-bold transition cursor-pointer shadow-sm shrink-0"
            title="Generate shareable weekly discipline card"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
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
            <div className="flex items-center gap-2 min-w-0 max-w-full overflow-hidden">
              <DayCalendarNavigator
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                accentColor="indigo"
                showDateLabel
              />
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

          {/* Share Proof of Work Action (Desktop only) */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-bold transition cursor-pointer shadow-sm"
            title="Generate shareable weekly discipline card"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Proof of Work</span>
          </button>
        </div>
      </div>

      {/* 🎯 2. UNIFIED 4-PILLAR EXECUTIVE SCORECARD */}
      <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 shadow-lg">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-indigo-500" />
            <span>4-Pillar Executive Scorecard</span>
          </span>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20 shrink-0">
            Pulse Health: {overallPulseScore}%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Vitality */}
          <div
            onClick={() => setActiveTab('vitality')}
            className={`p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border transition cursor-pointer space-y-2 group ${
              activeTab === 'vitality' ? 'border-cyan-500 ring-1 ring-cyan-500/30' : 'border-slate-200 dark:border-slate-800 hover:border-cyan-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-500" /> Vitality
              </span>
              <span className="text-lg font-black font-mono text-cyan-600 dark:text-cyan-400">
                {physicalScore}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${physicalScore}%` }}
              />
            </div>
            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between font-mono text-slate-500">
                <span>{totalActiveOutputMins}m active</span>
                <span>{totalRunningKm.toFixed(1)}km run</span>
              </div>
              <p className="text-slate-400 truncate font-mono">
                {totalGymSessions} workouts • {totalPagesRead}p read
              </p>
            </div>
          </div>

          {/* 2. Discipline */}
          <div
            onClick={() => setActiveTab('habits')}
            className={`p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border transition cursor-pointer space-y-2 group ${
              activeTab === 'habits' ? 'border-amber-500 ring-1 ring-amber-500/30' : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" /> Discipline
              </span>
              <span className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">
                {disciplineScore}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${disciplineScore}%` }}
              />
            </div>
            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between font-mono text-slate-500">
                <span>{habitRating}</span>
                <span>{topStreak}d streak</span>
              </div>
              <p className="text-slate-400 truncate font-mono">
                {habitDeltaText}
              </p>
            </div>
          </div>

          {/* 3. Cashflow */}
          <div
            onClick={() => setActiveTab('finance')}
            className={`p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border transition cursor-pointer space-y-2 group ${
              activeTab === 'finance' ? 'border-emerald-500 ring-1 ring-emerald-500/30' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-500" /> Cashflow
              </span>
              <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                {financialScore}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${financialScore}%` }}
              />
            </div>
            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between font-mono">
                <span className="text-slate-900 dark:text-slate-200 font-bold">₹{actualDailyRate.toLocaleString('en-IN')}/day</span>
                <span className={isUnderBudget ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                  {isUnderBudget ? `-${Math.abs(budgetVariancePct)}%` : `+${budgetVariancePct}%`}
                </span>
              </div>
              <p className="text-slate-400 truncate font-mono">
                Safe: ₹{Math.round(safeDailyRate).toLocaleString('en-IN')}/d (₹{Math.max(0, budgetBufferRemaining).toLocaleString('en-IN')} buffer)
              </p>
            </div>
          </div>

          {/* 4. Execution */}
          <div
            onClick={() => setActiveTab('execution')}
            className={`p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border transition cursor-pointer space-y-2 group ${
              activeTab === 'execution' ? 'border-indigo-500 ring-1 ring-indigo-500/30' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-500" /> Execution
              </span>
              <span className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
                {executionScore}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${executionScore}%` }}
              />
            </div>
            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between font-mono text-slate-500">
                <span>{completedScopedTasks.length}/{scopedTasks.length} tasks done</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{goalsOnTrackCount}/{goals.length} goals</span>
              </div>
              <p className="text-slate-400 truncate font-mono">
                {highPriorityTasks.length - highPriorityCompleted} High Priority pending
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 3. PILLAR SEGMENT NAVIGATION TABS */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {PILLAR_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 🌟 4. TABBED CONTENT ROUTER */}

      {/* TAB A: OVERVIEW */}
      {activeTab === 'all' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Smart Pulse Intelligence */}
          <SmartPulseIntelligence
            timeframe={timeframe}
            selectedDate={selectedDate}
            activeWeekBadge={activeWeekBadge}
            selectedMonthName={MONTH_NAMES_FULL[selectedMonth - 1]}
            selectedYear={selectedYear}
            periodIncome={periodIncome}
            periodLivingExpenses={periodLivingExpenses}
            periodGrossExpenses={periodGrossExpenses}
            periodInvested={periodInvested}
            leftoverSurplus={leftoverSurplus}
            actualDailyRate={actualDailyRate}
            safeDailyRate={safeDailyRate}
            budgetBufferRemaining={budgetBufferRemaining}
            budgetVariancePct={budgetVariancePct}
            topCategory={topCategory}
            topCategoryAmount={topCategoryAmount}
            topCategoryPct={topCategoryPct}
            habitScore={habitScore}
            habitRating={habitRating}
            lowestHabit={lowestHabit}
            lowestHabitCount={lowestHabitCount}
            lowestHabitPossibleDays={lowestHabitPossibleDays}
            habits={habits}
            isHabitDoneOn={isHabitDoneOn}
            totalRunningKm={totalRunningKm}
            totalGymSessions={totalGymSessions}
            totalVolumeLiftedKg={totalVolumeLiftedKg}
            totalPagesRead={totalPagesRead}
            totalActiveOutputMins={totalActiveOutputMins}
            scopedActivities={scopedActivities}
            scopedTasks={scopedTasks}
            tasksCompletionRate={taskCompletionPct}
            highPriorityTasks={highPriorityTasks}
            highPriorityCompleted={highPriorityCompleted}
            goalsOnTrackCount={goalsOnTrackCount}
            goalsNeedsFocusCount={goalsNeedsFocusCount}
            goalsAtRiskCount={goalsAtRiskCount}
            journalEntries={journalEntries}
            currency={dashboard?.currency || '₹'}
          />

          {/* Financial Trajectory Section */}
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

          {/* 2-Column Grid: Habit Tracker + Activity Effort Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Habit Adherence Graph */}
            <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>Habit Rhythm Adherence</span>
                  </h3>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {habitScore}% Score
                  </span>
                </div>

                <div className="h-44 w-full mt-4">
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

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-mono">{habitDeltaText}</span>
                <span className="font-mono text-slate-400 text-[10px]">{habits.length} habits tracked</span>
              </div>
            </div>

            {/* Activity Effort Allocation */}
            <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-500" />
                    <span>Discipline Effort Allocation</span>
                  </h3>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    {totalActiveOutputMins}m Total
                  </span>
                </div>

                {displayDisciplineData.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {/* Stacked Percentage Bar */}
                    <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                      {displayDisciplineData.map((item, idx) => {
                        const pct = totalActiveOutputMins > 0 ? ((item.mins / totalActiveOutputMins) * 100).toFixed(1) : 0;
                        return (
                          <div
                            key={idx}
                            style={{ width: `${pct}%`, backgroundColor: item.color }}
                            title={`${item.name}: ${item.mins}m (${pct}%)`}
                            className="h-full transition-all duration-300"
                          />
                        );
                      })}
                    </div>

                    {/* Consolidated Discipline Chips Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {displayDisciplineData.map((item, idx) => {
                        const pct = totalActiveOutputMins > 0 ? Math.round((item.mins / totalActiveOutputMins) * 100) : 0;
                        return (
                          <div key={idx} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1.5 min-w-0">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate text-[11px]">{item.name}</span>
                            </div>
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 shrink-0 ml-1 text-[11px]">
                              {item.mins}m ({pct}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center my-auto">
                    <p className="text-xs text-slate-500">No activity logs recorded for this timeframe.</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-mono">{scopedActivities.length} sessions in scope</span>
                <span className="font-mono text-slate-400 text-[10px]">{Math.round(totalActiveOutputMins / 60)}h total output</span>
              </div>
            </div>
          </div>

          {/* Execution Velocity & Goal Feasibility Matrix */}
          <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-500" />
                <span>Execution Throughput & Strategic Feasibility</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500">
                {taskCompletionPct}% Tasks • {goalsOnTrackCount}/{goals.length} Goals
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Task Velocity Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">To-Do Execution Breakdown</span>
                    <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {completedScopedTasks.length}/{scopedTasks.length} Completed
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${taskCompletionPct}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px] font-mono">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-rose-500 font-bold block">{highPriorityCompleted}/{highPriorityTasks.length}</span>
                      <span className="text-[9px] text-slate-400">High Pri</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-amber-500 font-bold block">{medPriorityCompleted}/{medPriorityTasks.length}</span>
                      <span className="text-[9px] text-slate-400">Med Pri</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-cyan-500 font-bold block">{lowPriorityCompleted}/{lowPriorityTasks.length}</span>
                      <span className="text-[9px] text-slate-400">Low Pri</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Horizon Backlog</span>
                    <span className="font-bold text-slate-600 dark:text-slate-300">{pendingScopedTasks.length} pending</span>
                  </div>
                </div>
              </div>

              {/* Goal Feasibility Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Goal Viability Status</span>
                    <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {goals.length} Strategic Goals
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm block">{goalsOnTrackCount}</span>
                      <span className="text-[9px] text-emerald-600/80 uppercase font-semibold">On Track</span>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                      <span className="text-amber-600 dark:text-amber-400 font-bold text-sm block">{goalsNeedsFocusCount}</span>
                      <span className="text-[9px] text-amber-600/80 uppercase font-semibold">Pacing</span>
                    </div>
                    <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
                      <span className="text-rose-600 dark:text-rose-400 font-bold text-sm block">{goalsAtRiskCount}</span>
                      <span className="text-[9px] text-rose-600/80 uppercase font-semibold">At Risk</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-tight pt-1">
                    Automated milestone trajectory and feasibility forecast based on current pace.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Tracked Targets</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{goalsOnTrackCount} on track</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: FINANCIAL RUNWAY */}
      {activeTab === 'finance' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                  <span>Financial Velocity & Cash Runway</span>
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
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-1.5 bg-emerald-500 rounded inline-block" />
                  <span className="text-slate-500 font-bold">Actual Spend</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
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
                      <linearGradient id="spendGradTab" x1="0" y1="0" x2="0" y2="1">
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
                    <Area type="monotone" dataKey="actualSpend" stroke="#10b981" strokeWidth={2.5} fill="url(#spendGradTab)" name="Actual Cumulative Spend" connectNulls={false} />
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

          {/* Financial Diagnostics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Burn Pacing</span>
              <p className="text-lg font-black font-mono text-slate-900 dark:text-slate-100">
                ₹{actualDailyRate.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-400">/day</span>
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Safe Ceiling: ₹{Math.round(safeDailyRate).toLocaleString('en-IN')}/day
              </p>
            </div>

            <div className="glass-card-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Budget Buffer</span>
              <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                ₹{Math.max(0, budgetBufferRemaining).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-500">
                {isUnderBudget ? 'Under planned allocation' : 'Allocation limit exceeded'}
              </p>
            </div>

            <div className="glass-card-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Outlay Driver</span>
              <p className="text-lg font-black text-slate-900 dark:text-slate-100 truncate">
                {topCategory}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                ₹{topCategoryAmount.toLocaleString('en-IN')} ({topCategoryPct}% of total outlays)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB C: HABITS & ROUTINES */}
      {activeTab === 'habits' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Habit Adherence Tracking</span>
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {habitScore}% Overall Score
              </span>
            </div>

            <div className="h-64 w-full">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consistency Rating</span>
              <p className="text-base font-bold text-amber-500">{habitRating}</p>
              <p className="text-xs text-slate-500">{habitDeltaText}</p>
            </div>

            <div className="glass-card-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Streak Health</span>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                {topStreak}d <span className="text-xs font-normal text-slate-500">top</span> • {avgHabitStreak}d <span className="text-xs font-normal text-slate-500">avg</span>
              </p>
              <p className="text-xs text-slate-500">Across {habits.length} active registered routines</p>
            </div>

            <div className="glass-card-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lowest Adherence Nudge</span>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {lowestHabit ? lowestHabit.name : 'All Habits On Track'}
              </p>
              <p className="text-xs text-slate-500">
                {lowestHabit ? `${lowestHabitCount}/${lowestHabitPossibleDays} check-ins logged` : 'Zero habit friction detected'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB D: PHYSICAL VITALITY */}
      {activeTab === 'vitality' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">🏃 Cardio / Running</span>
                <span className="text-[10px] font-mono text-slate-400">{runningActs.length} runs</span>
              </div>
              <p className="text-xl font-extrabold text-sky-600 dark:text-sky-400 font-mono">
                {totalRunningKm.toFixed(1)} <span className="text-xs font-normal">km</span>
              </p>
              <p className="text-xs text-slate-500 flex justify-between">
                <span>Avg Pace: {avgRunningPace > 0 ? `${avgRunningPace} min/km` : '—'}</span>
                <span>{totalRunningMins} mins</span>
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">🏋️ Gym & Strength</span>
                <span className="text-[10px] font-mono text-slate-400">{totalGymSessions} sessions</span>
              </div>
              <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                {totalVolumeLiftedKg.toLocaleString('en-IN')} <span className="text-xs font-normal">kg</span>
              </p>
              <p className="text-xs text-slate-500 flex justify-between">
                <span>Tonnage Volume</span>
                <span>{totalGymMins} mins</span>
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">🏊 Swim & Sports</span>
                <span className="text-[10px] font-mono text-slate-400">{swimActs.length + sportsActs.length} logs</span>
              </div>
              <p className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">
                {totalSwimLaps} <span className="text-xs font-normal">laps</span>
              </p>
              <p className="text-xs text-slate-500 flex justify-between">
                <span>Sports: {totalSportsHours} hrs</span>
                <span>{totalSwimMins} mins</span>
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">📚 Books & Learning</span>
                <span className="text-[10px] font-mono text-slate-400">{readingActs.length} logs</span>
              </div>
              <p className="text-xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
                {totalPagesRead} <span className="text-xs font-normal">pages</span>
              </p>
              <p className="text-xs text-slate-500 flex justify-between">
                <span>Deep Study</span>
                <span>{totalLearningMins} mins</span>
              </p>
            </div>
          </div>

          <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-500" />
                <span>Effort Distribution by Discipline</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500">
                {totalActiveOutputMins} Mins Total Output
              </span>
            </div>

            {displayDisciplineData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                  {displayDisciplineData.map((item, idx) => {
                    const pct = totalActiveOutputMins > 0 ? ((item.mins / totalActiveOutputMins) * 100).toFixed(1) : 0;
                    return (
                      <div
                        key={idx}
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                        title={`${item.name}: ${item.mins}m (${pct}%)`}
                        className="h-full transition-all duration-300"
                      />
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {displayDisciplineData.map((item, idx) => {
                    const pct = totalActiveOutputMins > 0 ? Math.round((item.mins / totalActiveOutputMins) * 100) : 0;
                    return (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="font-bold text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 shrink-0 ml-1">
                          {item.mins}m ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-500">No activity logs recorded in this timeframe.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB E: EXECUTION & GOALS */}
      {activeTab === 'execution' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-500" />
                <span>To-Do Execution Velocity</span>
              </h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {taskCompletionPct}% Completion Rate
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-500">
                <span>Task Execution Progress</span>
                <span>{completedScopedTasks.length} of {scopedTasks.length} Completed</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${taskCompletionPct}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">High Priority</span>
                </div>
                <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                  {highPriorityCompleted} / {highPriorityTasks.length}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Medium Priority</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  {medPriorityCompleted} / {medPriorityTasks.length}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Low Priority</span>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  {lowPriorityCompleted} / {lowPriorityTasks.length}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">
                Pending Execution Horizon
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {pendingScopedTasks.length} pending task{pendingScopedTasks.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Strategic Goals Viability Section */}
          <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-500" />
                <span>Strategic Objectives Feasibility</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500">
                {goals.length} Active Goals
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">
                  {goalsOnTrackCount}
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                  On Track
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Healthy completion trajectory
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
                <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono block">
                  {goalsNeedsFocusCount}
                </span>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                  Requires Acceleration
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Runway pace needs boost
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center space-y-1">
                <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono block">
                  {goalsAtRiskCount}
                </span>
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wide">
                  At Risk
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Immediate triage required
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">
                Strategic Milestone Health
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {goalsOnTrackCount} of {goals.length} on track
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 DISCIPLINE PROOF OF WORK SHARE MODAL */}
      <DisciplineShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        disciplineScore={habitScore}
        operatingArchetype={userArchetype.name}
        archetypeIcon={userArchetype.icon}
        topStreak={topStreak}
        totalActiveMins={totalActiveOutputMins}
        tasksCompleted={completedScopedTasks.length}
        timeframe={timeframe}
        timeframeLabel={
          timeframe === 'day'
            ? (selectedDate === todayStr ? 'Today' : formatISTDisplayDate(selectedDate))
            : timeframe === 'week'
            ? activeWeekBadge
            : `${MONTH_NAMES_FULL[selectedMonth - 1]} ${selectedYear}`
        }
        theme={theme}
      />

    </div>
  );
};
