/**
 * referralUtils.js
 * Tiered viral referral engine for Pulse Life Tracker.
 * 
 * Reward Ladder for Referrers:
 * - 1 successful referral  -> +14 Days Pro
 * - 3 successful referrals  -> 1 Month (30 Days) Pro
 * - 10 successful referrals -> 2 Months (60 Days) Pro (Max Cap)
 * 
 * Invitee Perk:
 * - 14 Days Free Pro exploration upon signup
 */

import { supabase } from '../lib/supabaseClient.js';

export const APP_BASE_URL = 'https://pulse-life-tracker.vercel.app';

/**
 * Generate or retrieve the user's permanent, clean referral code
 * e.g., 'pulse-sam89' or derived from user id / email prefix
 */
export const getUserReferralCode = (user) => {
  if (typeof window === 'undefined') return 'pulse-vip';

  const stored = localStorage.getItem('pulse_user_referral_code');
  if (stored) return stored;

  let base = 'pulse';
  if (user?.email) {
    base = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
  } else if (user?.id) {
    base = user.id.slice(0, 6);
  } else {
    // Generate clean 5-char alphanumeric seed
    base = Math.random().toString(36).substring(2, 7);
  }

  const generated = `pulse-${base}`;
  localStorage.setItem('pulse_user_referral_code', generated);
  return generated;
};

/**
 * Get personalized direct Create Account share URL with referral attribution
 */
export const getReferralShareUrl = (user) => {
  const code = getUserReferralCode(user);
  return `${APP_BASE_URL}/#/login?mode=signup&ref=${code}`;
};

/**
 * Validate syntax of a referral code (e.g. pulse-xxxx)
 */
export const isValidReferralCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  const clean = code.trim().toLowerCase();
  return /^[a-z0-9_-]{3,32}$/i.test(clean);
};

/**
 * Capture incoming ?ref= parameter from URL query or hash
 */
export const captureIncomingReferral = () => {
  if (typeof window === 'undefined') return null;

  try {
    const fullHref = window.location.href;
    const url = new URL(fullHref);
    let refParam = url.searchParams.get('ref');

    // Also check hash query (HashRouter resilience)
    if (!refParam && window.location.hash.includes('?')) {
      const hashQuery = window.location.hash.split('?')[1];
      const params = new URLSearchParams(hashQuery);
      refParam = params.get('ref');
    }

    if (refParam) {
      const cleanRef = refParam.trim().slice(0, 32);
      const existing = localStorage.getItem('pulse_incoming_referral');
      if (!existing) {
        const refPayload = {
          code: cleanRef,
          capturedAt: new Date().toISOString(),
          bonusGranted: true
        };
        localStorage.setItem('pulse_incoming_referral', JSON.stringify(refPayload));
        localStorage.setItem('pulse_referral_pro_boost', 'true');
        return refPayload;
      }
      return JSON.parse(existing);
    }
  } catch (e) {
    console.warn('[PULSE] Referral capture error:', e);
  }

  const saved = localStorage.getItem('pulse_incoming_referral');
  return saved ? JSON.parse(saved) : null;
};

/**
 * Reward tiers definition
 * 1 referral  -> +14 days Pro
 * 3 referrals  -> 1 month (30 days) Pro
 * 10 referrals -> 2 months (60 days) Pro (Max)
 */
export const REFERRAL_REWARD_TIERS = [
  { threshold: 1, bonusDays: 14, label: '14 Days Pro', shortLabel: '+14d Pro' },
  { threshold: 3, bonusDays: 30, label: '1 Month Pro', shortLabel: '1 Month Pro' },
  { threshold: 10, bonusDays: 60, label: '2 Months Pro (Max)', shortLabel: '2 Months Pro' }
];

export const MAX_REFERRAL_CAP = 10;
export const MAX_BONUS_DAYS = 60;

/**
 * Calculates current reward tier and progress based on count
 */
export const getReferralRewardTier = (count = 0) => {
  const safeCount = Math.max(0, Number(count) || 0);

  if (safeCount >= 10) {
    return {
      tier: 'gold_max',
      count: safeCount,
      bonusDays: 60,
      label: '2 Months Pro (Max Cap)',
      currentMilestoneText: '2 Months Pro Unlocked',
      nextThreshold: 10,
      neededForNext: 0,
      nextRewardLabel: null,
      isMax: true,
      progressPercentage: 100
    };
  }

  if (safeCount >= 3) {
    return {
      tier: 'silver',
      count: safeCount,
      bonusDays: 30,
      label: '1 Month Pro',
      currentMilestoneText: '1 Month Pro Unlocked',
      nextThreshold: 10,
      neededForNext: 10 - safeCount,
      nextRewardLabel: '2 Months Pro',
      isMax: false,
      progressPercentage: Math.round((safeCount / 10) * 100)
    };
  }

  if (safeCount >= 1) {
    return {
      tier: 'bronze',
      count: safeCount,
      bonusDays: 14,
      label: '14 Days Pro',
      currentMilestoneText: '14 Days Pro Unlocked',
      nextThreshold: 3,
      neededForNext: 3 - safeCount,
      nextRewardLabel: '1 Month Pro',
      isMax: false,
      progressPercentage: Math.round((safeCount / 10) * 100)
    };
  }

  return {
    tier: 'none',
    count: 0,
    bonusDays: 0,
    label: 'No Referrals Yet',
    currentMilestoneText: 'Invite friends to earn Pro',
    nextThreshold: 1,
    neededForNext: 1,
    nextRewardLabel: '14 Days Pro',
    isMax: false,
    progressPercentage: 0
  };
};

/**
 * Record a successful referral signup in Supabase and localStorage
 */
export const recordReferralSignup = async (referrerCode, newUserId = null, email = '') => {
  if (!referrerCode) return;
  const cleanCode = referrerCode.trim();

  // 1. Local tracking
  try {
    const key = `pulse_referral_count_${cleanCode}`;
    const current = Number(localStorage.getItem(key) || '0');
    const updated = Math.min(MAX_REFERRAL_CAP, current + 1);
    localStorage.setItem(key, String(updated));

    // Also save in local referrals history
    const historyKey = 'pulse_referral_history';
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    history.push({
      referrerCode: cleanCode,
      referredUserId: newUserId,
      referredEmail: email,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(historyKey, JSON.stringify(history));
  } catch (e) {
    console.warn('[PULSE] Local referral recording error:', e);
  }

  // 2. Supabase Cloud Sync
  try {
    if (supabase) {
      await supabase.from('referrals').insert({
        referrer_code: cleanCode,
        referred_user_id: newUserId,
        referred_email: email,
        status: 'completed',
        reward_granted: true
      });
    }
  } catch (e) {
    // Graceful fallback if table not yet created
    console.warn('[PULSE] Supabase referral table recording error (using local storage fallback):', e);
  }
};

/**
 * Fetch authoritative or cached referral stats for the logged-in referrer
 */
export const fetchReferralStats = async (user) => {
  const code = getUserReferralCode(user);
  let cloudCount = null;

  if (user?.id && supabase) {
    try {
      const { count, error } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_code', code);

      if (!error && typeof count === 'number') {
        cloudCount = count;
      }
    } catch (e) {
      // Table fallback
    }
  }

  const localCount = Number(localStorage.getItem(`pulse_referral_count_${code}`) || '0');
  const finalCount = Math.min(MAX_REFERRAL_CAP, Math.max(cloudCount ?? 0, localCount));

  // Sync to local storage
  if (typeof window !== 'undefined') {
    localStorage.setItem(`pulse_referral_count_${code}`, String(finalCount));
  }

  const tier = getReferralRewardTier(finalCount);
  return {
    code,
    referralCount: finalCount,
    tier
  };
};

/**
 * Check if the current user has active referral bonus days (as an invitee)
 */
export const isReferralBonusActive = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('pulse_referral_pro_boost') === 'true';
};

/**
 * Dismiss the invitee welcome banner
 */
export const dismissReferralBanner = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('pulse_referral_banner_dismissed', 'true');
};

/**
 * Check whether to show the referral welcome banner
 */
export const shouldShowReferralBanner = () => {
  if (typeof window === 'undefined') return false;
  const hasRef = Boolean(localStorage.getItem('pulse_incoming_referral'));
  const dismissed = localStorage.getItem('pulse_referral_banner_dismissed') === 'true';
  return hasRef && !dismissed;
};
