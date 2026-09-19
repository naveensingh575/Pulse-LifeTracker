import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import {
  getISTDateString,
  getISTWeekDays,
  getISTDate,
  getISTDateDiffDays,
  isDateEditable,
  detectDeviceDefaultCurrency
} from '../utils/dateUtils';
import { isLivingBudgetExpense } from '../utils/financeUtils';
import { triggerHaptic } from '../utils/hapticUtils';

export const SUPPORTED_CURRENCIES = [
  { symbol: '$', code: 'USD', name: 'US Dollar ($)' },
  { symbol: '₹', code: 'INR', name: 'Indian Rupee (₹)' },
  { symbol: '€', code: 'EUR', name: 'Euro (€)' },
  { symbol: '£', code: 'GBP', name: 'British Pound (£)' },
  { symbol: '¥', code: 'JPY', name: 'Japanese Yen (¥)' },
  { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar (C$)' },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar (A$)' },
  { symbol: 'AED', code: 'AED', name: 'UAE Dirham (AED)' }
];

const DashboardContext = createContext();

// Helper to calculate active streak from date-keyed completions
export const calculateHabitStreak = (completions = {}, createdAt) => {
  const today = getISTDate();
  let streak = 0;
  let checkDate = new Date(today);

  const todayStr = getISTDateString(checkDate);
  const isDoneToday = Boolean(completions[todayStr]);

  if (isDoneToday) {
    streak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = getISTDateString(checkDate);
    if (!completions[yesterdayStr]) {
      return 0;
    }
  }

  while (true) {
    const dateStr = getISTDateString(checkDate);
    if (createdAt && dateStr < createdAt) break;
    if (completions[dateStr]) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

// Normalize habit object
const normalizeHabit = (h) => {
  const completions = h.completions || {};
  const currentWeek = getISTWeekDays();
  const completedDays = currentWeek.map(w => Boolean(completions[w.dateStr]));
  const createdAt = h.created_at || h.createdAt || getISTDateString();
  const streak = calculateHabitStreak(completions, createdAt);

  return {
    ...h,
    id: h.id,
    name: h.name,
    category: h.category || 'Health',
    icon: h.icon || 'Smile',
    createdAt,
    completions,
    completedDays,
    streak
  };
};

// Normalize goal object
const normalizeGoal = (g) => {
  let subGoals = [];
  if (Array.isArray(g.subGoals)) {
    subGoals = g.subGoals.map(sg => ({
      id: sg.id,
      title: sg.title,
      targetDate: sg.targetDate || sg.target_date || '',
      completed: Boolean(sg.completed)
    }));
  } else if (Array.isArray(g.sub_goals)) {
    subGoals = g.sub_goals.map(sg => ({
      id: sg.id,
      title: sg.title,
      targetDate: sg.target_date || sg.targetDate || '',
      completed: Boolean(sg.completed)
    }));
  }

  const targetAmount = Number(
    g.targetAmount !== undefined ? g.targetAmount : (g.target_amount ?? 100)
  );
  const currentAmount = Number(
    g.currentAmount !== undefined ? g.currentAmount : (g.current_amount ?? 0)
  );

  return {
    ...g,
    id: g.id,
    title: g.title,
    horizon: g.horizon || (g.deadline && getISTDateDiffDays(getISTDateString(), g.deadline) > 90 ? 'long' : 'short'),
    targetAmount,
    currentAmount,
    unit: g.unit || '₹',
    deadline: g.deadline,
    category: g.category || 'Financial',
    color: g.color || 'indigo',
    icon: g.icon || 'Target',
    subGoals
  };
};

export const DashboardProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;

  // Theme state: defaults to 'light' for first-time users, then respects localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pulse_theme') || 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Currency state: defaults to auto-detected device currency for first-time users, then respects localStorage
  const [currency, setCurrencyState] = useState(() => {
    const saved = localStorage.getItem('pulse_currency');
    if (saved) return saved;
    const detected = detectDeviceDefaultCurrency();
    localStorage.setItem('pulse_currency', detected);
    return detected;
  });

  const setCurrency = (newCurrency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('pulse_currency', newCurrency);
  };

  const formatCurrency = useCallback((amount = 0) => {
    const num = Number(amount) || 0;
    return `${currency}${num.toLocaleString()}`;
  }, [currency]);

  // Navigation view state: 'overview' | 'analytics'
  const [activeView, setActiveView] = useState('overview');

  // Core Data States
  const [goals, setGoals] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [habits, setHabits] = useState([]);
  const [activities, setActivities] = useState([]);
  const [monthlyAllocations, setMonthlyAllocations] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Apply dark mode class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('pulse_theme', theme);
  }, [theme]);

  // --- Fetch All User Data from Supabase ---
  const fetchUserData = useCallback(async () => {
    if (!userId) return;
    setIsLoadingData(true);

    try {
      // 1. Fetch in parallel for high throughput with explicit user_id tenant isolation
      const [
        habitsRes,
        habitCompsRes,
        allocsRes,
        txRes,
        goalsRes,
        tasksRes,
        deadlinesRes,
        actsRes,
        journalRes
      ] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
        supabase.from('habit_completions').select('*').eq('user_id', userId),
        supabase.from('monthly_allocations').select('*').eq('user_id', userId),
        supabase.from('transactions').select('*').eq('user_id', userId).order('transaction_date', { ascending: false }),
        supabase.from('goals').select('*, sub_goals(*)').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('deadlines').select('*').eq('user_id', userId).order('deadline_date', { ascending: true }),
        supabase.from('activities').select('*').eq('user_id', userId).order('activity_date', { ascending: false }),
        supabase.from('journal_entries').select('*').eq('user_id', userId).order('entry_date', { ascending: false })
      ]);

      // 2. Process Habits & Completions
      const rawHabits = habitsRes.data || [];
      const completionsList = habitCompsRes.data || [];
      const habitCompletionsMap = {};
      completionsList.forEach(comp => {
        if (!habitCompletionsMap[comp.habit_id]) {
          habitCompletionsMap[comp.habit_id] = {};
        }
        habitCompletionsMap[comp.habit_id][comp.completed_date] = true;
      });

      const processedHabits = rawHabits.map(h =>
        normalizeHabit({
          ...h,
          completions: habitCompletionsMap[h.id] || {}
        })
      );
      setHabits(processedHabits);

      // 3. Process Monthly Allocations
      const rawAllocs = allocsRes.data || [];
      const allocMap = {};
      rawAllocs.forEach(a => {
        allocMap[a.month_key] = {
          expenseBudget: Number(a.expense_budget) || 0,
          investmentGoal: Number(a.investment_goal) || 0
        };
      });
      setMonthlyAllocations(allocMap);

      // 4. Process Transactions
      const rawTx = txRes.data || [];
      const processedTx = rawTx.map(t => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount) || 0,
        category: t.category,
        description: t.description,
        assetName: t.asset_name || '',
        date: t.transaction_date,
        notes: t.notes || ''
      }));
      setTransactions(processedTx);

      // 5. Process Goals & Sub-Goals
      const rawGoals = goalsRes.data || [];
      setGoals(rawGoals.map(normalizeGoal));

      // 6. Process Tasks
      const rawTasks = tasksRes.data || [];
      const processedTasks = rawTasks.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority || 'medium',
        category: t.category || 'Work',
        dueDate: t.due_date,
        completed: Boolean(t.completed),
        completedAt: t.completed_at,
        linkedGoalTitle: t.linked_goal_title,
        notes: t.notes || ''
      }));
      setTasks(processedTasks);

      // 7. Process Deadlines
      const rawDeadlines = deadlinesRes.data || [];
      const processedDeadlines = rawDeadlines.map(d => ({
        id: d.id,
        title: d.title,
        date: d.deadline_date,
        category: d.category || 'Work',
        tag: d.tag || '',
        priority: d.priority || 'medium',
        isCompleted: Boolean(d.is_completed)
      }));
      setDeadlines(processedDeadlines);

      // 8. Process Activities
      const rawActs = actsRes.data || [];
      const processedActs = rawActs.map(a => ({
        id: a.id,
        type: a.type,
        title: a.title,
        date: a.activity_date,
        durationMins: Number(a.duration_mins) || 0,
        notes: a.notes || '',
        sessionFocus: a.session_focus,
        totalVolumeKg: Number(a.total_volume_kg) || 0,
        exercises: a.exercises || [],
        distance: Number(a.distance_km) || 0,
        pace: a.pace,
        heartRateZone: a.heart_rate_zone,
        stroke: a.stroke,
        laps: Number(a.laps) || 0,
        poolLengthMeters: Number(a.pool_length_meters) || 50,
        sportType: a.sport_type,
        intensity: a.intensity,
        readingSubType: a.reading_sub_type,
        bookTitle: a.book_title,
        pagesRead: Number(a.pages_read) || 0,
        skillName: a.skill_name,
        moduleName: a.module_name
      }));
      setActivities(processedActs);

      // 9. Process Journal Entries
      const rawJournal = journalRes.data || [];
      const processedJournal = rawJournal.map(j => ({
        id: j.id,
        date: j.entry_date,
        accomplished: j.accomplished || '',
        notes: j.notes || '',
        gratitude: j.gratitude || '',
        mood: j.mood || 'productive',
        updatedAt: j.updated_at || j.created_at || null
      }));
      setJournalEntries(processedJournal);

    } catch (err) {
      console.error('[PULSE Supabase Fetch Error]:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserData();

      // Real-time synchronization across devices & browsers with debouncing
      let debounceTimeout = null;
      const channel = supabase
        .channel(`pulse-realtime-sync-${userId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          () => {
            if (debounceTimeout) clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
              fetchUserData();
            }, 1000);
          }
        )
        .subscribe();

      return () => {
        if (debounceTimeout) clearTimeout(debounceTimeout);
        supabase.removeChannel(channel);
      };
    } else {
      // Clear data on logout
      setGoals([]);
      setDeadlines([]);
      setHabits([]);
      setActivities([]);
      setMonthlyAllocations({});
      setTransactions([]);
      setTasks([]);
      setJournalEntries([]);
    }
  }, [userId, fetchUserData]);

  // --- Monthly Allocation Operations ---
  const getMonthlyAllocation = (ymStr) => {
    if (monthlyAllocations && monthlyAllocations[ymStr]) {
      return {
        expenseBudget: Number(monthlyAllocations[ymStr].expenseBudget) || 0,
        investmentGoal: Number(monthlyAllocations[ymStr].investmentGoal) || 0
      };
    }
    return { expenseBudget: 0, investmentGoal: 0 };
  };

  const setMonthlyAllocation = async (ymStr, { expenseBudget, investmentGoal }) => {
    const cleanExp = Math.min(1000000000, Math.max(0, Number(expenseBudget) || 0));
    const cleanInv = Math.min(1000000000, Math.max(0, Number(investmentGoal) || 0));

    // Optimistic state update
    setMonthlyAllocations(prev => ({
      ...prev,
      [ymStr]: { expenseBudget: cleanExp, investmentGoal: cleanInv }
    }));

    if (userId) {
      await supabase.from('monthly_allocations').upsert({
        user_id: userId,
        month_key: ymStr,
        expense_budget: cleanExp,
        investment_goal: cleanInv
      }, { onConflict: 'user_id, month_key' });
    }
  };

  const getBudgetForMonth = (ymStr) => getMonthlyAllocation(ymStr).expenseBudget;
  const setBudgetForMonth = (ymStr, amount) => {
    const curr = getMonthlyAllocation(ymStr);
    setMonthlyAllocation(ymStr, { expenseBudget: amount, investmentGoal: curr.investmentGoal });
  };

  const currentISTMonthKey = getISTDateString().substring(0, 7);
  const monthlyBudget = getBudgetForMonth(currentISTMonthKey);
  const setMonthlyBudget = (amount) => setBudgetForMonth(currentISTMonthKey, amount);

  // --- Habits Operations ---
  const isHabitDoneOn = (habitId, dateStr) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit || !habit.completions) return false;
    return Boolean(habit.completions[dateStr]);
  };

  const toggleHabitForDate = async (habitId, dateStr) => {
    if (!isDateEditable(dateStr)) {
      console.warn(`[PULSE Lock] Editing is locked for ${dateStr}.`);
      return false;
    }

    const targetHabit = habits.find(h => h.id === habitId);
    if (!targetHabit) return false;

    const currentCompletions = { ...(targetHabit.completions || {}) };
    const nextState = !currentCompletions[dateStr];

    if (nextState) {
      currentCompletions[dateStr] = true;
      triggerHaptic('light'); // Tactile feedback on Android when habit is marked done
    } else {
      delete currentCompletions[dateStr];
    }

    const newStreak = calculateHabitStreak(currentCompletions, targetHabit.createdAt);
    const currentWeek = getISTWeekDays();
    const updatedCompletedDays = currentWeek.map(w => Boolean(currentCompletions[w.dateStr]));

    // Optimistic UI update
    setHabits(prev =>
      prev.map(h => {
        if (h.id !== habitId) return h;
        return {
          ...h,
          completions: currentCompletions,
          completedDays: updatedCompletedDays,
          streak: newStreak
        };
      })
    );

    // Supabase background write
    if (userId) {
      if (nextState) {
        await supabase.from('habit_completions').upsert({
          user_id: userId,
          habit_id: habitId,
          completed_date: dateStr
        }, { onConflict: 'habit_id, completed_date' });
      } else {
        await supabase.from('habit_completions').delete().match({
          user_id: userId,
          habit_id: habitId,
          completed_date: dateStr
        });
      }
      await supabase.from('habits').update({ streak: newStreak }).eq('id', habitId).eq('user_id', userId);
    }

    return true;
  };

  const toggleHabitDay = (habitId, dayIndex) => {
    const currentWeek = getISTWeekDays();
    if (dayIndex < 0 || dayIndex >= currentWeek.length) return false;
    const targetDay = currentWeek[dayIndex];
    return toggleHabitForDate(habitId, targetDay.dateStr);
  };

  const addHabit = async (newHabit) => {
    const todayStr = getISTDateString();
    const habitCreatedAt = newHabit.createdAt || todayStr;

    if (userId) {
      const { data, error } = await supabase.from('habits').insert({
        user_id: userId,
        name: newHabit.name.trim(),
        category: newHabit.category || 'Health',
        icon: newHabit.icon || 'Smile',
        frequency: newHabit.frequency || 'daily',
        streak: 0,
        created_at: habitCreatedAt
      }).select().single();

      if (!error && data) {
        setHabits(prev => [...prev, normalizeHabit(data)]);
      }
    } else {
      const localHabit = normalizeHabit({
        ...newHabit,
        id: `h-${Date.now()}`,
        createdAt: habitCreatedAt,
        completions: {},
        streak: 0
      });
      setHabits(prev => [...prev, localHabit]);
    }
  };

  const deleteHabit = async (id) => {
    const prevHabits = habits;
    setHabits(prev => prev.filter(h => h.id !== id));
    if (userId) {
      const { error } = await supabase.from('habits').delete().eq('id', id).eq('user_id', userId);
      if (error) {
        setHabits(prevHabits);
        console.error('[PULSE] Failed to delete habit:', error.message);
      }
    }
  };

  const updateHabit = async (arg1, arg2) => {
    const updatedHabit = typeof arg1 === 'object' && arg1 !== null && !arg2 ? arg1 : { ...(arg2 || {}), id: (arg1?.id || arg1) };
    const habitId = updatedHabit.id;
    if (!habitId) {
      console.warn('[PULSE] updateHabit: missing habit id');
      return;
    }

    const name = (updatedHabit.name || '').trim();
    const category = updatedHabit.category || 'Health';
    const icon = updatedHabit.icon || 'Smile';
    const frequency = updatedHabit.frequency || 'daily';
    const createdAt = updatedHabit.createdAt || updatedHabit.created_at || getISTDateString();

    setHabits(prev =>
      prev.map(h => {
        if (h.id !== habitId) return h;
        const completions = h.completions || {};
        const streak = calculateHabitStreak(completions, createdAt);
        return {
          ...h,
          name,
          category,
          icon,
          frequency,
          createdAt,
          streak
        };
      })
    );

    if (userId) {
      const { error } = await supabase.from('habits').update({
        name,
        category,
        icon,
        frequency,
        created_at: createdAt
      }).eq('id', habitId).eq('user_id', userId);

      if (error) {
        console.error('[PULSE Supabase updateHabit Error]:', error);
      }
    }
  };

  // --- Transactions Operations ---
  const addTransaction = async (newTx) => {
    const txDate = newTx.date || getISTDateString();
    const cleanAmt = Math.max(0, Number(newTx.amount) || 0);

    if (userId) {
      const { data, error } = await supabase.from('transactions').insert({
        user_id: userId,
        type: newTx.type || 'expense',
        amount: cleanAmt,
        category: newTx.category || 'Food',
        description: newTx.description || 'Expense',
        asset_name: newTx.assetName || null,
        transaction_date: txDate,
        notes: newTx.notes || ''
      }).select().single();

      if (!error && data) {
        setTransactions(prev => [{
          id: data.id,
          type: data.type,
          amount: Number(data.amount) || 0,
          category: data.category,
          description: data.description,
          assetName: data.asset_name || '',
          date: data.transaction_date,
          notes: data.notes || ''
        }, ...prev]);
      }
    } else {
      const localTx = {
        ...newTx,
        id: `t-${Date.now()}`,
        amount: cleanAmt,
        date: txDate
      };
      setTransactions(prev => [localTx, ...prev]);
    }
  };

  const updateTransaction = async (arg1, arg2) => {
    const updatedTx = typeof arg1 === 'object' && arg1 !== null && !arg2 ? arg1 : { ...(arg2 || {}), id: (arg1?.id || arg1) };
    const txId = updatedTx.id;
    if (!txId) {
      console.warn('[PULSE] updateTransaction: missing tx id');
      return;
    }

    const cleanAmt = Math.max(0, Number(updatedTx.amount) || 0);
    const txDate = updatedTx.date || updatedTx.transaction_date || getISTDateString();
    const type = updatedTx.type || 'expense';
    const category = updatedTx.category || 'Food';
    const description = (updatedTx.description || '').trim() || (updatedTx.assetName || updatedTx.asset_name || 'Expense');
    const assetName = updatedTx.assetName !== undefined ? updatedTx.assetName : (updatedTx.asset_name || '');
    const notes = updatedTx.notes || '';

    setTransactions(prev =>
      prev.map(t => {
        if (t.id !== txId) return t;
        return {
          ...t,
          type,
          amount: cleanAmt,
          category,
          description,
          assetName,
          date: txDate,
          notes
        };
      })
    );

    if (userId) {
      const { error } = await supabase.from('transactions').update({
        type,
        amount: cleanAmt,
        category,
        description,
        asset_name: assetName || null,
        transaction_date: txDate,
        notes
      }).eq('id', txId).eq('user_id', userId);

      if (error) {
        console.error('[PULSE Supabase updateTransaction Error]:', error);
      }
    }
  };

  const deleteTransaction = async (id) => {
    const prevTx = transactions;
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (userId) {
      const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId);
      if (error) {
        setTransactions(prevTx);
        console.error('[PULSE] Failed to delete transaction:', error.message);
      }
    }
  };

  // Overall financial calculations
  const totalSpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalLivingSpent = transactions
    .filter(isLivingBudgetExpense)
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalInvested = transactions
    .filter(t => t.type === 'investment')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const remainingBalance = monthlyBudget - totalLivingSpent;
  const daysInMonth = 31;
  const currentDayOfMonth = getISTDate().getDate();
  const daysRemaining = daysInMonth - currentDayOfMonth;
  const dailyBurnRate = currentDayOfMonth > 0 ? (totalLivingSpent / currentDayOfMonth) : 0;
  const targetDailyBurn = daysInMonth > 0 ? (monthlyBudget / daysInMonth) : 0;

  // --- Goals Operations ---
  const addGoal = async (newGoal) => {
    const normalized = normalizeGoal(newGoal);
    if (userId) {
      const { data, error } = await supabase.from('goals').insert({
        user_id: userId,
        title: normalized.title.trim(),
        horizon: normalized.horizon || 'short',
        category: normalized.category || 'Financial',
        target_amount: Number(normalized.targetAmount) || 100,
        current_amount: Number(normalized.currentAmount) || 0,
        unit: normalized.unit || '₹',
        deadline: normalized.deadline || null,
        color: normalized.color || 'indigo',
        icon: normalized.icon || 'Target'
      }).select().single();

      if (!error && data) {
        let insertedSubGoals = [];
        if (normalized.subGoals && normalized.subGoals.length > 0) {
          const subRows = normalized.subGoals.map(sg => ({
            user_id: userId,
            goal_id: data.id,
            title: sg.title.trim(),
            target_date: sg.targetDate || null,
            completed: Boolean(sg.completed),
            completed_at: sg.completed ? new Date().toISOString() : null
          }));
          const { data: subData } = await supabase.from('sub_goals').insert(subRows).select();
          if (subData) {
            insertedSubGoals = subData.map(s => ({
              id: s.id,
              title: s.title,
              targetDate: s.target_date,
              completed: Boolean(s.completed)
            }));
          }
        }
        setGoals(prev => [{ ...normalizeGoal(data), subGoals: insertedSubGoals }, ...prev]);
      }
    } else {
      setGoals(prev => [normalizeGoal({ ...normalized, id: `g-${Date.now()}` }), ...prev]);
    }
  };

  const updateGoal = async (arg1, arg2) => {
    const updatedGoal = typeof arg1 === 'object' && arg1 !== null && !arg2 ? arg1 : { ...(arg2 || {}), id: (arg1?.id || arg1) };
    const normalized = normalizeGoal(updatedGoal);
    setGoals(prev => prev.map(g => (g.id === normalized.id ? normalized : g)));

    if (userId) {
      // 1. Update goals parent record
      await supabase.from('goals').update({
        title: normalized.title,
        horizon: normalized.horizon,
        category: normalized.category,
        target_amount: normalized.targetAmount,
        current_amount: normalized.currentAmount,
        unit: normalized.unit,
        deadline: normalized.deadline || null,
        color: normalized.color,
        icon: normalized.icon
      }).eq('id', normalized.id).eq('user_id', userId);

      // 2. Comprehensive Sub-goals synchronization in Supabase
      try {
        const currentSubGoals = normalized.subGoals || [];

        // Fetch existing sub-goals for this goal from Supabase
        const { data: existingDbSubs } = await supabase
          .from('sub_goals')
          .select('id')
          .eq('goal_id', normalized.id)
          .eq('user_id', userId);

        const existingDbIds = (existingDbSubs || []).map(s => s.id);
        const keptDbIds = currentSubGoals
          .map(s => s.id)
          .filter(id => id && !String(id).startsWith('sg-') && existingDbIds.includes(id));

        // Delete sub-goals that were removed
        const toDeleteIds = existingDbIds.filter(id => !keptDbIds.includes(id));
        if (toDeleteIds.length > 0) {
          await supabase.from('sub_goals').delete().in('id', toDeleteIds).eq('user_id', userId);
        }

        // Insert new sub-goals or update existing ones
        const finalSubGoals = [];
        for (const sg of currentSubGoals) {
          if (sg.id && !String(sg.id).startsWith('sg-') && existingDbIds.includes(sg.id)) {
            await supabase.from('sub_goals').update({
              title: sg.title.trim(),
              target_date: sg.targetDate || null,
              completed: Boolean(sg.completed),
              completed_at: sg.completed ? new Date().toISOString() : null
            }).eq('id', sg.id).eq('user_id', userId);
            finalSubGoals.push(sg);
          } else {
            const { data: newSgData, error: insErr } = await supabase.from('sub_goals').insert({
              user_id: userId,
              goal_id: normalized.id,
              title: sg.title.trim(),
              target_date: sg.targetDate || null,
              completed: Boolean(sg.completed),
              completed_at: sg.completed ? new Date().toISOString() : null
            }).select().single();

            if (!insErr && newSgData) {
              finalSubGoals.push({
                id: newSgData.id,
                title: newSgData.title,
                targetDate: newSgData.target_date,
                completed: Boolean(newSgData.completed)
              });
            } else {
              finalSubGoals.push(sg);
            }
          }
        }

        // Refresh local goal sub-goals with confirmed DB IDs
        setGoals(prev =>
          prev.map(g => (g.id === normalized.id ? { ...normalized, subGoals: finalSubGoals } : g))
        );
      } catch (subErr) {
        console.error('Error syncing sub-goals in updateGoal:', subErr);
      }
    }
  };

  const deleteGoal = async (goalId) => {
    const prevGoals = goals;
    setGoals(prev => prev.filter(g => g.id !== goalId));
    if (userId) {
      const { error: subErr } = await supabase.from('sub_goals').delete().eq('goal_id', goalId).eq('user_id', userId);
      const { error: gErr } = await supabase.from('goals').delete().eq('id', goalId).eq('user_id', userId);
      if (gErr || subErr) {
        setGoals(prevGoals);
        console.error('[PULSE] Failed to delete goal:', (gErr || subErr)?.message);
      }
    }
  };

  const toggleGoalSubGoal = async (goalId, subGoalId) => {
    let nextCompleted = false;

    setGoals(prev =>
      prev.map(g => {
        if (g.id !== goalId) return g;
        const updatedSubs = (g.subGoals || []).map(sg => {
          if (sg.id === subGoalId) {
            nextCompleted = !sg.completed;
            return { ...sg, completed: nextCompleted };
          }
          return sg;
        });
        return { ...g, subGoals: updatedSubs };
      })
    );

    if (userId) {
      await supabase.from('sub_goals').update({
        completed: nextCompleted,
        completed_at: nextCompleted ? new Date().toISOString() : null
      }).eq('id', subGoalId).eq('user_id', userId);
    }
  };

  const addSubGoalToGoal = async (goalId, { title, targetDate }) => {
    if (!title || !title.trim()) return;

    if (userId) {
      const { data, error } = await supabase.from('sub_goals').insert({
        user_id: userId,
        goal_id: goalId,
        title: title.trim(),
        target_date: targetDate || null,
        completed: false
      }).select().single();

      if (!error && data) {
        setGoals(prev =>
          prev.map(g => {
            if (g.id !== goalId) return g;
            return {
              ...g,
              subGoals: [...(g.subGoals || []), {
                id: data.id,
                title: data.title,
                targetDate: data.target_date,
                completed: false
              }]
            };
          })
        );
      }
    } else {
      const newSub = {
        id: `sg-${Date.now()}`,
        title: title.trim(),
        targetDate,
        completed: false
      };
      setGoals(prev =>
        prev.map(g => (g.id === goalId ? { ...g, subGoals: [...(g.subGoals || []), newSub] } : g))
      );
    }
  };

  // --- Task Board Operations ---
  const addTask = async (newTask) => {
    const taskDueDate = newTask.dueDate || getISTDateString();

    if (userId) {
      const { data, error } = await supabase.from('tasks').insert({
        user_id: userId,
        title: newTask.title.trim(),
        priority: newTask.priority || 'medium',
        category: newTask.category || 'Work',
        due_date: taskDueDate,
        completed: false,
        linked_goal_title: newTask.linkedGoalTitle || null,
        notes: newTask.notes || ''
      }).select().single();

      if (!error && data) {
        setTasks(prev => [{
          id: data.id,
          title: data.title,
          priority: data.priority,
          category: data.category,
          dueDate: data.due_date,
          completed: false,
          linkedGoalTitle: data.linked_goal_title,
          notes: data.notes || ''
        }, ...prev]);
      }
    } else {
      setTasks(prev => [{
        ...newTask,
        id: `k-${Date.now()}`,
        completed: false,
        dueDate: taskDueDate
      }, ...prev]);
    }
  };

  const updateTask = async (arg1, arg2) => {
    const updatedTask = typeof arg1 === 'object' && arg1 !== null && !arg2 ? arg1 : { ...(arg2 || {}), id: (arg1?.id || arg1) };
    const taskId = updatedTask.id;
    if (!taskId) {
      console.warn('[PULSE] updateTask missing task id:', arg1, arg2);
      return;
    }

    const title = (updatedTask.title || '').trim();
    const priority = updatedTask.priority || 'medium';
    const category = updatedTask.category || 'Work';
    const dueDate = updatedTask.dueDate || updatedTask.due_date || getISTDateString();
    const linkedGoalTitle = updatedTask.linkedGoalTitle !== undefined ? updatedTask.linkedGoalTitle : (updatedTask.linked_goal_title || null);
    const notes = updatedTask.notes || '';

    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          title,
          priority,
          category,
          dueDate,
          linkedGoalTitle,
          notes
        };
      })
    );

    if (userId) {
      const { error } = await supabase.from('tasks').update({
        title,
        priority,
        category,
        due_date: dueDate,
        linked_goal_title: linkedGoalTitle || null,
        notes
      }).eq('id', taskId).eq('user_id', userId);

      if (error) {
        console.error('[PULSE Supabase updateTask Error]:', error);
      }
    }
  };

  const updateTaskPriority = async (taskId, newPriority) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, priority: newPriority } : t)));
    if (userId) {
      await supabase.from('tasks').update({ priority: newPriority }).eq('id', taskId).eq('user_id', userId);
    }
  };

  const toggleTaskComplete = async (taskId) => {
    let nextComp = false;
    const todayStr = getISTDateString();

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          nextComp = !t.completed;
          return {
            ...t,
            completed: nextComp,
            completedAt: nextComp ? todayStr : null
          };
        }
        return t;
      })
    );

    if (userId) {
      await supabase.from('tasks').update({
        completed: nextComp,
        completed_at: nextComp ? todayStr : null
      }).eq('id', taskId).eq('user_id', userId);
    }

    // Tactile feedback on Android when task is checked off
    if (nextComp) triggerHaptic('medium');
  };

  const deleteTask = async (taskId) => {
    const prevTasks = tasks;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (userId) {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', userId);
      if (error) {
        setTasks(prevTasks);
        console.error('[PULSE] Failed to delete task:', error.message);
      }
    }
  };

  // --- Deadlines Operations ---
  const addDeadline = async (newDeadline) => {
    if (userId) {
      const { data, error } = await supabase.from('deadlines').insert({
        user_id: userId,
        title: newDeadline.title.trim(),
        deadline_date: newDeadline.date || getISTDateString(),
        category: newDeadline.category || 'Work',
        tag: newDeadline.tag || '',
        priority: newDeadline.priority || 'medium',
        is_completed: false
      }).select().single();

      if (!error && data) {
        setDeadlines(prev => [...prev, {
          id: data.id,
          title: data.title,
          date: data.deadline_date,
          category: data.category,
          tag: data.tag,
          priority: data.priority,
          isCompleted: false
        }].sort((a, b) => new Date(a.date) - new Date(b.date)));
      }
    } else {
      setDeadlines(prev => [...prev, {
        ...newDeadline,
        id: `d-${Date.now()}`
      }].sort((a, b) => new Date(a.date) - new Date(b.date)));
    }
  };

  const updateDeadline = async (arg1, arg2) => {
    const updated = typeof arg1 === 'object' && arg1 !== null && !arg2 ? arg1 : { ...(arg2 || {}), id: (arg1?.id || arg1) };
    const deadlineId = updated.id;
    if (!deadlineId) return;

    setDeadlines(prev =>
      prev.map(d => {
        if (d.id !== deadlineId) return d;
        return {
          ...d,
          title: (updated.title || d.title).trim(),
          date: updated.date || updated.deadline_date || d.date,
          category: updated.category || d.category,
          tag: updated.tag !== undefined ? updated.tag : d.tag,
          priority: updated.priority || d.priority,
          isCompleted: updated.isCompleted !== undefined ? Boolean(updated.isCompleted) : d.isCompleted
        };
      }).sort((a, b) => new Date(a.date) - new Date(b.date))
    );

    if (userId) {
      await supabase.from('deadlines').update({
        title: (updated.title || '').trim(),
        deadline_date: updated.date || updated.deadline_date,
        category: updated.category,
        tag: updated.tag || '',
        priority: updated.priority,
        is_completed: Boolean(updated.isCompleted)
      }).eq('id', deadlineId).eq('user_id', userId);
    }
  };

  const deleteDeadline = async (id) => {
    const prevDeadlines = deadlines;
    setDeadlines(prev => prev.filter(d => d.id !== id));
    if (userId) {
      const { error } = await supabase.from('deadlines').delete().eq('id', id).eq('user_id', userId);
      if (error) {
        setDeadlines(prevDeadlines);
        console.error('[PULSE] Failed to delete deadline:', error.message);
      }
    }
  };

  // --- Activities Operations ---
  const addActivity = async (newAct) => {
    const actDate = newAct.date || getISTDateString();

    if (userId) {
      const { data, error } = await supabase.from('activities').insert({
        user_id: userId,
        type: newAct.type,
        title: newAct.title,
        activity_date: actDate,
        duration_mins: Number(newAct.durationMins) || 0,
        notes: newAct.notes || '',
        session_focus: newAct.sessionFocus || null,
        total_volume_kg: Number(newAct.totalVolumeKg) || 0,
        exercises: newAct.exercises || [],
        distance_km: Number(newAct.distance) || 0,
        pace: newAct.pace || null,
        heart_rate_zone: newAct.heartRateZone || null,
        stroke: newAct.stroke || null,
        laps: Number(newAct.laps) || 0,
        pool_length_meters: Number(newAct.poolLengthMeters) || 50,
        sport_type: newAct.sportType || null,
        intensity: newAct.intensity || null,
        reading_sub_type: newAct.readingSubType || null,
        book_title: newAct.bookTitle || null,
        pages_read: Number(newAct.pagesRead) || 0,
        skill_name: newAct.skillName || null,
        module_name: newAct.moduleName || null
      }).select().single();

      if (!error && data) {
        const item = {
          id: data.id,
          type: data.type,
          title: data.title,
          date: data.activity_date,
          durationMins: Number(data.duration_mins) || 0,
          notes: data.notes || '',
          sessionFocus: data.session_focus,
          totalVolumeKg: Number(data.total_volume_kg) || 0,
          exercises: data.exercises || [],
          distance: Number(data.distance_km) || 0,
          pace: data.pace,
          heartRateZone: data.heart_rate_zone,
          stroke: data.stroke,
          laps: Number(data.laps) || 0,
          poolLengthMeters: Number(data.pool_length_meters) || 50,
          sportType: data.sport_type,
          intensity: data.intensity,
          readingSubType: data.reading_sub_type,
          bookTitle: data.book_title,
          pagesRead: Number(data.pages_read) || 0,
          skillName: data.skill_name,
          moduleName: data.module_name
        };
        setActivities(prev => [item, ...prev]);
      }
    } else {
      setActivities(prev => [{ ...newAct, id: `act-${Date.now()}`, date: actDate }, ...prev]);
    }
  };

  const updateActivity = async (arg1, arg2) => {
    const updatedAct = typeof arg1 === 'object' && arg1 !== null && !arg2 ? arg1 : { ...(arg2 || {}), id: (arg1?.id || arg1) };
    const actId = updatedAct.id;
    if (!actId) {
      console.warn('[PULSE] updateActivity: missing activity id');
      return;
    }

    const actDate = updatedAct.date || updatedAct.activity_date || getISTDateString();
    const durationMins = Number(updatedAct.durationMins ?? updatedAct.duration_mins) || 0;
    const totalVolumeKg = Number(updatedAct.totalVolumeKg ?? updatedAct.total_volume_kg) || 0;
    const distance = Number(updatedAct.distance ?? updatedAct.distance_km) || 0;
    const laps = Number(updatedAct.laps) || 0;
    const poolLengthMeters = Number(updatedAct.poolLengthMeters ?? updatedAct.pool_length_meters) || 50;
    const pagesRead = Number(updatedAct.pagesRead ?? updatedAct.pages_read) || 0;

    const formattedObj = {
      ...updatedAct,
      id: actId,
      date: actDate,
      durationMins,
      totalVolumeKg,
      distance,
      laps,
      poolLengthMeters,
      pagesRead
    };

    setActivities(prev =>
      prev.map(a => (a.id === actId ? { ...a, ...formattedObj } : a))
    );

    if (userId) {
      const { error } = await supabase.from('activities').update({
        type: updatedAct.type,
        title: updatedAct.title,
        activity_date: actDate,
        duration_mins: durationMins,
        notes: updatedAct.notes || '',
        session_focus: updatedAct.sessionFocus || updatedAct.session_focus || null,
        total_volume_kg: totalVolumeKg,
        exercises: updatedAct.exercises || [],
        distance_km: distance,
        pace: updatedAct.pace || null,
        heart_rate_zone: updatedAct.heartRateZone || updatedAct.heart_rate_zone || null,
        stroke: updatedAct.stroke || null,
        laps: laps,
        pool_length_meters: poolLengthMeters,
        sport_type: updatedAct.sportType || updatedAct.sport_type || null,
        intensity: updatedAct.intensity || null,
        reading_sub_type: updatedAct.readingSubType || updatedAct.reading_sub_type || null,
        book_title: updatedAct.bookTitle || updatedAct.book_title || null,
        pages_read: pagesRead,
        skill_name: updatedAct.skillName || updatedAct.skill_name || null,
        module_name: updatedAct.moduleName || updatedAct.module_name || null
      }).eq('id', actId).eq('user_id', userId);

      if (error) {
        console.error('[PULSE Supabase updateActivity Error]:', error);
      }
    }
  };

  const deleteActivity = async (actId) => {
    const prevActs = activities;
    setActivities(prev => prev.filter(a => a.id !== actId));
    if (userId) {
      const { error } = await supabase.from('activities').delete().eq('id', actId).eq('user_id', userId);
      if (error) {
        setActivities(prevActs);
        console.error('[PULSE] Failed to delete activity:', error.message);
      }
    }
  };

  // --- Journal Operations ---
  const saveJournalEntry = async (dateStr, entryData) => {
    const updatedEntry = {
      date: dateStr,
      accomplished: entryData.accomplished || '',
      notes: entryData.notes || '',
      gratitude: entryData.gratitude || '',
      mood: entryData.mood || 'productive'
    };

    setJournalEntries(prev => {
      const existingIdx = prev.findIndex(e => e.date === dateStr);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], ...updatedEntry };
        return next;
      }
      return [{ ...updatedEntry, id: `j-${dateStr}` }, ...prev];
    });

    if (userId) {
      await supabase.from('journal_entries').upsert({
        user_id: userId,
        entry_date: dateStr,
        accomplished: entryData.accomplished || '',
        notes: entryData.notes || '',
        gratitude: entryData.gratitude || '',
        mood: entryData.mood || 'productive'
      }, { onConflict: 'user_id, entry_date' });
    }
  };

  const deleteJournalEntry = async (dateStr) => {
    setJournalEntries(prev => prev.filter(e => e.date !== dateStr));
    if (userId) {
      await supabase.from('journal_entries').delete().match({
        user_id: userId,
        entry_date: dateStr
      });
    }
  };

  const getJournalEntry = (dateStr) => {
    return journalEntries.find(e => e.date === dateStr) || null;
  };

  const getDayCompletionStats = useCallback((dateStr = getISTDateString()) => {
    if (!habits || habits.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    const total = habits.length;
    const completed = habits.filter(h => h.completions && Boolean(h.completions[dateStr])).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }, [habits]);

  return (
    <DashboardContext.Provider
      value={{
        theme,
        toggleTheme,
        activeView,
        setActiveView,
        isLoadingData,
        fetchUserData,

        // Goals
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        toggleGoalSubGoal,
        addSubGoalToGoal,

        // Deadlines
        deadlines,
        addDeadline,
        updateDeadline,
        deleteDeadline,

        // Habits
        habits,
        isHabitDoneOn,
        isDateEditable,
        toggleHabitForDate,
        toggleHabitDay,
        addHabit,
        updateHabit,
        deleteHabit,
        getDayCompletionStats,

        // Activities
        activities,
        addActivity,
        updateActivity,
        deleteActivity,

        // Currency & Localization
        currency,
        setCurrency,
        formatCurrency,
        SUPPORTED_CURRENCIES,

        // Monthly Allocations & Budget
        monthlyAllocations,
        getMonthlyAllocation,
        setMonthlyAllocation,
        monthlyBudget,
        setMonthlyBudget,
        getBudgetForMonth,
        setBudgetForMonth,

        // Money & Cashflow
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        totalSpent,
        totalLivingSpent,
        totalIncome,
        totalInvested,
        remainingBalance,
        dailyBurnRate,
        targetDailyBurn,
        daysRemaining,

        // Tasks
        tasks,
        addTask,
        updateTask,
        updateTaskPriority,
        toggleTaskComplete,
        toggleTask: toggleTaskComplete,
        deleteTask,

        // Journal
        journalEntries,
        saveJournalEntry,
        deleteJournalEntry,
        getJournalEntry
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
