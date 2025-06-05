import React from 'react';
import { ProcessedOrder, AnalyticsData, TimeFilter } from '../../types/SwiggyData';

interface RestaurantsDashboardProps {
  data: ProcessedOrder[];
  analytics: AnalyticsData;
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  timeFilterOptions: TimeFilter[];
}

const RestaurantsDashboard: React.FC<RestaurantsDashboardProps> = ({ 
  data, 
  analytics, 
  timeFilter, 
  onTimeFilterChange, 
  timeFilterOptions 
}) => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-3xl font-bold text-white mb-2">Restaurant Analytics</h1>
        <p className="text-gray-400">
          Explore your favorite restaurants and cuisine preferences
        </p>
        <div className="mt-8 text-center">
          <p className="text-gray-500">🚧 Dashboard under construction 🚧</p>
          <p className="text-sm text-gray-600 mt-2">
            This dashboard will show top restaurants, cuisine analysis, and restaurant performance metrics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantsDashboard; 