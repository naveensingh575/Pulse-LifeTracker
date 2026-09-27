import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import {
  LayoutDashboard,
  Flame,
  Dumbbell,
  Wallet,
  Compass,
  CheckSquare,
  BookOpen,
  LineChart,
  Shield,
  Sparkles,
  Crown,
  ArrowRight
} from 'lucide-react';

export const Sidebar = () => {
  const {
    goals,
    habits,
    activities,
    tasks,
    remainingBalance,
    journalEntries,
    currency,
    subscriptionTier,
    openPricingModal
  } = useDashboard();

  const navItems = [
    { to: '/', label: 'My Pulse', icon: LayoutDashboard },
    { to: '/habits', label: 'Habits', icon: Flame, badge: `${habits ? habits.length : 0}` },
    { to: '/activity', label: 'Activity', icon: Dumbbell, badge: `${activities ? activities.length : 0}` },
    { to: '/finance', label: 'Financial Pulse', icon: Wallet, badge: `${currency}${remainingBalance > 1000 ? (remainingBalance / 1000).toFixed(0) + 'k' : remainingBalance.toFixed(0)}` },
    { to: '/goals', label: 'Goals', icon: Compass, badge: `${goals ? goals.length : 0}` },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare, badge: `${tasks ? tasks.filter(t => !t.completed).length : 0}` },
    { to: '/journal', label: 'Journal', icon: BookOpen, badge: `${journalEntries ? journalEntries.length : 0}` },
    { to: '/analytics', label: 'Analytics', icon: LineChart, tag: 'AI' }
  ];

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-4rem)] border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/60 p-4 space-y-6 shrink-0 transition-colors">
        
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-2">Navigation</p>
          
          {navItems.map((item) => {
            const IconC = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <IconC className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    {item.badge}
                  </span>
                )}
                {item.tag && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 font-bold uppercase tracking-wider">
                    {item.tag}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Membership & Founder Pass Status Widget */}
        <div className="mt-auto">
          {subscriptionTier === 'founder' ? (
            <div
              onClick={openPricingModal}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 border border-emerald-500/30 text-xs space-y-1.5 cursor-pointer hover:border-emerald-500/50 transition group"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Founder Active</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold">
                  Lifetime
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-snug">
                Full unlocked access to all intelligence suites.
              </p>
            </div>
          ) : (
            <div
              onClick={openPricingModal}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-cyan-50/80 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-slate-950 border border-indigo-200 dark:border-indigo-500/30 text-xs space-y-2 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500/60 transition shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>Founder Pass</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400">
                  Early Pass
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-snug">
                Claim 100% free lifetime access with your early invite code.
              </p>
              <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                <span>Unlock Pass</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          )}
        </div>

        {/* Privacy Policy Footer Link */}
        <NavLink
          to="/privacy"
          className="flex items-center justify-center gap-1 text-[11px] text-slate-400 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition py-1"
        >
          🔒 Privacy Policy
        </NavLink>

      </aside>
    </>
  );
};
