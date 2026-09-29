import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';
import { RoutineWidget } from '../components/routines/RoutineWidget';
import { RemindersList } from '../components/reminders/RemindersList';
import { SmartFocusBanner } from '../components/focus/SmartFocusBanner';
import { DailyCockpitModal } from '../components/focus/DailyCockpitModal';
import { getISTDateString } from '../utils/dateUtils';
import { Zap } from 'lucide-react';

export const OverviewPage = () => {
  const { habits, tasks, isLoadingData } = useDashboard();
  
  // Show onboarding by default if brand new user (0 habits and 0 tasks)
  const isBrandNewUser = !isLoadingData && habits?.length === 0 && tasks?.length === 0;
  const [showOnboarding, setShowOnboarding] = useState(true);

  // 30-Second Morning Cockpit state: auto-opens on first daily visit if enabled
  const [showDailyCockpit, setShowDailyCockpit] = useState(() => {
    if (typeof window === 'undefined') return false;
    const todayStr = getISTDateString();
    const lastCockpit = localStorage.getItem('pulse_last_cockpit_date');
    const autoOpenPref = localStorage.getItem('pulse_auto_open_cockpit') !== 'false';
    return lastCockpit !== todayStr && autoOpenPref;
  });

  if (isBrandNewUser && showOnboarding) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <OnboardingWizard onDismiss={() => setShowOnboarding(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 🚀 Daily Standup Quick Launcher Bar */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-cyan-500/10 border border-indigo-500/20 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <Zap className="w-4 h-4 fill-indigo-500 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white">Daily Operating Cockpit</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Lock in your top 3 priorities & habit rhythm</p>
          </div>
        </div>

        <button
          onClick={() => setShowDailyCockpit(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>30s Check-In</span>
        </button>
      </div>

      {/* ☀️ 1. MORNING PLANNING FLOW & EVENING REVIEW CARD (Full-Width) */}
      <RoutineWidget />

      {/* ⏰ 2. REMINDERS & URGENT DEADLINES (Full-Width) */}
      <RemindersList />

      {/* 🧠 3. "WHERE TO FOCUS" 5-PILLAR STRATEGIC ENGINE (Tasks, Habits, Finance, Activity, Goals) */}
      <SmartFocusBanner />

      {/* 🚀 30-Second Morning Cockpit Modal */}
      <DailyCockpitModal
        isOpen={showDailyCockpit}
        onClose={() => setShowDailyCockpit(false)}
      />

    </div>
  );
};
