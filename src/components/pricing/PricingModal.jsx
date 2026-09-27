import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { PLAN_TIERS, getRemainingFounderSeats } from '../../utils/pricingUtils';
import {
  X,
  Shield,
  Check,
  Sparkles,
  Tag,
  ArrowRight,
  Flame,
  CheckCircle2,
  Crown,
  Zap,
  Lock
} from 'lucide-react';

export const PricingModal = () => {
  const {
    isPricingModalOpen,
    closePricingModal,
    subscriptionTier,
    redeemPromoCode,
    currency
  } = useDashboard();

  const [promoInput, setPromoInput] = useState('');
  const [promoStatus, setPromoStatus] = useState(null); // { type: 'success'|'error', message }
  const [isApplying, setIsApplying] = useState(false);

  if (!isPricingModalOpen) return null;

  const remainingSeats = getRemainingFounderSeats();
  const isFounder = subscriptionTier === 'founder';
  const isPro = subscriptionTier === 'monthly' || subscriptionTier === 'yearly' || subscriptionTier === 'pro';

  const handleApplyPromo = async (e) => {
    if (e) e.preventDefault();
    if (!promoInput.trim()) return;

    setIsApplying(true);
    setPromoStatus(null);

    try {
      const res = await redeemPromoCode(promoInput.trim());
      if (res.valid) {
        setPromoStatus({ type: 'success', message: res.message });
        setPromoInput('');
      } else {
        setPromoStatus({ type: 'error', message: res.message });
      }
    } catch (err) {
      setPromoStatus({ type: 'error', message: 'Failed to redeem code. Please check spelling.' });
    } finally {
      setIsApplying(false);
    }
  };

  const quickApplyFamilyCode = async () => {
    setPromoInput('FAMILY100');
    setIsApplying(true);
    const res = await redeemPromoCode('FAMILY100');
    if (res.valid) {
      setPromoStatus({ type: 'success', message: res.message });
      setPromoInput('');
    } else {
      setPromoStatus({ type: 'error', message: res.message });
    }
    setIsApplying(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 dark:bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-4xl w-full rounded-3xl p-5 sm:p-8 shadow-2xl relative my-6 max-h-[92vh] overflow-y-auto space-y-6">
        
        {/* Close Button */}
        <button
          onClick={closePricingModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer z-10"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2 pt-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Launch Special · Exclusive Early Access</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Master Your Daily Operating Rhythm
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Clean, high-performance intelligence to build unbreakable habits, execute priority goals, and gain financial clarity.
          </p>
        </div>

        {/* Active Founder Banner (If already claimed) */}
        {isFounder && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  Founder Member Active · 100% Lifetime Free
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  You have full unlocked access to all current and future intelligence suites.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold text-xs border border-emerald-500/30">
              ✓ Lifetime VIP
            </span>
          </div>
        )}

        {/* Friends & Family Scarcity Callout (If not yet founder) */}
        {!isFounder && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-cyan-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200">
              <Flame className="w-4 h-4 text-amber-500 shrink-0 animate-bounce" />
              <span>
                <strong>Friends & Family Release:</strong> First 100 members get <strong>100% Lifetime Free</strong> with code <code className="font-mono font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded">FAMILY100</code> ({remainingSeats} spots left).
              </span>
            </div>
            <button
              onClick={quickApplyFamilyCode}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition cursor-pointer shrink-0 flex items-center gap-1"
            >
              <span>1-Tap Apply FAMILY100</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3 High-Impact Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          
          {/* Card 1: Monthly Pro */}
          <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Pro Monthly</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                  60% OFF Launch
                </span>
              </div>

              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">₹99</span>
                  <span className="text-xs text-slate-400">/ month</span>
                  <span className="text-xs text-slate-400 line-through ml-1">₹249</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Flexible monthly operating rhythm</p>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Unlimited Habits & Sub-goals</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Goal Advisory & AI Directives</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Cross-Domain Correlations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Full iCalendar (.ics) Sync</span>
                </li>
              </ul>
            </div>

            <button
              onClick={quickApplyFamilyCode}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold transition cursor-pointer"
            >
              Select Monthly
            </button>
          </div>

          {/* Card 2: Yearly Pro (⭐ Best Value) */}
          <div className="rounded-2xl p-5 border-2 border-indigo-500 bg-gradient-to-b from-indigo-50/60 via-white to-indigo-50/20 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 flex flex-col justify-between space-y-4 relative shadow-xl shadow-indigo-500/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                ⭐ Best Value · 2 Mos Free
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-indigo-900 dark:text-indigo-200">Pro Yearly</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Save 33%
                </span>
              </div>

              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">₹799</span>
                  <span className="text-xs text-slate-400">/ year</span>
                  <span className="text-xs text-slate-400 line-through ml-1">₹1,999</span>
                </div>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                  Just ~₹66/mo (Less than 1 coffee a month)
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-indigo-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Everything in Pro Monthly</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>2 Months Completely Free</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Predictive Feasibility Radar</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Executive Multi-Pillar Analytics</span>
                </li>
              </ul>
            </div>

            <button
              onClick={quickApplyFamilyCode}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              Get Pro Yearly
            </button>
          </div>

          {/* Card 3: Founder Lifetime Pass (👑 One-Time) */}
          <div className="rounded-2xl p-5 border-2 border-amber-500/70 bg-gradient-to-b from-amber-50/60 via-white to-amber-50/20 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 flex flex-col justify-between space-y-4 relative shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                👑 Own Forever · Zero Subs
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-1">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>Founder Lifetime</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  70% OFF
                </span>
              </div>

              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {isFounder ? 'Free (Claimed)' : '₹1,499'}
                  </span>
                  {!isFounder && (
                    <span className="text-xs text-slate-400 line-through ml-1">₹4,999</span>
                  )}
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                  {isFounder ? '✓ Active Founder Pass' : 'Pay once · Zero subscriptions forever'}
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-amber-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Unlimited Lifetime Access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>All Future Intelligence Updates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Verified Founder Badge</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Free with code FAMILY100</span>
                </li>
              </ul>
            </div>

            {isFounder ? (
              <button
                disabled
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-default"
              >
                <Check className="w-4 h-4" />
                <span>Founder Active</span>
              </button>
            ) : (
              <button
                onClick={quickApplyFamilyCode}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Claim Free with FAMILY100
              </button>
            )}
          </div>

        </div>

        {/* Clean Promo Code Redemption Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              <span>Have an Invite Code?</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Friends & Family Early Access
            </span>
          </div>

          <form onSubmit={handleApplyPromo} className="flex flex-col sm:flex-row items-stretch gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              placeholder="Enter code: FAMILY100"
              className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 uppercase"
            />
            <button
              type="submit"
              disabled={isApplying || !promoInput.trim()}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer shrink-0"
            >
              {isApplying ? 'Checking...' : 'Apply Code'}
            </button>
          </form>

          {promoStatus && (
            <div className={'p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ' + (
              promoStatus.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
            )}>
              {promoStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span>{promoStatus.message}</span>
            </div>
          )}
        </div>

        {/* Free Starter Note & Privacy Guarantee */}
        <div className="pt-1 text-center space-y-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Want to use free forever? <strong>Starter Plan</strong> includes up to 5 habits & 3 active goals with no time limits.
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            <span>100% Private · Zero Advertising · Zero Data Selling</span>
          </p>
        </div>

      </div>
    </div>
  );
};
