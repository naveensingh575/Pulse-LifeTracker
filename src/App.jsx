import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DashboardProvider } from './context/DashboardContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthPage } from './components/auth/AuthPage';

import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

import { OverviewPage } from './pages/OverviewPage';
import { HabitsPage } from './pages/HabitsPage';
import { FinancePage } from './pages/FinancePage';
import { GoalsPage } from './pages/GoalsPage';
import { TasksPage } from './pages/TasksPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { JournalPage } from './pages/JournalPage';
import { ActivityPage } from './pages/ActivityPage';

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full pb-24 lg:pb-12">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <DashboardProvider>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </DashboardProvider>
      </AuthProvider>
    </HashRouter>
  );
}
