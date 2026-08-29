import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialGoals,
  initialDeadlines,
  initialHabits,
  initialActivities,
  initialTransactions,
  initialTasks,
  initialJournalEntries
} from '../data/seedData';
import {
  getISTDateString,
  getISTWeekDays,
  getISTDate,
  getISTDateDiffDays,
  isDateEditable,
  getISTYearMonth
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

// Normalize habit object to ensure completions map and completedDays exist
const normalizeHabit = (h) => {
  const completions = h.completions || {};
  const currentWeek = getISTWeekDays();
  const completedDays = currentWeek.map(w => Boolean(completions[w.dateStr]));
  const createdAt = h.createdAt || '2026-08-01';
  const streak = calculateHabitStreak(completions, createdAt);

  return {
    ...h,
    createdAt,
    completions,
    completedDays,
    streak
  };
};

// Normalize goal to ensure horizon, color, icon, and subGoals exist
const normalizeGoal = (g) => {
  return {
    ...g,
    horizon: g.horizon || (g.deadline && getISTDateDiffDays(getISTDateString(), g.deadline) > 90 ? 'long' : 'short'),
    icon: g.icon || 'Target',
    color: g.color || 'indigo',
    subGoals: Array.isArray(g.subGoals) ? g.subGoals : []
  };
};

export const DashboardProvider = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pulse_theme') || 'dark';
  });

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Navigation view state: 'overview' | 'analytics'
  const [activeView, setActiveView] = useState('overview');

  // One-time clean start migration to remove any legacy seed/demo data
  useEffect(() => {
    const isCleaned = localStorage.getItem('pulse_clean_v10');
    if (!isCleaned) {
      localStorage.setItem('pulse_monthly_allocations', JSON.stringify({}));
      localStorage.setItem('pulse_transactions', JSON.stringify([]));
      localStorage.setItem('pulse_tasks', JSON.stringify([]));
      localStorage.setItem('pulse_deadlines', JSON.stringify([]));
      localStorage.setItem('pulse_journal_entries', JSON.stringify([]));
      localStorage.setItem('pulse_habits', JSON.stringify([]));
      localStorage.setItem('pulse_activities', JSON.stringify([]));
      localStorage.setItem('pulse_goals', JSON.stringify([]));
      localStorage.setItem('pulse_clean_v10', 'true');

      setGoals([]);
      setDeadlines([]);
      setHabits([]);
      setActivities([]);
      setMonthlyAllocations({});
      setTransactions([]);
      setTasks([]);
      setJournalEntries([]);
    }
  }, []);

  // Goals state
  const [goals, setGoals] = useState(() => {
    if (!localStorage.getItem('pulse_clean_v10')) return [];
    const saved = localStorage.getItem('pulse_goals');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.map(normalizeGoal);
  });

  // Deadlines state
  const [deadlines, setDeadlines] = useState(() => {
    if (!localStorage.getItem('pulse_clean_v10')) return [];
    const saved = localStorage.getItem('pulse_deadlines');
    return saved ? JSON.parse(saved) : [];
  });

  // Habits state with normalized completions
  const [habits, setHabits] = useState(() => {
    if (!localStorage.getItem('pulse_clean_v10')) return [];
    const saved = localStorage.getItem('pulse_habits');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.map(normalizeHabit);
  });

  // Activities state (Gym, Running, Swimming, Reading)
  const [activities, setActivities] = useState(() => {
    if (!localStorage.getItem('pulse_clean_v10')) return [];
    const saved = localStorage.getItem('pulse_activities');
    return saved ? JSON.parse(saved) : [];
  });

  // Monthly Allocations Dictionary { [YYYY-MM]: { expenseBudget: number, investmentGoal: number } }
  // Strictly isolated per month. By default, any unconfigured month is 0.
  const [monthlyAllocations, setMonthlyAllocations] = useState(() => {
    if (!localStorage.getItem('pulse_clean_v10')) return {};
    const saved = localStorage.getItem('pulse_monthly_allocations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  // Strictly get allocation for a specific month. Defaults strictly to 0. No cross-month inheritance.
  const getMonthlyAllocation = (ymStr) => {
    if (monthlyAllocations && monthlyAllocations[ymStr]) {
      return {
        expenseBudget: Number(monthlyAllocations[ymStr].expenseBudget) || 0,
        investmentGoal: Number(monthlyAllocations[ymStr].investmentGoal) || 0
      };
    }
    return { expenseBudget: 0, investmentGoal: 0 };
  };

  // Strictly set allocation for a specific month only.
  const setMonthlyAllocation = (ymStr, { expenseBudget, investmentGoal }) => {
    const cleanExp = Math.max(0, Number(expenseBudget) || 0);
    const cleanInv = Math.max(0, Number(investmentGoal) || 0);
    
    setMonthlyAllocations(prev => {
      const next = {
        ...(prev || {}),
        [ymStr]: { expenseBudget: cleanExp, investmentGoal: cleanInv }
      };
      localStorage.setItem('pulse_monthly_allocations', JSON.stringify(next));
      return next;
    });
  };

  const getBudgetForMonth = (ymStr) => getMonthlyAllocation(ymStr).expenseBudget;
  const setBudgetForMonth = (ymStr, amount) => {
    const curr = getMonthlyAllocation(ymStr);
    setMonthlyAllocation(ymStr, { expenseBudget: amount, investmentGoal: curr.investmentGoal });
  };

  const currentISTMonthKey = getISTDateString().substring(0, 7);
  const monthlyBudget = getBudgetForMonth(currentISTMonthKey);
  const setMonthlyBudget = (amount) => setBudgetForMonth(currentISTMonthKey, amount);

  // Transactions state
  const [transactions, setTransactions] = useState(() => {
    if (!localStorage.getItem('pulse_clean_v10')) return [];
    const saved = localStorage.getItem('pulse_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // To-Do Tasks state
  const [tasks, setTasks] = useState(() => {
    if (!localStorage.getItem('pulse_clean_v10')) return [];
    const saved = localStorage.getItem('pulse_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  // Journal Entries state
  const [journalEntries, setJournalEntries] = useState(() => {
    if (!localStorage.getItem('pulse_clean_v10')) return [];
    const saved = localStorage.getItem('pulse_journal_entries');
    return saved ? JSON.parse(saved) : [];
  });

  // Apply dark mode class to html element
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

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('pulse_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('pulse_deadlines', JSON.stringify(deadlines));
  }, [deadlines]);

  useEffect(() => {
    localStorage.setItem('pulse_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('pulse_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('pulse_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('pulse_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('pulse_journal_entries', JSON.stringify(journalEntries));
  }, [journalEntries]);

  // Reset/Clear demo data helper
  const resetToDemoData = () => {
    setGoals([]);
    setDeadlines([]);
    setHabits([]);
    setActivities([]);
    setMonthlyAllocations({});
    setTransactions([]);
    setTasks([]);
    setJournalEntries([]);
    localStorage.setItem('pulse_monthly_allocations', JSON.stringify({}));
    localStorage.setItem('pulse_transactions', JSON.stringify([]));
    localStorage.setItem('pulse_tasks', JSON.stringify([]));
    localStorage.setItem('pulse_deadlines', JSON.stringify([]));
    localStorage.setItem('pulse_journal_entries', JSON.stringify([]));
    localStorage.setItem('pulse_habits', JSON.stringify([]));
    localStorage.setItem('pulse_activities', JSON.stringify([]));
    localStorage.setItem('pulse_goals', JSON.stringify([]));
  };

  // --- Habits Handlers & Date-Keyed Engine ---

  const isHabitDoneOn = (habitId, dateStr) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit || !habit.completions) return false;
    return Boolean(habit.completions[dateStr]);
  };

  const toggleHabitForDate = (habitId, dateStr) => {
    if (!isDateEditable(dateStr)) {
      console.warn(`[PULSE Lock] Editing is locked for ${dateStr}. Allowed range: Last Week (Mon-Sun) and This Week (Mon-Today).`);
      return false;
    }

    setHabits(prev =>
      prev.map(h => {
        if (h.id !== habitId) return h;
        const currentCompletions = { ...(h.completions || {}) };
        const nextState = !currentCompletions[dateStr];
        
        if (nextState) {
          currentCompletions[dateStr] = true;
        } else {
          delete currentCompletions[dateStr];
        }

        const newStreak = calculateHabitStreak(currentCompletions, h.createdAt);
        const currentWeek = getISTWeekDays();
        const updatedCompletedDays = currentWeek.map(w => Boolean(currentCompletions[w.dateStr]));

        return {
          ...h,
          completions: currentCompletions,
          completedDays: updatedCompletedDays,
          streak: newStreak
        };
      })
    );
    return true;
  };

  const toggleHabitDay = (habitId, dayIndex) => {
    const currentWeek = getISTWeekDays();
    if (dayIndex < 0 || dayIndex >= currentWeek.length) return false;
    const targetDay = currentWeek[dayIndex];
    return toggleHabitForDate(habitId, targetDay.dateStr);
  };

  const getDayCompletionStats = (dateStr) => {
    const activeHabits = habits.filter(h => !h.createdAt || h.createdAt <= dateStr);
    if (activeHabits.length === 0) return { completed: 0, total: 0, percentage: 0 };

    const completed = activeHabits.filter(h => isHabitDoneOn(h.id, dateStr)).length;
    const total = activeHabits.length;
    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
  };

  const addHabit = (newHabit) => {
    const todayStr = getISTDateString();
    const habitCreatedAt = newHabit.createdAt || todayStr;
    const habitWithId = normalizeHabit({
      ...newHabit,
      id: `h-${Date.now()}`,
      createdAt: habitCreatedAt,
      completions: newHabit.completions || {},
      streak: 0
    });
    setHabits(prev => [...prev, habitWithId]);
  };

  const deleteHabit = (id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const resetHabitWeek = () => {
    const todayStr = getISTDateString();
    setHabits(prev =>
      prev.map(h => {
        const currentCompletions = { ...(h.completions || {}) };
        delete currentCompletions[todayStr];
        return normalizeHabit({
          ...h,
          completions: currentCompletions
        });
      })
    );
  };

  // --- Activities Handlers ---
  const addActivity = (newAct) => {
    const actWithId = {
      ...newAct,
      id: `act-${Date.now()}`
    };

    setActivities(prev => [actWithId, ...prev]);

    if (newAct.type === 'running' && newAct.distance > 0) {
      setGoals(prevGoals =>
        prevGoals.map(g => {
          if (g.category === 'Health' || g.title.toLowerCase().includes('run')) {
            const nextAmt = Math.min(g.targetAmount, Number((g.currentAmount + newAct.distance).toFixed(2)));
            return { ...g, currentAmount: nextAmt };
          }
          return g;
        })
      );
    }
  };

  const deleteActivity = (actId) => {
    setActivities(prev => prev.filter(a => a.id !== actId));
  };

  // --- Journal Handlers ---
  const saveJournalEntry = (dateStr, entryData) => {
    setJournalEntries(prev => {
      const existingIdx = prev.findIndex(e => e.date === dateStr);
      const updatedEntry = {
        id: existingIdx >= 0 ? prev[existingIdx].id : `j-${dateStr}`,
        date: dateStr,
        accomplished: entryData.accomplished || '',
        notes: entryData.notes || '',
        gratitude: entryData.gratitude || '',
        mood: entryData.mood || 'productive',
        updatedAt: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        const nextArr = [...prev];
        nextArr[existingIdx] = updatedEntry;
        return nextArr;
      } else {
        return [updatedEntry, ...prev];
      }
    });
  };

  const deleteJournalEntry = (dateStr) => {
    setJournalEntries(prev => prev.filter(e => e.date !== dateStr));
  };

  const getJournalEntry = (dateStr) => {
    return journalEntries.find(e => e.date === dateStr) || null;
  };

  // --- Goals Handlers ---
  const addGoal = (newGoal) => {
    const goalWithId = normalizeGoal({
      ...newGoal,
      id: `g-${Date.now()}`
    });
    setGoals(prev => [goalWithId, ...prev]);
  };

  const updateGoal = (updatedGoal) => {
    const normalized = normalizeGoal(updatedGoal);
    setGoals(prev => prev.map(g => (g.id === normalized.id ? normalized : g)));
  };

  const deleteGoal = (goalId) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const toggleGoalSubGoal = (goalId, subGoalId) => {
    setGoals(prev =>
      prev.map(g => {
        if (g.id !== goalId) return g;
        const updatedSubs = (g.subGoals || []).map(sg =>
          sg.id === subGoalId ? { ...sg, completed: !sg.completed } : sg
        );
        return {
          ...g,
          subGoals: updatedSubs
        };
      })
    );
  };

  const addSubGoalToGoal = (goalId, { title, targetDate }) => {
    if (!title || !title.trim()) return;
    setGoals(prev =>
      prev.map(g => {
        if (g.id !== goalId) return g;
        const newSub = {
          id: `sg-${Date.now()}`,
          title: title.trim(),
          targetDate: targetDate || g.deadline,
          completed: false
        };
        return {
          ...g,
          subGoals: [...(g.subGoals || []), newSub]
        };
      })
    );
  };

  // --- Deadlines Handlers ---
  const addDeadline = (newDeadline) => {
    const deadlineWithId = {
      ...newDeadline,
      id: `d-${Date.now()}`
    };
    setDeadlines(prev => [...prev, deadlineWithId].sort((a, b) => new Date(a.date) - new Date(b.date)));
  };

  const deleteDeadline = (id) => {
    setDeadlines(prev => prev.filter(d => d.id !== id));
  };

  // --- Money / Transactions Handlers ---
  const addTransaction = (newTx) => {
    const txWithId = {
      ...newTx,
      id: `t-${Date.now()}`
    };
    setTransactions(prev => [txWithId, ...prev]);
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Overall calculations across all time
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

  // --- Task Board Handlers ---
  const addTask = (newTask) => {
    const taskWithId = {
      ...newTask,
      id: `k-${Date.now()}`,
      completed: false
    };
    setTasks(prev => [taskWithId, ...prev]);
  };

  const updateTaskPriority = (taskId, newPriority) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, priority: newPriority } : t)));
  };

  const toggleTaskComplete = (taskId) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const isComp = !t.completed;
          return {
            ...t,
            completed: isComp,
            completedAt: isComp ? getISTDateString() : null
          };
        }
        return t;
      })
    );
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  return (
    <DashboardContext.Provider
      value={{
        theme,
        toggleTheme,
        activeView,
        setActiveView,
        resetToDemoData,

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
        getDayCompletionStats,
        resetHabitWeek,
        addHabit,
        deleteHabit,

        // Activities
        activities,
        addActivity,
        deleteActivity,

        // Money, Budgets & Allocations (Strictly Isolated Per Month, Default 0)
        monthlyAllocations,
        getMonthlyAllocation,
        setMonthlyAllocation,
        getBudgetForMonth,
        setBudgetForMonth,
        monthlyBudget,
        setMonthlyBudget,
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
