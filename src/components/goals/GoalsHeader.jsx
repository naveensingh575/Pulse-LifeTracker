import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { GoalModal, GOAL_ICONS } from './GoalModal';
import {
  Target,
  Compass,
  Plus,
  PiggyBank,
  Activity,
  Award,
  Rocket,
  Briefcase,
  Plane,
  Home,
  Flame,
  Heart,
  Edit3,
  Calendar,
  CheckSquare,
  Square,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const iconMap = {
  PiggyBank,
  Activity,
  Award,
  Rocket,
  Briefcase,
  Plane,
  Home,
  Target,
  Compass,
  Flame,
  Heart
};

const colorThemeStyles = {
  emerald: {
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    bar: 'bg-emerald-500',
    border: 'border-emerald-500/30',
    glow: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
    accentText: 'text-emerald-600 dark:text-emerald-400'
  },
  indigo: {
    badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    bar: 'bg-indigo-500',
    border: 'border-indigo-500/30',
    glow: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10',
    accentText: 'text-indigo-600 dark:text-indigo-400'
  },
  amber: {
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    bar: 'bg-amber-500',
    border: 'border-amber-500/30',
    glow: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
    accentText: 'text-amber-600 dark:text-amber-400'
  },
  rose: {
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    bar: 'bg-rose-500',
    border: 'border-rose-500/30',
    glow: 'hover:border-rose-500/50 hover:shadow-rose-500/10',
    accentText: 'text-rose-600 dark:text-rose-400'
  },
  cyan: {
    badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    bar: 'bg-cyan-500',
    border: 'border-cyan-500/30',
    glow: 'hover:border-cyan-500/50 hover:shadow-cyan-500/10',
    accentText: 'text-cyan-600 dark:text-cyan-400'
  },
  violet: {
    badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    bar: 'bg-violet-500',
    border: 'border-violet-500/30',
    glow: 'hover:border-violet-500/50 hover:shadow-violet-500/10',
    accentText: 'text-violet-600 dark:text-violet-400'
  },
  slate: {
    badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    bar: 'bg-slate-500',
    border: 'border-slate-500/30',
    glow: 'hover:border-slate-500/50 hover:shadow-slate-500/10',
    accentText: 'text-slate-600 dark:text-slate-400'
  }
};

export const GoalsHeader = () => {
  const { goals, addGoal, updateGoal, deleteGoal, toggleGoalSubGoal, addSubGoalToGoal } = useDashboard();
  
  // Horizon Filter state: 'all' | 'short' | 'long'
  const [horizonFilter, setHorizonFilter] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  
  // Expand/collapse subgoals map
  const [expandedGoals, setExpandedGoals] = useState({});

  const toggleExpand = (goalId, e) => {
    e.stopPropagation();
    setExpandedGoals(prev => ({ ...prev, [goalId]: !prev[goalId] }));
  };

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleSave = (goalData) => {
    if (editingGoal) {
      updateGoal(goalData);
    } else {
      addGoal(goalData);
    }
  };

  // Filter goals by horizon
  const shortGoalsCount = goals.filter(g => g.horizon === 'short').length;
  const longGoalsCount = goals.filter(g => g.horizon === 'long').length;

  const filteredGoals = goals.filter(g => {
    if (horizonFilter === 'short') return g.horizon === 'short';
    if (horizonFilter === 'long') return g.horizon === 'long';
    return true;
  });

  return (
    <section className="space-y-4">
      
      {/* Section Header & Horizon Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Objectives</h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Horizon Filter Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setHorizonFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                horizonFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All Goals ({goals.length})
            </button>

            <button
              onClick={() => setHorizonFilter('short')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                horizonFilter === 'short'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>⚡ Short-Term</span>
              <span className="text-[10px] opacity-80">({shortGoalsCount})</span>
            </button>

            <button
              onClick={() => setHorizonFilter('long')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                horizonFilter === 'long'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>🏔️ Long-Term</span>
              <span className="text-[10px] opacity-80">({longGoalsCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Goals Card Grid */}
      {filteredGoals.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-xs text-slate-500">No {horizonFilter !== 'all' ? `${horizonFilter}-term` : ''} goals found.</p>
          <button
            onClick={handleOpenAdd}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            + Create New Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGoals.map((goal) => {
            const IconComp = iconMap[goal.icon] || Target;
            const styles = colorThemeStyles[goal.color] || colorThemeStyles.indigo;
            const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const subGoals = goal.subGoals || [];
            const completedSubGoalsCount = subGoals.filter(s => s.completed).length;
            const isExpanded = Boolean(expandedGoals[goal.id]);

            return (
              <div
                key={goal.id}
                onClick={() => handleOpenEdit(goal)}
                className={`group relative glass-card-dark rounded-2xl p-4 border border-slate-200 dark:border-slate-800 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md ${styles.glow} flex flex-col justify-between`}
              >
                
                <div>
                  {/* Top Bar: Icon, Category & Horizon Badge */}
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-xl border ${styles.badge} shadow-sm`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles.badge}`}>
                          {goal.category}
                        </span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                          goal.horizon === 'short'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {goal.horizon === 'short' ? '⚡ Short' : '🏔️ Long'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(goal);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                      title="Edit Goal"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Deadline */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-white transition line-clamp-2 mb-1.5">
                    {goal.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                    <span className="flex items-center gap-1 text-[11px] font-mono">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {goal.deadline}
                    </span>
                    <span className={`font-extrabold font-mono ${styles.accentText}`}>{percent}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-600 dark:text-slate-400 font-medium">
                      <span>{['$', '₹', '€', '£', '¥', 'CAD', 'AUD'].includes(goal.unit) ? `${goal.unit}${Number(goal.currentAmount).toLocaleString()}` : `${goal.currentAmount} ${goal.unit}`}</span>
                      <span>{['$', '₹', '€', '£', '¥', 'CAD', 'AUD'].includes(goal.unit) ? `${goal.unit}${Number(goal.targetAmount).toLocaleString()}` : `${goal.targetAmount} ${goal.unit}`}</span>
                    </div>
                  </div>
                </div>

                {/* NESTED MILESTONES (For Long-Term Goals or goals with subGoals) */}
                {subGoals.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5">
                    <div
                      onClick={(e) => toggleExpand(goal.id, e)}
                      className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-500 cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-indigo-500" />
                        <span>Milestones ({completedSubGoalsCount}/{subGoals.length})</span>
                      </span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </div>

                    {isExpanded && (
                      <div className="space-y-1 pt-1 max-h-32 overflow-y-auto pr-1">
                        {subGoals.map((sg) => (
                          <div
                            key={sg.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleGoalSubGoal(goal.id, sg.id);
                            }}
                            className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 text-[10px] hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                          >
                            <div className="flex items-center space-x-1.5 flex-1 pr-1">
                              {sg.completed ? (
                                <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              )}
                              <span className={`line-clamp-1 ${sg.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                {sg.title}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-slate-400 shrink-0">{sg.targetDate}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={deleteGoal}
        initialData={editingGoal}
      />
    </section>
  );
};
