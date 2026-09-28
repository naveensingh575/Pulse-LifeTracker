import React, { useState } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { useAuth } from "../../context/AuthContext";
import { getLocalizedPrice, PRICING_DATA, getPaidLifetimeSeatsStatus, getFamily100SeatsStatus } from "../../utils/pricingUtils";
import { openRazorpayCheckout } from "../../utils/paymentUtils";
import {
  X,
  Shield,
  Check,
  Sparkles,
  Tag,
  ArrowRight,
  CheckCircle2,
  Crown,
  Globe,
  AlertTriangle,
  Lock,
  Flame
} from "lucide-react";

export const PricingModal = () => {
  const {
    isPricingModalOpen,
    closePricingModal,
    subscriptionTier,
    selectPlan,
    redeemPromoCode,
    currency,
    trialInfo,
    occupiedPaidLifetimeSeats,
    occupiedCouponSeats
  } = useDashboard();
  const { user } = useAuth();

  const [promoInput, setPromoInput] = useState("");
  const [promoStatus, setPromoStatus] = useState(null); // { type: "success"|"error", message }
  const [isApplying, setIsApplying] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(null); // "monthly" | "yearly" | null

  if (!isPricingModalOpen) return null;

  const isFounder = subscriptionTier === "founder";
  const isLifetime = subscriptionTier === "lifetime" || subscriptionTier === "founder";
  const isYearly = subscriptionTier === "yearly";
  const isMonthly = subscriptionTier === "monthly";
  const isCancellable = isMonthly || isYearly; // only these two can cancel

  const monthlyPrice = getLocalizedPrice("monthly", currency);
  const yearlyPrice = getLocalizedPrice("yearly", currency);
  const lifetimePrice = getLocalizedPrice("lifetime", currency);
  const paidLifetimeSeats = getPaidLifetimeSeatsStatus(occupiedPaidLifetimeSeats);
  const couponSeats = getFamily100SeatsStatus(occupiedCouponSeats);
  const isTrialActive = Boolean(trialInfo?.isTrialActive && subscriptionTier === "free");

  const handleApplyPromo = async (e) => {
    if (e) e.preventDefault();
    if (!promoInput.trim()) return;

    setIsApplying(true);
    setPromoStatus(null);

    try {
      const res = await redeemPromoCode(promoInput.trim());
      if (res.valid) {
        setPromoStatus({ type: "success", message: res.message });
        setPromoInput("");
      } else {
        setPromoStatus({ type: "error", message: res.message });
      }
    } catch (err) {
      setPromoStatus({ type: "error", message: "Failed to redeem code. Please check spelling." });
    } finally {
      setIsApplying(false);
    }
  };

  // Cancel subscription (monthly or yearly → free)
  const handleCancelSubscription = async () => {
    setIsApplying(true);
    setCancelConfirm(null);
    setPromoStatus(null);
    try {
      await selectPlan("free");
      setPromoStatus({
        type: "success",
        message: "Your subscription has been cancelled. You've been moved to the Free Starter plan. No further charges will apply."
      });
    } catch (err) {
      setPromoStatus({ type: "error", message: "Could not cancel subscription. Please try again." });
    } finally {
      setIsApplying(false);
    }
  };

  const handleSelectPlan = async (planId) => {
    // Lifetime plan is permanent — no action when already active
    if (isLifetime && planId === "lifetime") return;

    // Prevent lifetime holders from downgrading
    if (isLifetime) {
      setPromoStatus({
        type: "error",
        message: "Lifetime access is permanent and cannot be changed or downgraded."
      });
      return;
    }

    if (planId === "free") return; // free handled via cancel flow only

    const plan = PRICING_DATA[planId];
    setIsApplying(true);
    setPromoStatus(null);

    const result = await openRazorpayCheckout({
      planId,
      currency,
      user,
      onSuccess: async (paymentDetails) => {
        const upgradeRes = await selectPlan(planId, paymentDetails);
        if (upgradeRes?.success) {
          setPromoStatus({
            type: "success",
            message: "🎉 Payment verified (ID: " + paymentDetails.paymentId + ")! Successfully upgraded to " + plan.name + "."
          });
        } else {
          setPromoStatus({
            type: "error",
            message: "Payment verification failed. Please contact support."
          });
        }
        setIsApplying(false);
      },
      onFailure: (error) => {
        console.warn("Razorpay payment issue:", error);
        setIsApplying(false);
        setPromoStatus({
          type: "error",
          message: error?.description || error?.reason || error?.message || "Payment was not completed. Please try again to upgrade."
        });
      },
      onDismiss: () => {
        setIsApplying(false);
      }
    });

    if (!result?.opened) {
      setIsApplying(false);
      setPromoStatus({
        type: "error",
        message: result?.error || "Could not open Razorpay checkout. Please check your internet connection or disable adblockers."
      });
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 pt-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Subscription Plans
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Current Plan:</span>
            <span className={'text-xs font-bold px-3 py-1 rounded-full border ' + (
              isFounder || isLifetime
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : isYearly || isMonthly
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                : isTrialActive
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            )}>
              {isFounder ? 'Founder Lifetime' : isLifetime ? 'Lifetime Pass' : isYearly ? 'Pro Yearly' : isMonthly ? 'Pro Monthly' : isTrialActive ? `⭐ Pro Preview Trial (${trialInfo?.trialDaysRemaining}d left)` : 'Free Starter'}
            </span>
          </div>
        </div>

        {/* 7-Day Pro Trial Active Announcement Banner */}
        {isTrialActive && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-transparent border border-amber-500/30 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900 dark:text-white">
                  7-Day Pro Preview Active ({trialInfo?.trialDaysRemaining} days remaining)
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  You currently have full access to Monthly Heatmaps and the Analytics Suite. Lock in <strong>Pro Yearly (Save 33%)</strong> or the <strong>Founder Lifetime Pass</strong> to keep unlimited intelligence forever.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        {cancelConfirm && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-700/50 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-rose-800 dark:text-rose-300">
                  Cancel {cancelConfirm === "monthly" ? "Monthly" : "Yearly"} Subscription?
                </p>
                <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
                  You will immediately lose Pro access and be moved to the Free Starter plan.
                  <strong className="block mt-1">No refunds are issued for any subscription plan.</strong>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancelSubscription}
                disabled={isApplying}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer"
              >
                {isApplying ? "Cancelling..." : "Yes, Cancel Subscription"}
              </button>
              <button
                onClick={() => setCancelConfirm(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Keep My Plan
              </button>
            </div>
          </div>
        )}

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-stretch">

          {/* Card 1: Monthly Pro */}
          <div
            onClick={() => !isMonthly && !isLifetime && handleSelectPlan("monthly")}
            className={"relative rounded-2xl p-5 border-2 flex flex-col justify-between space-y-4 transition-all duration-300 ease-out " + (
              isMonthly
                ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-md cursor-default"
                : isLifetime
                ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 opacity-50 cursor-not-allowed"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 cursor-pointer group hover:-translate-y-1.5 hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-indigo-500/15 hover:bg-indigo-50/10 dark:hover:bg-slate-900/90"
            )}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold uppercase tracking-wider shadow-sm border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform">
                ⚡ Flexible
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between min-h-[24px]">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Pro Monthly</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                  {monthlyPrice.discountTag}
                </span>
              </div>

              <div className="min-h-[58px] flex flex-col justify-center">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{monthlyPrice.current}</span>
                  <span className="text-xs text-slate-400">{monthlyPrice.period}</span>
                  <span className="text-xs text-slate-400 line-through ml-1">{monthlyPrice.regular}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
                  Cancel anytime · No refunds
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 min-h-[136px] flex flex-col justify-start">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Unlimited Habits & Sub-goals</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Goal Advisory & AI Directives</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Cross-Domain Correlations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Full CSV & iCalendar (.ics) Sync</span>
                </li>
              </ul>
            </div>

            {/* Action button */}
            {isMonthly ? (
              <div className="space-y-2">
                <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-emerald-600 text-white">
                  ✓ Current Plan
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setCancelConfirm("monthly"); setPromoStatus(null); }}
                  disabled={isApplying}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-800 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel Subscription
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); if (!isLifetime) handleSelectPlan("monthly"); }}
                disabled={isLifetime}
                className={"w-full py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer group-hover:shadow-md " + (
                  isLifetime
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    : "bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-900 dark:text-white"
                )}
              >
                Choose Monthly
              </button>
            )}
          </div>

          {/* Card 2: Yearly Pro (⭐ Best Value · Recommended) */}
          <div
            onClick={() => !isYearly && !isLifetime && handleSelectPlan("yearly")}
            className={"relative rounded-2xl p-5 border-2 flex flex-col justify-between space-y-4 transition-all duration-300 ease-out " + (
              isYearly
                ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xl cursor-default"
                : isLifetime
                ? "border-indigo-500/30 bg-gradient-to-b from-indigo-50/20 via-white to-indigo-50/10 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 opacity-50 cursor-not-allowed"
                : "border-indigo-500 ring-2 ring-indigo-500/40 bg-gradient-to-b from-indigo-50/70 via-white to-indigo-50/30 dark:from-indigo-950/50 dark:via-slate-900 dark:to-slate-900 shadow-xl shadow-indigo-500/15 cursor-pointer group hover:-translate-y-1.5 hover:shadow-2xl hover:border-indigo-400 dark:hover:border-indigo-400 hover:shadow-indigo-500/30"
            )}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md group-hover:scale-105 transition-transform">
                ⭐ Best Value · Recommended
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between min-h-[24px]">
                <h3 className="font-bold text-sm text-indigo-950 dark:text-indigo-200">Pro Yearly</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Save 33%
                </span>
              </div>

              <div className="min-h-[58px] flex flex-col justify-center">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{yearlyPrice.current}</span>
                  <span className="text-xs text-slate-400">{yearlyPrice.period}</span>
                  <span className="text-xs text-slate-400 line-through ml-1">{yearlyPrice.regular}</span>
                </div>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                  {yearlyPrice.effectiveMonthly}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Billed annually · Cancel anytime
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 pt-3 border-t border-indigo-100 dark:border-slate-800 min-h-[136px] flex flex-col justify-start">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Everything in Pro Monthly</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Predictive Feasibility Radar</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Executive Multi-Pillar Analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Priority Support & Continuous Updates</span>
                </li>
              </ul>
            </div>

            {/* Action button */}
            {isYearly ? (
              <div className="space-y-2">
                <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-emerald-600 text-white">
                  ✓ Current Plan
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setCancelConfirm("yearly"); setPromoStatus(null); }}
                  disabled={isApplying}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-800 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel Subscription
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); if (!isLifetime) handleSelectPlan("yearly"); }}
                disabled={isLifetime}
                className={"w-full py-2.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer group-hover:brightness-110 group-hover:shadow-lg " + (
                  isLifetime
                    ? "bg-indigo-300 dark:bg-indigo-900/40 text-white/60 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 font-extrabold"
                )}
              >
                Get Pro Yearly (Save 33%)
              </button>
            )}
          </div>

          {/* Card 3: Founder Lifetime Pass (👑 One-Time) — PERMANENT, no cancel */}
          <div
            onClick={() => !isLifetime && handleSelectPlan("lifetime")}
            className={"relative rounded-2xl p-5 border-2 flex flex-col justify-between space-y-4 transition-all duration-300 ease-out " + (
              isLifetime
                ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-lg cursor-default"
                : "border-amber-500/70 bg-gradient-to-b from-amber-50/60 via-white to-amber-50/20 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 cursor-pointer group hover:-translate-y-1.5 hover:shadow-2xl hover:border-amber-400 dark:hover:border-amber-400 hover:shadow-amber-500/25"
            )}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm group-hover:scale-105 transition-transform">
                👑 Pay Once
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between min-h-[24px]">
                <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-1">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>Founder Lifetime</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  70% OFF
                </span>
              </div>

              <div className="min-h-[58px] flex flex-col justify-center">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {lifetimePrice.current}
                  </span>
                  <span className="text-xs text-slate-400">{lifetimePrice.period}</span>
                  <span className="text-xs text-slate-400 line-through ml-1">{lifetimePrice.regular}</span>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-1">
                  Non-refundable · Permanent access
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 pt-3 border-t border-amber-100 dark:border-slate-800 min-h-[136px] flex flex-col justify-start">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Unlimited Lifetime Access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>All Future Intelligence Modules</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Verified Founder Golden Badge</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Priority Direct Founder Support</span>
                </li>
              </ul>

              {/* Slim Founder Quota Indicator */}
              <div className="pt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-medium text-amber-800 dark:text-amber-300">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                    <span>{paidLifetimeSeats.remaining} seats left</span>
                  </span>
                  <span className="font-mono text-[9px] text-amber-600 dark:text-amber-400">
                    {paidLifetimeSeats.claimed}/500 claimed
                  </span>
                </div>
                <div className="w-full h-1 bg-amber-200/60 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(paidLifetimeSeats.claimed > 0 ? 1 : 0, paidLifetimeSeats.percentage)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Lifetime button — locked permanently when active or sold out */}
            {isLifetime ? (
              <div className="space-y-2">
                <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-emerald-600 text-white flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Lifetime Active — Permanent
                </div>
                <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
                  Lifetime plans cannot be cancelled or changed
                </p>
              </div>
            ) : paidLifetimeSeats.isSoldOut ? (
              <button
                disabled
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              >
                Founder Lifetime Sold Out (500/500 Paid Seats Filled)
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); handleSelectPlan("lifetime"); }}
                className="w-full py-2.5 rounded-xl text-xs font-black transition shadow-md cursor-pointer group-hover:brightness-110 group-hover:shadow-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20"
              >
                Get Lifetime Access
              </button>
            )}
          </div>

        </div>

        {/* No-Refund Policy Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
          <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 dark:text-slate-500 leading-relaxed">
            <strong className="text-slate-600 dark:text-slate-400">No Refund Policy:</strong> All payments are final and non-refundable. Monthly and yearly plans can be cancelled anytime — you retain access until the current period ends. Lifetime plans are permanent and cannot be cancelled, downgraded, or refunded.
          </p>
        </div>

        {/* Secret VIP Promo Code Redemption Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              <span>Have a VIP / Invite Code?</span>
            </span>
            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              {couponSeats.claimed} / 100 VIP Codes Claimed ({couponSeats.remaining} Left)
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            FAMILY100 VIP Founder Pass is strictly limited to 100 users only and tracked independently from paid lifetime seats.
          </p>

          <form onSubmit={handleApplyPromo} className="flex flex-col sm:flex-row items-stretch gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              placeholder="Enter your VIP invite code"
              className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 uppercase"
            />
            <button
              type="submit"
              disabled={isApplying || !promoInput.trim()}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer shrink-0"
            >
              {isApplying ? "Checking..." : "Redeem VIP Code"}
            </button>
          </form>

          {promoStatus && (
            <div className={"p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 " + (
              promoStatus.type === "success"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
            )}>
              {promoStatus.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span>{promoStatus.message}</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
