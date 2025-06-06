import React from 'react';
import { AnalyticsData } from "../../types/SwiggyData";

interface InsightsDashboardProps {
  data: AnalyticsData | null;
}

const InsightsDashboard: React.FC<InsightsDashboardProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-3xl font-bold text-white mb-2">Smart Insights</h1>
        <p className="text-gray-400">
          AI-powered insights and intelligent recommendations
        </p>
        <div className="mt-8 text-center">
          <p className="text-gray-500">🚧 Dashboard under construction 🚧</p>
          <p className="text-sm text-gray-600 mt-2">
            This dashboard will provide smart insights, recommendations, and
            advanced analytics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsightsDashboard; 