import React from 'react';
import { MoneyTracker } from '../components/finance/MoneyTracker';
import { useDashboard } from '../context/DashboardContext';
import { Wallet, PieChart, TrendingUp, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const FinancePage = () => {
  const { transactions, totalSpent, totalIncome, totalInvested } = useDashboard();

  // Dynamically calculate category spending from actual logged expense transactions
  const getCategorySpent = (catName) => {
    return transactions
      .filter(t => t.type === 'expense' && t.category?.toLowerCase() === catName.toLowerCase())
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  };

  // Category limits breakdown
  const categoryLimits = [
    { category: 'Food & Dining', spent: getCategorySpent('Food'), limit: 0, color: 'bg-rose-500' },
    { category: 'Bills & Utilities', spent: getCategorySpent('Bills'), limit: 0, color: 'bg-blue-500' },
    { category: 'Shopping & Tech', spent: getCategorySpent('Shopping'), limit: 0, color: 'bg-purple-500' },
    { category: 'Health & Wellness', spent: getCategorySpent('Health'), limit: 0, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="glass-panel-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Financial Pulse Hub
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="bg-slate-50 dark:bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Total Inflow</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
              +₹{totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Total Invested</span>
            <span className="font-extrabold text-indigo-600 dark:text-cyan-400 text-sm">
              ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Net Cashflow</span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
              ₹{(totalIncome - totalSpent).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Money Tracker Component (With Time-Horizon filters & Investment logging) */}
      <MoneyTracker />

    </div>
  );
};
