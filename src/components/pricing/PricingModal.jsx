import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { PLAN_TIERS, getRemainingFounderSeats } from '../../utils/pricingUtils';
import {
  X,
  Shield,
  Check,
  Sparkles,
  Zap,
  Tag,
  ArrowRight,
  Flame,
  Star,
  CheckCircle2,
  Lock,
  Crown
} from 'lucide-react';

export const PricingModal = () => {
  const {
    isPricingModalOpen,
    closePricingModal,
    subscriptionTier,
    founderCode,
    redeemPromoCode,
    currency
  } = useDashboard();

  const [promoInput, setPromoInput] = useState('');
  const [promoStatus, setPromoStatus] = useState(null); // { type: 'success'|'error', message }
  const [isApplying, setIsApplying] = useState(false);

  if (!isPricingModalOpen) return null;

  const remainingSeats = getRemainingFounderSeats();
  const isFounder = subscriptionTier === 'founder';
  const isPro = subscriptionTier === 'pro';

  const handleApplyPromo = async (e) => {
    e.preventDefault();
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
      setPromoStatus({ type: 'error', message: 'Failed to redeem code. Please try again.' });
    } finally {
      setIsApplying(false);
    }
  };

  const quickApplyCode = async (code) => {
    setPromoInput(code);
    setIsApplying(true);
    const res = await redeemPromoCode(code);
    if (res.valid) {
      setPromoStatus({ type: 'success', message: res.message });
      setPromoInput('');
    } else {
      setPromoStatus({ type: 'error', message: res.message });
    }
    setIsApplying(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 dark:bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-4xl w-full rounded-3xl p-5 sm:p-7 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={closePricingModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2 pt-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 text-xs font-bold">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Pulse Membership & Founder Pass</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Level Up Your Daily Operating Rhythm
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Free forever for core tracking. Unlock the full Goal Advisory & Cross-Domain Intelligence engine.
          </p>
        </div>

        {/* Active Founder Pass Banner (if already unlocked) */}
        {isFounder && (
          <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  Verified Founder Member · Lifetime Free Active
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  You have full unlimited access to all current and future Pulse intelligence suites.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold text-xs border border-emerald-500/30">
              ✓ Lifetime Pass Unlocked
            </span>
          </div>
        )}

        {/* Early-Bird Urgency Banner */}
        {!isFounder && (
          <div className="my-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-200 font-medium">
              <Flame className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Early-Adopter Founder Pass:</strong> Only <span className="font-bold text-amber-700 dark:text-amber-400">{remainingSeats} of 200</span> lifetime passes remaining in this release.
              </span>
            </div>
            <button
              onClick={() => quickApplyCode('FOUNDER100')}
              className="hidden sm:flex items-center space-x-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <span>Quick Apply: FOUNDER100</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3-Tier Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          
          {/* 1. Starter Plan */}
          <div className={'rounded-2xl p-5 border flex flex-col justify-between transition-all ' + (
            subscriptionTier === 'free'
              ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-300 dark:border-slate-700'
              : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-85'
          )}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Starter</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Free Forever
                </span>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">₹0</p>
                <p className="text-[11px] text-slate-500">Core personal tracking</p>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                {PLAN_TIERS.free.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                disabled
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold cursor-default"
              >
                {subscriptionTier === 'free' ? '✓ Current Plan' : 'Free Starter'}
              </button>
            </div>
          </div>

          {/* 2. Founder Lifetime Pass (Featured) */}
          <div className={'rounded-2xl p-5 border-2 flex flex-col justify-between relative shadow-xl transition-all ' + (
            isFounder
              ? 'bg-gradient-to-b from-emerald-50/50 via-white to-indigo-50/50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-indigo-950/20 border-emerald-500/60 shadow-emerald-500/10'
              : 'bg-gradient-to-b from-indigo-50/70 via-white to-cyan-50/70 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 border-indigo-500/80 shadow-indigo-500/10'
          )}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                ⭐ Most Popular · Lifetime
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Founder Lifetime</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Early Pass
                </span>
              </div>

              <div>
                <div className="flex items-baseline space-x-1.5">
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {isFounder ? 'Free (Claimed)' : '₹2,499'}
                  </p>
                  {!isFounder && (
                    <span className="text-xs text-slate-400 line-through">₹4,999</span>
                  )}
                </div>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  {isFounder ? 'Active Lifetime Founder Pass' : 'One-time payment · Or 100% Free with Invite Code'}
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-indigo-100 dark:border-slate-800">
                {PLAN_TIERS.founder.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span className="font-medium">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 mt-4 border-t border-indigo-100 dark:border-slate-800">
              {isFounder ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Founder Active</span>
                </button>
              ) : (
                <button
                  onClick={() => quickApplyCode('FOUNDER100')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Claim with Code FOUNDER100</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. Pro Monthly */}
          <div className={'rounded-2xl p-5 border flex flex-col justify-between transition-all ' + (
            isPro
              ? 'bg-slate-50 dark:bg-slate-900/60 border-purple-500'
              : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80'
          )}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Pro Monthly</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  Recurring
                </span>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">₹149<span className="text-xs font-normal text-slate-500">/mo</span></p>
                <p className="text-[11px] text-slate-500">Or ₹1,299 billed annually</p>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                {PLAN_TIERS.pro.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => quickApplyCode('FOUNDER100')}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                Use Founder Pass Instead
              </button>
            </div>
          </div>

        </div>

        {/* Promo Code Redemption Form */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              <span>Redeem Founder / Invite Code</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Instant 100% Lifetime Free Unlock
            </span>
          </div>

          <form onSubmit={handleApplyPromo} className="flex flex-col sm:flex-row items-stretch gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              placeholder="e.g. FOUNDER100, FAMILY_VIP, EARLYBIRD"
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

          {/* Quick Clickable Sample Codes */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
            <span className="text-slate-400">Available Early Codes:</span>
            {['FOUNDER100', 'FAMILY_VIP', 'EARLYBIRD', 'LIFETIME2026'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => quickApplyCode(c)}
                className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 font-mono font-bold cursor-pointer transition"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-2 text-[11px] text-slate-400 dark:text-slate-500">
          Pulse Life Tracker · Privacy-First Operating System · Zero Advertising · Zero Data Selling
        </div>

      </div>
    </div>
  );
};
