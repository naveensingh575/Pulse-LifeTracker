/**
 * Razorpay Payment Gateway Integration Engine for Pulse Life Tracker
 */

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

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
 * Plan amount mapping in INR paise (1 INR = 100 paise)
 */
export const RAZORPAY_PLAN_AMOUNTS = {
  monthly: {
    amountInPaise: 9900, // ₹99
    amountINR: 99,
    name: "Pro Monthly Subscription",
    description: "Pulse Pro Monthly Operating Suite"
  },
  yearly: {
    amountInPaise: 79900, // ₹799
    amountINR: 799,
    name: "Pro Yearly Subscription",
    description: "Pulse Pro Yearly Operating Suite"
  },
  lifetime: {
    amountInPaise: 149900, // ₹1,499
    amountINR: 1499,
    name: "Founder Lifetime Pass",
    description: "Pulse Founder Lifetime Access (Pay Once)"
  },
  founder: {
    amountInPaise: 149900, // ₹1,499
    amountINR: 1499,
    name: "Founder Lifetime Pass",
    description: "Pulse Founder Lifetime Access (Pay Once)"
  }
};

/**
 * Opens Razorpay payment modal with standard configuration
 */
export async function openRazorpayCheckout({
  planId = "yearly",
  user = null,
  onSuccess,
  onFailure,
  onDismiss
}) {
  const planInfo = RAZORPAY_PLAN_AMOUNTS[planId] || RAZORPAY_PLAN_AMOUNTS.yearly;
  const isLoaded = await loadRazorpayScript();

  // If Razorpay SDK is available on window
  if (isLoaded && typeof window !== "undefined" && window.Razorpay) {
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_ThLQKI8oeYBlEN";

    const options = {
      key: keyId,
      amount: planInfo.amountInPaise,
      currency: "INR",
      name: "Pulse Life Tracker",
      description: planInfo.description,
      image: "https://pulse-life-tracker.vercel.app/pwa-512x512.png",
      prefill: {
        name: user?.user_metadata?.full_name || user?.name || "Pulse Member",
        email: user?.email || "",
        contact: ""
      },
      notes: {
        plan_id: planId,
        app: "Pulse Life Tracker",
        user_id: user?.id || "guest"
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
            amount: planInfo.amountINR,
            currency: "INR"
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

  // Fallback: If SDK failed to load (e.g. adblocker)
  return { opened: false, error: "Razorpay SDK could not be loaded. Please ensure you are connected to the internet and disable adblockers." };
}
