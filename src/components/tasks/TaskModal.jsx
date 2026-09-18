import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  X,
  CheckSquare,
  Briefcase,
  ShoppingBag,
  User,
  Zap,
  Calendar,
  FileText,
  Plus,
  AlertCircle,
  Edit2
} from 'lucide-react';

export const TaskModal = ({ isOpen, onClose, initialCategory = 'Work', initialTask = null, onSave = null }) => {
  const { addTask, updateTask } = useDashboard();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title || '');
        setCategory(initialTask.category || 'Work');
        setPriority(initialTask.priority || 'medium');
        setDueDate(initialTask.dueDate || new Date().toISOString().split('T')[0]);
        setNotes(initialTask.notes || '');
      } else {
        setTitle('');
        setCategory(initialCategory || 'Work');
        setPriority('medium');
        setDueDate(new Date().toISOString().split('T')[0]);
        setNotes('');
      }
    }
  }, [isOpen, initialCategory, initialTask]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      category,
      priority,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      notes: notes.trim(),
    };

    if (initialTask) {
      if (onSave) {
        onSave({ id: initialTask.id, ...payload });
      } else {
        updateTask(initialTask.id, payload);
      }
    } else {
      if (onSave) {
        onSave(payload);
      } else {
        addTask(payload);
      }
    }

    // Reset & close
    setTitle('');
    setNotes('');
    onClose();
  };

  const categories = [
    { key: 'Work', label: 'Work / Office', icon: Briefcase, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30' },
    { key: 'Shopping', label: 'Shopping & Errands', icon: ShoppingBag, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' },
    { key: 'Personal', label: 'Personal', icon: User, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30' },
    { key: 'Urgent', label: 'Urgent / Focus', icon: Zap, color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' },
  ];

  const priorities = [
    { key: 'high', label: 'High Priority (Do Today)', badge: '🔴 High', color: 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400' },
    { key: 'medium', label: 'Medium Priority (This Week)', badge: '🟡 Medium', color: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    { key: 'low', label: 'Low Priority (Backlog)', badge: '🔵 Low', color: 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  ];

  return (
    <>
      {/* Backdrop: Clicking closes modal */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Modal Card: FIXED at top-20 on mobile, centered on sm */}
      <div className="fixed top-20 sm:top-1/2 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 max-w-lg mx-auto w-[calc(100%-2rem)] sm:w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-150 max-h-[calc(100vh-6rem)] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {initialTask ? <Edit2 className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {initialTask ? 'Edit Action Task' : 'Create New Action Task'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Task Title <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Finalize Q3 Budget Deck or Buy Grocery Items"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-indigo-500 transition"
              autoFocus
            />
          </div>

          {/* Context Board / Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Context Board / Tag:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const IconC = cat.icon;
                const isSelected = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <IconC className="w-4 h-4 shrink-0 text-indigo-500" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Priority Level:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {priorities.map((p) => {
                const isSelected = priority === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPriority(p.key)}
                    className={`p-2 rounded-xl border text-[11px] font-bold transition text-center cursor-pointer ${
                      isSelected
                        ? `${p.color} border-current shadow-sm`
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {p.badge}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Due Date:</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Notes / Subtasks */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              <span>Notes / Subtasks (Optional):</span>
            </label>
            <textarea
              rows={2}
              placeholder="Add extra context, links, or micro sub-steps..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition cursor-pointer"
            >
              {initialTask ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{initialTask ? 'Save Task' : 'Add Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};


