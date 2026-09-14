import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  BookOpen,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Check,
  Search,
  Trash2,
  Smile,
  Zap,
  Coffee,
  Moon,
  Clock,
  Save,
  Share2
} from 'lucide-react';

export const JournalPage = () => {
  const { journalEntries, saveJournalEntry, deleteJournalEntry, getJournalEntry } = useDashboard();
  
  // Date state (default today: 2026-08-26)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Form fields
  const [accomplished, setAccomplished] = useState('');
  const [notes, setNotes] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [mood, setMood] = useState('productive');
  
  // UI states
  const [saveStatus, setSaveStatus] = useState(''); // '' | 'saving' | 'saved'
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load entry data when selected date changes
  useEffect(() => {
    const entry = getJournalEntry(selectedDate);
    if (entry) {
      setAccomplished(entry.accomplished || '');
      setNotes(entry.notes || '');
      setGratitude(entry.gratitude || '');
      setMood(entry.mood || 'productive');
    } else {
      setAccomplished('');
      setNotes('');
      setGratitude('');
      setMood('productive');
    }
  }, [selectedDate, journalEntries]);

  // Auto-save logic on edit
  const handleAutoSave = (updatedFields) => {
    setSaveStatus('saving');
    const newEntry = {
      accomplished: updatedFields.accomplished ?? accomplished,
      notes: updatedFields.notes ?? notes,
      gratitude: updatedFields.gratitude ?? gratitude,
      mood: updatedFields.mood ?? mood,
    };

    saveJournalEntry(selectedDate, newEntry);
    setTimeout(() => {
      setSaveStatus('saved');
    }, 400);
  };

  const shiftDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const moods = [
    { key: 'high_energy', label: 'High Energy', emoji: '⚡', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
    { key: 'productive', label: 'Productive', emoji: '😊', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' },
    { key: 'tired', label: 'Tired', emoji: '😴', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30' },
    { key: 'calm', label: 'Calm', emoji: '🧘', color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30' },
  ];

  // Markdown formatting for export / copy
  const generateMarkdown = () => {
    const formattedDate = new Date(selectedDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const currentMoodObj = moods.find(m => m.key === mood) || moods[1];

    return `# 📓 PULSE Daily Journal — ${formattedDate}
**Mood & Energy:** ${currentMoodObj.emoji} ${currentMoodObj.label}

## 🏆 What I Accomplished Today
${accomplished || '*No entries recorded.*'}

## 📝 Important Notes & Decisions
${notes || '*No entries recorded.*'}

## 🙏 Gratitude & Evening Thoughts
${gratitude || '*No entries recorded.*'}

---
*Generated with PULSE Life Operating System*
`;
  };

  const handleCopyToClipboard = () => {
    const text = generateMarkdown();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const text = generateMarkdown();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PULSE_Journal_${selectedDate}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered past journal entries for search sidebar
  const filteredEntries = journalEntries.filter(entry => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      entry.date.includes(q) ||
      (entry.accomplished && entry.accomplished.toLowerCase().includes(q)) ||
      (entry.notes && entry.notes.toLowerCase().includes(q)) ||
      (entry.gratitude && entry.gratitude.toLowerCase().includes(q))
    );
  });

  const formattedSelectedDateStr = new Date(selectedDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="glass-panel-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Journal Pulse <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">Daily Reflection</span>
            </h2>
          </div>
        </div>

        {/* Top Actions: Copy & Download Markdown */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyToClipboard}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
            title="Copy as formatted Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Markdown!' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition"
            title="Download .md File"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .md</span>
          </button>
        </div>
      </div>

      {/* Date Navigation & Calendar Strip Bar */}
      <div className="glass-panel-dark rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Date Prev / Next / Picker */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => shiftDate(-1)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold font-mono text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => shiftDate(1)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              isToday
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            Today
          </button>
        </div>

        {/* Selected Date String & Save Status */}
        <div className="flex items-center space-x-3 text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200">{formattedSelectedDateStr}</span>
          {saveStatus && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono font-semibold flex items-center gap-1">
              <Save className="w-3 h-3" />
              {saveStatus === 'saving' ? 'Saving...' : 'Auto-Saved'}
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Journal Editor (Left 8 cols) & Search / History Stream (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Daily Journal Log Entry Form */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Mood & Energy Selector */}
          <div className="glass-panel-dark rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>Mood & Energy Level:</span>
              <span className="text-[10px] text-slate-400 font-mono">How did you feel today?</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {moods.map((m) => {
                const isSelected = mood === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => {
                      setMood(m.key);
                      handleAutoSave({ mood: m.key });
                    }}
                    className={`flex items-center justify-center space-x-2 p-2.5 rounded-xl border text-xs font-bold transition ${
                      isSelected
                        ? `${m.color} shadow-sm scale-[1.02]`
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base">{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 1: Accomplishments */}
          <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="p-1 rounded bg-amber-500/10 text-amber-500">🏆</span>
                What I Accomplished Today
              </h3>
              <span className="text-[10px] font-mono text-slate-400">{accomplished.length} chars</span>
            </div>
            <textarea
              rows={4}
              placeholder="Log key wins, completed tasks, metrics, or major progress made today..."
              value={accomplished}
              onChange={(e) => {
                setAccomplished(e.target.value);
                handleAutoSave({ accomplished: e.target.value });
              }}
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-indigo-500 leading-relaxed transition"
            />
          </div>

          {/* Section 2: Important Notes & Decisions */}
          <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="p-1 rounded bg-indigo-500/10 text-indigo-500">📝</span>
                Important Notes & Key Decisions
              </h3>
              <span className="text-[10px] font-mono text-slate-400">{notes.length} chars</span>
            </div>
            <textarea
              rows={4}
              placeholder="Key meeting takeaways, technical decisions, financial notes, or follow-ups..."
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                handleAutoSave({ notes: e.target.value });
              }}
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-indigo-500 leading-relaxed transition"
            />
          </div>

          {/* Section 3: Gratitude & Evening Thoughts */}
          <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="p-1 rounded bg-emerald-500/10 text-emerald-500">🙏</span>
                Gratitude & Evening Reflections
              </h3>
              <span className="text-[10px] font-mono text-slate-400">{gratitude.length} chars</span>
            </div>
            <textarea
              rows={3}
              placeholder="3 things you are grateful for, evening thoughts, or energy reflections..."
              value={gratitude}
              onChange={(e) => {
                setGratitude(e.target.value);
                handleAutoSave({ gratitude: e.target.value });
              }}
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-indigo-500 leading-relaxed transition"
            />
          </div>

        </div>

        {/* Right Column: Search & Past Entries Sidebar Stream */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Search Box */}
          <div className="glass-panel-dark rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-500" />
              Search Reflection Logs
            </h3>
            <input
              type="text"
              placeholder="Search keyword or date (e.g. run, budget, 2026-08)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Past Entries List */}
          <div className="glass-panel-dark rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Past Journal Logs ({filteredEntries.length})</span>
            </div>

            <div className="space-y-2">
              {filteredEntries.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">No journal entries found.</p>
              ) : (
                filteredEntries.map((entry) => {
                  const isCurrent = entry.date === selectedDate;
                  const moodObj = moods.find(m => m.key === entry.mood) || moods[1];

                  return (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedDate(entry.date)}
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        isCurrent
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                          {entry.date}
                        </span>
                        <span className="text-[11px] font-medium">{moodObj.emoji}</span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                        "{entry.accomplished || entry.notes || entry.gratitude || 'Empty entry'}"
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 mt-2 text-[10px] text-slate-400">
                        <span>Updated: {new Date(entry.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteJournalEntry(entry.date);
                          }}
                          className="text-slate-400 hover:text-rose-500"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
