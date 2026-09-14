import React from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import { BookOpen, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export const JournalWidget = () => {
  const { getJournalEntry } = useDashboard();
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntry = getJournalEntry(todayStr);

  const moodEmojis = {
    high_energy: '⚡ High Energy',
    productive: '😊 Productive',
    tired: '😴 Tired',
    calm: '🧘 Calm'
  };

  return (
    <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Journal Pulse</h3>
          </div>
        </div>

        <Link
          to="/journal"
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-xs font-bold transition border border-indigo-200 dark:border-indigo-500/30"
        >
          <span>Open Journal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {todayEntry ? (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
            <span>Today's Log Entry</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {moodEmojis[todayEntry.mood] || '😊 Productive'}
            </span>
          </div>

          <p className="text-slate-600 dark:text-slate-400 italic line-clamp-2">
            "{todayEntry.accomplished || todayEntry.notes || todayEntry.gratitude || 'Logged today'}"
          </p>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-medium">No reflection logged for today yet.</span>
          <Link
            to="/journal"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            + Write Today's Entry
          </Link>
        </div>
      )}
    </div>
  );
};
