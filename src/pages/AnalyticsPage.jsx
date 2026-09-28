import React, { Component, useEffect, useRef } from 'react';
import { AnalyticsView } from '../components/analytics/AnalyticsView';
import { AlertTriangle, RefreshCw, Sparkles, Crown, ArrowRight, Lock } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

class AnalyticsErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AnalyticsPage Error Caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-lg mx-auto text-center space-y-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl my-12">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Unable to Load Analytics Suite
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              An unexpected issue occurred while rendering charts. Click below to reload your metrics.
            </p>
            {this.state.error?.message && (
              <p className="text-[11px] font-mono text-rose-500 bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl mt-2 max-w-sm mx-auto break-words">
                {this.state.error.message}
              </p>
            )}
          </div>
          <button
            onClick={this.handleReset}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Analytics</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const AnalyticsPage = () => {
  const { quotaStatus, analyticsViewsCount, recordAnalyticsView, openPricingModal } = useDashboard();
  const hasRecordedRef = useRef(false);

  const isFree = !quotaStatus?.isPremium;
  const isLimitReached = isFree && analyticsViewsCount >= 3;

  useEffect(() => {
    if (isFree) {
      if (isLimitReached) {
        // Automatically pop up subscription modal on 4th+ view
        openPricingModal();
      } else if (!hasRecordedRef.current) {
        hasRecordedRef.current = true;
        recordAnalyticsView();
      }
    }
  }, [isFree, isLimitReached, openPricingModal, recordAnalyticsView]);

  return (
    <AnalyticsErrorBoundary>
      <div className="space-y-6 animate-in fade-in duration-200">
        
        {/* If Free Tier limit reached (4th+ view), display high-impact Paywall Lock */}
        {isLimitReached ? (
          <div className="glass-panel-dark rounded-3xl p-8 sm:p-12 border border-indigo-500/30 bg-gradient-to-b from-indigo-500/10 via-slate-900/60 to-slate-950 text-center space-y-6 max-w-2xl mx-auto my-8 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 mx-auto flex items-center justify-center shadow-xl shadow-indigo-500/20 animate-pulse">
              <Lock className="w-8 h-8 text-indigo-400" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Monthly Preview Limit Reached
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white pt-2">
                Executive Analytics Suite Locked
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
                You have used your <strong>3 free monthly visits</strong> to the Analytics Suite for this month. 
                Upgrade to Pulse Pro or Founder Lifetime for unlimited real-time executive insights, correlation analysis, and long-term trajectory forecasts.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-center gap-2 text-xs font-mono font-bold text-indigo-400 max-w-xs mx-auto">
              <span>Used 3 / 3 Free Monthly Views</span>
            </div>

            <button
              onClick={openPricingModal}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>Unlock Unlimited Analytics Suite</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Free Tier Preview Banner (Views 1, 2, 3) */}
            {isFree && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 text-xs">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-medium">
                  <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>
                    <strong>Free Monthly Preview:</strong> Visit {Math.min(3, analyticsViewsCount + 1)} of 3 used this month.
                  </span>
                </div>
                <button
                  onClick={openPricingModal}
                  className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-sm transition shrink-0 cursor-pointer"
                >
                  Upgrade for Unlimited Access
                </button>
              </div>
            )}

            {/* Consolidated Full Analytics & Executive Diagnostic Suite */}
            <AnalyticsView />
          </>
        )}
      </div>
    </AnalyticsErrorBoundary>
  );
};
