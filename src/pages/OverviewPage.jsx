import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';
import { RoutineWidget } from '../components/routines/RoutineWidget';
import { RemindersList } from '../components/reminders/RemindersList';
import { SmartFocusBanner } from '../components/focus/SmartFocusBanner';
import { DailyCockpitModal } from '../components/focus/DailyCockpitModal';
import { getISTDateString } from '../utils/dateUtils';

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
      
      {/* ☀️ 1. MORNING PLANNING FLOW & EVENING REVIEW CARD (Full-Width) */}
      <RoutineWidget />

      {/* ⏰ 2. REMINDERS & URGENT DEADLINES (Full-Width) */}
      <RemindersList />

      {/* 🧠 3. "WHERE TO FOCUS" 5-PILLAR STRATEGIC ENGINE (Tasks, Habits, Finance, Activity, Goals) */}
      <SmartFocusBanner />

      {/* 🚀 30-Second Morning Cockpit Modal (Auto-opens on first visit each day, dismissable) */}
      <DailyCockpitModal
        isOpen={showDailyCockpit}
        onClose={() => setShowDailyCockpit(false)}
      />

    </div>
  );
};
