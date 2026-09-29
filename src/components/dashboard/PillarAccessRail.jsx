import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import { getISTDateString, getISTYearMonth } from '../../utils/dateUtils';
import { isLivingBudgetExpense } from '../../utils/financeUtils';
import { Flame, CheckSquare, Wallet, Dumbbell, Compass, BookOpen, LineChart } from 'lucide-react';

const colorMap = {
  amber: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', hover: 'hover:border-amber-500/40', icon: 'text-amber-500' },
  indigo: { bg: 'bg-indigo-500/5', border: 'border-indigo-500/20', hover: 'hover:border-indigo-500/40', icon: 'text-indigo-500' },
  emerald: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', hover: 'hover:border-emerald-500/40', icon: 'text-emerald-500' },
  cyan: { bg: 'bg-cyan-500/5', border: 'border-cyan-500/20', hover: 'hover:border-cyan-500/40', icon: 'text-cyan-500' },
  purple: { bg: 'bg-purple-500/5', border: 'border-purple-500/20', hover: 'hover:border-purple-500/40', icon: 'text-purple-500' },
  rose: { bg: 'bg-rose-500/5', border: 'border-rose-500/20', hover: 'hover:border-rose-500/40', icon: 'text-rose-500' },
  sky: { bg: 'bg-sky-500/5', border: 'border-sky-500/20', hover: 'hover:border-sky-500/40', icon: 'text-sky-500' },
};

export const PillarAccessRail = () => {
  const navigate = useNavigate();
  const {
    habits = [],
    tasks = [],
    transactions = [],
    isHabitDoneOn = () => false,
    isHabitActiveOnDate = () => true,
    formatCurrency = (val) => `₹${Number(val || 0).toLocaleString()}`,
    currency = '₹'
  } = useDashboard() || {};

  const todayStr = getISTDateString();
  const activeHabits = habits.filter(h => isHabitActiveOnDate(h, todayStr));
  const completedHabits = activeHabits.filter(h => isHabitDoneOn(h.id, todayStr)).length;
  const openTasks = tasks.filter(t => !t.completed).length;

  const currentISTYM = getISTYearMonth();
  const currentMonthKey = `${currentISTYM.year}-${String(currentISTYM.month).padStart(2, '0')}`;
  const todaySpend = transactions
    .filter(t => t.date === todayStr && isLivingBudgetExpense(t))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const pillars = [
    { icon: Flame, label: `${completedHabits}/${activeHabits.length}`, sublabel: 'Habits', route: '/habits', color: 'amber' },
    { icon: CheckSquare, label: `${openTasks}`, sublabel: 'Tasks', route: '/tasks', color: 'indigo' },
    { icon: Wallet, label: formatCurrency(todaySpend), sublabel: 'Today', route: '/finance', color: 'emerald' },
    { icon: Dumbbell, label: null, sublabel: 'Activity', route: '/activity', color: 'cyan' },
    { icon: Compass, label: null, sublabel: 'Goals', route: '/goals', color: 'purple' },
    { icon: BookOpen, label: null, sublabel: 'Journal', route: '/journal', color: 'rose' },
    { icon: LineChart, label: null, sublabel: 'Analytics', route: '/analytics', color: 'sky' },
  ];

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
    >
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {pillars.map((p) => {
        const IconComp = p.icon;
        const colors = colorMap[p.color] || colorMap.indigo;
        return (
          <button
            key={p.route}
            type="button"
            onClick={() => navigate(p.route)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border whitespace-nowrap snap-start shrink-0 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer min-h-[48px] ${colors.bg} ${colors.border} ${colors.hover}`}
          >
            <IconComp className={`w-4 h-4 ${colors.icon}`} />
            <div className="flex flex-col items-start justify-center">
              {p.label && (
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 font-mono leading-none mb-0.5">
                  {p.label}
                </span>
              )}
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
                {p.sublabel}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default PillarAccessRail;
