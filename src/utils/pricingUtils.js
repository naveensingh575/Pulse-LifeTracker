/**
 * Universal Central-Currency Pricing Tiers & VIP Promo Engine for Pulse Life Tracker
 * Aligned 100% with the central dashboard currency selector.
 */

export const MAX_FOUNDER_SEATS = 500;
export const MAX_FAMILY100_ACCOUNTS = 500;

/**
 * All currencies now supported via Razorpay International.
 */
export const PAYMENT_SUPPORTED_CURRENCIES = ["₹", "$", "€", "£", "¥", "C$", "A$", "AED"];

export function isPaymentSupported(currency) {
  return PAYMENT_SUPPORTED_CURRENCIES.includes(currency);
}

/**
 * Currency symbol → Razorpay ISO 4217 code
 */
export const CURRENCY_ISO_MAP = {
  "₹": "INR",
  "$": "USD",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
  "C$": "CAD",
  "A$": "AUD",
  "AED": "AED"
};

/**
 * Human-readable labels for each currency symbol
 */
export const CURRENCY_LABELS = {
  "₹": "Indian Rupee (INR)",
  "$": "US Dollar (USD)",
  "€": "Euro (EUR)",
  "£": "British Pound (GBP)",
  "¥": "Japanese Yen (JPY)",
  "C$": "Canadian Dollar (CAD)",
  "A$": "Australian Dollar (AUD)",
  "AED": "UAE Dirham (AED)"
};


export const VALID_PROMO_CODES = {
  FAMILY100: {
    tier: "founder",
    discountPct: 100,
    label: "Friends & Family VIP Founder Pass",
    badge: "Founder Lifetime",
    icon: "🛡️",
    maxLimit: MAX_FAMILY100_ACCOUNTS
  }
};

export const PRICING_DATA = {
  monthly: {
    id: "monthly",
    name: "Pro Monthly",
    badge: "60% OFF Launch",
    discountTag: "60% Launch Special",
    period: "/ month",
    description: "High-performance operating system for continuous daily output.",
    features: [
      "Unlimited Habits & Milestone Sub-goals",
      "Unlimited Monthly History & Heatmaps",
      "Unlimited Executive Analytics Suite",
      "Full CSV & Markdown (.md) Data Export",
      "Goal Advisory & AI Action Steps Engine"
    ],
    highlight: false,
    prices: {
      "₹":   { current: "₹99",      regular: "₹249",      symbol: "₹",   amount: 99 },
      "$":   { current: "$1.99",    regular: "$4.99",    symbol: "$",   amount: 1.99 },
      "€":   { current: "€1.89",    regular: "€4.49",    symbol: "€",   amount: 1.89 },
      "£":   { current: "£1.69",    regular: "£3.99",    symbol: "£",   amount: 1.69 },
      "¥":   { current: "¥299",     regular: "¥750",     symbol: "¥",   amount: 299 },
      "C$":  { current: "C$2.79",   regular: "C$6.99",   symbol: "C$",  amount: 2.79 },
      "A$":  { current: "A$2.99",   regular: "A$7.49",   symbol: "A$",  amount: 2.99 },
      "AED": { current: "AED 7.99", regular: "AED 19.99", symbol: "AED", amount: 7.99 }
    }
  },
  yearly: {
    id: "yearly",
    name: "Pro Yearly",
    badge: "⭐ Best Value",
    discountTag: "60% OFF · Best Value",
    period: "/ year",
    description: "Save 33% over monthly. Less than the cost of one cup of coffee a month.",
    features: [
      "Everything in Pro Monthly",
      "Predictive Long-Term Feasibility Radar",
      "Executive Multi-Pillar Analytics Suite",
      "Unlimited CSV & Markdown (.md) Sync",
      "Priority Support & System Updates"
    ],
    highlight: true,
    isPopular: true,
    effectiveMonthly: {
      "₹":   "₹66/mo (Less than ₹2.20/day)",
      "$":   "$1.25/mo (Less than $0.05/day)",
      "€":   "€1.16/mo",
      "£":   "£0.99/mo",
      "¥":   "¥191/mo",
      "C$":  "C$1.66/mo",
      "A$":  "A$1.91/mo",
      "AED": "AED 4.9/mo"
    },
    prices: {
      "₹":   { current: "₹799",    regular: "₹1,999",   symbol: "₹",   amount: 799 },
      "$":   { current: "$14.99",  regular: "$39.99",  symbol: "$",   amount: 14.99 },
      "€":   { current: "€13.99",  regular: "€34.99",  symbol: "€",   amount: 13.99 },
      "£":   { current: "£11.99",  regular: "£29.99",  symbol: "£",   amount: 11.99 },
      "¥":   { current: "¥2,299",  regular: "¥5,999",  symbol: "¥",   amount: 2299 },
      "C$":  { current: "C$19.99", regular: "C$49.99", symbol: "C$",  amount: 19.99 },
      "A$":  { current: "A$22.99", regular: "A$59.99", symbol: "A$",  amount: 22.99 },
      "AED": { current: "AED 59",  regular: "AED 149", symbol: "AED", amount: 59 }
    }
  },
  lifetime: {
    id: "lifetime",
    name: "Founder Lifetime Pass",
    badge: "👑 One-Time Investment",
    discountTag: "70% OFF · Pay Once",
    period: "One-time",
    description: "Pay once. Zero recurring subscription fatigue with all future updates.",
    features: [
      "Lifetime Access to All Intelligence Modules",
      "Unlimited Habits, Goals & Predictive Analytics",
      "Cross-Domain Life Synergy Engine",
      "Verified Founder Golden Badge & Profile Tag",
      "Free Lifetime Updates & Direct Founder Support"
    ],
    highlight: false,
    prices: {
      "₹":   { current: "₹1,499", regular: "₹4,999",   symbol: "₹",   amount: 1499 },
      "$":   { current: "$24",    regular: "$79",      symbol: "$",   amount: 24 },
      "€":   { current: "€22",    regular: "€69",      symbol: "€",   amount: 22 },
      "£":   { current: "£19",    regular: "£59",      symbol: "£",   amount: 19 },
      "¥":   { current: "¥3,699", regular: "¥11,999",  symbol: "¥",   amount: 3699 },
      "C$":  { current: "C$32",   regular: "C$99",     symbol: "C$",  amount: 32 },
      "A$":  { current: "A$36",   regular: "A$110",    symbol: "A$",  amount: 36 },
      "AED": { current: "AED 99", regular: "AED 299",  symbol: "AED", amount: 99 }
    }
  },
  free: {
    id: "free",
    name: "Starter Plan",
    badge: "Free",
    period: "Free",
    description: "Essential life & habit tracking for individuals building baseline routines.",
    features: [
      "Unlimited Habits & Long-Term Goals",
      "Day & Week Planning & Tracker Views",
      "3 Free Monthly Views per Module / Month",
      "3 Free Analytics Suite Visits / Month",
      "Morning Focus & Evening Reflection Widget"
    ],
    highlight: false,
    prices: {
      "₹":   { current: "₹0",   regular: "₹0",   symbol: "₹",   amount: 0 },
      "$":   { current: "$0",   regular: "$0",   symbol: "$",   amount: 0 },
      "€":   { current: "€0",   regular: "€0",   symbol: "€",   amount: 0 },
      "£":   { current: "£0",   regular: "£0",   symbol: "£",   amount: 0 },
      "¥":   { current: "¥0",   regular: "¥0",   symbol: "¥",   amount: 0 },
      "C$":  { current: "C$0",  regular: "C$0",  symbol: "C$",  amount: 0 },
      "A$":  { current: "A$0",  regular: "A$0",  symbol: "A$",  amount: 0 },
      "AED": { current: "AED 0", regular: "AED 0", symbol: "AED", amount: 0 }
    }
  }
};


export const PLAN_TIERS = PRICING_DATA;

/**
 * Returns localized pricing for a given plan based strictly on the selected central dashboard currency
 */
export function getLocalizedPrice(planId, centralCurrency = "₹") {
  const plan = PRICING_DATA[planId] || PRICING_DATA.monthly;
  const curr = plan.prices[centralCurrency] ? centralCurrency : (centralCurrency === "$" ? "$" : "₹");
  const priceObj = plan.prices[curr] || plan.prices["$"] || plan.prices["₹"];
  const effMonthly = plan.effectiveMonthly ? (plan.effectiveMonthly[curr] || plan.effectiveMonthly["$"]) : null;

  return {
    current: priceObj.current,
    regular: priceObj.regular,
    symbol: priceObj.symbol,
    period: plan.period,
    effectiveMonthly: effMonthly,
    discountTag: plan.discountTag
  };
}

/**
 * Validates promo code (case-insensitive) with max 100 unique account redemption limit check
 */
export function validatePromoCode(rawCode, currentRedeemedCount = 0, isAlreadyRedeemedByUser = false) {
  if (!rawCode || typeof rawCode !== "string") {
    return { valid: false, message: "Please enter a valid invite code." };
  }

  const clean = rawCode.trim().toUpperCase();
  const match = VALID_PROMO_CODES[clean];

  if (match) {
    // If limit has been reached (500 unique accounts) and this user has not already claimed it
    if (currentRedeemedCount >= MAX_FAMILY100_ACCOUNTS && !isAlreadyRedeemedByUser) {
      return {
        valid: false,
        message: "This exclusive VIP founder pass has reached its capacity limit (500/500 accounts claimed)."
      };
    }

    return {
      valid: true,
      code: clean,
      tier: match.tier,
      discountPct: match.discountPct,
      label: match.label,
      badge: match.badge,
      icon: match.icon,
      message: "🎉 " + match.label + " successfully applied!"
    };
  }

  return {
    valid: false,
    message: "Invalid or unrecognized invite code. Please check spelling."
  };
}

/**
 * Limited Founder Cohort Settings (Strictly Capped at 500 users)
 */
export function getFounderSeatsStatus(occupiedCount = 0) {
  const total = MAX_FOUNDER_SEATS; // 500
  const claimed = Math.min(total, Math.max(0, Number(occupiedCount) || 0));
  const remaining = Math.max(0, total - claimed);
  const percentage = Math.round((claimed / total) * 100);
  return {
    total,
    claimed,
    remaining,
    percentage,
    isSoldOut: remaining === 0
  };
}

/**
 * Computes remaining limited founder seats (out of 500)
 */
export function getRemainingFounderSeats(claimedCount = 0) {
  return Math.max(0, MAX_FAMILY100_ACCOUNTS - claimedCount);
}

