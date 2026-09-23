import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../../context/DashboardContext';
import { getISTDateString, formatISTDisplayDate } from '../../utils/dateUtils';
import {
  Sun,
  Moon,
  Calendar,
  Flame,
  Download,
  Check,
  Sparkles,
  Zap,
  CheckCircle2,
  Smile
} from 'lucide-react';

// Helper to generate Google Calendar URLs
export const createGoogleCalendarUrl = ({ title, details, date }) => {
  const formattedDate = date ? date.replace(/-/g, '') : getISTDateString().replace(/-/g, '');
  const startTime = `${formattedDate}T090000Z`;
  const endTime = `${formattedDate}T100000Z`;

  const baseUrl = 'https://calendar.google.com/calendar/render';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: details || 'PULSE Operating Routine Task',
    dates: `${startTime}/${endTime}`
  });

  return `${baseUrl}?${params.toString()}`;
};

// Helper to download .ics iCalendar file
export const downloadIcsFile = ({ title, details, date }) => {
  const formattedDate = date ? date.replace(/-/g, '') : getISTDateString().replace(/-/g, '');
  const safeTitle = (title || 'Task').replace(/[\r\n]+/g, ' ').trim();
  const safeDetails = (details || 'PULSE Task').replace(/[\r\n]+/g, ' ').trim();
  const safeFileName = safeTitle.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 50) || 'pulse_task';

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PULSE//Daily Operating System//EN
BEGIN:VEVENT
SUMMARY:${safeTitle}
DESCRIPTION:${safeDetails}
DTSTART:${formattedDate}T090000Z
DTEND:${formattedDate}T100000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${safeFileName}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const RoutineWidget = () => {
  const {
    habits = [],
    tasks = [],
    isHabitDoneOn = () => false,
    toggleHabitForDate,
    getJournalEntry = () => null,
    saveJournalEntry = async () => {}
  } = useDashboard();

  const todayStr = getISTDateString();

  // Smart time-aware default tab: Evening Review if >= 6 PM or < 5 AM IST; Morning Planning otherwise
  const [activeTab, setActiveTab] = useState(() => {
    const currentHour = new Date().getHours();
    return currentHour >= 18 || currentHour < 5 ? 'evening' : 'morning';
  });

  // Calculations for Morning Mode
  const openTasks = tasks.filter(t => !t.completed);
  const focusStorageKey = `pulse_focus_tasks_${todayStr}`;

  const [topPriorities, setTopPriorities] = useState(() => {
    try {
      const saved = localStorage.getItem(focusStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return openTasks.slice(0, 3).map(t => t.id);
  });

  const togglePrioritySelection = (taskId) => {
    setTopPriorities(prev => {
      const next = prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : prev.length < 3
        ? [...prev, taskId]
        : prev;
      try {
        localStorage.setItem(focusStorageKey, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Calculations for Evening Mode using real IST Today completions
  const totalHabits = habits.length;
  const completedHabitsToday = habits.filter(h => isHabitDoneOn(h.id, todayStr)).length;
  const totalTasks = tasks.length;
  const completedTasksToday = tasks.filter(t => t.completed).length;

  const dayCompletionScore = Math.round(
    ((completedHabitsToday / (totalHabits || 1)) * 0.6 +
      (completedTasksToday / (totalTasks || 1)) * 0.4) * 100
  );

  // Micro-journal reflection state for evening review
  const existingTodayJournal = getJournalEntry ? getJournalEntry(todayStr) : null;
  const [eveningMood, setEveningMood] = useState('productive');
  const [eveningHighlight, setEveningHighlight] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);

  useEffect(() => {
    if (existingTodayJournal) {
      if (existingTodayJournal.mood) setEveningMood(existingTodayJournal.mood);
      if (existingTodayJournal.accomplished) setEveningHighlight(existingTodayJournal.accomplished);
    }
  }, [existingTodayJournal]);

  const handleSaveReflection = async () => {
    if (!saveJournalEntry) return;
    try {
      await saveJournalEntry(todayStr, {
        mood: eveningMood,
        accomplished: eveningHighlight,
        notes: existingTodayJournal?.notes || '',
        gratitude: existingTodayJournal?.gratitude || ''
      });
      setReflectionSaved(true);
      setTimeout(() => setReflectionSaved(false), 2500);
    } catch (err) {
      console.error('Error saving evening reflection', err);
    }
  };

  return (
    <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-md">
      
      {/* Tab Switcher: Morning vs Evening */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg border ${
            activeTab === 'morning'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
          }`}>
            {activeTab === 'morning' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {activeTab === 'morning' ? 'Planning' : 'Review'}
            </h3>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('morning')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'morning'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Morning</span>
          </button>

          <button
            onClick={() => setActiveTab('evening')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'evening'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Evening</span>
          </button>
        </div>
      </div>

      {/* Morning Planning Mode Content */}
      {activeTab === 'morning' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
            <span>Select up to 3 focus priorities for today:</span>
            <span className="font-extrabold text-amber-600 dark:text-amber-400 font-mono">{topPriorities.length}/3 Selected</span>
          </div>

          <div className="space-y-2">
            {openTasks.slice(0, 5).map((task) => {
              const isSelected = topPriorities.includes(task.id);
              return (
                <div
                  key={task.id}
                  onClick={() => togglePrioritySelection(task.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/30 text-slate-900 dark:text-slate-100 font-bold'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${
                      isSelected ? 'bg-amber-500 border-amber-500 text-slate-950 font-bold' : 'border-slate-300 dark:border-slate-700'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-xs font-semibold line-clamp-1">{task.title}</span>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    {task.category}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Google Calendar Sync Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Sync priorities to Google Calendar:</span>
            <div className="flex items-center space-x-2">
              <a
                href={createGoogleCalendarUrl({
                  title: 'PULSE Morning Focus Ritual',
                  details: 'Review top 3 daily priorities & execute high-value tasks.'
                })}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold transition"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Google Calendar</span>
              </a>

              {/* Download .ics — hidden on mobile, visible on sm+ */}
              <button
                onClick={() =>
                  downloadIcsFile({
                    title: 'PULSE Morning Ritual',
                    details: 'Daily Morning Planning Routine'
                  })
                }
                className="hidden sm:flex p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition"
                title="Download .ics Calendar File"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Evening Review Mode Content */}
      {activeTab === 'evening' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Day Completion Score Header */}
          <div className="flex items-center justify-between p-3.5 bg-indigo-50 dark:bg-gradient-to-r dark:from-indigo-950/60 dark:to-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 tracking-wider">Day Completion Rating</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">{dayCompletionScore}% Score</p>
            </div>
            <div className="text-right text-xs text-slate-600 dark:text-slate-400">
              <p><span className="text-amber-600 dark:text-amber-400 font-bold">{completedHabitsToday}/{totalHabits}</span> Habits Done</p>
              <p><span className="text-cyan-600 dark:text-cyan-400 font-bold">{completedTasksToday}/{totalTasks}</span> Tasks Completed</p>
            </div>
          </div>

          {/* Quick Evening Habits Check List synced directly to date-keyed engine */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Daily Habits Check-Off (Today):</span>
              <span className="text-[10px] text-slate-500 font-mono">{todayStr}</span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {habits.map((habit) => {
                const isDoneToday = isHabitDoneOn(habit.id, todayStr);
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabitForDate(habit.id, todayStr)}
                    className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer text-xs transition ${
                      isDoneToday
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Flame className={`w-3.5 h-3.5 ${isDoneToday ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                      {habit.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold">{isDoneToday ? 'Completed' : 'Pending'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 60-Second Micro-Reflection */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                60-Second Evening Reflection
              </span>
              <span className="text-[10px] text-slate-400">Syncs directly to Journal</span>
            </div>

            {/* Mood selector buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
              {[
                { id: 'high_energy', label: 'High Energy', emoji: '⚡' },
                { id: 'productive', label: 'Productive', emoji: '😊' },
                { id: 'calm', label: 'Calm', emoji: '🧘' },
                { id: 'tired', label: 'Tired', emoji: '😴' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setEveningMood(m.id)}
                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1 transition ${
                    eveningMood === m.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Highlight input & 1-tap save */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={eveningHighlight}
                onChange={(e) => setEveningHighlight(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveReflection();
                }}
                placeholder="Today's win or breakthrough in one sentence..."
                className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleSaveReflection}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                  reflectionSaved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                }`}
              >
                {reflectionSaved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Log Win</span>
                )}
              </button>
            </div>
          </div>

          {/* Calendar Nightly Reminder & Journal Link */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Evening Review Actions:</span>
            <div className="flex items-center space-x-2">
              <Link
                to="/journal"
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <span>✍️ Full Journal</span>
              </Link>

              <a
                href={createGoogleCalendarUrl({
                  title: 'PULSE Nightly Recap & Log',
                  details: 'Log remaining expenses, complete daily habits & review day-end score.'
                })}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>9 PM Reminder</span>
              </a>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
