import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  TrendingUp, 
  CreditCard, 
  MapPin,
  Calendar,
  Award,
  Clock,
  Users
} from 'lucide-react';
import { ProcessedOrder, AnalyticsData, TimeFilter } from '../../types/SwiggyData';
import { formatCurrency, formatDuration, getMonthlySpending, getTopRestaurants } from '../../utils/dataProcessor';

interface OverviewDashboardProps {
  data: ProcessedOrder[];
  analytics: AnalyticsData;
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  timeFilterOptions: TimeFilter[];
}

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon: Icon, trend, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="stats-card"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-${color}-500/10`}>
        <Icon className={`w-6 h-6 text-${color}-500`} />
      </div>
      {trend && (
        <div className={`flex items-center space-x-1 text-sm ${
          trend.isPositive ? 'text-green-400' : 'text-red-400'
        }`}>
          <TrendingUp className={`w-4 h-4 ${!trend.isPositive ? 'transform rotate-180' : ''}`} />
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
    
    <div>
      <h3 className="text-2xl font-bold text-white mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </h3>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      {subtitle && (
        <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
      )}
    </div>
  </motion.div>
);

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ 
  data, 
  analytics, 
  timeFilter, 
  onTimeFilterChange, 
  timeFilterOptions 
}) => {
  // Calculate additional metrics
  const avgOrderValue = analytics.totalSpent / analytics.totalOrders;
  const avgOrdersPerMonth = analytics.totalOrders / 12; // Assuming roughly a year of data
  const topRestaurant = getTopRestaurants(data, 1)[0];
  const monthlyData = getMonthlySpending(data);
  
  // Calculate trends (comparing last 3 months vs previous 3 months for example)
  const recentMonths = monthlyData.slice(-3);
  const previousMonths = monthlyData.slice(-6, -3);
  const recentTotal = recentMonths.reduce((sum, month) => sum + month.totalSpent, 0);
  const previousTotal = previousMonths.reduce((sum, month) => sum + month.totalSpent, 0);
  const spendingTrend = previousTotal > 0 ? ((recentTotal - previousTotal) / previousTotal) * 100 : 0;

  const statsCards = [
    {
      title: 'Total Orders',
      value: analytics.totalOrders,
      subtitle: `${avgOrdersPerMonth.toFixed(1)} orders/month`,
      icon: ShoppingBag,
      color: 'blue'
    },
    {
      title: 'Total Spent',
      value: formatCurrency(analytics.totalSpent),
      subtitle: `${formatCurrency(avgOrderValue)} avg per order`,
      icon: CreditCard,
      trend: {
        value: Math.round(Math.abs(spendingTrend)),
        isPositive: spendingTrend > 0
      },
      color: 'green'
    },
    {
      title: 'Total Fees',
      value: formatCurrency(analytics.totalFees),
      subtitle: `${((analytics.totalFees / analytics.totalSpent) * 100).toFixed(1)}% of total`,
      icon: TrendingUp,
      color: 'orange'
    },
    {
      title: 'Tips Given',
      value: formatCurrency(analytics.totalTips),
      subtitle: `${(analytics.totalTips / analytics.totalOrders).toFixed(0)} avg per order`,
      icon: Award,
      color: 'purple'
    },
    {
      title: 'Unique Restaurants',
      value: analytics.uniqueRestaurants,
      subtitle: topRestaurant ? `Top: ${topRestaurant.restaurant}` : '',
      icon: Users,
      color: 'pink'
    },
    {
      title: 'Delivery Areas',
      value: analytics.uniqueAreas,
      subtitle: 'Different locations',
      icon: MapPin,
      color: 'indigo'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Overview Dashboard</h1>
          <p className="text-gray-400">
            Get a comprehensive view of your Swiggy ordering patterns
          </p>
        </div>
        
        {/* Time Filter */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={timeFilter.label}
            onChange={(e) => {
              const selectedFilter = timeFilterOptions.find(f => f.label === e.target.value);
              if (selectedFilter) onTimeFilterChange(selectedFilter);
            }}
            className="select"
            title="Select time filter"
            aria-label="Select time filter"
          >
            {timeFilterOptions.map((option) => (
              <option key={option.label} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="responsive-grid">
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <StatsCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Quick Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="card"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Quick Insights</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-dark-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Most Active Day</span>
            </div>
            <p className="text-white font-semibold">
              {/* Calculate most active day */}
              {Object.entries(
                data.reduce((acc, order) => {
                  acc[order.dayOfWeek] = (acc[order.dayOfWeek] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
            </p>
          </div>

          <div className="bg-dark-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Peak Hour</span>
            </div>
            <p className="text-white font-semibold">
              {/* Calculate peak hour */}
              {Object.entries(
                data.reduce((acc, order) => {
                  acc[order.hour] = (acc[order.hour] || 0) + 1;
                  return acc;
                }, {} as Record<number, number>)
              ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}:00
            </p>
          </div>

          <div className="bg-dark-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Highest Order</span>
            </div>
            <p className="text-white font-semibold">
              {formatCurrency(Math.max(...data.map(order => order.orderTotal)))}
            </p>
          </div>

          <div className="bg-dark-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">Avg Items/Order</span>
            </div>
            <p className="text-white font-semibold">
              {(data.reduce((sum, order) => sum + order.itemsCount, 0) / data.length).toFixed(1)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="card"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Recent Orders</h2>
        
        <div className="space-y-3">
          {data.slice(0, 5).map((order, index) => (
            <div key={order.orderId} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-white">{order.restaurantName}</h3>
                <p className="text-sm text-gray-400">
                  {order.orderTime.toLocaleDateString()} • {order.deliveryArea}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">{formatCurrency(order.orderTotal)}</p>
                <p className="text-sm text-gray-400">{order.itemsCount} items</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-center text-gray-400 text-sm">
            Explore other dashboards for detailed analysis
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OverviewDashboard; 