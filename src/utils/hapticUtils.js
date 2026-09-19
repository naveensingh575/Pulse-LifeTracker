/**
 * hapticUtils.js
 * Platform-gated haptic feedback using the Web Vibration API.
 * - Works on Android Chrome providing tactile feedback.
 * - Completely no-ops on iOS Safari, desktop browsers, and any environment
 *   where navigator.vibrate is not available — zero errors, zero crashes.
 */

/**
 * Trigger a haptic pulse.
 * @param {'light' | 'medium' | 'heavy'} style
 */
export const triggerHaptic = (style = 'light') => {
  try {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
      return; // Silently no-op on unsupported platforms
    }
    const patterns = {
      light: [15],
      medium: [30],
      heavy: [50],
    };
    navigator.vibrate(patterns[style] || patterns.light);
  } catch {
    // Silently swallow any errors — haptics are non-critical
  }
};
