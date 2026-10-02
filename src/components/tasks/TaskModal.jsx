import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  X,
  CheckSquare,
  Calendar,
  FileText,
  Plus,
  Edit2,
  ChevronDown,
  RotateCw,
  Sparkles
} from 'lucide-react';
import { RECURRENCE_OPTIONS, cleanNotes } from '../../utils/taskUtils';
import { getISTDateString } from '../../utils/dateUtils';

export const TaskModal = ({ isOpen, onClose, initialCategory = 'Work', initialTask = null, onSave = null }) => {
  const { addTask, updateTask } = useDashboard();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [repeat, setRepeat] = useState('none');
  const [notes, setNotes] = useState('');

  const todayStr = getISTDateString();

  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTitle(initialTask.title || '');
        setCategory(initialTask.category || 'Work');
        setPriority(initialTask.priority || 'medium');
        setDueDate(initialTask.dueDate || todayStr);
        setRepeat(initialTask.repeat || 'none');
        setNotes(cleanNotes(initialTask.notes || ''));
      } else {
        setTitle('');
        setCategory(initialCategory || 'Work');
        setPriority('medium');
        setDueDate(todayStr);
        setRepeat('none');
        setNotes('');
      }
    }
  }, [isOpen, initialCategory, initialTask, todayStr]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      category,
      priority,
      dueDate: dueDate || todayStr,
      repeat: repeat || 'none',
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
    { key: 'Work', label: 'Work / Office', emoji: '💼' },
    { key: 'Shopping', label: 'Shopping & Errands', emoji: '🛒' },
    { key: 'Personal', label: 'Personal', emoji: '👤' },
    { key: 'Urgent', label: 'Urgent / Focus', emoji: '⚡' },
    { key: 'Finance', label: 'Finance & Money', emoji: '💰' },
    { key: 'Health', label: 'Health & Fitness', emoji: '🏃' },
    { key: 'Tech', label: 'Tech & Projects', emoji: '💻' }
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

      {/* Modal Card: FIXED at top-16 on mobile, centered on sm */}
      <div className="fixed top-14 sm:top-1/2 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 max-w-lg mx-auto w-[calc(100%-1.5rem)] sm:w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-150 max-h-[calc(100vh-4.5rem)] overflow-y-auto">
        
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
            aria-label="Close modal"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
            />
          </div>

          {/* Context Board / Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Context Board / Tag:
            </label>
            <div className="relative flex items-center">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-indigo-500 transition cursor-pointer appearance-none"
              >
                {categories.map((cat) => (
                  <option key={cat.key} value={cat.key} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {cat.emoji} {cat.label}
                  </option>
                ))}
                {!categories.some(c => c.key === category) && category && (
                  <option value={category} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    📌 {category}
                  </option>
                )}
              </select>
              <div className="pointer-events-none absolute right-3 flex items-center text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
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
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p.badge}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date */}
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

          {/* Repeatability / Recurrence Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5 text-indigo-500" />
                <span>Repeat / Recurrence:</span>
              </span>
              {repeat !== 'none' && (
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  Recurring Task
                </span>
              )}
            </label>

            <div className="relative flex items-center">
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                className="w-full px-3.5 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-indigo-500 transition cursor-pointer appearance-none"
              >
                {RECURRENCE_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {opt.emoji} {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 flex items-center text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {repeat !== 'none' && (
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 pt-0.5 font-medium">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>When checked off, the next task instance is automatically scheduled.</span>
              </p>
            )}
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
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition cursor-pointer active:scale-95"
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
