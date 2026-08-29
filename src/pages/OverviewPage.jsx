import React from 'react';
import { SmartFocusBanner } from '../components/focus/SmartFocusBanner';
import { RoutineWidget } from '../components/routines/RoutineWidget';
import { PrioritizedTasks } from '../components/dashboard/PrioritizedTasks';
import { RemindersList } from '../components/reminders/RemindersList';
import { HabitSnapshot } from '../components/dashboard/HabitSnapshot';
import { FinanceSnapshot } from '../components/dashboard/FinanceSnapshot';

export const OverviewPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 🧠 1. "WHERE TO FOCUS" SMART ENGINE (Top 3 Priority Directives for Today) */}
      <SmartFocusBanner />

      {/* ☀️ 2. HORIZONTAL MORNING PLANNING FLOW & EVENING REVIEW CARD (Full-Width Single Card) */}
      <RoutineWidget />

      {/* ⚡ 3. ROW 1: PRIORITIZED ACTION BOARD & REMINDERS/DEADLINES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Prioritized Action Board (High-Priority tasks for Today) */}
        <PrioritizedTasks />

        {/* Right: Reminders & Urgent Deadlines (Due in next 72 hrs) */}
        <RemindersList />
      </div>

      {/* 📊 4. ROW 2: HABIT RHYTHM SNAPSHOT & CASH FLOW/BURN-RATE GAUGE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Habit Rhythm Snapshot (Today's ring + 1-tap pending habits + top streak) */}
        <HabitSnapshot />

        {/* Right: Cash Flow & Burn-Rate Gauge (Budget bar + daily pace meter + quick expense) */}
        <FinanceSnapshot />
      </div>

    </div>
  );
};
