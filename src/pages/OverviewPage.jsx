import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';
import { RoutineWidget } from '../components/routines/RoutineWidget';
import { RemindersList } from '../components/reminders/RemindersList';
import { SmartFocusBanner } from '../components/focus/SmartFocusBanner';
import { DailyCockpitModal } from '../components/focus/DailyCockpitModal';
import { getISTDateString } from '../utils/dateUtils';

export const OverviewPage = () => {
  const { habits, tasks, isLoadingData } = useDashboard();
  
  // Track whether user has completed or dismissed onboarding
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('pulse_onboarding_completed') !== 'true';
  });

  const [hasStartedOnboarding, setHasStartedOnboarding] = useState(false);
  const isBrandNewUser = habits?.length === 0 && tasks?.length === 0;

  // Once data is loaded initially, if brand new user and onboarding not completed, start onboarding
  useEffect(() => {
    if (!isLoadingData && isBrandNewUser && showOnboarding) {
      setHasStartedOnboarding(true);
    }
  }, [isLoadingData, isBrandNewUser, showOnboarding]);

  // If user has existing habits or tasks, mark onboarding as completed
  useEffect(() => {
    if (habits?.length > 0 || tasks?.length > 0) {
      setShowOnboarding(false);
      localStorage.setItem('pulse_onboarding_completed', 'true');
    }
  }, [habits?.length, tasks?.length]);

  const handleDismissOnboarding = () => {
    setShowOnboarding(false);
    setHasStartedOnboarding(false);
    localStorage.setItem('pulse_onboarding_completed', 'true');
    try {
      sessionStorage.removeItem('pulse_onboarding_step');
    } catch {}
  };

  // 30-Second Morning Cockpit state: auto-opens on first daily visit if enabled
  const [showDailyCockpit, setShowDailyCockpit] = useState(() => {
    if (typeof window === 'undefined') return false;
    const todayStr = getISTDateString();
    const lastCockpit = localStorage.getItem('pulse_last_cockpit_date');
    const autoOpenPref = localStorage.getItem('pulse_auto_open_cockpit') !== 'false';
    return lastCockpit !== todayStr && autoOpenPref;
  });

  if (hasStartedOnboarding && showOnboarding) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <OnboardingWizard onDismiss={handleDismissOnboarding} />
      </div>
    );
  }

  // Smooth loading spinner on initial load if user might be brand new
  if (isLoadingData && !hasStartedOnboarding && showOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
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
