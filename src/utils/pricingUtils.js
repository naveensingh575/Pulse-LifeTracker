/**
 * Pricing Tiers & Promo Code Validation Engine for Pulse Life Tracker
 */

export const VALID_PROMO_CODES = {
  FOUNDER100: {
    tier: 'founder',
    discountPct: 100,
    label: '100% Lifetime Free Founder Pass',
    badge: 'Founder Lifetime',
    icon: '🛡️'
  },
  FAMILY_VIP: {
    tier: 'founder',
    discountPct: 100,
    label: 'Friends & Family VIP Founder Pass',
    badge: 'Founder Lifetime',
    icon: '🛡️'
  },
  EARLYBIRD: {
    tier: 'founder',
    discountPct: 100,
    label: 'Early-Bird Lifetime Founder Pass',
    badge: 'Founder Lifetime',
    icon: '🛡️'
  },
  LIFETIME2026: {
    tier: 'founder',
    discountPct: 100,
    label: 'Lifetime 2026 Early Access Pass',
    badge: 'Founder Lifetime',
    icon: '🛡️'
  },
  PULSE50: {
    tier: 'pro',
    discountPct: 50,
    label: '50% Special Pro Discount',
    badge: 'Pro Member',
    icon: '⭐'
  }
};

export const PLAN_TIERS = {
  free: {
    id: 'free',
    name: 'Starter Plan',
    badge: 'Free',
    priceINR: '₹0',
    priceUSD: '$0',
    period: 'Forever free',
    description: 'Essential life and habit tracking for individuals building baseline routines.',
    features: [
      'Daily Habits & Streak Tracking',
      'Up to 3 Active Goals',
      'Basic Task & Action Checklist',
      'Core Daily Focus & Review Widgets',
      'Standard Financial Burn-rate Tracker'
    ],
    highlight: false
  },
  founder: {
    id: 'founder',
    name: 'Founder Lifetime Pass',
    badge: 'Early Access',
    priceINR: '₹2,499',
    priceUSD: '$29',
    period: 'One-time payment · Lifetime Access',
    description: 'Exclusive lifetime access for early joiners with all current and future intelligence modules.',
    features: [
      'Unlimited Goals & Milestone Sub-goals',
      'Goal Advisory Engine (Prescribed Action Steps)',
      'Cross-Domain Correlation Engine',
      'Shareable Proof of Work Social Cards',
      'Full CSV & iCalendar (.ics) Data Exports',
      'Verified Founder Badge & Profile Tag',
      'Free Lifetime Updates & Priority Support'
    ],
    highlight: true,
    isPopular: true
  },
  pro: {
    id: 'pro',
    name: 'Pro Operating Suite',
    badge: 'Pro Tier',
    priceINR: '₹149/mo',
    priceUSD: '$3/mo',
    period: 'Billed monthly (or ₹1,299/yr)',
    description: 'High-performance operating system for ambitious professionals and creators.',
    features: [
      'Unlimited Goals & Habits',
      'Advanced Predictive Feasibility Engine',
      'Multi-Pillar Executive Analytics',
      'Automated Google Calendar Routine Sync',
      'Priority Feature Requests'
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
    message: 'Invalid or expired invite code. Check spelling and try again.'
  };
}

/**
 * Computes remaining limited founder seats (out of 200)
 */
export function getRemainingFounderSeats() {
  // Deterministic calculation based on launch month
  const totalSeats = 200;
  const claimedSeats = 158;
  return Math.max(12, totalSeats - claimedSeats);
}
