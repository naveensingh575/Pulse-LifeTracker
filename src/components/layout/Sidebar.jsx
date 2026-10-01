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

  const formatFinanceBadge = (bal) => {
    const num = Number(bal) || 0;
    if (num === 0) return `${currency}0`;
    const isNeg = num < 0;
    const abs = Math.abs(num);
    const formatted = abs >= 1000 ? `${(abs / 1000).toFixed(0)}k` : `${Math.round(abs)}`;
    return isNeg ? `-${currency}${formatted}` : `${currency}${formatted}`;
  };

  const navItems = [
    { to: '/', label: 'My Pulse', icon: LayoutDashboard },
    { to: '/habits', label: 'Habits', icon: Flame, badge: `${habits ? habits.length : 0}` },
    { to: '/activity', label: 'Activity', icon: Dumbbell, badge: `${activities ? activities.length : 0}` },
    { to: '/finance', label: 'Financial Pulse', icon: Wallet, badge: formatFinanceBadge(remainingBalance) },
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

        {/* Sidebar Footer: Subscription & Legal */}
        <div className="mt-auto pt-4 space-y-1 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={openPricingModal}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer group"
          >
            <div className="flex items-center space-x-2.5">
              <Crown className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
              <span>Subscription</span>
            </div>
            <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full ' + (
              subscriptionTier === 'founder' || subscriptionTier === 'lifetime'
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : subscriptionTier === 'yearly' || subscriptionTier === 'monthly'
                ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            )}>
              {subscriptionTier === 'founder' ? 'Founder' : subscriptionTier === 'lifetime' ? 'Lifetime' : subscriptionTier === 'yearly' ? 'Yearly' : subscriptionTier === 'monthly' ? 'Monthly' : 'Upgrade'}
            </span>
          </button>

          <NavLink
            to="/policy"
            className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition py-1"
          >
            📜 Policies & Legal
          </NavLink>
        </div>

      </aside>
    </>
  );
};
