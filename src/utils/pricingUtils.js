/**
 * Pricing Tiers & Promo Code Validation Engine for Pulse Life Tracker
 * Single Active Coupon: FAMILY100 (100% Lifetime Free for first 100 Friends & Family)
 */

export const VALID_PROMO_CODES = {
  FAMILY100: {
    tier: 'founder',
    discountPct: 100,
    label: 'Friends & Family 100% Lifetime Free Founder Pass',
    badge: 'Founder Lifetime',
    icon: '🛡️'
  }
};

export const PLAN_TIERS = {
  free: {
    id: 'free',
    name: 'Starter Plan',
    badge: 'Free Forever',
    priceINR: '₹0',
    priceUSD: '/bin/zsh',
    regularINR: '₹0',
    regularUSD: '/bin/zsh',
    period: 'Forever free',
    discountTag: null,
    description: 'Essential life & habit tracking for individuals building baseline routines.',
    features: [
      'Up to 5 Active Habits with Streak Tracking',
      'Up to 3 Active Long-Term Goals',
      'Unlimited Action Tasks & Daily Priorities',
      'Morning Focus & Evening Reflection Widget',
      'Daily Cash Flow & Burn-Rate Gauge'
    ],
    highlight: false
  },
  monthly: {
    id: 'monthly',
    name: 'Pro Monthly',
    badge: '60% OFF Launch',
    priceINR: '₹99',
    priceUSD: '.99',
    regularINR: '₹249',
    regularUSD: '.99',
    period: '/ month',
    discountTag: '60% Launch Special',
    description: 'High-performance operating system for continuous daily output.',
    features: [
      'Unlimited Habits & Milestone Sub-goals',
      'Goal Advisory & AI Action Steps Engine',
      'Cross-Domain Correlation Engine',
      'Full CSV & iCalendar (.ics) Routine Sync',
      'Priority Support & Feature Access'
    ],
    highlight: false
  },
  yearly: {
    id: 'yearly',
    name: 'Pro Yearly',
    badge: '⭐ Best Value · 2 Months Free',
    priceINR: '₹799',
    priceUSD: '.99',
    regularINR: '₹1,999',
    regularUSD: '.99',
    period: '/ year',
    effectiveMonthly: '₹66/mo (.25/mo)',
    discountTag: '60% OFF · ₹66/mo',
    description: 'Save 33% over monthly. Less than the cost of one cup of coffee a month.',
    features: [
      'Everything in Pro Monthly',
      '2 Months Completely Free Included',
      'Predictive Long-Term Feasibility Radar',
      'Multi-Pillar Executive Analytics',
      'Automated Routine Calendar Export'
    ],
    highlight: true,
    isPopular: true
  },
  founder: {
    id: 'founder',
    name: 'Founder Lifetime Pass',
    badge: '👑 One-Time Investment',
    priceINR: '₹1,499',
    priceUSD: '',
    regularINR: '₹4,999',
    regularUSD: '',
    period: 'One-time · Own Forever',
    discountTag: '70% OFF · Zero Subscriptions',
    description: 'Pay once, own forever. Zero recurring subscription fatigue with all future updates.',
    features: [
      'Lifetime Access to All Intelligence Modules',
      'Unlimited Habits, Goals & Predictive Analytics',
      'Cross-Domain Life Synergy Engine',
      'Verified Founder Golden Badge & Profile Tag',
      'Free Lifetime Updates & Direct Founder Support'
    ],
    highlight: false
  }
};

/**
 * Validates promo code (case-insensitive)
 */
export function validatePromoCode(rawCode) {
  if (!rawCode || typeof rawCode !== 'string') {
    return { valid: false, message: 'Please enter a valid invite code.' };
  }

  const clean = rawCode.trim().toUpperCase();
  const match = VALID_PROMO_CODES[clean];

  if (match) {
    return {
      valid: true,
      code: clean,
      tier: match.tier,
      discountPct: match.discountPct,
      label: match.label,
      badge: match.badge,
      icon: match.icon,
      message: '🎉 ' + match.label + ' successfully applied!'
    };
  }

  return {
    valid: false,
    message: 'Invalid invite code. Only VIP code FAMILY100 is valid for early access.'
  };
}

/**
 * Computes remaining limited founder seats (out of 100)
 */
export function getRemainingFounderSeats() {
  const totalSeats = 100;
  const claimedSeats = 78;
  return Math.max(8, totalSeats - claimedSeats);
}
