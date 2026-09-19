import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard, SUPPORTED_CURRENCIES } from '../../context/DashboardContext';
import { useAuth } from '../../context/AuthContext';
import { PulseLogo } from '../common/PulseLogo';
import { DeleteAccountModal } from '../auth/DeleteAccountModal';
import { getLocalDateString, formatDisplayDate } from '../../utils/dateUtils';
import { Sun, Moon, Calendar, LogOut, ChevronDown, LogIn, Globe, Search, Trash2, Shield } from 'lucide-react';

export const Navbar = ({ onOpenQuickCapture }) => {
  const { theme, toggleTheme, currency, setCurrency } = useDashboard();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

        {/* Action Controls & User Avatar Menu */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Dynamic Global Currency Switcher — min 44px touch target on mobile */}
          <div className="relative flex items-center">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold py-2 pl-2.5 pr-7 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer transition appearance-none min-h-[36px] touch-manipulation"
              title="Select Global Currency"
              aria-label="Select Currency"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.symbol} value={c.symbol} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {c.symbol} {c.code}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Light/Dark Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-800 touch-manipulation"
            aria-label="Toggle theme"
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* User Profile Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2.5 p-1 px-2 min-h-[36px] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-800 cursor-pointer touch-manipulation"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/30"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden sm:inline">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>

                  {/* Privacy Policy */}
                  <Link
                    to="/privacy"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-indigo-500" />
                    <span>Privacy Policy</span>
                  </Link>

                  {/* Sign Out */}
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-slate-500" />
                    <span>Sign Out</span>
                  </button>

                  {/* Divider */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-1 mt-1">
                    {/* Delete Account — danger zone */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowDeleteModal(true);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </Link>
          )}

        </div>

      </div>
    </header>

    {/* Delete Account Confirmation Modal — rendered outside header to avoid stacking context issues */}
    {showDeleteModal && (
      <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
    )}
  </>
  );
};

