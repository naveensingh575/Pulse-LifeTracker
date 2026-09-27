import React, { useState } from 'react';
import { GoalsHeader } from '../components/goals/GoalsHeader';
import { PredictiveFeasibility } from '../components/goals/PredictiveFeasibility';
import { GoalModal } from '../components/goals/GoalModal';
import { useDashboard } from '../context/DashboardContext';
import { Compass, Plus } from 'lucide-react';

export const GoalsPage = () => {
  const { addGoal, canAddGoal, quotaStatus, openPricingModal } = useDashboard();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleOpenCreateGoal = () => {
    if (!canAddGoal) {
      openPricingModal();
      return;
    }
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="glass-panel-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Goals & Viability</span>
              {quotaStatus && (
                <button
                  onClick={() => !quotaStatus.isPremium && openPricingModal()}
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                    quotaStatus.isPremium
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                      : quotaStatus.goals.isLimitReached
                        ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30 cursor-pointer'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                  title={quotaStatus.isPremium ? 'Unlimited Goals' : `${quotaStatus.goals.remaining} goal slots remaining. Click to upgrade for unlimited.`}
                >
                  {quotaStatus.isPremium ? '✨ Unlimited' : `${quotaStatus.goals.current} / ${quotaStatus.goals.max} Goals`}
                </button>
              )}
            </h2>
          </div>
        </div>

        <button
          onClick={handleOpenCreateGoal}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Goal</span>
        </button>
      </div>

      {/* Goal Cards Header Component */}
      <GoalsHeader />

      {/* Predictive Feasibility Engine */}
      <PredictiveFeasibility />

      {/* Add Goal Modal */}
      <GoalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={(data) => addGoal(data)}
      />

    </div>
  );
};
