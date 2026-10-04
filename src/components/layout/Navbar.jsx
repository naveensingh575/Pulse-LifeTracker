import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/AuthContext';
import { PulseLogo } from '../common/PulseLogo';
import { ProfileCardModal } from '../profile/ProfileCardModal';
import { getLocalDateString, formatDisplayDate } from '../../utils/dateUtils';
import {
  Calendar,
  Search,
  Sparkles,
  ChevronDown,
  User,
  LogIn,
  SlidersHorizontal
} from 'lucide-react';

export const Navbar = ({ onOpenQuickCapture }) => {
  const { subscriptionTier, openPricingModal, trialInfo } = useDashboard();
  const { user } = useAuth();
  const [showProfileCard, setShowProfileCard] = useState(false);

  const currentDateStr = formatDisplayDate(getLocalDateString());

  return (
    // z-50 ensures the navbar sits above the MobileBottomNav (z-40) and its drawer (z-60 backdrop)
    // padding-top: env(safe-area-inset-top) pushes content below the iPhone Dynamic Island / notch
    <>
      <header
        className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80 transition-colors"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Tagline — touch-friendly on mobile */}
          <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 min-h-[44px] touch-manipulation">
            <PulseLogo size="md" />
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                PULSE <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">Life Tracker</span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic hidden sm:block">"Your Life, in Rhythm."</p>
            </div>
          </Link>

          {/* Center: Date Display & Quick Capture Pill */}
          <div className="hidden md:flex items-center space-x-2.5">
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>{currentDateStr}</span>
            </div>

            {onOpenQuickCapture && (
              <button
                onClick={onOpenQuickCapture}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-800 transition cursor-pointer"
                title="Quick Capture (Cmd + K)"
              >
                <Search className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-medium">Quick Capture</span>
                <kbd className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">⌘K</kbd>
              </button>
            )}
          </div>

          {/* Action Controls & Unified Profile Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">

            {/* Pro Preview Trial Pill */}
            {trialInfo?.isTrialActive && subscriptionTier === 'free' && (
              <button
                onClick={openPricingModal}
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition cursor-pointer shrink-0"
                title="7-Day Pro Preview Active — Click to Upgrade"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Pro Trial: {trialInfo.trialDaysRemaining}d left</span>
              </button>
            )}

            {/* Profile & Preferences Portal Button */}
            {user ? (
              <button
                onClick={() => setShowProfileCard(true)}
                className="flex items-center space-x-2 p-1.5 sm:px-2.5 min-h-[38px] rounded-xl bg-slate-100/90 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 transition cursor-pointer touch-manipulation group"
                title="Open Profile & Preferences"
                aria-label="Profile and Settings"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="w-7 h-7 rounded-lg object-cover ring-1.5 ring-indigo-500/40 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {user.name ? user.name[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none truncate max-w-[110px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                    {subscriptionTier === 'founder' || subscriptionTier === 'lifetime' ? '👑 Lifetime' :
                     subscriptionTier === 'yearly' || subscriptionTier === 'monthly' ? '✨ Pro' :
                     '🌱 Free'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition shrink-0" />
              </button>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setShowProfileCard(true)}
                  className="flex items-center space-x-1.5 p-1.5 sm:px-2.5 min-h-[38px] rounded-xl bg-slate-100/90 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 transition cursor-pointer touch-manipulation group"
                  title="Preferences (Theme, Currency, Support)"
                  aria-label="Open Preferences"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">Preferences</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Theme & Currency</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition shrink-0" />
                </button>

                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-3 py-1.5 min-h-[38px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition cursor-pointer shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              </div>
            )}

          </div>

        </div>
      </header>

      {/* Unified Profile & Preferences Modal */}
      <ProfileCardModal
        isOpen={showProfileCard}
        onClose={() => setShowProfileCard(false)}
      />
    </>
  );
};
