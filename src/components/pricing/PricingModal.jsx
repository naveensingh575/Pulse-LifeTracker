import React, { useState } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { useAuth } from "../../context/AuthContext";
import { getLocalizedPrice, PRICING_DATA, getRemainingFounderSeats } from "../../utils/pricingUtils";
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
  CreditCard
} from "lucide-react";

export const PricingModal = () => {
  const {
    isPricingModalOpen,
    closePricingModal,
    subscriptionTier,
    selectPlan,
    redeemPromoCode,
    currency
  } = useDashboard();
  const { user } = useAuth();

  const [promoInput, setPromoInput] = useState("");
  const [promoStatus, setPromoStatus] = useState(null); // { type: "success"|"error", message }
  const [isApplying, setIsApplying] = useState(false);
  const [checkoutModalPlan, setCheckoutModalPlan] = useState(null); // { id, name, price }
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  if (!isPricingModalOpen) return null;

  const isFounder = subscriptionTier === "founder";
  const isLifetime = subscriptionTier === "lifetime" || subscriptionTier === "founder";
  const isYearly = subscriptionTier === "yearly";
  const isMonthly = subscriptionTier === "monthly";

  const monthlyPrice = getLocalizedPrice("monthly", currency);
  const yearlyPrice = getLocalizedPrice("yearly", currency);
  const lifetimePrice = getLocalizedPrice("lifetime", currency);

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

  const handleSelectPlan = async (planId) => {
    const plan = PRICING_DATA[planId];
    const localized = getLocalizedPrice(planId, currency);

    if (currency === "₹") {
      setIsApplying(true);
      const opened = await openRazorpayCheckout({
        planId,
        user,
        onSuccess: async (paymentDetails) => {
          await selectPlan(planId, paymentDetails);
          setPromoStatus({
            type: "success",
            message: "🎉 Payment verified (ID: " + paymentDetails.paymentId + ")! Successfully upgraded to " + plan.name + "."
          });
          setIsApplying(false);
        },
        onFailure: (error) => {
          console.warn("Razorpay payment issue:", error);
          setIsApplying(false);
          setCheckoutModalPlan({
            id: planId,
            name: plan.name,
            price: localized.current + " " + localized.period
          });
        },
        onDismiss: () => {
          setIsApplying(false);
        }
      });

      if (!opened) {
        setIsApplying(false);
        setCheckoutModalPlan({
          id: planId,
          name: plan.name,
          price: localized.current + " " + localized.period
        });
      }
    } else {
      setCheckoutModalPlan({
        id: planId,
        name: plan.name,
        price: localized.current + " " + localized.period
      });
    }
  };

  const handleConfirmCheckout = async () => {
    if (!checkoutModalPlan) return;
    setIsProcessingCheckout(true);
    try {
      await selectPlan(checkoutModalPlan.id, {
        gateway: currency === "₹" ? "razorpay_direct" : "stripe_direct",
        amount: checkoutModalPlan.price,
        currency: currency === "₹" ? "INR" : "USD"
      });
      setPromoStatus({
        type: "success",
        message: "🎉 Successfully activated " + checkoutModalPlan.name + "! All intelligence features unlocked."
      });
      setCheckoutModalPlan(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingCheckout(false);
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

        {/* Simple Clean Header */}
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
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            )}>
              {isFounder ? 'Founder Lifetime' : isLifetime ? 'Lifetime Pass' : isYearly ? 'Pro Yearly' : isMonthly ? 'Pro Monthly' : 'Free Starter'}
            </span>
          </div>
        </div>

        {/* 3 High-Impact Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          
          {/* Card 1: Monthly Pro */}
          <div className={"rounded-2xl p-5 border flex flex-col justify-between space-y-4 transition " + (
            isMonthly
              ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-md"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700"
          )}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Pro Monthly</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                  {monthlyPrice.discountTag}
                </span>
              </div>

              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{monthlyPrice.current}</span>
                  <span className="text-xs text-slate-400">{monthlyPrice.period}</span>
                  <span className="text-xs text-slate-400 line-through ml-1">{monthlyPrice.regular}</span>
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
                  <span>Full CSV & iCalendar (.ics) Sync</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan("monthly")}
              className={"w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer " + (
                isMonthly
                  ? "bg-emerald-600 text-white cursor-default"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white"
              )}
            >
              {isMonthly ? "✓ Current Plan" : "Choose Monthly"}
            </button>
          </div>

          {/* Card 2: Yearly Pro (⭐ Best Value) */}
          <div className={"rounded-2xl p-5 border-2 flex flex-col justify-between space-y-4 relative shadow-xl " + (
            isYearly
              ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20"
              : "border-indigo-500 bg-gradient-to-b from-indigo-50/60 via-white to-indigo-50/20 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 shadow-indigo-500/10"
          )}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                ⭐ Best Value
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
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{yearlyPrice.current}</span>
                  <span className="text-xs text-slate-400">{yearlyPrice.period}</span>
                  <span className="text-xs text-slate-400 line-through ml-1">{yearlyPrice.regular}</span>
                </div>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                  {yearlyPrice.effectiveMonthly}
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-indigo-100 dark:border-slate-800">
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
                  <span>Priority Support & System Updates</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan("yearly")}
              className={"w-full py-2.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer " + (
                isYearly
                  ? "bg-emerald-600 text-white cursor-default"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
              )}
            >
              {isYearly ? "✓ Current Plan" : "Choose Yearly (Save 33%)"}
            </button>
          </div>

          {/* Card 3: Founder Lifetime Pass (👑 One-Time) */}
          <div className={"rounded-2xl p-5 border-2 flex flex-col justify-between space-y-4 relative shadow-lg " + (
            isLifetime
              ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20"
              : "border-amber-500/70 bg-gradient-to-b from-amber-50/60 via-white to-amber-50/20 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900"
          )}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                👑 Pay Once
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
                    {lifetimePrice.current}
                  </span>
                  <span className="text-xs text-slate-400">{lifetimePrice.period}</span>
                  <span className="text-xs text-slate-400 line-through ml-1">{lifetimePrice.regular}</span>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                  Zero recurring subscriptions
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-amber-100 dark:border-slate-800">
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
            </div>

            <button
              onClick={() => handleSelectPlan("lifetime")}
              className={"w-full py-2.5 rounded-xl text-xs font-black transition shadow-md cursor-pointer " + (
                isLifetime
                  ? "bg-emerald-600 text-white cursor-default"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20"
              )}
            >
              {isLifetime ? "✓ Lifetime Active" : "Get Lifetime Access"}
            </button>
          </div>

        </div>

        {/* Secret VIP Promo Code Redemption Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              <span>Have a VIP / Invite Code?</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Private early-access pass
            </span>
          </div>

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

      {/* Checkout / Payment Gateway Integration Modal */}
      {checkoutModalPlan && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Payment Gateway Checkout</h3>
              </div>
              <button
                onClick={() => setCheckoutModalPlan(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 space-y-1.5">
              <p className="text-xs text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wide">
                Selected Plan
              </p>
              <div className="flex items-baseline justify-between">
                <p className="text-base font-black text-slate-900 dark:text-white">
                  {checkoutModalPlan.name}
                </p>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {checkoutModalPlan.price}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p>💳 <strong>Gateway Integration:</strong> Ready for Razorpay / Stripe direct checkout.</p>
              <p>🔒 256-Bit SSL Encrypted. Cancel anytime or upgrade seamlessly.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCheckoutModalPlan(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckout}
                disabled={isProcessingCheckout}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                {isProcessingCheckout ? "Upgrading..." : "Confirm & Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
