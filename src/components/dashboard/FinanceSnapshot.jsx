import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import { getISTDateString, getISTDate, getISTYearMonth } from '../../utils/dateUtils';
import {
  Wallet,
  ArrowRight,
  Plus,
  TrendingUp,
  X,
  Check,
  ArrowUpRight
} from 'lucide-react';

export const FinanceSnapshot = () => {
  const {
    transactions,
    addTransaction,
    getMonthlyAllocation,
    currency,
    formatCurrency
  } = useDashboard();

  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [quickDesc, setQuickDesc] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickCategory, setQuickCategory] = useState('Food');

  const todayStr = getISTDateString();
  const currentISTYM = getISTYearMonth();
  const currentMonthKey = `${currentISTYM.year}-${String(currentISTYM.month).padStart(2, '0')}`;
  
  const activeAllocation = getMonthlyAllocation(currentMonthKey);
  const monthlyBudgetCap = activeAllocation.expenseBudget;

  // Calculate actual spend for current month
  const monthExpenses = transactions
    .filter(t => t.type === 'expense' && t.date && t.date.startsWith(currentMonthKey))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // Today's actual expense
  const todayExpenses = transactions
    .filter(t => t.type === 'expense' && t.date === todayStr)
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const daysInMonth = 31;
  const currentDayNum = getISTDate().getDate();
  const safeDailyPace = monthlyBudgetCap > 0 ? (monthlyBudgetCap / daysInMonth) : 0;
  const remainingBudget = monthlyBudgetCap - monthExpenses;
  const consumptionPct = monthlyBudgetCap > 0 ? Math.round((monthExpenses / monthlyBudgetCap) * 100) : 0;

  const handleQuickExpenseSubmit = (e) => {
    e.preventDefault();
    const parsed = parseFloat(quickAmount);
    if (isNaN(parsed) || parsed <= 0 || !quickDesc.trim()) return;

    addTransaction({
      description: quickDesc.trim(),
      amount: parsed,
      type: 'expense',
      category: quickCategory,
      date: todayStr,
      notes: 'Quick expense from My Pulse'
    });

    setQuickDesc('');
    setQuickAmount('');
    setIsQuickExpenseOpen(false);
  };

  const getHealthColor = (pct) => {
    if (pct > 90) return { bar: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' };
    if (pct >= 70) return { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' };
    return { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' };
  };

  const colorStyle = getHealthColor(consumptionPct);

  return (
    <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between relative">
      
      {/* Header with deep-link */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Cash Flow & Burn-Rate Gauge</h3>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsQuickExpenseOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Expense</span>
          </button>

          <Link
            to="/finance"
            className="flex items-center space-x-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition group"
          >
            <span>Manage Finances</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Monthly Budget Consumption Bar */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {formatCurrency(monthExpenses)}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              / {formatCurrency(monthlyBudgetCap)}
            </span>
          </div>

          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono ${colorStyle.badge}`}>
            {monthlyBudgetCap > 0 ? `${consumptionPct}% Used` : 'No Budget Set'}
          </span>
        </div>

        {/* Consumption Bar */}
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${colorStyle.bar}`}
            style={{ width: `${Math.min(100, consumptionPct)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>Remaining Budget:</span>
          <span className={`font-mono font-bold ${remainingBudget >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatCurrency(remainingBudget)}
          </span>
        </div>
      </div>

      {/* Daily Pacing Metric Card */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <ArrowUpRight className="w-4 h-4 text-emerald-500 shrink-0" />
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(todayExpenses)} spent today
            </p>
            <p className="text-[10px] text-slate-500">
              Safe Daily Allowance: <strong className="text-slate-700 dark:text-slate-300">{formatCurrency(Math.round(safeDailyPace))}/day</strong>
            </p>
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
          todayExpenses <= safeDailyPace
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
        }`}>
          {todayExpenses <= safeDailyPace ? 'Within Pace 🟢' : 'Over Pace ⚠️'}
        </span>
      </div>

      {/* Lightweight Quick Expense Modal */}
      {isQuickExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h4 className="text-sm font-bold flex items-center gap-1.5">
                <span className="text-emerald-500 font-extrabold text-base">{currency}</span>
                Log Quick Expense
              </h4>
              <button onClick={() => setIsQuickExpenseOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickExpenseSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coffee, Metro Ticket, Lunch"
                  value={quickDesc}
                  onChange={e => setQuickDesc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    placeholder="150"
                    value={quickAmount}
                    onChange={e => setQuickAmount(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={quickCategory}
                    onChange={e => setQuickCategory(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Food">Food & Dining</option>
                    <option value="Transport">Transport</option>
                    <option value="Bills">Bills</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuickExpenseOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
