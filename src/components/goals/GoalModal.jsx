import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  X,
  Target,
  Compass,
  Plus,
  Trash2,
  PiggyBank,
  Activity,
  Award,
  Rocket,
  Briefcase,
  Plane,
  Home,
  Flame,
  Heart,
  CheckCircle2,
  CheckSquare,
  Square,
  Calendar
} from 'lucide-react';
import { getISTDateString } from '../../utils/dateUtils';

export const GOAL_ICONS = [
  { id: 'Compass', label: 'Objective', emoji: '🧭', icon: Compass },
  { id: 'PiggyBank', label: 'Finance', emoji: '💰', icon: PiggyBank },
  { id: 'Activity', label: 'Fitness', emoji: '🏃', icon: Activity },
  { id: 'Award', label: 'Skill', emoji: '📚', icon: Award },
  { id: 'Rocket', label: 'Launch', emoji: '🚀', icon: Rocket },
  { id: 'Briefcase', label: 'Career', emoji: '💼', icon: Briefcase },
  { id: 'Plane', label: 'Travel', emoji: '✈️', icon: Plane },
  { id: 'Home', label: 'Asset', emoji: '🏠', icon: Home },
  { id: 'Target', label: 'Focus', emoji: '🎯', icon: Target },
  { id: 'Flame', label: 'Habit', emoji: '🔥', icon: Flame },
  { id: 'Heart', label: 'Life', emoji: '❤️', icon: Heart }
];

export const GOAL_COLOR_THEMES = [
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500', border: 'border-emerald-500' },
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500', border: 'border-indigo-500' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500', border: 'border-amber-500' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-500', border: 'border-rose-500' },
  { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-500', border: 'border-cyan-500' },
  { id: 'violet', label: 'Violet', bg: 'bg-violet-500', border: 'border-violet-500' },
  { id: 'slate', label: 'Slate', bg: 'bg-slate-500', border: 'border-slate-500' }
];

export const GoalModal = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
  const { currency } = useDashboard();
  const [formData, setFormData] = useState({
    title: '',
    horizon: 'short', // 'short' | 'long'
    targetAmount: 100000,
    currentAmount: 0,
    unit: currency || '₹',
    deadline: '',
    category: 'Financial',
    color: 'emerald',
    icon: 'PiggyBank',
    subGoals: []
  });

  const [newSubGoalTitle, setNewSubGoalTitle] = useState('');
  const [newSubGoalDate, setNewSubGoalDate] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        title: initialData.title || '',
        horizon: initialData.horizon || 'short',
        targetAmount: Number(initialData.targetAmount !== undefined ? initialData.targetAmount : (initialData.target_amount ?? 100000)),
        currentAmount: Number(initialData.currentAmount !== undefined ? initialData.currentAmount : (initialData.current_amount ?? 0)),
        unit: initialData.unit || currency || '₹',
        deadline: initialData.deadline || '',
        category: initialData.category || 'Financial',
        color: initialData.color || 'emerald',
        icon: initialData.icon || 'Target',
        subGoals: Array.isArray(initialData.subGoals)
          ? initialData.subGoals.map(sg => ({
              id: sg.id,
              title: sg.title,
              targetDate: sg.targetDate || sg.target_date || '',
              completed: Boolean(sg.completed)
            }))
          : Array.isArray(initialData.sub_goals)
          ? initialData.sub_goals.map(sg => ({
              id: sg.id,
              title: sg.title,
              targetDate: sg.target_date || sg.targetDate || '',
              completed: Boolean(sg.completed)
            }))
          : []
      });
    } else {
      const defaultDeadline = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setFormData({
        title: '',
        horizon: 'short',
        targetAmount: 100000,
        currentAmount: 0,
        unit: currency || '₹',
        deadline: defaultDeadline,
        category: 'Financial',
        color: 'emerald',
        icon: 'PiggyBank',
        subGoals: []
      });
    }
    setNewSubGoalTitle('');
    setNewSubGoalDate('');
  }, [initialData, isOpen, currency]);

  if (!isOpen) return null;

  const handleAddSubGoal = () => {
    if (!newSubGoalTitle.trim()) return;
    const newSub = {
      id: `sg-${Date.now()}`,
      title: newSubGoalTitle.trim(),
      targetDate: newSubGoalDate || formData.deadline || getISTDateString(),
      completed: false
    };
    setFormData(prev => ({
      ...prev,
      subGoals: [...(prev.subGoals || []), newSub]
    }));
    setNewSubGoalTitle('');
    setNewSubGoalDate('');
  };

  const handleToggleSubGoalCompletion = (sgId) => {
    setFormData(prev => ({
      ...prev,
      subGoals: (prev.subGoals || []).map(sg =>
        sg.id === sgId ? { ...sg, completed: !sg.completed } : sg
      )
    }));
  };

  const handleRemoveSubGoal = (sgId) => {
    setFormData(prev => ({
      ...prev,
      subGoals: (prev.subGoals || []).filter(sg => sg.id !== sgId)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    const cleanGoal = {
      ...formData,
      title: formData.title.trim(),
      targetAmount: parseFloat(formData.targetAmount) || 1,
      currentAmount: parseFloat(formData.currentAmount) || 0,
      subGoals: formData.subGoals || []
    };
    delete cleanGoal.target_amount;
    delete cleanGoal.current_amount;
    delete cleanGoal.sub_goals;

    onSave(cleanGoal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {initialData ? 'Edit Strategic Objective' : 'Create Strategic Objective'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          {/* 1. Time Horizon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Goal Time Horizon
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, horizon: 'short' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                  formData.horizon === 'short'
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/50 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>⚡ Short-Term</span>
                <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">(≤ 3 Months)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, horizon: 'long' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                  formData.horizon === 'long'
                    ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/50 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>🏔️ Long-Term</span>
                <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">(&gt; 3 Months / Multi-Year)</span>
              </button>
            </div>
          </div>

          {/* 2. Goal Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Goal Title
            </label>
            <input
              type="text"
              required
              placeholder={formData.horizon === 'long' ? 'e.g. Save ₹5,00,000 Emergency Fund' : 'e.g. Complete 5K Run by Oct'}
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* 3. Icon / Logo Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Goal Icon / Logo
            </label>
            <div className="grid grid-cols-5 gap-2">
              {GOAL_ICONS.map((item) => {
                const IconComp = item.icon;
                const isSelected = formData.icon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: item.id })}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/50 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span className="text-[10px] font-semibold mt-0.5">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Card Color Theme Palette */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Card Color Theme
            </label>
            <div className="flex items-center space-x-2">
              {GOAL_COLOR_THEMES.map((th) => {
                const isSelected = formData.color === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: th.id })}
                    className={`w-7 h-7 rounded-full ${th.bg} transition-all transform flex items-center justify-center cursor-pointer ${
                      isSelected ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={th.label}
                  >
                    {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Target Value & Progress */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Metric
              </label>
              <input
                type="number"
                step="any"
                required
                value={formData.targetAmount}
                onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Progress
              </label>
              <input
                type="number"
                step="any"
                required
                value={formData.currentAmount}
                onChange={e => setFormData({ ...formData, currentAmount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* 6. Unit, Deadline & Category */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unit (₹, km, pts)
              </label>
              <input
                type="text"
                required
                placeholder="₹"
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category Tag
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Financial">Financial</option>
                <option value="Health">Health / Fitness</option>
                <option value="Skill">Skill & Tech</option>
                <option value="Career">Career & Work</option>
                <option value="Travel">Travel & Life</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
          </div>

          {/* 7. NESTED SUB-GOALS / MILESTONES (For Long-Term Goals or optional milestones) */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Nested Milestone Sub-Goals ({formData.subGoals?.length || 0})
              </label>
              <span className="text-[10px] text-slate-400">Short milestone checkpoints</span>
            </div>

            {/* List existing sub-goals */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {(formData.subGoals || []).map((sg) => (
                <div
                  key={sg.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs gap-2"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleSubGoalCompletion(sg.id)}
                      className="text-slate-400 hover:text-emerald-500 transition cursor-pointer shrink-0"
                      title={sg.completed ? "Mark as incomplete" : "Mark as completed"}
                    >
                      {sg.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 hover:text-emerald-500" />
                      )}
                    </button>
                    <span className={`font-semibold truncate ${
                      sg.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {sg.title}
                    </span>
                    {sg.targetDate && (
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">({sg.targetDate})</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubGoal(sg.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer shrink-0 transition"
                    title="Remove sub-goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new sub-goal inputs */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                placeholder="Add sub-goal milestone (e.g. Save first ₹25,000 buffer)"
                value={newSubGoalTitle}
                onChange={e => setNewSubGoalTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="date"
                value={newSubGoalDate}
                onChange={e => setNewSubGoalDate(e.target.value)}
                className="w-32 px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-[11px] text-slate-900 dark:text-slate-100 font-mono"
              />
              <button
                type="button"
                onClick={handleAddSubGoal}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 shrink-0">
            {initialData && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialData.id);
                  onClose();
                }}
                className="flex items-center space-x-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Goal</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{initialData ? 'Update Goal' : 'Create Goal'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
