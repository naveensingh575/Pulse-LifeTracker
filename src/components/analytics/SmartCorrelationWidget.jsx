import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { generateSmartCorrelations } from '../../utils/correlationUtils';
import {
  Sparkles,
  Zap,
  Flame,
  Wallet,
  Activity,
  ArrowRight
} from 'lucide-react';

const ICON_MAP = {
  Zap,
  Flame,
  Wallet,
  Activity
};

const COLOR_MAP = {
  indigo: {
    badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    border: 'hover:border-indigo-500/40'
  },
  amber: {
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    border: 'hover:border-amber-500/40'
  },
  emerald: {
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    border: 'hover:border-emerald-500/40'
  },
  cyan: {
    badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    border: 'hover:border-cyan-500/40'
  }
};

export const SmartCorrelationWidget = () => {
  const { activities, tasks, habits, transactions, isHabitDoneOn, currency } = useDashboard();

  const correlations = generateSmartCorrelations({
    activities,
    tasks,
    habits,
    transactions,
    isHabitDoneOn,
    currency
  });

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/20 via-slate-900/60 to-purple-950/20 border border-indigo-500/20 shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              Smart Pulse Intelligence
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-bold uppercase tracking-wider">
                Cross-Pillar AI
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Empirical cause-and-effect correlations across your habits, workouts, cashflow & focus
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {correlations.map(item => {
          const IconComponent = ICON_MAP[item.icon] || Zap;
          const styles = COLOR_MAP[item.color] || COLOR_MAP.indigo;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 ${styles.border} transition flex flex-col justify-between space-y-3`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wide uppercase text-slate-400">
                    {item.pillar}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles.badge}`}>
                    {item.tag}
                  </span>
                </div>

                <div className="flex items-start space-x-2.5 pt-1">
                  <div className={`p-1.5 rounded-lg border shrink-0 ${styles.iconBg}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                    {item.headline}
                  </h4>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pt-0.5">
                  {item.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
