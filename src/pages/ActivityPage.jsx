import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { ActivityModal } from '../components/activity/ActivityModal';
import {
  getISTDateString,
  getISTYearMonth,
  getISTWeekDays,
  getISTWeekBadge,
  formatISTDisplayDate,
  MONTH_NAMES_FULL
} from '../utils/dateUtils';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Activity,
  Plus,
  Dumbbell,
  Waves,
  BookOpen,
  Trophy,
  Calendar as CalendarIcon,
  Flame,
  Clock,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Brain,
  Book,
  Edit2
} from 'lucide-react';

const CATEGORY_COLORS = {
  gym: '#6366f1',       // Indigo
  running: '#06b6d4',   // Cyan
  swimming: '#38bdf8',  // Sky
  sports: '#10b981',    // Emerald
  reading: '#f59e0b'    // Amber
};

export const ActivityPage = () => {
  const { activities, addActivity, updateActivity, deleteActivity, theme } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  // Timeframe states: strictly 'day' | 'week' | 'month'
  const [timeframe, setTimeframe] = useState('month'); // 'day' | 'week' | 'month'
  
  // IST Date & Time Selector state
  const currentISTYM = getISTYearMonth();
  const todayStr = getISTDateString();
  const [selectedYear, setSelectedYear] = useState(currentISTYM.year);
  const [selectedMonth, setSelectedMonth] = useState(currentISTYM.month); // 1-12
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Week navigation offset (0 = current week, -1 = last week, +1 = next week)
  const [weekOffset, setWeekOffset] = useState(0);

  const getWeekRefDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + (weekOffset * 7));
    return d;
  };

  const activeWeekRef = getWeekRefDate();
  const currentWeekDays = getISTWeekDays(activeWeekRef);
  const weekStartStr = currentWeekDays[0].dateStr;
  const weekEndStr = currentWeekDays[6].dateStr;
  const weekBadge = getISTWeekBadge(activeWeekRef);
  const isCurrentWeek = weekOffset === 0;

  const years = [2025, 2026, 2027, 2028];

  // --- Compute PR Highlights across all logged activities ---
  const longestRun = activities
    .filter(a => a.type === 'running' || a.type === 'swimming')
    .reduce((max, a) => Math.max(max, a.distance || 0), 0);

  const heaviestLift = activities
    .filter(a => a.type === 'gym')
    .reduce((max, a) => {
      if (a.exercises && Array.isArray(a.exercises)) {
        const sessionMax = a.exercises.reduce((exMax, ex) => {
          if (ex.setList && Array.isArray(ex.setList)) {
            const setMax = ex.setList.reduce((sMax, s) => Math.max(sMax, Number(s.weightKg) || 0), 0);
            return Math.max(exMax, setMax);
          }
          return Math.max(exMax, Number(ex.weightKg) || 0);
        }, 0);
        return Math.max(max, sessionMax);
      }
      return Math.max(max, Number(a.weightKg) || 0);
    }, 0);

  const maxReading = activities
    .filter(a => a.type === 'reading')
    .reduce((max, a) => Math.max(max, a.pagesRead || 0), 0);

  // --- Time Horizon Filtered Activities ---
  const getFilteredActivities = () => {
    if (timeframe === 'day') {
      return activities.filter(a => a.date === selectedDate);
    }
    if (timeframe === 'week') {
      return activities.filter(a => a.date && a.date >= weekStartStr && a.date <= weekEndStr);
    }
    // Month View (Filtered by selectedYear & selectedMonth)
    const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    return activities.filter(a => a.date && a.date.startsWith(monthPrefix));
  };

  const activeLogs = getFilteredActivities();

  // Aggregated Volume Metrics for Active Timeframe
  const totalMins = activeLogs.reduce((acc, a) => acc + (a.durationMins || 0), 0);
  
  const totalKm = activeLogs
    .filter(a => a.type === 'running' || a.type === 'swimming')
    .reduce((acc, a) => acc + (a.distance || 0), 0);

  const totalWeightVol = activeLogs
    .filter(a => a.type === 'gym')
    .reduce((acc, a) => {
      if (a.totalVolumeKg !== undefined) return acc + a.totalVolumeKg;
      if (a.exercises && Array.isArray(a.exercises)) {
        const sVol = a.exercises.reduce((exSum, ex) => {
          if (ex.exerciseVolumeKg !== undefined) return exSum + ex.exerciseVolumeKg;
          if (ex.setList && Array.isArray(ex.setList)) {
            const setSum = ex.setList.reduce((sTot, s) => sTot + ((Number(s.weightKg) || 0) * (Number(s.reps) || 0)), 0);
            return exSum + setSum;
          }
          const reps = parseInt(ex.reps, 10) || 10;
          return exSum + ((Number(ex.sets) || 1) * reps * (Number(ex.weightKg) || 0));
        }, 0);
        return acc + sVol;
      }
      return acc + ((a.sets || 1) * (a.reps || 1) * (a.weightKg || 0));
    }, 0);

  const totalPages = activeLogs
    .filter(a => a.type === 'reading')
    .reduce((acc, a) => acc + (a.pagesRead || 0), 0);

  const totalSkillMins = activeLogs
    .filter(a => a.type === 'reading' && a.readingSubType === 'skill')
    .reduce((acc, a) => acc + (a.durationMins || 0), 0);

  // Discipline Breakdown Chart Data
  const breakdownMap = { gym: 0, running: 0, swimming: 0, sports: 0, reading: 0 };
  activeLogs.forEach(a => {
    const cat = a.type || 'gym';
    breakdownMap[cat] = (breakdownMap[cat] || 0) + (a.durationMins || 0);
  });

  const donutData = Object.keys(breakdownMap)
    .filter(type => breakdownMap[type] > 0)
    .map(type => ({
      name: type.toUpperCase(),
      value: breakdownMap[type],
      color: CATEGORY_COLORS[type] || '#6366f1'
    }));

  const getCategoryIcon = (act) => {
    if (act.type === 'gym') return Dumbbell;
    if (act.type === 'running') return Activity;
    if (act.type === 'swimming') return Waves;
    if (act.type === 'sports') return Trophy;
    if (act.type === 'reading') {
      return act.readingSubType === 'skill' ? Brain : Book;
    }
    return BookOpen;
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="glass-panel-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Activity Pulse
            </h2>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition self-start md:self-auto cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Log Activity</span>
        </button>
      </div>

      {/* PR Highlights (Personal Records) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="glass-panel-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-500" /> Longest Cardio Run / Swim
            </span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {longestRun > 0 ? `${longestRun.toFixed(1)} km` : '0.0 km'}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-indigo-500" /> Heaviest Single Lift (PR)
            </span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {heaviestLift > 0 ? `${heaviestLift} kg` : '0 kg'}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-500" /> Peak Reading Session
            </span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {maxReading > 0 ? `${maxReading} pages` : '0 pages'}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* ⏱️ TIME-HORIZON VOLUME AGGREGATIONS (Strictly [ Today | Week | Month ]) */}
      <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
        
        {/* Tab Controls & Month Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Activities Aggregations</h3>
          </div>

          {/* Time Horizon Selector Tabs: Day | Week | Month */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
            {[
              { id: 'day', label: 'Day' },
              { id: 'week', label: 'Week' },
              { id: 'month', label: 'Month' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimeframe(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  timeframe === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Period Information & Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
          
          {/* If MONTH View is selected: Show Month & Year dropdown pickers */}
          {timeframe === 'month' && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-500 dark:text-slate-400">Select Month / Year:</span>
              
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {MONTH_NAMES_FULL.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer font-mono"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <span className="text-slate-400 pl-2">
                Showing logs for: <strong className="text-indigo-600 dark:text-cyan-400 font-bold">{MONTH_NAMES_FULL[selectedMonth - 1]} {selectedYear}</strong>
              </span>
            </div>
          )}

          {/* If TODAY View is selected */}
          {timeframe === 'day' && (
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-500 dark:text-slate-400">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2.5 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100"
              />
              <span className="text-slate-400">
                {selectedDate === todayStr ? '(Today)' : formatISTDisplayDate(selectedDate)}
              </span>
            </div>
          )}

          {/* If WEEK View is selected */}
          {timeframe === 'week' && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-500 dark:text-slate-400">Active Week:</span>
              
              <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  onClick={() => setWeekOffset(prev => prev - 1)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer transition"
                  title="Previous Week"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <span className="px-2 py-0.5 font-mono font-bold text-indigo-700 dark:text-cyan-300 text-xs">
                  {weekBadge}
                </span>

                {!isCurrentWeek && (
                  <button
                    onClick={() => setWeekOffset(0)}
                    className="px-1.5 py-0.5 text-[10px] font-extrabold text-indigo-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    Current
                  </button>
                )}

                <button
                  onClick={() => setWeekOffset(prev => prev + 1)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer transition"
                  title="Next Week"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="text-slate-500 dark:text-slate-400 font-mono text-xs">
            Total Sessions: <strong className="text-slate-900 dark:text-slate-100">{activeLogs.length}</strong>
          </div>
        </div>

        {/* Aggregated Totals Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Active Duration</span>
            <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-mono">{totalMins} mins</p>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Distance (Run/Swim)</span>
            <p className="text-lg font-extrabold text-cyan-600 dark:text-cyan-400 font-mono">{totalKm.toFixed(1)} km</p>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Weight Volume Lifted</span>
            <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">{totalWeightVol.toLocaleString()} kg</p>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Reading & Study</span>
            <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              {totalPages} pages
            </p>
            {totalSkillMins > 0 && (
              <p className="text-[10px] text-slate-400 font-mono">
                + {totalSkillMins}m skill study
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown Chart & Logged Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Donut Chart Discipline Breakdown */}
        <div className="glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            Discipline Effort Distribution
          </h3>

          {donutData.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center p-4">
              <Activity className="w-8 h-8 text-slate-400 mb-2 stroke-[1.5]" />
              <p className="text-xs text-slate-500 font-medium">No activity sessions logged for this period.</p>
            </div>
          ) : (
            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [`${val} mins`, 'Active Time']}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-center text-xs pt-1">
            {Object.keys(CATEGORY_COLORS).map(cat => (
              <div key={cat} className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                <span className="text-slate-600 dark:text-slate-400 capitalize">{cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logged Activity Feed Cards */}
        <div className="lg:col-span-2 glass-panel-dark rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Logged Session History ({activeLogs.length})
            </h3>
          </div>

          {activeLogs.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Activity className="w-8 h-8 text-slate-400 mx-auto stroke-[1.5]" />
              <p className="text-xs text-slate-500 font-medium">No activity sessions logged for this timeframe.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold mt-2 cursor-pointer"
              >
                Log First Session
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {activeLogs.map((act) => {
                const IconC = getCategoryIcon(act);
                
                return (
                  <div
                    key={act.id}
                    className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 transition hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      
                      <div className="flex items-start space-x-3">
                        <div
                          className="p-2.5 rounded-xl text-white shadow-sm shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[act.type] || '#6366f1' }}
                        >
                          <IconC className="w-5 h-5" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{act.title}</h4>
                            
                            {/* Distinct Category & Sub-Type Badges */}
                            {act.type === 'reading' ? (
                              <span className="text-[10px] px-2 py-0.2 rounded-full uppercase font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                {act.readingSubType === 'skill' ? '🧠 Skill Topic' : '📖 Book'}
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.2 rounded-full uppercase font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {act.type}
                              </span>
                            )}

                            {act.sessionFocus && (
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-cyan-300 border border-indigo-500/20 font-bold">
                                {act.sessionFocus}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-mono">
                            <span>📅 {act.date}</span>
                            <span>•</span>
                            <span>⏱️ {act.durationMins} mins</span>

                            {act.totalVolumeKg !== undefined && act.totalVolumeKg > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                  🏋️ Total Vol: {act.totalVolumeKg.toLocaleString()} kg
                                </span>
                              </>
                            )}

                            {act.type === 'running' && (
                              <>
                                <span>•</span>
                                <span className="text-cyan-600 dark:text-cyan-400 font-bold">🏃 {act.distance} km</span>
                                <span>•</span>
                                <span>⚡ {act.pace} min/km</span>
                              </>
                            )}

                            {act.type === 'swimming' && (
                              <>
                                <span>•</span>
                                <span className="text-sky-600 dark:text-sky-400 font-bold">🏊 {act.stroke}</span>
                                <span>•</span>
                                <span>🌊 {act.laps} laps ({act.distance || 0} km)</span>
                              </>
                            )}

                            {act.type === 'sports' && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">🏆 {act.sportType}</span>
                                {act.intensity && <span>• {act.intensity}</span>}
                              </>
                            )}

                            {/* Reading: Book vs. Skill Topic Details */}
                            {act.type === 'reading' && (
                              <>
                                {act.readingSubType === 'skill' ? (
                                  <>
                                    <span>•</span>
                                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                                      🧠 {act.skillName || act.topic}
                                    </span>
                                    {act.moduleName && (
                                      <>
                                        <span>•</span>
                                        <span className="text-slate-600 dark:text-slate-400">
                                          📌 {act.moduleName}
                                        </span>
                                      </>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <span>•</span>
                                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                                      📖 {act.bookTitle || act.topic} ({act.pagesRead} pages)
                                    </span>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setEditingActivity(act);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                          title="Edit Log"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteActivity(act.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                          title="Delete Log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Multi-Exercise Breakdown Tags for Gym Workouts */}
                    {act.type === 'gym' && act.exercises && Array.isArray(act.exercises) && act.exercises.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                          <Layers className="w-3 h-3 text-indigo-500" />
                          <span>Exercises Completed ({act.exercises.length}):</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {act.exercises.map((ex, exIdx) => {
                            const hasSetList = ex.setList && Array.isArray(ex.setList) && ex.setList.length > 0;
                            const parsedReps = parseInt(ex.reps, 10) || 10;
                            const exVol = ex.exerciseVolumeKg !== undefined
                              ? ex.exerciseVolumeKg
                              : hasSetList
                                ? ex.setList.reduce((acc, s) => acc + ((Number(s.weightKg) || 0) * (Number(s.reps) || 0)), 0)
                                : (Number(ex.sets) || 1) * parsedReps * (Number(ex.weightKg) || 0);

                            return (
                              <div
                                key={ex.id || exIdx}
                                className="p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-800 dark:text-slate-200">{ex.name}</span>
                                  {exVol > 0 && (
                                    <span className="font-mono text-[10px] text-indigo-600 dark:text-cyan-400 font-bold bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                                      {exVol}kg vol
                                    </span>
                                  )}
                                </div>

                                {hasSetList ? (
                                  <div className="flex flex-wrap gap-1 pt-0.5">
                                    {ex.setList.map((s, sIdx) => (
                                      <span
                                        key={sIdx}
                                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                                      >
                                        <span className="text-slate-400 dark:text-slate-500 font-sans mr-0.5">S{s.setNumber || sIdx + 1}:</span>
                                        <strong>{s.weightKg}kg</strong> × {s.reps}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="font-mono text-[11px] text-indigo-600 dark:text-cyan-400 font-bold">
                                    {ex.sets}x{ex.reps} @ {ex.weightKg}kg
                                  </div>
                                )}

                                {ex.notes && (
                                  <p className="text-[10px] text-slate-500 italic">
                                    "{ex.notes}"
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {act.notes && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                        "{act.notes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Activity Creation / Edit Modal */}
      <ActivityModal
        isOpen={isModalOpen}
        initialData={editingActivity}
        onClose={() => {
          setIsModalOpen(false);
          setEditingActivity(null);
        }}
        onSave={(payload) => {
          if (editingActivity) {
            updateActivity(editingActivity.id, payload);
          } else {
            addActivity(payload);
          }
        }}
      />

    </div>
  );
};
