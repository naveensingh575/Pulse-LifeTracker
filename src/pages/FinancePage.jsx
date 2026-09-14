import React from 'react';
import { MoneyTracker } from '../components/finance/MoneyTracker';
import { useDashboard } from '../context/DashboardContext';
import { Wallet, PieChart, TrendingUp, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const FinancePage = () => {
  const { transactions = [], totalSpent = 0, totalIncome = 0, totalInvested = 0, formatCurrency } = useDashboard();

  const safeIncome = Number(totalIncome) || 0;
  const safeInvested = Number(totalInvested) || 0;
  const safeSpent = Number(totalSpent) || 0;
  const netCashflow = safeIncome - safeSpent;

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
              +{formatCurrency(safeIncome)}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Total Invested</span>
            <span className="font-extrabold text-indigo-600 dark:text-cyan-400 text-sm">
              {formatCurrency(safeInvested)}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Net Cashflow</span>
            <span className={`font-extrabold text-sm ${netCashflow >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatCurrency(netCashflow)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Money Tracker Component (With Time-Horizon filters & Investment logging) */}
      <MoneyTracker />

    </div>
  );
};
