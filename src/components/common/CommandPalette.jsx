import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import { getISTDateString } from '../../utils/dateUtils';
import {
  Search,
  Plus,
  Zap,
  Flame,
  Wallet,
  Compass,
  ArrowRight,
  Check,
  X,
  CornerDownLeft,
  Sparkles,
  Layers
} from 'lucide-react';

export const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const {
    addTask,
    addTransaction,
    habits,
    toggleHabitForDate,
    currency
  } = useDashboard();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setFeedback(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard shortcut: Cmd + K / Ctrl + K and Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExecute = (e) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    const todayStr = getISTDateString();

    // 1. QUICK NAVIGATION: "go [page]"
    const navMap = {
      'go pulse': '/',
      'go overview': '/',
      'go home': '/',
      'go habits': '/habits',
      'go habit': '/habits',
      'go tasks': '/tasks',
      'go task': '/tasks',
      'go todo': '/tasks',
      'go finance': '/finance',
      'go money': '/finance',
      'go activity': '/activity',
      'go gym': '/activity',
      'go run': '/activity',
      'go workout': '/activity',
      'go goals': '/goals',
      'go goal': '/goals',
      'go journal': '/journal',
      'go analytics': '/analytics',
      'go ai': '/analytics'
    };

    if (navMap[lower]) {
      navigate(navMap[lower]);
      onClose();
      return;
    }

    // 2. QUICK HABIT TOGGLE: "habit [name]"
    if (lower.startsWith('habit ') || lower.startsWith('h ')) {
      const habitQuery = lower.replace(/^(habit|h)\s+/, '').trim();
      const matchedHabit = habits.find(h => h.name.toLowerCase().includes(habitQuery));
      if (matchedHabit) {
        toggleHabitForDate(matchedHabit.id, todayStr);
        setFeedback(`✓ Checked today's '${matchedHabit.name}' habit!`);
        setTimeout(() => onClose(), 800);
        return;
      }
    }

    // 3. QUICK INCOME: "income 50000 Freelance" or "inflow 2000"
    if (lower.startsWith('income ') || lower.startsWith('inflow ') || lower.startsWith('salary ')) {
      const match = trimmed.match(/^(?:income|inflow|salary)\s+([0-9.]+)(?:\s+(.*))?$/i);
      if (match) {
        const amount = parseFloat(match[1]) || 0;
        const note = match[2] || 'Income';
        addTransaction({
          amount,
          type: 'income',
          category: 'Salary',
          notes: note,
          date: todayStr
        });
        setFeedback(`✓ Logged +${currency}${amount} income!`);
        setTimeout(() => onClose(), 800);
        return;
      }
    }

    // 4. QUICK EXPENSE: "+500 Lunch" or "-25 Coffee" or "500 Lunch"
    const expenseMatch = trimmed.match(/^[+-]?([0-9.]+)(?:\s+(.*))?$/);
    if (expenseMatch) {
      const amount = parseFloat(expenseMatch[1]) || 0;
      const note = expenseMatch[2] || 'Quick Expense';

      // Auto-categorize keyword
      let category = 'Food';
      const noteLower = note.toLowerCase();
      if (noteLower.includes('bill') || noteLower.includes('wifi') || noteLower.includes('electric')) category = 'Bills';
      else if (noteLower.includes('uber') || noteLower.includes('fuel') || noteLower.includes('petrol') || noteLower.includes('cab')) category = 'Transport';
      else if (noteLower.includes('amazon') || noteLower.includes('tech') || noteLower.includes('cloth')) category = 'Shopping';
      else if (noteLower.includes('movie') || noteLower.includes('game')) category = 'Entertainment';
      else if (noteLower.includes('doctor') || noteLower.includes('med')) category = 'Health';

      addTransaction({
        amount,
        type: 'expense',
        category,
        notes: note,
        date: todayStr
      });
      setFeedback(`✓ Logged -${currency}${amount} (${category})!`);
      setTimeout(() => onClose(), 800);
      return;
    }

    // 5. QUICK TASK: "task Title" or default string
    let taskTitle = trimmed;
    let priority = 'medium';

    if (lower.startsWith('task ') || lower.startsWith('t ') || lower.startsWith('todo ')) {
      taskTitle = trimmed.replace(/^(?:task|t|todo)\s+/i, '').trim();
    } else if (lower.startsWith('high ') || lower.startsWith('urgent ')) {
      taskTitle = trimmed.replace(/^(?:high|urgent)\s+/i, '').trim();
      priority = 'high';
    }

    if (taskTitle) {
      addTask({
        title: taskTitle,
        priority,
        category: 'Work',
        completed: false,
        dueDate: todayStr
      });
      setFeedback(`✓ Added task: "${taskTitle}" (${priority} priority)!`);
      setTimeout(() => onClose(), 800);
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Spotlight Command Modal */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        
        {/* Input Bar */}
        <form onSubmit={handleExecute} className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-indigo-500 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type '+500 lunch', 'task Review roadmap', 'habit Meditate', or 'go finance'..."
            className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shrink-0 cursor-pointer"
          >
            <span>Enter</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </form>

        {/* Feedback Confirmation Toast */}
        {feedback && (
          <div className="p-3 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2 animate-in fade-in duration-150">
            <Check className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Action Suggestions Guide */}
        <div className="p-3 space-y-2 text-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
            Smart Quick-Actions
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => { setQuery('+250 Lunch'); inputRef.current?.focus(); }}
              className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition cursor-pointer"
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">+500 Coffee</p>
                <p className="text-[10px] text-slate-400">Log an expense</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setQuery('task Finalize quarterly goals'); inputRef.current?.focus(); }}
              className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition cursor-pointer"
            >
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">task Review PR</p>
                <p className="text-[10px] text-slate-400">Add to action board</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setQuery('habit '); inputRef.current?.focus(); }}
              className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition cursor-pointer"
            >
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">habit Meditate</p>
                <p className="text-[10px] text-slate-400">Toggle habit completion</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setQuery('go finance'); inputRef.current?.focus(); }}
              className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition cursor-pointer"
            >
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">go habits / finance</p>
                <p className="text-[10px] text-slate-400">Instant jump to page</p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>ProTip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">Esc</kbd> to close</span>
          <span>Pulse Spotlight</span>
        </div>

      </div>
    </div>
  );
};
