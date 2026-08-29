import React, { useState, useEffect } from 'react';
import { getISTDateString } from '../../utils/dateUtils';
import {
  X,
  Dumbbell,
  Activity,
  Waves,
  Trophy,
  BookOpen,
  Plus,
  Trash2,
  Clock,
  Flame,
  Check,
  Brain,
  Book
} from 'lucide-react';

export const ActivityModal = ({ isOpen, onClose, onSave }) => {
  const [actType, setActType] = useState('gym'); // 'gym' | 'running' | 'swimming' | 'sports' | 'reading'
  
  // Shared fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getISTDateString());
  const [durationMins, setDurationMins] = useState(45);
  const [notes, setNotes] = useState('');

  // Gym Multi-Exercise State
  const [sessionFocus, setSessionFocus] = useState('Chest & Triceps');
  const [exercises, setExercises] = useState([
    { id: 'ex-1', name: 'Barbell Bench Press', sets: 4, reps: '10', weightKg: 75, notes: '' }
  ]);

  // Running fields
  const [distanceKm, setDistanceKm] = useState(5.0);
  const [heartRateZone, setHeartRateZone] = useState('Zone 3 (Aerobic)');
  const [pace, setPace] = useState('5.00');

  // Swimming fields (Isolated)
  const [stroke, setStroke] = useState('Freestyle');
  const [laps, setLaps] = useState(20);
  const [poolLengthMeters, setPoolLengthMeters] = useState(50);

  // Sports & Athletics fields (Isolated)
  const [sportType, setSportType] = useState('Badminton');
  const [intensity, setIntensity] = useState('Competitive Match');

  // Reading & Learning Sub-Type State ('book' vs. 'skill')
  const [readingSubType, setReadingSubType] = useState('book'); // 'book' | 'skill'
  const [bookTitle, setBookTitle] = useState('Atomic Habits');
  const [pagesRead, setPagesRead] = useState(25);
  const [skillName, setSkillName] = useState('System Design');
  const [moduleName, setModuleName] = useState('Chapter 3: Cache Invalidation');

  // Auto calculate running pace (min/km)
  useEffect(() => {
    if (actType === 'running' && distanceKm > 0 && durationMins > 0) {
      const computedPace = (durationMins / distanceKm).toFixed(2);
      setPace(computedPace);
    }
  }, [actType, distanceKm, durationMins]);

  if (!isOpen) return null;

  // Exercise manipulation helpers
  const handleAddExercise = () => {
    setExercises(prev => [
      ...prev,
      {
        id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: '',
        sets: 3,
        reps: '10',
        weightKg: 0,
        notes: ''
      }
    ]);
  };

  const handleUpdateExercise = (id, field, value) => {
    setExercises(prev =>
      prev.map(ex => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  };

  const handleRemoveExercise = (id) => {
    if (exercises.length <= 1) return; // Keep at least one exercise
    setExercises(prev => prev.filter(ex => ex.id !== id));
  };

  const getDefaultTitle = () => {
    if (actType === 'gym') return `${sessionFocus || 'Strength'} Workout`;
    if (actType === 'running') return `${distanceKm}k Cardio Run`;
    if (actType === 'swimming') return `${stroke} Swim Session`;
    if (actType === 'sports') return `${sportType} Session`;
    if (actType === 'reading') {
      return readingSubType === 'book'
        ? `Reading: ${bookTitle || 'Book'}`
        : `Learning: ${skillName || 'Skill Topic'}`;
    }
    return 'Activity Session';
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const baseActivity = {
      type: actType,
      title: title.trim() || getDefaultTitle(),
      date,
      durationMins: Number(durationMins) || 0,
      notes: notes.trim()
    };

    let payload = { ...baseActivity };

    if (actType === 'gym') {
      const sanitizedExercises = exercises.map(ex => ({
        id: ex.id,
        name: ex.name.trim() || 'Exercise',
        sets: Number(ex.sets) || 1,
        reps: ex.reps || '10',
        weightKg: Number(ex.weightKg) || 0,
        notes: ex.notes ? ex.notes.trim() : ''
      }));

      const totalVolumeKg = sanitizedExercises.reduce((acc, ex) => {
        const parsedReps = parseInt(ex.reps, 10) || 10;
        return acc + (ex.sets * parsedReps * ex.weightKg);
      }, 0);

      // Primary lift for backward-compatible display
      const primary = sanitizedExercises[0] || { name: 'Workout', sets: 4, reps: '10', weightKg: 0 };

      payload = {
        ...payload,
        sessionFocus: sessionFocus.trim(),
        exercises: sanitizedExercises,
        totalVolumeKg,
        exercise: primary.name,
        sets: primary.sets,
        reps: primary.reps,
        weightKg: primary.weightKg
      };
    } else if (actType === 'running') {
      payload = {
        ...payload,
        distance: Number(distanceKm) || 0,
        pace,
        heartRateZone
      };
    } else if (actType === 'swimming') {
      const totalSwimDistanceKm = ((Number(laps) || 0) * (Number(poolLengthMeters) || 50)) / 1000;
      payload = {
        ...payload,
        stroke,
        laps: Number(laps) || 0,
        poolLengthMeters: Number(poolLengthMeters) || 50,
        distance: Number(totalSwimDistanceKm.toFixed(2))
      };
    } else if (actType === 'sports') {
      payload = {
        ...payload,
        sportType,
        intensity
      };
    } else if (actType === 'reading') {
      if (readingSubType === 'book') {
        payload = {
          ...payload,
          readingSubType: 'book',
          bookTitle: bookTitle.trim() || 'Book Reading',
          topic: bookTitle.trim() || 'Book Reading',
          pagesRead: Number(pagesRead) || 0
        };
      } else {
        payload = {
          ...payload,
          readingSubType: 'skill',
          skillName: skillName.trim() || 'Skill Topic',
          moduleName: moduleName.trim(),
          topic: skillName.trim() || 'Skill Topic',
          pagesRead: 0
        };
      }
    }

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glass-panel-dark bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Log Activity Session</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Multi-exercise gym logs, cardio endurance, book reading & skill study</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Discipline Category Tabs (5 Distinct Disciplines) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Activity Discipline</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'gym', label: 'Gym / Strength', icon: Dumbbell },
                { id: 'running', label: 'Running / Cardio', icon: Activity },
                { id: 'swimming', label: 'Swimming', icon: Waves },
                { id: 'sports', label: 'Sports', icon: Trophy },
                { id: 'reading', label: 'Reading / Skill', icon: BookOpen }
              ].map((item) => {
                const IconC = item.icon;
                const isActive = actType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActType(item.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition space-y-1 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <IconC className="w-4 h-4" />
                    <span className="text-[10px] truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Session Title & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Session Name</label>
              <input
                type="text"
                placeholder={getDefaultTitle()}
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Log Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* 🏋️ 1. MULTI-EXERCISE GYM & STRENGTH SESSION BUILDER */}
          {actType === 'gym' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              
              {/* Session Focus / Muscle Group */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Session Focus / Muscle Group</label>
                <input
                  type="text"
                  placeholder="e.g. Chest & Triceps, Leg Day, Push Workout, Full Body"
                  value={sessionFocus}
                  onChange={e => setSessionFocus(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Chest & Triceps', 'Back & Biceps', 'Legs & Core', 'Shoulders & Arms', 'Full Body Hypertrophy'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSessionFocus(tag)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition ${
                        sessionFocus === tag
                          ? 'bg-indigo-500 text-white border-indigo-500 font-bold'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercises List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Exercises in this Session ({exercises.length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddExercise}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-cyan-300 text-xs font-bold border border-indigo-500/20 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Exercise</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {exercises.map((ex, index) => (
                    <div
                      key={ex.id}
                      className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          #{index + 1}
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="Exercise name (e.g. Incline Dumbbell Press)"
                          value={ex.name}
                          onChange={e => handleUpdateExercise(ex.id, 'name', e.target.value)}
                          className="flex-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                        {exercises.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(ex.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                            title="Remove Exercise"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-0.5">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Sets</label>
                          <input
                            type="number"
                            min="1"
                            value={ex.sets}
                            onChange={e => handleUpdateExercise(ex.id, 'sets', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Reps / Set</label>
                          <input
                            type="text"
                            placeholder="10 or 12-10-8"
                            value={ex.reps}
                            onChange={e => handleUpdateExercise(ex.id, 'reps', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Weight (kg)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={ex.weightKg}
                            onChange={e => handleUpdateExercise(ex.id, 'weightKg', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 🏃 2. RUNNING / CARDIO */}
          {actType === 'running' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={distanceKm}
                    onChange={e => setDistanceKm(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Auto Calculated Pace</label>
                  <input
                    type="text"
                    readOnly
                    value={`${pace} min/km`}
                    className="w-full px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-extrabold text-indigo-600 dark:text-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Heart Rate / Training Zone</label>
                <select
                  value={heartRateZone}
                  onChange={e => setHeartRateZone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="Zone 1 (Warmup)">Zone 1 (Warmup - Light Pace)</option>
                  <option value="Zone 2 (Endurance)">Zone 2 (Fat Burn / Endurance)</option>
                  <option value="Zone 3 (Aerobic)">Zone 3 (Aerobic Tempo)</option>
                  <option value="Zone 4 (Threshold)">Zone 4 (Lactate Threshold)</option>
                  <option value="Zone 5 (Max Sprint)">Zone 5 (Max Sprint)</option>
                </select>
              </div>
            </div>
          )}

          {/* 🏊 3. SWIMMING (ISOLATED CATEGORY) */}
          {actType === 'swimming' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Swimming Stroke / Style</label>
                  <select
                    value={stroke}
                    onChange={e => setStroke(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
                  >
                    <option value="Freestyle">🏊 Freestyle / Front Crawl</option>
                    <option value="Breaststroke">🐸 Breaststroke</option>
                    <option value="Butterfly">🦋 Butterfly</option>
                    <option value="Backstroke">🌊 Backstroke</option>
                    <option value="Individual Medley">🏅 Individual Medley (IM)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pool Length (Meters)</label>
                  <select
                    value={poolLengthMeters}
                    onChange={e => setPoolLengthMeters(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono"
                  >
                    <option value="25">25m (Short Course)</option>
                    <option value="50">50m (Olympic Long Course)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Laps Completed</label>
                  <input
                    type="number"
                    min="1"
                    value={laps}
                    onChange={e => setLaps(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                    placeholder="e.g. 20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Distance</label>
                  <input
                    type="text"
                    readOnly
                    value={`${((laps * poolLengthMeters) / 1000).toFixed(2)} km (${laps * poolLengthMeters}m)`}
                    className="w-full px-3 py-1.5 bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 rounded-xl text-xs font-extrabold text-cyan-600 dark:text-cyan-400 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 🏆 4. SPORTS & ATHLETICS (ISOLATED - NO SWIMMING STROKES) */}
          {actType === 'sports' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Sport Type</label>
                  <select
                    value={sportType}
                    onChange={e => setSportType(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
                  >
                    <option value="Badminton">🏸 Badminton</option>
                    <option value="Football">⚽ Football / Soccer</option>
                    <option value="Tennis">🎾 Tennis</option>
                    <option value="Basketball">🏀 Basketball</option>
                    <option value="Cricket">🏏 Cricket</option>
                    <option value="Table Tennis">🏓 Table Tennis</option>
                    <option value="Squash">🎾 Squash</option>
                    <option value="Volleyball">🏐 Volleyball</option>
                    <option value="Cycling">🚴 Outdoor Cycling</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Match Intensity</label>
                  <select
                    value={intensity}
                    onChange={e => setIntensity(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="Casual Play">Casual / Warmup Match</option>
                    <option value="Competitive Match">Competitive Match (Medium Intensity)</option>
                    <option value="Tournament / Hard">High-Intensity Tournament Match</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 📚 5. DEDICATED READING & LEARNING (BOOK vs. SKILL TOPIC) */}
          {actType === 'reading' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              
              {/* Sub-Category Toggle: Book vs. Skill Topic */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Learning Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReadingSubType('book')}
                    className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      readingSubType === 'book'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <Book className="w-4 h-4" />
                    <span>📖 Book Reading</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReadingSubType('skill')}
                    className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      readingSubType === 'skill'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <Brain className="w-4 h-4" />
                    <span>🧠 Skill / Self-Study</span>
                  </button>
                </div>
              </div>

              {/* 📖 SUB-TYPE: BOOK FIELDS */}
              {readingSubType === 'book' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Book Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Atomic Habits, Psychology of Money, Clean Code"
                      value={bookTitle}
                      onChange={e => setBookTitle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pages Read</label>
                    <input
                      type="number"
                      min="1"
                      value={pagesRead}
                      onChange={e => setPagesRead(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono font-bold text-amber-600 dark:text-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* 🧠 SUB-TYPE: SKILL TOPIC FIELDS */}
              {readingSubType === 'skill' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Skill / Topic Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. System Design, Advanced Excel, Data Structures, Spanish"
                      value={skillName}
                      onChange={e => setSkillName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Module / Lesson / Resource Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Chapter 3: Cache Invalidation, YouTube Lecture, Documentation"
                      value={moduleName}
                      onChange={e => setModuleName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Session Duration (Applies to the entire session) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Total Session Duration (Minutes)</span>
              <span className="font-mono text-indigo-600 dark:text-cyan-400 font-extrabold">{durationMins} mins</span>
            </label>
            <input
              type="number"
              min="5"
              step="5"
              value={durationMins}
              onChange={e => setDurationMins(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Overall Notes / Reflections */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {actType === 'reading'
                ? readingSubType === 'book'
                  ? 'Key Takeaways / Book Notes'
                  : 'Key Concepts Learned / Notes'
                : 'Overall Notes / Key Takeaways'}
            </label>
            <textarea
              rows="2"
              placeholder={
                actType === 'reading'
                  ? readingSubType === 'book'
                    ? 'Record favorite quotes, chapter summaries, or highlights...'
                    : 'Summarize core insights, architecture trade-offs, or formula notes...'
                  : 'Record workout highlights, PR weights, feel, pace notes, or key learnings...'
              }
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              Save Activity Session
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
