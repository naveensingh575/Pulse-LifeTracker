/**
 * referralUtils.js
 * High-velocity zero-CAC viral referral engine for Pulse Life Tracker.
 * 
 * Flow:
 * 1. User shares Proof-of-Work Card or Milestone link -> URL contains ?ref=USER_REFERRAL_CODE
 * 2. Invitee opens link -> App captures referral, applies 14-day Pro exploration
 * 3. Shows custom welcome banner & tracks viral attribution without invasive third-party cookies
 */

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
 * Get personalized share URL with referral attribution
 */
export const getReferralShareUrl = (user) => {
  const code = getUserReferralCode(user);
  return `${APP_BASE_URL}/?ref=${code}`;
};

/**
 * Capture incoming ?ref= parameter on app boot
 * Returns captured referral object or null if none
 */
export const captureIncomingReferral = () => {
  if (typeof window === 'undefined') return null;

  try {
    // Check both standard query string and hash query string for SPA routing resilience
    const fullHref = window.location.href;
    const url = new URL(fullHref);
    let refParam = url.searchParams.get('ref');

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
        
        // Boost trial period for referred users: 14 days of Pro Preview instead of 7
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
 * Check if the current user has active referral bonus days
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
