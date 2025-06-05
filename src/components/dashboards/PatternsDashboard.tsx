import React from 'react';
import { ProcessedOrder, AnalyticsData, TimeFilter } from '../../types/SwiggyData';

interface PatternsDashboardProps {
  data: ProcessedOrder[];
  analytics: AnalyticsData;
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  timeFilterOptions: TimeFilter[];
}

const PatternsDashboard: React.FC<PatternsDashboardProps> = ({ 
  data, 
  analytics, 
  timeFilter, 
  onTimeFilterChange, 
  timeFilterOptions 
}) => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-3xl font-bold text-white mb-2">Order Patterns</h1>
        <p className="text-gray-400">
          Analyze your time-based ordering behavior and patterns
        </p>
        <div className="mt-8 text-center">
          <p className="text-gray-500">🚧 Dashboard under construction 🚧</p>
          <p className="text-sm text-gray-600 mt-2">
            This dashboard will show hourly patterns, day-of-week analysis, and seasonal trends.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatternsDashboard; 