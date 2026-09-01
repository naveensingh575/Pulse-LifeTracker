import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Flame,
  Dumbbell,
  Wallet,
  Target,
  CheckSquare,
  BookOpen,
  LineChart,
  Cloud,
  LogOut,
  User
} from 'lucide-react';

export const Sidebar = () => {
  const { goals, habits, activities, tasks, remainingBalance, journalEntries } = useDashboard();
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/', label: 'My Pulse', icon: LayoutDashboard },
    { to: '/habits', label: 'Habits', icon: Flame, badge: `${habits.length}` },
    { to: '/activity', label: 'Activity Pulse', icon: Dumbbell, badge: `${activities ? activities.length : 0}` },
    { to: '/finance', label: 'Financial Pulse', icon: Wallet, badge: `₹${remainingBalance > 1000 ? (remainingBalance / 1000).toFixed(0) + 'k' : remainingBalance.toFixed(0)}` },
    { to: '/goals', label: 'Goals', icon: Target, badge: `${goals.length}` },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare, badge: `${tasks.filter(t => !t.completed).length}` },
    { to: '/journal', label: 'Journal Pulse', icon: BookOpen, badge: `${journalEntries ? journalEntries.length : 0}` },
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

        {/* User Account & Supabase Cloud Status at Bottom */}
        <div className="mt-auto space-y-3">
          {user ? (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center space-x-2.5">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/30"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px]">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Cloud className="w-3 h-3" /> Supabase Synced
                </span>

                <button
                  onClick={logout}
                  className="text-rose-600 dark:text-rose-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                  title="Sign out of your account"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 text-xs text-center space-y-2">
              <p className="font-bold text-indigo-700 dark:text-indigo-300">Guest Mode</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Sign in to sync across devices.</p>
              <NavLink
                to="/login"
                className="block w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition text-center"
              >
                Sign In
              </NavLink>
            </div>
          )}

          {/* Operating Tip Footer Widget */}
          <div className="bg-slate-50 dark:bg-gradient-to-br dark:from-indigo-950/40 dark:to-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-indigo-500/20 text-xs space-y-1">
            <p className="font-bold text-indigo-600 dark:text-indigo-300 flex items-center gap-1 text-[11px]">
              ✨ Cloud Operating Tip
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[10px]">
              Open PULSE on your phone and laptop to check off habits & log workouts in real-time!
            </p>
          </div>
        </div>

      </aside>

      {/* Mobile Bottom Sticky Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const IconC = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center space-y-1 transition ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              <IconC className="w-4 h-4" />
              <span className="text-[9px] truncate max-w-[55px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
