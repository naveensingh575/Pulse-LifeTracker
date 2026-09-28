import React, { Component } from 'react';
import { AnalyticsView } from '../components/analytics/AnalyticsView';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
  return (
    <AnalyticsErrorBoundary>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Consolidated Full Analytics & Executive Diagnostic Suite */}
        <AnalyticsView />
      </div>
    </AnalyticsErrorBoundary>
  );
};
