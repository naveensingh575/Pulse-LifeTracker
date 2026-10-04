import React, { useState, useMemo, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  Sparkles,
  CheckCircle2,
  Check,
  ArrowRight,
  ArrowLeft,
  Flame,
  Target,
  Wallet,
  Shield,
  Dumbbell,
  Briefcase,
  Compass,
  Crown,
  Tag,
  Zap,
  Layers
} from 'lucide-react';

const FOCUS_AREAS = [
  {
    id: 'career',
    title: 'Career & High Output',
    icon: Briefcase,
    color: 'indigo',
    desc: 'Deep work focus, high-priority task velocity & deadline execution.',
    recommendedHabits: [
      { name: '🎯 90m Deep Work Block', category: 'Career', target: 90, unit: 'mins' },
      { name: '📖 Read 15 Minutes', category: 'Mind', target: 15, unit: 'mins' }
    ],
    defaultGoal: 'Ship Q4 Priority Project Milestone',
    starterTask: 'Outline key milestones and deliverables for current project'
  },
  {
    id: 'fitness',
    title: 'Fitness & Physical Vitality',
    icon: Dumbbell,
    color: 'cyan',
    desc: 'Strength training, active running, hydration & daily stamina.',
    recommendedHabits: [
      { name: '💧 Drink 2.5L Water', category: 'Health', target: 1, unit: 'daily' },
      { name: '🏋️‍♂️ Daily Workout / Movement', category: 'Fitness', target: 30, unit: 'mins' }
    ],
    defaultGoal: 'Complete 30-Day Fitness Streak',
    starterTask: 'Schedule weekly workout sessions and prep training routine'
  },
  {
    id: 'habits',
    title: 'Mind & Habit Discipline',
    icon: Flame,
    color: 'amber',
    desc: 'Unbroken daily routines, morning planning & evening reflections.',
    recommendedHabits: [
      { name: '💧 Drink 2.5L Water', category: 'Health', target: 1, unit: 'daily' },
      { name: '🧘 Morning Mindfulness / Walk', category: 'Mind', target: 15, unit: 'mins' },
      { name: '✍️ Evening Debrief Journal', category: 'Mind', target: 1, unit: 'daily' }
    ],
    defaultGoal: 'Build 21-Day Unbroken Habit Rhythm',
    starterTask: 'Establish morning focus protocol and evening review habit'
  },
  {
    id: 'balance',
    title: 'Complete Life Synergy',
    icon: Compass,
    color: 'emerald',
    desc: 'Holistic balance across habits, physical vitality, tasks & cash flow.',
    recommendedHabits: [
      { name: '💧 Drink 2.5L Water', category: 'Health', target: 1, unit: 'daily' },
      { name: '🏋️‍♂️ Daily Movement (20m+)', category: 'Fitness', target: 20, unit: 'mins' },
      { name: '📖 Read 15 Minutes', category: 'Mind', target: 15, unit: 'mins' }
    ],
    defaultGoal: 'Master Daily Operating System',
    starterTask: 'Review weekly life goals and allocate monthly spending budget'
  }
];

export const OnboardingWizard = ({ onDismiss }) => {
  const {
    addHabit,
    addGoal,
    addTask,
    setMonthlyBudget,
    currency,
    redeemPromoCode,
    subscriptionTier
  } = useDashboard();

  // Preserved step in sessionStorage so reload or auth sync never resets to step 1
  const [step, setStep] = useState(() => {
    try {
      const saved = sessionStorage.getItem('pulse_onboarding_step');
      return saved ? Math.min(3, Math.max(1, Number(saved))) : 1;
    } catch {
      return 1;
    }
  });

  const goToStep = (s) => {
    setStep(s);
    try {
      sessionStorage.setItem('pulse_onboarding_step', String(s));
    } catch {}
  };

  // Step 1: Multi-selection focus areas
  const [selectedFocusIds, setSelectedFocusIds] = useState(() => {
    try {
      const saved = sessionStorage.getItem('pulse_onboarding_focus_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return ['career', 'fitness']; // Default multi-select to showcase capability
  });

  const handleToggleFocus = (focusId) => {
    setSelectedFocusIds(prev => {
      let next;
      if (prev.includes(focusId)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        next = prev.filter(id => id !== focusId);
      } else {
        next = [...prev, focusId];
      }
      try {
        sessionStorage.setItem('pulse_onboarding_focus_ids', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const selectedFocuses = useMemo(() => {
    return FOCUS_AREAS.filter(f => selectedFocusIds.includes(f.id));
  }, [selectedFocusIds]);

  // Aggregate habits across all chosen focus areas (deduplicated by name)
  const allRecommendedHabits = useMemo(() => {
    const habitMap = new Map();
    selectedFocuses.forEach(f => {
      f.recommendedHabits.forEach(h => {
        if (!habitMap.has(h.name)) {
          habitMap.set(h.name, { ...h, focusTitle: f.title.split('&')[0].trim() });
        }
      });
    });
    return Array.from(habitMap.values());
  }, [selectedFocuses]);

  // Step 2 states: habits selected
  const [selectedHabits, setSelectedHabits] = useState(allRecommendedHabits);

  // Sync selected habits when focus areas change
  useEffect(() => {
    setSelectedHabits(prev => {
      const existingNames = new Set(prev.map(h => h.name));
      const next = [...prev];
      allRecommendedHabits.forEach(h => {
        if (!existingNames.has(h.name)) {
          next.push(h);
        }
      });
      // Retain only habits from currently active focus areas
      const validNames = new Set(allRecommendedHabits.map(h => h.name));
      return next.filter(h => validNames.has(h.name));
    });
  }, [allRecommendedHabits]);

  // Milestone goals for each selected focus
  const [goalsByFocus, setGoalsByFocus] = useState(() => {
    const initial = {};
    FOCUS_AREAS.forEach(f => {
      initial[f.id] = f.defaultGoal;
    });
    return initial;
  });

  const [budgetVal, setBudgetVal] = useState(currency === '₹' ? 30000 : 2500);

  // Step 3 states
  const isAlreadyLifetime = subscriptionTier === 'lifetime' || subscriptionTier === 'founder';
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(isAlreadyLifetime);
  const [promoMessage, setPromoMessage] = useState(isAlreadyLifetime ? '🎉 VIP Lifetime Pass Active!' : '');
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Sync promoApplied if subscriptionTier changes externally
  useEffect(() => {
    if (subscriptionTier === 'lifetime' || subscriptionTier === 'founder') {
      setPromoApplied(true);
    }
  }, [subscriptionTier]);

  const toggleHabitSelection = (habit) => {
    setSelectedHabits(prev =>
      prev.some(h => h.name === habit.name)
        ? prev.filter(h => h.name !== habit.name)
        : [...prev, habit]
    );
  };

  const handleApplyPromoCode = async (codeToApply) => {
    const targetCode = (codeToApply || promoCode).trim().toUpperCase();
    if (!targetCode) return;
    setIsApplyingCode(true);
    setPromoMessage('');
    try {
      const res = await redeemPromoCode(targetCode);
      if (res.valid) {
        setPromoApplied(true);
        setPromoMessage(res.message || '🎉 VIP Lifetime Pass successfully claimed!');
        setPromoCode(targetCode);
      } else {
        setPromoMessage(res.message || 'Invalid or unrecognized VIP code.');
      }
    } catch (err) {
      console.error('Error redeeming promo code:', err);
      setPromoMessage('Error redeeming code. Please check your connection.');
    } finally {
      setIsApplyingCode(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setIsFinishing(true);
    try {
      // Auto-redeem promo code if user entered it but forgot to click Claim
      if (!promoApplied && promoCode.trim() && redeemPromoCode) {
        try {
          await redeemPromoCode(promoCode.trim().toUpperCase());
        } catch (e) {
          console.warn('Auto-redeem during onboarding finish failed:', e);
        }
      }

      // 1. Add selected habits (combined across selected focus areas)
      for (const h of selectedHabits) {
        if (addHabit) {
          await addHabit({
            name: h.name,
            category: h.category,
            frequency: 'Daily',
            target_days: 7,
            target_value: h.target,
            unit: h.unit
          });
        }
      }

      // 2. Set monthly budget
      if (budgetVal > 0 && setMonthlyBudget) {
        await setMonthlyBudget(Number(budgetVal));
      }

      // 3. Create starter goals for all selected focus areas
      for (const focus of selectedFocuses) {
        const title = (goalsByFocus[focus.id] || focus.defaultGoal).trim();
        if (title && addGoal) {
          await addGoal({
            title,
            category: focus.title.split('&')[0].trim() || 'General',
            target_value: 100,
            current_value: 10,
            unit: '%',
            color: focus.color || 'indigo',
            priority: 'high'
          });
        }
      }

      // 4. Create starter actionable tasks for selected focus areas
      if (addTask) {
        for (const focus of selectedFocuses) {
          if (focus.starterTask) {
            await addTask({
              title: focus.starterTask,
              priority: 'high',
              category: focus.title.split('&')[0].trim() || 'Work'
            });
          }
        }
      }
    } catch (err) {
      console.error('Error in onboarding setup', err);
    } finally {
      setIsFinishing(false);
      try {
        localStorage.setItem('pulse_onboarding_completed', 'true');
        sessionStorage.removeItem('pulse_onboarding_step');
        sessionStorage.removeItem('pulse_onboarding_focus_ids');
      } catch {}
      if (onDismiss) onDismiss();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
      
      {/* Progress Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Welcome to Pulse Life Tracker
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Step {step} of 3 · 60-Second Operating Setup
            </p>
          </div>
        </div>

        {/* Step Indicator Pills */}
        <div className="flex items-center space-x-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={'w-7 h-2 rounded-full transition-all ' + (
                step === s
                  ? 'bg-indigo-600 w-9'
                  : step > s
                  ? 'bg-emerald-500'
                  : 'bg-slate-200 dark:bg-slate-800'
              )}
            />
          ))}
        </div>
      </div>

      {/* ── STEP 1: MULTI-FOCUS SELECTION ────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              What is your primary focus right now?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select one or more focus areas. We'll tailor your starter dashboard, keystone habits, and goal calibration engine for all chosen areas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {FOCUS_AREAS.map((focus) => {
              const IconC = focus.icon;
              const isSelected = selectedFocusIds.includes(focus.id);
              return (
                <div
                  key={focus.id}
                  onClick={() => handleToggleFocus(focus.id)}
                  className={'p-4 rounded-2xl border-2 cursor-pointer transition-all ' + (
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-600 dark:border-indigo-500 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={'p-2 rounded-xl border ' + (
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    )}>
                      <IconC className="w-4 h-4" />
                    </div>
                    {isSelected ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1 shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Selected</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-400">
                        + Select
                      </span>
                    )}
                  </div>
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">{focus.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{focus.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                {selectedFocusIds.length} {selectedFocusIds.length === 1 ? 'focus area' : 'focus areas'} selected
              </span>
            </span>

            <button
              onClick={() => goToStep(2)}
              disabled={selectedFocusIds.length === 0}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              <span>Next: Starter Habits ({allRecommendedHabits.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: STARTER MOMENTUM SETUP ────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Instant Momentum Setup
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calibrate starter habits, milestone goals, and living budget for your selected focus areas.
            </p>
          </div>

          {/* Active Focus Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mr-1">Focuses:</span>
            {selectedFocuses.map(f => {
              const FIcon = f.icon;
              return (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold"
                >
                  <FIcon className="w-3 h-3" />
                  <span>{f.title}</span>
                </span>
              );
            })}
          </div>

          {/* Habits Selection */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Select Starter Habits ({selectedHabits.length} selected):
              </span>
              <span className="text-[10px] text-slate-400">Combined from selected focus areas</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allRecommendedHabits.map((habit, idx) => {
                const isChecked = selectedHabits.some(h => h.name === habit.name);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleHabitSelection(habit)}
                    className={'p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ' + (
                      isChecked
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-900 dark:text-white font-bold'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs">{habit.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal mt-0.5">{habit.category} · {habit.target} {habit.unit}</span>
                    </div>
                    <div className={'w-4 h-4 rounded flex items-center justify-center shrink-0 ml-2 ' + (
                      isChecked ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-700'
                    )}>
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Starter Goals for all selected focuses */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                <span>Primary Milestone Targets ({selectedFocuses.length} Focus Goals)</span>
              </span>
              <span className="text-[10px] text-slate-400">Customizable per focus</span>
            </div>

            <div className="space-y-2">
              {selectedFocuses.map(f => {
                const FIcon = f.icon;
                return (
                  <div key={f.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <FIcon className="w-3 h-3 text-indigo-500" />
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {f.title} Goal
                      </span>
                    </div>
                    <input
                      type="text"
                      value={goalsByFocus[f.id] || ''}
                      onChange={(e) => setGoalsByFocus(prev => ({ ...prev, [f.id]: e.target.value }))}
                      placeholder={f.defaultGoal}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Budget Allocation */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-500" />
              <span>Monthly Living Budget Ceiling ({currency})</span>
            </span>
            <input
              type="number"
              value={budgetVal}
              onChange={(e) => setBudgetVal(e.target.value)}
              placeholder="30000"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => goToStep(1)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              onClick={() => goToStep(3)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              <span>Next: Founder Pass Unlock</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: FOUNDER PASS & UNLOCK ─────────────────────────── */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span>Claim Your Founder Pass</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Early joiners get 100% lifetime free access to all current and upcoming intelligence modules.
            </p>
          </div>

          {/* Founder Pass Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-cyan-500/10 to-purple-500/10 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Founder Lifetime Member
                </span>
              </div>
              {promoApplied || isAlreadyLifetime ? (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Lifetime Unlocked</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  100% Free with Code
                </span>
              )}
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Goal Advisory Engine</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Cross-Domain Correlations</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Verified Founder Badge</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Lifetime Free Updates</span>
              </li>
            </ul>
          </div>

          {/* Secret VIP Promo Code Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                <span>Have a VIP Invite Code?</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                e.g. Family100
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyPromoCode(promoCode);
                  }
                }}
                disabled={promoApplied}
                placeholder="Enter VIP invite code (e.g. Family100)"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:border-indigo-500 disabled:opacity-70"
              />
              <button
                type="button"
                onClick={() => handleApplyPromoCode(promoCode)}
                disabled={!promoCode.trim() || isApplyingCode || promoApplied}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                {isApplyingCode ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Claiming...</span>
                  </>
                ) : promoApplied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Claimed</span>
                  </>
                ) : (
                  <span>Claim VIP Pass</span>
                )}
              </button>
            </div>

            {promoMessage && (
              <div className={'p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ' + (
                promoApplied
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              )}>
                {promoApplied ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Shield className="w-4 h-4 shrink-0" />}
                <span>{promoMessage}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => goToStep(2)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              onClick={handleCompleteOnboarding}
              disabled={isFinishing}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>{isFinishing ? 'Launching Dashboard...' : 'Launch Dashboard'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
