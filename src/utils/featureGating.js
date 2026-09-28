/**
 * Non-Intrusive Freemium Gating & Quota Engine for Pulse Life Tracker
 */

export const FREE_TIER_LIMITS = {
  MAX_HABITS: Infinity, // Unlimited for all users
  MAX_GOALS: Infinity, // Unlimited for all users
  MAX_MONTHLY_AI_RUNS: 3,
  MAX_MONTHLY_MONTH_VIEWS: 3, // 3 monthly views per page/module per month
  MAX_MONTHLY_ANALYTICS_VIEWS: 3 // 3 analytics suite views per month
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
 * Computes full quota status across habits, goals, AI intelligence runs, month views per page, and analytics views
 */
export function getQuotaStatus({
  habitsCount = 0,
  goalsCount = 0,
  aiRunsThisMonth = 0,
  monthViews = { habits: 0, activity: 0, finance: 0 },
  monthViewsThisMonth = 0, // backwards compatibility
  analyticsViewsThisMonth = 0,
  subscriptionTier = "free"
}) {
  const isPremium = subscriptionTier !== "free";

  const habitsMax = Infinity;
  const goalsMax = Infinity;
  const aiRunsMax = isPremium ? Infinity : FREE_TIER_LIMITS.MAX_MONTHLY_AI_RUNS;
  const monthViewsMax = isPremium ? Infinity : FREE_TIER_LIMITS.MAX_MONTHLY_MONTH_VIEWS;
  const analyticsViewsMax = isPremium ? Infinity : FREE_TIER_LIMITS.MAX_MONTHLY_ANALYTICS_VIEWS;

  // Resolve per-page month views
  const habitsMonthViews = typeof monthViews?.habits === 'number' ? monthViews.habits : monthViewsThisMonth;
  const activityMonthViews = typeof monthViews?.activity === 'number' ? monthViews.activity : 0;
  const financeMonthViews = typeof monthViews?.finance === 'number' ? monthViews.finance : 0;

  return {
    isPremium,
    subscriptionTier,
    habits: {
      current: habitsCount,
      max: habitsMax,
      canAdd: true, // Unlimited habits
      remaining: Infinity,
      isLimitReached: false
    },
    goals: {
      current: goalsCount,
      max: goalsMax,
      canAdd: true, // Unlimited goals
      remaining: Infinity,
      isLimitReached: false
    },
    aiRuns: {
      current: aiRunsThisMonth,
      max: aiRunsMax,
      canRun: isPremium || aiRunsThisMonth < aiRunsMax,
      remaining: isPremium ? Infinity : Math.max(0, aiRunsMax - aiRunsThisMonth),
      isLimitReached: !isPremium && aiRunsThisMonth >= aiRunsMax
    },
    // Backwards-compatible monthViews object (maps to habits) + per-page breakdown
    monthViews: {
      current: habitsMonthViews,
      max: monthViewsMax,
      canView: isPremium || habitsMonthViews < monthViewsMax,
      remaining: isPremium ? Infinity : Math.max(0, monthViewsMax - habitsMonthViews),
      isLimitReached: !isPremium && habitsMonthViews >= monthViewsMax,
      byPage: {
        habits: {
          current: habitsMonthViews,
          canView: isPremium || habitsMonthViews < monthViewsMax,
          remaining: isPremium ? Infinity : Math.max(0, monthViewsMax - habitsMonthViews),
          isLimitReached: !isPremium && habitsMonthViews >= monthViewsMax
        },
        activity: {
          current: activityMonthViews,
          canView: isPremium || activityMonthViews < monthViewsMax,
          remaining: isPremium ? Infinity : Math.max(0, monthViewsMax - activityMonthViews),
          isLimitReached: !isPremium && activityMonthViews >= monthViewsMax
        },
        finance: {
          current: financeMonthViews,
          canView: isPremium || financeMonthViews < monthViewsMax,
          remaining: isPremium ? Infinity : Math.max(0, monthViewsMax - financeMonthViews),
          isLimitReached: !isPremium && financeMonthViews >= monthViewsMax
        }
      }
    },
    analyticsViews: {
      current: analyticsViewsThisMonth,
      max: analyticsViewsMax,
      canView: isPremium || analyticsViewsThisMonth < analyticsViewsMax,
      remaining: isPremium ? Infinity : Math.max(0, analyticsViewsMax - analyticsViewsThisMonth),
      isLimitReached: !isPremium && analyticsViewsThisMonth >= analyticsViewsMax
    },
    exports: {
      canExport: isPremium
    }
  };
}

/**
 * Checks if user can export data (CSV, .md)
 */
export function canExportData(subscriptionTier = "free") {
  return subscriptionTier !== "free";
}
