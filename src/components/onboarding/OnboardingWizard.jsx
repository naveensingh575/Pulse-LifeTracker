import React, { useState } from 'react';
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
  Zap
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
    defaultGoal: 'Ship Q4 Priority Project Milestone'
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
    defaultGoal: 'Complete 30-Day Fitness Streak'
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
    defaultGoal: 'Build 21-Day Unbroken Habit Rhythm'
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
    defaultGoal: 'Master Daily Operating System'
  }
];

export const OnboardingWizard = ({ onDismiss }) => {
  const {
    addHabit,
    addGoal,
    setMonthlyBudget,
    currency,
    redeemPromoCode,
    subscriptionTier
  } = useDashboard();

  const [step, setStep] = useState(1); // 1: Focus, 2: Momentum Setup, 3: Founder Pass
  const [selectedFocusId, setSelectedFocusId] = useState('balance');
  const selectedFocus = FOCUS_AREAS.find(f => f.id === selectedFocusId) || FOCUS_AREAS[3];

  // Step 2 states
  const [selectedHabits, setSelectedHabits] = useState(selectedFocus.recommendedHabits);
  const [goalTitle, setGoalTitle] = useState(selectedFocus.defaultGoal);
  const [budgetVal, setBudgetVal] = useState(currency === '₹' ? 30000 : 2500);

  // Step 3 states
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(subscriptionTier === 'founder');
  const [promoMessage, setPromoMessage] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  // When focus area changes, update suggested habits & goal
  const handleSelectFocus = (focus) => {
    setSelectedFocusId(focus.id);
    setSelectedHabits(focus.recommendedHabits);
    setGoalTitle(focus.defaultGoal);
  };

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
    const res = await redeemPromoCode(targetCode);
    if (res.valid) {
      setPromoApplied(true);
      setPromoMessage(res.message);
      setPromoCode(targetCode);
    } else {
      setPromoMessage(res.message);
    }
  };

  const handleCompleteOnboarding = async () => {
    setIsFinishing(true);
    try {
      // 1. Add selected habits
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

      // 3. Create starter goal
      if (goalTitle.trim() && addGoal) {
        await addGoal({
          title: goalTitle.trim(),
          category: selectedFocus.title.split('&')[0].trim() || 'General',
          target_value: 100,
          current_value: 10,
          unit: '%',
          color: 'indigo',
          priority: 'high'
        });
      }
    } catch (err) {
      console.error('Error in onboarding setup', err);
    } finally {
      setIsFinishing(false);
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

      {/* ── STEP 1: CHOOSE CORE FOCUS AREA ────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              What is your primary focus right now?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              We'll tailor your starter dashboard, keystone habits, and goal calibration engine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {FOCUS_AREAS.map((focus) => {
              const IconC = focus.icon;
              const isSelected = selectedFocusId === focus.id;
              return (
                <div
                  key={focus.id}
                  onClick={() => handleSelectFocus(focus)}
                  className={'p-4 rounded-2xl border-2 cursor-pointer transition-all ' + (
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-600 shadow-md shadow-indigo-500/10'
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
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">{focus.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{focus.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={() => setStep(2)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              <span>Next: Starter Habits</span>
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
              Select your initial keystone habits and monthly living budget cap.
            </p>
          </div>

          {/* Habits Selection */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Select Starter Habits ({selectedHabits.length} selected):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedFocus.recommendedHabits.map((habit, idx) => {
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
                    <span className="text-xs">{habit.name}</span>
                    <div className={'w-4 h-4 rounded flex items-center justify-center ' + (
                      isChecked ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-700'
                    )}>
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Starter Goal */}
          <div className="space-y-1.5 pt-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-500" />
              <span>Primary Milestone Target</span>
            </span>
            <input
              type="text"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="e.g. Run 10km Marathon, Ship Product Milestone"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
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
              onClick={() => setStep(1)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              onClick={() => setStep(3)}
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
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                100% Free with Code
              </span>
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

          {/* Promo Code Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>Friends & Family VIP Invite Code:</span>
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">100% Free Lifetime Pass</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="FAMILY100"
                className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => handleApplyPromoCode(promoCode || 'FAMILY100')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-sm cursor-pointer shrink-0"
              >
                Apply Code
              </button>
            </div>

            {promoMessage && (
              <p className={'text-xs font-semibold ' + (promoApplied ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                {promoMessage}
              </p>
            )}

            {/* Quick 1-tap code chips */}
            {!promoApplied && (
              <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                <span className="text-slate-400">1-Tap Apply:</span>
                <button
                  type="button"
                  onClick={() => handleApplyPromoCode('FAMILY100')}
                  className="px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80 font-mono font-bold transition cursor-pointer"
                >
                  FAMILY100
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setStep(2)}
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
              <span>{isFinishing ? 'Launching...' : 'Launch Dashboard'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
