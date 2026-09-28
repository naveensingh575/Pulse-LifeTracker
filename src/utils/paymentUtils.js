/**
 * Razorpay Payment Gateway Integration Engine for Pulse Life Tracker
 * Supports INR (domestic) and all international currencies via Razorpay International.
 */

import { PRICING_DATA, CURRENCY_ISO_MAP } from "./pricingUtils";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * JPY and other zero-decimal currencies — amount is NOT multiplied by 100.
 * All others use smallest unit (paise, cents, pence, fils, etc.)
 */
const ZERO_DECIMAL_CURRENCIES = new Set(["JPY"]);

/**
 * Convert a decimal amount to Razorpay's expected smallest-unit integer.
 * e.g. 14.99 USD → 1499 cents | 799 INR → 79900 paise | 2299 JPY → 2299 yen
 */
function toSmallestUnit(amount, isoCode) {
  if (ZERO_DECIMAL_CURRENCIES.has(isoCode)) {
    return Math.round(amount);
  }
  return Math.round(amount * 100);
}

/**
 * Plan metadata (name / description) used in the checkout modal header
 */
const PLAN_META = {
  monthly:  { name: "Pro Monthly Subscription",  description: "Pulse Pro Monthly Operating Suite" },
  yearly:   { name: "Pro Yearly Subscription",    description: "Pulse Pro Yearly Operating Suite" },
  lifetime: { name: "Founder Lifetime Pass",      description: "Pulse Founder Lifetime Access (Pay Once)" },
  founder:  { name: "Founder Lifetime Pass",      description: "Pulse Founder Lifetime Access (Pay Once)" }
};

// Loads Razorpay standard checkout script dynamically into DOM
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Check if script tag is already in DOM
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.Razorpay) {
          clearInterval(interval);
          resolve(true);
        } else if (attempts >= 25) {
          clearInterval(interval);
          resolve(Boolean(window.Razorpay));
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = (err) => {
      console.warn("Could not load Razorpay script directly from CDN", err);
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Opens Razorpay payment modal — currency-aware for Razorpay International.
 *
 * @param {string}   planId      - "monthly" | "yearly" | "lifetime"
 * @param {string}   currency    - Symbol from dashboard selector: "₹" | "$" | "€" | "£" | "¥" | "C$" | "A$" | "AED"
 * @param {object}   user        - Supabase auth user object
 * @param {function} onSuccess   - Called with payment details on success
 * @param {function} onFailure   - Called with error on failure
 * @param {function} onDismiss   - Called when user closes modal
 */
export async function openRazorpayCheckout({
  planId = "yearly",
  currency = "₹",
  user = null,
  onSuccess,
  onFailure,
  onDismiss
}) {
  // Resolve ISO code — default to INR if unknown
  const isoCode = CURRENCY_ISO_MAP[currency] || "INR";

  // Look up localized price from PRICING_DATA
  const planData = PRICING_DATA[planId] || PRICING_DATA.yearly;
  const priceObj = planData.prices[currency] || planData.prices["₹"];
  const numericAmount = priceObj?.amount ?? 0;
  const amountInSmallestUnit = toSmallestUnit(numericAmount, isoCode);

  const planMeta = PLAN_META[planId] || PLAN_META.yearly;

  const isLoaded = await loadRazorpayScript();

  if (isLoaded && typeof window !== "undefined" && window.Razorpay) {
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_ThLQKI8oeYBlEN";

    const options = {
      key: keyId,
      amount: amountInSmallestUnit,
      currency: isoCode,
      name: "Pulse Life Tracker",
      description: planMeta.description,
      image: "https://pulse-life-tracker.vercel.app/pwa-512x512.png",
      prefill: {
        name: user?.user_metadata?.full_name || user?.name || "Pulse Member",
        email: user?.email || "",
        contact: ""
      },
      notes: {
        plan_id: planId,
        app: "Pulse Life Tracker",
        user_id: user?.id || "guest",
        currency_symbol: currency
      },
      theme: {
        color: "#4f46e5"
      },
      modal: {
        ondismiss: function () {
          if (onDismiss) onDismiss();
        }
      },
      handler: function (response) {
        if (onSuccess) {
          onSuccess({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            planId,
            amount: numericAmount,
            currency: isoCode,
            currencySymbol: currency
          });
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        if (onFailure) {
          onFailure(response.error);
        }
      });
      rzp.open();
      return { opened: true };
    } catch (err) {
      console.error("Error opening Razorpay checkout:", err);
      if (onFailure) onFailure(err);
      return { opened: false, error: err?.message || "Failed to initialize checkout modal." };
    }
  }

  // Fallback: SDK failed to load (e.g. adblocker)
  return { opened: false, error: "Razorpay SDK could not be loaded. Please ensure you are connected to the internet and disable adblockers." };
}
