import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { TransactionModal } from './TransactionModal';
import {
  getISTDateString,
  getISTYearMonth,
  getISTWeekDays,
  getISTWeekBadge,
  formatISTDisplayDate,
  MONTH_NAMES_FULL
} from '../../utils/dateUtils';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  TrendingUp,
  Edit2,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  PiggyBank,
  Check,
  X,
  PieChart,
  Layers
} from 'lucide-react';

export const MoneyTracker = () => {
  const {
    getMonthlyAllocation,
    setMonthlyAllocation,
    transactions,
    addTransaction,
    deleteTransaction,
    currency,
    formatCurrency
  } = useDashboard();

  // Time-Horizon state: 'day' | 'week' | 'month'
  const [timeframe, setTimeframe] = useState('month');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // IST Date & Period Selectors
  const currentISTYM = getISTYearMonth();
  const todayStr = getISTDateString();
  const [selectedYear, setSelectedYear] = useState(currentISTYM.year);
  const [selectedMonth, setSelectedMonth] = useState(currentISTYM.month); // 1-12
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  
  // Current active month key
  const activeMonthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const activeAllocation = getMonthlyAllocation(activeMonthKey) || { expenseBudget: 0, investmentGoal: 0 };
  
  // Modal temp state
  const [tempExpenseBudget, setTempExpenseBudget] = useState((activeAllocation.expenseBudget || 0).toString());
  const [tempInvestmentGoal, setTempInvestmentGoal] = useState((activeAllocation.investmentGoal || 0).toString());

  // Week navigation offset (0 = current week, -1 = last week, +1 = next week)
  const [weekOffset, setWeekOffset] = useState(0);

  const getWeekRefDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + (weekOffset * 7));
    return d;
  };

  const activeWeekRef = getWeekRefDate();
  const currentWeekDays = getISTWeekDays(activeWeekRef);
  const weekStartStr = currentWeekDays[0]?.dateStr || todayStr;
  const weekEndStr = currentWeekDays[6]?.dateStr || todayStr;
  const weekBadge = getISTWeekBadge(activeWeekRef);
  const isCurrentWeek = weekOffset === 0;

  const years = [2025, 2026, 2027, 2028];

  const handleOpenBudgetModal = () => {
    const currentAlloc = getMonthlyAllocation(activeMonthKey) || { expenseBudget: 0, investmentGoal: 0 };
    setTempExpenseBudget((currentAlloc.expenseBudget || 0).toString());
    setTempInvestmentGoal((currentAlloc.investmentGoal || 0).toString());
    setIsBudgetModalOpen(true);
  };

  const handleSaveBudgetModal = (e) => {
    e.preventDefault();
    const exp = parseFloat(tempExpenseBudget) || 0;
    const inv = parseFloat(tempInvestmentGoal) || 0;
    setMonthlyAllocation(activeMonthKey, {
      expenseBudget: Math.max(0, exp),
      investmentGoal: Math.max(0, inv)
    });
    setIsBudgetModalOpen(false);
  };

  // Month navigation helpers
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

  // Filter transactions by active Time-Horizon
  const getFilteredByTimeframe = () => {
    const list = Array.isArray(transactions) ? transactions : [];
    if (timeframe === 'day') {
      return list.filter(t => t.date === selectedDate);
    }
    if (timeframe === 'week') {
      return list.filter(t => t.date && t.date >= weekStartStr && t.date <= weekEndStr);
    }
    // Month
    return list.filter(t => t.date && t.date.startsWith(activeMonthKey));
  };

  const timeframeTransactions = getFilteredByTimeframe();

  // 1. Total Inflow (Salary / Income) for this period
  const periodIncome = timeframeTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // 2. Total Everyday Expenses Spent
  const periodExpenses = timeframeTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // 3. Total Investments Made (Wealth Asset Allocation)
  const periodInvested = timeframeTransactions
    .filter(t => t.type === 'investment')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // 4. Monthly Expense Budget & Remaining Limit
  const expenseBudget = Number(activeAllocation?.expenseBudget) || 0;
  const investmentGoal = Number(activeAllocation?.investmentGoal) || 0;
  const remainingExpenseBudget = expenseBudget - periodExpenses;
  
  // Budget consumption percentage & health color
  const consumptionPct = expenseBudget > 0
    ? Math.round((periodExpenses / expenseBudget) * 100)
    : 0;

  const getBudgetColor = (pct) => {
    if (pct > 90) return { bar: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' };
    if (pct >= 70) return { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' };
    return { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' };
  };

  const budgetColor = getBudgetColor(consumptionPct);

  // 5. Net Leftover / Unallocated Cash from Total Income
  // Formula: Leftover = Total Income - (Actual Expenses Spent + Total Investments Made)
  const leftoverCash = periodIncome - (periodExpenses + periodInvested);

  // Category filter for transaction list
  const displayTransactions = timeframeTransactions.filter(t => {
    if (filterCategory === 'All') return true;
    if (filterCategory === 'Expense') return t.type === 'expense';
    if (filterCategory === 'Income') return t.type === 'income';
    if (filterCategory === 'Investment') return t.type === 'investment';
    return t.category === filterCategory;
  });

  return (
    <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-5">
      
      {/* Header & Time-Horizon Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Ledger & Income Hub</h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Buttons: Day | Week | Month */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {[
              { id: 'day', label: 'Day' },
              { id: 'week', label: 'Week' },
              { id: 'month', label: 'Month' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimeframe(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  timeframe === tab.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsTxModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Transaction</span>
          </button>
        </div>
      </div>

      {/* Dynamic Date / Month Selectors Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Month View Dropdowns */}
        {timeframe === 'month' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-500 dark:text-slate-400">Active Month:</span>
            
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer"
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
              className="px-3 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 cursor-pointer font-mono"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="text-slate-400 pl-1">
              Ledger for: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{MONTH_NAMES_FULL[selectedMonth - 1]} {selectedYear}</strong>
            </span>
          </div>
        )}

        {/* Day View Input */}
        {timeframe === 'day' && (
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-500 dark:text-slate-400">Select Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100"
            />
            <span className="text-slate-400">
              {selectedDate === todayStr ? '(Today)' : formatISTDisplayDate(selectedDate)}
            </span>
          </div>
        )}

        {/* Week View Controls */}
        {timeframe === 'week' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-500 dark:text-slate-400">Active Week:</span>
            
            <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setWeekOffset(prev => prev - 1)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer transition"
                title="Previous Week"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="px-2 py-0.5 font-mono font-bold text-emerald-700 dark:text-emerald-300 text-xs">
                {weekBadge}
              </span>

              {!isCurrentWeek && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
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
          </div>
        )}

        <div className="text-slate-500 dark:text-slate-400 font-mono text-xs">
          Transactions: <strong className="text-slate-900 dark:text-slate-100">{timeframeTransactions.length}</strong>
        </div>
      </div>

      {/* 💰 4-CARD INCOME-FIRST SUMMARY BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* 1. Total Income (Inflow) */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Income (Inflow)</span>
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            +{formatCurrency(periodIncome)}
          </p>
        </div>

        {/* 2. Expense Budget Health */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Expense Budget Health</span>
            <div className="flex items-center space-x-1">
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${budgetColor.badge}`}>
                {consumptionPct}% Used
              </span>
              <button
                onClick={handleOpenBudgetModal}
                className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Configure Budget Allocation"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <div className="flex items-baseline justify-between text-xs">
            <span className={`text-base font-extrabold font-mono ${budgetColor.text}`}>
              {formatCurrency(periodExpenses)}
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              / {formatCurrency(expenseBudget)}
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${budgetColor.bar}`}
              style={{ width: `${Math.min(100, consumptionPct)}%` }}
            />
          </div>

          <p className="text-[10px] text-slate-500 font-medium flex justify-between">
            <span>Remaining:</span>
            <span className={`font-bold font-mono ${remainingExpenseBudget >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatCurrency(remainingExpenseBudget)}
            </span>
          </p>
        </div>

        {/* 3. Total Invested (Wealth Asset Allocation) */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Invested</span>
            <div className="p-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20">
              <TrendingUp className="w-3 h-3" />
            </div>
          </div>
          <p className="text-lg font-extrabold text-indigo-600 dark:text-cyan-400 font-mono">
            {formatCurrency(periodInvested)}
          </p>
          {investmentGoal > 0 && (
            <p className="text-[10px] text-slate-500 font-medium font-mono">
              Goal: {formatCurrency(investmentGoal)} ({Math.round((periodInvested / investmentGoal) * 100)}%)
            </p>
          )}
        </div>

        {/* 4. Net Leftover / Unallocated Cash */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Leftover / Surplus Cash</span>
            <PiggyBank className={`w-3.5 h-3.5 ${leftoverCash >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
          </div>
          <p className={`text-lg font-extrabold font-mono ${leftoverCash >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatCurrency(leftoverCash)}
          </p>
        </div>

      </div>

      {/* 🌊 CASH FLOW ALLOCATION PIPELINE VISUALIZER (When Income > 0) */}
      {timeframe === 'month' && periodIncome > 0 && (
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <span>Income Allocation Distribution</span>
            </span>
            <span className="font-mono text-slate-500 text-[11px]">
              Total Inflow: {formatCurrency(periodIncome)}
            </span>
          </div>

          {/* Segmented Flow Bar */}
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden flex border border-slate-300 dark:border-slate-800">
            {/* Actual Expenses Spent Portion */}
            {periodExpenses > 0 && (
              <div
                className="bg-rose-500 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((periodExpenses / periodIncome) * 100))}%` }}
                title={`Expenses Spent: ${formatCurrency(periodExpenses)} (${Math.round((periodExpenses / periodIncome) * 100)}%)`}
              />
            )}
            {/* Investments Portion */}
            {periodInvested > 0 && (
              <div
                className="bg-indigo-500 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((periodInvested / periodIncome) * 100))}%` }}
                title={`Investments: ${formatCurrency(periodInvested)} (${Math.round((periodInvested / periodIncome) * 100)}%)`}
              />
            )}
            {/* Leftover Surplus Portion */}
            {leftoverCash > 0 && (
              <div
                className="bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((leftoverCash / periodIncome) * 100))}%` }}
                title={`Leftover Surplus: ${formatCurrency(leftoverCash)} (${Math.round((leftoverCash / periodIncome) * 100)}%)`}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-0.5">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Expenses: {formatCurrency(periodExpenses)} ({Math.round((periodExpenses / periodIncome) * 100)}%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Investments: {formatCurrency(periodInvested)} ({Math.round((periodInvested / periodIncome) * 100)}%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Surplus Cash: {formatCurrency(Math.max(0, leftoverCash))} ({Math.max(0, Math.round((leftoverCash / periodIncome) * 100))}%)</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Transaction Feed */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between overflow-x-auto pb-1 gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0">
            Transaction History ({displayTransactions.length})
          </span>
          <div className="flex items-center space-x-1 text-xs overflow-x-auto">
            {['All', 'Expense', 'Income', 'Investment', 'Food', 'Bills', 'Shopping'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {displayTransactions.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <p className="text-xs text-slate-500 italic">No transactions found for this period.</p>
              <button
                onClick={() => setIsTxModalOpen(true)}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                + Log a Transaction
              </button>
            </div>
          ) : (
            displayTransactions.map((tx) => (
              <div
                key={tx.id}
                className="group flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/80 transition"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      tx.type === 'income'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : tx.type === 'investment'
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : tx.type === 'investment' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {tx.description}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      <span>{tx.date}</span>
                      <span>•</span>
                      
                      {tx.type === 'investment' ? (
                        <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-700 dark:text-cyan-300 border border-indigo-500/20 font-bold">
                          🟣 {tx.category || 'Investment'}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                          {tx.category}
                        </span>
                      )}

                      {tx.notes && (
                        <span className="text-slate-400 italic">
                          "{tx.notes}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`text-xs font-extrabold font-mono ${
                      tx.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : tx.type === 'investment'
                        ? 'text-indigo-600 dark:text-cyan-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : tx.type === 'investment' ? '📈 ' : '-'}{currency}{Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>

                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                    title="Delete Transaction"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={addTransaction}
      />

      {/* Set Monthly Budget Allocation Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Set Budget Allocation
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {MONTH_NAMES_FULL[selectedMonth - 1]} {selectedYear}
                </p>
              </div>
              <button onClick={() => setIsBudgetModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBudgetModal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Expense Living Budget ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 40000"
                  value={tempExpenseBudget}
                  onChange={e => setTempExpenseBudget(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Portion of income dedicated to monthly living expenses and bills.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Investment Goal (Optional {currency})
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 25000"
                  value={tempInvestmentGoal}
                  onChange={e => setTempInvestmentGoal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm font-mono font-bold text-indigo-600 dark:text-cyan-400 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Planned monthly savings and investment targets.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Save Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
