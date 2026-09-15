import React, { useState } from 'react';
import { MoneyTracker } from '../components/finance/MoneyTracker';
import { Wallet, Plus } from 'lucide-react';

export const FinancePage = () => {
  const [openAddModalTrigger, setOpenAddModalTrigger] = useState(0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="glass-panel-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        <button
          onClick={() => setOpenAddModalTrigger(prev => prev + 1)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Transaction</span>
        </button>
      </div>

      {/* Main Money Tracker Component (With Time-Horizon filters & Investment logging) */}
      <MoneyTracker openAddModalTrigger={openAddModalTrigger} />

    </div>
  );
};
