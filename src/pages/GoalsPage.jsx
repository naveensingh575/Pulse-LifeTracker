import React from 'react';
import { GoalsHeader } from '../components/goals/GoalsHeader';
import { PredictiveFeasibility } from '../components/goals/PredictiveFeasibility';
import { Target } from 'lucide-react';

export const GoalsPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="glass-panel-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Strategic Target Goals & Feasibility
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Milestones, deadlines, progress tracking & run-rate feasibility predictions (₹)</p>
          </div>
        </div>
      </div>

      {/* Goal Cards Header Component */}
      <GoalsHeader />

      {/* Predictive Feasibility Engine */}
      <PredictiveFeasibility />

    </div>
  );
};
