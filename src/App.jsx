import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth, clearRecoveryUrlAndState } from './context/AuthContext';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
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
import { PolicyPage } from './pages/PolicyPage';
import { PricingModal } from './components/pricing/PricingModal';
import { SundayReviewModal } from './components/review/SundayReviewModal';
import { AppInstallModal } from './components/common/AppInstallModal';
import { PwaInstallBanner } from './components/common/PwaInstallBanner';
import { checkAndTriggerScheduledReminders } from './utils/notificationUtils';
import { captureIncomingReferral, shouldShowReferralBanner, dismissReferralBanner } from './utils/referralUtils';

import { WifiOff, Sparkles, ArrowRight, X, Gift } from 'lucide-react';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installPlatform, setInstallPlatform] = useState('android');
  const [incomingReferral, setIncomingReferral] = useState(null);
  const [showReferralBanner, setShowReferralBanner] = useState(false);

  // 🎁 Viral Referral Engine: capture ?ref= on mount
  useEffect(() => {
    const refData = captureIncomingReferral();
    if (refData && shouldShowReferralBanner()) {
      setIncomingReferral(refData);
      setShowReferralBanner(true);
    }
  }, []);

  // Sanitize any stale recovery URL parameters or storage flags once inside dashboard
  useEffect(() => {
    clearRecoveryUrlAndState();
  }, []);

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

  // 🔔 30-Day Retention Loop: Check and dispatch scheduled morning/evening reminder pings
  useEffect(() => {
    checkAndTriggerScheduledReminders();
    const interval = setInterval(() => {
      checkAndTriggerScheduledReminders();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const location = useLocation();
  const { openPricingModal, isSundayReviewOpen, openSundayReview, closeSundayReview } = useDashboard();

  // 📋 Sunday Executive Review Auto-Trigger: opens at or after 9 PM (21:00) on Sundays upon opening/login
  useEffect(() => {
    const today = new Date();
    const isSunday = today.getDay() === 0;
    const currentHour = today.getHours();
    
    // Triggers strictly on Sunday at or after 9:00 PM (21:00)
    if (isSunday && currentHour >= 21) {
      const todayDateStr = today.toISOString().split('T')[0];
      const reviewedToday = localStorage.getItem(`pulse_sunday_reviewed_${todayDateStr}`);
      if (!reviewedToday) {
        // Delay slightly for smooth initial page hydration
        const timer = setTimeout(() => {
          openSundayReview();
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [openSundayReview]);

  // If user navigates directly to /subscription or /pricing (via URL, bookmark, or direct link)
  useEffect(() => {
    if (location.pathname === '/subscription' || location.pathname === '/pricing') {
      openPricingModal();
      navigate('/', { replace: true });
    }
  }, [location.pathname, openPricingModal, navigate]);

  const handleExitGuestMode = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors">
      {/* 🚀 Guest Mode Interactive Sandbox Banner */}
      {user?.isGuest && (
        <div
          className="relative z-50 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white px-3.5 sm:px-6 shadow-md transition-all"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
            paddingBottom: '12px'
          }}
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4 text-xs sm:text-sm font-medium">
            <div className="flex items-center space-x-2.5">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              <span className="leading-snug">
                <strong className="font-bold">Guest Demo Sandbox:</strong> You are exploring full Pulse features. Changes persist in this session.
              </span>
            </div>
            <div className="flex items-center justify-end w-full sm:w-auto shrink-0 pt-0.5 sm:pt-0">
              <button
                onClick={handleExitGuestMode}
                className="w-full sm:w-auto justify-center px-4 py-2 sm:py-1.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer touch-manipulation"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🎁 Viral Referral Welcome Banner */}
      {showReferralBanner && (
        <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-amber-600 via-indigo-600 to-emerald-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between text-xs sm:text-sm font-medium shadow-md animate-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="p-1 rounded-lg bg-white/20 shrink-0">
              <Gift className="w-4 h-4 text-amber-200" />
            </div>
            <span className="truncate">
              <strong className="font-bold">VIP Invite Activated:</strong> You were invited by <span className="font-mono underline underline-offset-2">{incomingReferral?.code}</span>! Enjoy <strong className="font-bold text-amber-200">14 Days of Pulse Pro Exploration</strong> on us.
            </span>
          </div>
          <div className="flex items-center space-x-2 shrink-0 ml-2">
            <button
              onClick={() => {
                dismissReferralBanner();
                setShowReferralBanner(false);
              }}
              className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
            <Route path="/policy" element={<PolicyPage />} />
            <Route path="/privacy" element={<PolicyPage defaultTab="privacy" />} />
            <Route path="/terms" element={<PolicyPage defaultTab="terms" />} />
            <Route path="/refund-policy" element={<PolicyPage defaultTab="refund" />} />
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

      {/* 📲 PWA Smart Mobile Install Prompter Banner */}
      <PwaInstallBanner
        onOpenInstallGuide={(platform) => {
          setInstallPlatform(platform);
          setShowInstallModal(true);
        }}
      />

      {/* 📲 PWA Step-by-Step Install Instructions Modal */}
      <AppInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        initialPlatform={installPlatform}
      />

      {/* 📋 Sunday Executive Review & Weekly Synthesis Modal */}
      <SundayReviewModal
        isOpen={isSundayReviewOpen}
        onClose={closeSundayReview}
      />

      {/* 👑 Pulse Membership & Founder Pass Modal */}
      <PricingModal />
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

