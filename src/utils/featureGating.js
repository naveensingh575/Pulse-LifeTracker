/**
 * Non-Intrusive Freemium Gating & Quota Engine for Pulse Life Tracker
 */

export const FREE_TIER_LIMITS = {
  MAX_HABITS: 5,
  MAX_GOALS: 3,
  MAX_MONTHLY_AI_RUNS: 3
};

/**
 * Returns year-month key for monthly reset (e.g., "2026_09")
 */
export function getCurrentMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}_${month}`;
}

/**
 * Computes full quota status across habits, goals, and AI intelligence runs
 */
export function getQuotaStatus({
  habitsCount = 0,
  goalsCount = 0,
  aiRunsThisMonth = 0,
  subscriptionTier = "free"
}) {
  const isPremium = subscriptionTier !== "free";

  const habitsMax = isPremium ? Infinity : FREE_TIER_LIMITS.MAX_HABITS;
  const goalsMax = isPremium ? Infinity : FREE_TIER_LIMITS.MAX_GOALS;
  const aiRunsMax = isPremium ? Infinity : FREE_TIER_LIMITS.MAX_MONTHLY_AI_RUNS;

  return {
    isPremium,
    subscriptionTier,
    habits: {
      current: habitsCount,
      max: habitsMax,
      canAdd: isPremium || habitsCount < habitsMax,
      remaining: isPremium ? Infinity : Math.max(0, habitsMax - habitsCount),
      isLimitReached: !isPremium && habitsCount >= habitsMax
    },
    goals: {
      current: goalsCount,
      max: goalsMax,
      canAdd: isPremium || goalsCount < goalsMax,
      remaining: isPremium ? Infinity : Math.max(0, goalsMax - goalsCount),
      isLimitReached: !isPremium && goalsCount >= goalsMax
    },
    aiRuns: {
      current: aiRunsThisMonth,
      max: aiRunsMax,
      canRun: isPremium || aiRunsThisMonth < aiRunsMax,
      remaining: isPremium ? Infinity : Math.max(0, aiRunsMax - aiRunsThisMonth),
      isLimitReached: !isPremium && aiRunsThisMonth >= aiRunsMax
    }
  };
}
