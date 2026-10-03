import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../context/DashboardContext';
import { getReferralShareUrl, getUserReferralCode } from '../../utils/referralUtils';
import {
  X,
  Gift,
  Copy,
  Check,
  Share2,
  Sparkles,
  Trophy,
  Crown
} from 'lucide-react';
import { triggerHaptic } from '../../utils/hapticUtils';

export const ReferralModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { referralStats } = useDashboard();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const referralCode = getUserReferralCode(user);
  const referralUrl = getReferralShareUrl(user);

  const count = referralStats?.referralCount || 0;
  const tier = referralStats?.tier || { bonusDays: 0, isMax: false };

  const shareText = `Hey! I'm using Pulse to track my habits, fitness, and daily routine. Use my invite link to get 14 days of Pulse Pro free:\n${referralUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopiedLink(true);
      triggerHaptic('light');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      triggerHaptic('light');
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pulse Life Tracker — 14 Days Free Pro',
          text: shareText,
          url: referralUrl
        });
      } catch (e) {
        if (e.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-md w-full rounded-3xl p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 pr-8">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Invite Friends to Pulse
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Friends get 14 days free Pro · You unlock up to 2 months
            </p>
          </div>
        </div>

        {/* Referrer Milestone Rewards Progress */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-slate-50 to-amber-50/30 dark:from-slate-950/80 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Your Referral Milestones</span>
            </div>
            <span className="font-mono text-xs font-black px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              {count} / 10 Joined
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((count / 10) * 100))}%` }}
            />
          </div>

          {/* Milestone Tiers Grid */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {/* Tier 1: 1 Referral */}
            <div className={`p-2.5 rounded-xl border text-center transition ${
              count >= 1
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5">1 Friend</div>
              <div className="text-xs font-black flex items-center justify-center gap-1">
                {count >= 1 && <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />}
                <span>+14d Pro</span>
              </div>
            </div>

            {/* Tier 2: 3 Referrals */}
            <div className={`p-2.5 rounded-xl border text-center transition ${
              count >= 3
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5">3 Friends</div>
              <div className="text-xs font-black flex items-center justify-center gap-1">
                {count >= 3 && <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />}
                <span>1 Mo Pro</span>
              </div>
            </div>

            {/* Tier 3: 10 Referrals (Max) */}
            <div className={`p-2.5 rounded-xl border text-center transition ${
              count >= 10
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
                : 'bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center justify-center gap-1">
                <Crown className="w-2.5 h-2.5 text-amber-500" />
                <span>10 (Max)</span>
              </div>
              <div className="text-xs font-black flex items-center justify-center gap-1">
                {count >= 10 && <Check className="w-3 h-3 text-amber-500 stroke-[3]" />}
                <span>2 Mos Pro</span>
              </div>
            </div>
          </div>

          {/* Current reward status footnote */}
          <div className="text-[11px] text-center pt-1 font-medium text-slate-600 dark:text-slate-400">
            {count >= 10 ? (
              <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                Max Ambassador Tier reached! 2 full months of Pro unlocked.
              </span>
            ) : count >= 3 ? (
              <span>
                🎉 <strong>1 Month Pro</strong> active! Invite <strong>{10 - count} more</strong> to unlock 2 Months Pro.
              </span>
            ) : count >= 1 ? (
              <span>
                🎉 <strong>14 Days Pro</strong> active! Invite <strong>{3 - count} more</strong> to unlock 1 Month Pro.
              </span>
            ) : (
              <span>
                Invite your first friend to unlock <strong>14 days of Pro</strong> free.
              </span>
            )}
          </div>
        </div>

        {/* Referral Code Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Your Referral Code
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={referralCode}
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-slate-100 select-all focus:outline-none"
            />
            <button
              onClick={handleCopyCode}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Direct Sign-Up Link Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Direct Create Account Link
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-mono text-slate-700 dark:text-slate-300 select-all focus:outline-none truncate"
            />
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Share Action */}
        <div className="pt-1">
          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Invite Link</span>
          </button>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
