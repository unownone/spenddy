import React from 'react';
import { ProcessedOrder, AnalyticsData, TimeFilter } from '../../types/SwiggyData';

interface SpendingDashboardProps {
  data: ProcessedOrder[];
  analytics: AnalyticsData;
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  timeFilterOptions: TimeFilter[];
}

const SpendingDashboard: React.FC<SpendingDashboardProps> = ({ 
  data, 
  analytics, 
  timeFilter, 
  onTimeFilterChange, 
  timeFilterOptions 
}) => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-3xl font-bold text-white mb-2">Spending Analysis</h1>
        <p className="text-gray-400">
          Detailed spending patterns and trends analysis
        </p>
        <div className="mt-8 text-center">
          <p className="text-gray-500">🚧 Dashboard under construction 🚧</p>
          <p className="text-sm text-gray-600 mt-2">
            This dashboard will include monthly/yearly spending charts, fees breakdown, and spending trends.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpendingDashboard; 