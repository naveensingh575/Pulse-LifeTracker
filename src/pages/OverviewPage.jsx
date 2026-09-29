import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';
import { TodayCommandHero } from '../components/dashboard/TodayCommandHero';
import { PillarAccessRail } from '../components/dashboard/PillarAccessRail';
import { ActionableToday } from '../components/dashboard/ActionableToday';
import { FinanceDeadlinePulse } from '../components/dashboard/FinanceDeadlinePulse';
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
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* 🌟 1. TODAY'S COMMAND HERO — Greeting + Pulse Ring + Focus Directive + 30s Check-In + Morning/Evening */}
      <TodayCommandHero onOpenCockpit={() => setShowDailyCockpit(true)} />

      {/* ⚡ 2. 7-PILLAR QUICK ACCESS RAIL — Swipeable chips with live badges */}
      <PillarAccessRail />

      {/* 🎯 3. ACTIONABLE TODAY — Top 3 Must-Win Tasks + Pending Habits Grid */}
      <ActionableToday />

      {/* 📊 4. FINANCIAL & DEADLINE PULSE — Budget Gauge + Daily Pace + Top 3 Deadlines */}
      <FinanceDeadlinePulse />

      {/* 🚀 30-Second Morning Cockpit Modal (kept as-is) */}
      <DailyCockpitModal
        isOpen={showDailyCockpit}
        onClose={() => setShowDailyCockpit(false)}
      />

    </div>
  );
};
