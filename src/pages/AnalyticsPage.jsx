import React from 'react';
import { AnalyticsView } from '../components/analytics/AnalyticsView';

export const AnalyticsPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Consolidated Full Analytics & Executive Diagnostic Suite */}
      <AnalyticsView />
    </div>
  );
};
