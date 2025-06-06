import React from 'react';
import { AnalyticsData } from "../../types/SwiggyData";

interface LocationsDashboardProps {
  data: AnalyticsData | null;
}

const LocationsDashboard: React.FC<LocationsDashboardProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-3xl font-bold text-white mb-2">
          Location Analysis
        </h1>
        <p className="text-gray-400">
          Explore delivery locations and geographical insights
        </p>
        <div className="mt-8 text-center">
          <p className="text-gray-500">🚧 Dashboard under construction 🚧</p>
          <p className="text-sm text-gray-600 mt-2">
            This dashboard will show delivery areas, distance analysis, and
            location-based preferences.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationsDashboard; 