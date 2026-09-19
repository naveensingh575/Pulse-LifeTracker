import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardProvider } from './context/DashboardContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthPage } from './components/auth/AuthPage';

import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { CommandPalette } from './components/common/CommandPalette';

import { OverviewPage } from './pages/OverviewPage';
import { HabitsPage } from './pages/HabitsPage';
import { FinancePage } from './pages/FinancePage';
import { GoalsPage } from './pages/GoalsPage';
import { TasksPage } from './pages/TasksPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { JournalPage } from './pages/JournalPage';
import { ActivityPage } from './pages/ActivityPage';
import { PrivacyPage } from './pages/PrivacyPage';

import { ShieldCheck, Loader2, WifiOff } from 'lucide-react';

// ── Global Email Verified Success Overlay ────────────────────────────────────
// Renders on top of all routing when the user clicks their verification link.
const EmailVerifiedOverlay = () => {
  const { emailVerified, setEmailVerified } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!emailVerified) return;
    const timer = setTimeout(() => {
      setEmailVerified(false);
      navigate('/');
    }, 2500);
    return () => clearTimeout(timer);
  }, [emailVerified, navigate, setEmailVerified]);

  if (!emailVerified) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-6">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="z-10 space-y-5 max-w-sm w-full">
        {/* Success icon */}
        <div className="flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 flex items-center justify-center ring-4 ring-emerald-500/20">
            <ShieldCheck className="w-10 h-10 text-emerald-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Authentication Successful!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Your email has been verified and your account is now active.
            Taking you to your dashboard…
          </p>
        </div>

        {/* Animated progress bar */}
        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{
              animation: 'pulse-fill 2.5s ease-in-out forwards',
              width: '0%'
            }}
          />
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
          <span>Entering Pulse Life Tracker…</span>
        </div>
      </div>

      <style>{`
        @keyframes pulse-fill {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
};

const AppLayout = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Offline / Online detection — purely informational, no state mutations
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors">
      <Navbar onOpenQuickCapture={() => setIsCommandPaletteOpen(true)} />

      {/* Offline Banner — shown only when network is unavailable */}
      {!isOnline && (
        <div className="sticky top-[env(safe-area-inset-top,0px)] z-40 w-full bg-amber-500 text-white px-4 py-2 flex items-center justify-center space-x-2 text-xs font-bold shadow-md">
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>You're offline — connect to the internet to sync your data.</span>
        </div>
      )}

      <div className="flex flex-1">
        <Sidebar />
        {/* Safe-area-aware main padding: pb-24 for mobile bottom nav + home bar inset */}
        <main
          className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full lg:pb-12"
          style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Routes>
        </main>
      </div>

      {/* 📱 Dedicated Mobile 5-Tab Navigation Dock */}
      <MobileBottomNav onOpenQuickCapture={() => setIsCommandPaletteOpen(true)} />

      {/* ⚡ Global Spotlight Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <DashboardProvider>
          {/* Global email-verified overlay — renders on top of any route */}
          <EmailVerifiedOverlay />
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/reset-password" element={<AuthPage initialMode="update-password" />} />
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

