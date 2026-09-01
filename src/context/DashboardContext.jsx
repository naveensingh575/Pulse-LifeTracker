import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import {
  getISTDateString,
  getISTWeekDays,
  getISTDate,
  getISTDateDiffDays,
  isDateEditable
} from '../utils/dateUtils';

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
  const subGoals = Array.isArray(g.sub_goals)
    ? g.sub_goals.map(sg => ({
        id: sg.id,
        title: sg.title,
        targetDate: sg.target_date || sg.targetDate,
        completed: Boolean(sg.completed)
      }))
    : Array.isArray(g.subGoals)
    ? g.subGoals
    : [];

  return {
    ...g,
    id: g.id,
    title: g.title,
    horizon: g.horizon || (g.deadline && getISTDateDiffDays(getISTDateString(), g.deadline) > 90 ? 'long' : 'short'),
    targetAmount: Number(g.target_amount ?? g.targetAmount ?? 100),
    currentAmount: Number(g.current_amount ?? g.currentAmount ?? 0),
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

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pulse_theme') || 'dark';
  });

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

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
      // 1. Fetch in parallel for high throughput
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
        supabase.from('habits').select('*').order('created_at', { ascending: true }),
        supabase.from('habit_completions').select('*'),
        supabase.from('monthly_allocations').select('*'),
        supabase.from('transactions').select('*').order('transaction_date', { ascending: false }),
        supabase.from('goals').select('*, sub_goals(*)').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('deadlines').select('*').order('deadline_date', { ascending: true }),
        supabase.from('activities').select('*').order('activity_date', { ascending: false }),
        supabase.from('journal_entries').select('*').order('entry_date', { ascending: false })
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
        mood: j.mood || 'productive'
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

      // Real-time synchronization across devices & browsers
      const channel = supabase
        .channel('pulse-realtime-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          () => {
            fetchUserData();
          }
        )
        .subscribe();

      return () => {
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
    const cleanExp = Math.max(0, Number(expenseBudget) || 0);
    const cleanInv = Math.max(0, Number(investmentGoal) || 0);

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
      await supabase.from('habits').update({ streak: newStreak }).eq('id', habitId);
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
    setHabits(prev => prev.filter(h => h.id !== id));
    if (userId) {
      await supabase.from('habits').delete().eq('id', id);
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

  const deleteTransaction = async (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (userId) {
      await supabase.from('transactions').delete().eq('id', id);
    }
  };

  // Overall financial calculations
  const totalSpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalInvested = transactions
    .filter(t => t.type === 'investment')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const remainingBalance = monthlyBudget - totalSpent;
  const daysInMonth = 31;
  const currentDayOfMonth = getISTDate().getDate();
  const daysRemaining = daysInMonth - currentDayOfMonth;
  const dailyBurnRate = currentDayOfMonth > 0 ? (totalSpent / currentDayOfMonth) : 0;
  const targetDailyBurn = daysInMonth > 0 ? (monthlyBudget / daysInMonth) : 0;

  // --- Goals Operations ---
  const addGoal = async (newGoal) => {
    if (userId) {
      const { data, error } = await supabase.from('goals').insert({
        user_id: userId,
        title: newGoal.title.trim(),
        horizon: newGoal.horizon || 'short',
        category: newGoal.category || 'Financial',
        target_amount: Number(newGoal.targetAmount) || 100,
        current_amount: Number(newGoal.currentAmount) || 0,
        unit: newGoal.unit || '₹',
        deadline: newGoal.deadline || null,
        color: newGoal.color || 'indigo',
        icon: newGoal.icon || 'Target'
      }).select().single();

      if (!error && data) {
        setGoals(prev => [normalizeGoal(data), ...prev]);
      }
    } else {
      setGoals(prev => [normalizeGoal({ ...newGoal, id: `g-${Date.now()}` }), ...prev]);
    }
  };

  const updateGoal = async (updatedGoal) => {
    const normalized = normalizeGoal(updatedGoal);
    setGoals(prev => prev.map(g => (g.id === normalized.id ? normalized : g)));

    if (userId) {
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
      }).eq('id', normalized.id);
    }
  };

  const deleteGoal = async (goalId) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    if (userId) {
      await supabase.from('goals').delete().eq('id', goalId);
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
      }).eq('id', subGoalId);
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

  const updateTaskPriority = async (taskId, newPriority) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, priority: newPriority } : t)));
    if (userId) {
      await supabase.from('tasks').update({ priority: newPriority }).eq('id', taskId);
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
      }).eq('id', taskId);
    }
  };

  const deleteTask = async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (userId) {
      await supabase.from('tasks').delete().eq('id', taskId);
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

  const deleteDeadline = async (id) => {
    setDeadlines(prev => prev.filter(d => d.id !== id));
    if (userId) {
      await supabase.from('deadlines').delete().eq('id', id);
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

  const deleteActivity = async (actId) => {
    setActivities(prev => prev.filter(a => a.id !== actId));
    if (userId) {
      await supabase.from('activities').delete().eq('id', actId);
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
        deleteDeadline,

        // Habits
        habits,
        isHabitDoneOn,
        isDateEditable,
        toggleHabitForDate,
        toggleHabitDay,
        addHabit,
        deleteHabit,
        getDayCompletionStats,

        // Activities
        activities,
        addActivity,
        deleteActivity,

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
        deleteTransaction,
        totalSpent,
        totalIncome,
        totalInvested,
        remainingBalance,
        dailyBurnRate,
        targetDailyBurn,
        daysRemaining,

        // Tasks
        tasks,
        addTask,
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
