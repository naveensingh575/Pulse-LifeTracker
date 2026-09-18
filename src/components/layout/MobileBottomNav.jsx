import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Flame,
  CheckSquare,
  Wallet,
  MoreHorizontal,
  X,
  Dumbbell,
  Compass,
  BookOpen,
  LineChart,
  Plus,
  Sparkles
} from 'lucide-react';

export const MobileBottomNav = ({ onOpenQuickCapture }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();

  const primaryTabs = [
    { to: '/', label: 'Pulse', icon: LayoutDashboard },
    { to: '/habits', label: 'Habits', icon: Flame },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/finance', label: 'Finance', icon: Wallet }
  ];

  const secondaryTabs = [
    { to: '/activity', label: 'Activity & Fitness', icon: Dumbbell, desc: 'Gym, running, reading & recovery' },
    { to: '/goals', label: 'Life Goals', icon: Compass, desc: 'Short & long-horizon milestones' },
    { to: '/journal', label: 'Daily Journal', icon: BookOpen, desc: 'Evening reflections & mindset' },
    { to: '/analytics', label: 'Analytics AI', icon: LineChart, desc: 'Smart correlations & velocity' }
  ];

  const isSecondaryActive = secondaryTabs.some(item => location.pathname === item.to);

  return (
    <>
      {/* 📱 5-TOUCHPOINT DEDICATED BOTTOM BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/95 dark:bg-slate-950/95 border-t border-slate-200 dark:border-slate-800/90 h-16 px-2 flex items-center justify-around shadow-lg">
        {primaryTabs.map((item) => {
          const IconC = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setIsMoreOpen(false)}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <IconC className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </NavLink>
          );
        })}

        {/* 5th Tab: "More" Drawer Trigger */}
        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 cursor-pointer ${
            isMoreOpen || isSecondaryActive
              ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          aria-label="More navigation options"
        >
          <MoreHorizontal className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] mt-0.5 font-medium">More</span>
        </button>
      </nav>

      {/* 📂 "MORE" SLIDE-UP BOTTOM SHEET */}
      {isMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMoreOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl z-10 pb-20 animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  All Operations & Pillars
                </h3>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Capture Action Banner */}
            {onOpenQuickCapture && (
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  onOpenQuickCapture();
                }}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-between shadow-md shadow-indigo-600/25 transition cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-xl bg-white/20">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold">Quick Capture</p>
                    <p className="text-[10px] text-indigo-100">Instant task, expense or habit entry</p>
                  </div>
                </div>
                <Plus className="w-4 h-4" />
              </button>
            )}

            {/* Secondary Pillar Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {secondaryTabs.map((item) => {
                const IconC = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMoreOpen(false)}
                    className={`p-3 rounded-2xl border transition flex flex-col justify-between space-y-2 ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-400'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit">
                      <IconC className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className="text-[10px] text-slate-500 truncate">{item.desc}</p>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
