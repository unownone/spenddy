import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  DollarSign,
  PieChart,
  Calendar,
  Receipt,
  Target,
  AlertTriangle,
  Award,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ProcessedOrder, AnalyticsData } from "../../types/SwiggyData";
import {
  formatCurrency,
  getMonthlySpending,
  filterOrdersByDateRange,
} from "../../utils/dataProcessor";
import { useTimeDial } from "../../App";

interface SpendingDashboardProps {
  data: ProcessedOrder[];
  analytics: AnalyticsData;
}

interface SpendingCard {
  title: string;
  value: string;
  subtitle: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ElementType;
  color: string;
}

interface ChartDataPoint {
  month: string;
  spending: number;
  fees: number;
  tips: number;
  orders: number;
}

interface FeesBreakdown {
  deliveryFees: number;
  packingCharges: number;
  convenienceFee: number;
  gst: number;
  serviceCharges: number;
  total: number;
}

interface PaymentMethodStats {
  method: string;
  count: number;
  totalSpent: number;
  percentage: number;
}

// Add pagination interface
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}) => {
  const startItem = currentPage * itemsPerPage + 1;
  const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-gray-400">
        Showing {startItem}-{endItem} of {totalItems} items
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm bg-dark-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                currentPage === i
                  ? "bg-blue-500 text-white"
                  : "bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm bg-dark-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-600 transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const SpendingCard: React.FC<SpendingCard> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="stats-card-compact"
  >
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 rounded-md bg-${color}-500/10`}>
        <Icon className={`w-4 h-4 text-${color}-500`} />
      </div>
      {trend && (
        <div
          className={`flex items-center space-x-1 text-xs ${
            trend.isPositive ? "text-green-400" : "text-red-400"
          }`}
        >
          {trend.isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{Math.abs(trend.value).toFixed(1)}%</span>
        </div>
      )}
    </div>

    <div>
      <h3 className="text-lg font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-xs font-medium">{title}</p>
      <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>
    </div>
  </motion.div>
);

const SpendingChart: React.FC<{
  data: ChartDataPoint[];
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  selectedMonth: string | null;
  onSelectMonth: (month: string | null) => void;
}> = ({
  data,
  currentPage,
  onPageChange,
  itemsPerPage = 6,
  selectedMonth,
  onSelectMonth,
}) => {
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const maxSpending = Math.max(...currentData.map((d) => d.spending));
  const maxFees = Math.max(...currentData.map((d) => d.fees));

  return (
    <div>
      <div className="space-y-3">
        {currentData.map((point, index) => {
          const spendingPercentage = (point.spending / maxSpending) * 100;
          const feesPercentage = (point.fees / maxFees) * 100;
          const isSelected = selectedMonth === point.month;
          return (
            <motion.div
              key={`${point.month}-${currentPage}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-dark-700 rounded-lg p-4 cursor-pointer border-2 transition-all ${
                isSelected
                  ? "border-orange-500 shadow-glow"
                  : "border-transparent hover:border-orange-400"
              }`}
              onClick={() => onSelectMonth(isSelected ? null : point.month)}
              tabIndex={0}
              aria-pressed={isSelected}
              title={
                isSelected ? "Deselect month" : "Show breakdown for this month"
              }
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`font-medium ${
                    isSelected ? "text-orange-400" : "text-white"
                  }`}
                >
                  {point.month}
                </span>
                <div className="text-right">
                  <div className="text-white font-bold">
                    {formatCurrency(point.spending)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {point.orders} orders
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {/* Spending Bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Food & Total</span>
                    <span>{formatCurrency(point.spending)}</span>
                  </div>
                  <div className="w-full bg-dark-600 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${spendingPercentage}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Fees Bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Fees & Tips</span>
                    <span>{formatCurrency(point.fees + point.tips)}</span>
                  </div>
                  <div className="w-full bg-dark-600 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${feesPercentage}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                      className="h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        totalItems={data.length}
      />
    </div>
  );
};

// Month-specific breakdown component with pie chart
const MonthBreakdown: React.FC<{
  data: ProcessedOrder[];
  selectedMonth: string | null;
}> = ({ data, selectedMonth }) => {
  // Convert chart month format (e.g., "Dec 24") to monthYear format (e.g., "2024-12")
  const convertChartMonthToMonthYear = (chartMonth: string): string | null => {
    if (!chartMonth) return null;

    try {
      // Parse chart month format like "Dec 24" or "Jan 25"
      const [monthShort, yearShort] = chartMonth.split(" ");

      // Convert 2-digit year to 4-digit year
      const currentYear = new Date().getFullYear();
      const currentYearShort = currentYear.toString().slice(-2);
      const yearNum = parseInt(yearShort);
      const currentYearNum = parseInt(currentYearShort);

      // If the year is greater than current year (unlikely), it's probably previous century
      // Otherwise, assume it's in the current century
      const fullYear =
        yearNum <= currentYearNum
          ? Math.floor(currentYear / 100) * 100 + yearNum
          : (Math.floor(currentYear / 100) - 1) * 100 + yearNum;

      // Convert short month name to month number
      const monthMap: Record<string, string> = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12",
      };

      const monthNum = monthMap[monthShort];
      if (!monthNum) return null;

      return `${fullYear}-${monthNum}`;
    } catch (error) {
      console.error("Error converting chart month to monthYear:", error);
      return null;
    }
  };

  const monthData = useMemo(() => {
    let orders: ProcessedOrder[];
    if (!selectedMonth) {
      orders = data;
    } else {
      // Convert selectedMonth from chart format to monthYear format
      const monthYearToMatch = convertChartMonthToMonthYear(selectedMonth);
      if (!monthYearToMatch) {
        return null;
      }
      orders = data.filter((order) => order.monthYear === monthYearToMatch);
    }
    if (orders.length === 0) return null;

    const totalFood = orders.reduce((sum, order) => sum + order.itemTotal, 0);
    const totalDelivery = orders.reduce(
      (sum, order) => sum + order.deliveryCharges,
      0
    );
    const totalGST = orders.reduce((sum, order) => sum + order.gst, 0);
    const totalPacking = orders.reduce(
      (sum, order) => sum + order.packingCharges,
      0
    );
    const totalConvenience = orders.reduce(
      (sum, order) => sum + order.convenienceFee,
      0
    );
    const totalService = orders.reduce(
      (sum, order) => sum + order.serviceCharges,
      0
    );
    const totalTips = orders.reduce((sum, order) => sum + order.tipAmount, 0);
    const totalSpent = orders.reduce((sum, order) => sum + order.orderTotal, 0);

    const breakdown = [
      { name: "Food", value: totalFood, color: "bg-green-500" },
      { name: "Delivery", value: totalDelivery, color: "bg-orange-500" },
      { name: "GST", value: totalGST, color: "bg-red-500" },
      { name: "Tips", value: totalTips, color: "bg-purple-500" },
      { name: "Packing", value: totalPacking, color: "bg-blue-500" },
      { name: "Convenience", value: totalConvenience, color: "bg-yellow-500" },
      { name: "Service", value: totalService, color: "bg-pink-500" },
    ].filter((item) => item.value > 0);

    return {
      totalSpent,
      orderCount: orders.length,
      breakdown,
    };
  }, [data, selectedMonth]);

  return (
    <div className="space-y-4">
      {monthData ? (
        <div className="space-y-4">
          {/* Total for the month */}
          <div className="bg-dark-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Total Spent</span>
              <span className="text-white font-bold text-lg">
                {formatCurrency(monthData.totalSpent)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Orders</span>
              <span className="text-gray-300">{monthData.orderCount}</span>
            </div>
          </div>

          {/* Pie Chart (Simple circular progress version) */}
          <div className="grid grid-cols-2 gap-3">
            {monthData.breakdown.map((item, index) => {
              const percentage = (item.value / monthData.totalSpent) * 100;

              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-dark-700 rounded-lg p-3"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-xs text-gray-300">{item.name}</span>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {formatCurrency(item.value)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {percentage.toFixed(1)}%
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <PieChart className="w-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No data for this range</p>
        </div>
      )}
    </div>
  );
};

const PaymentMethodChart: React.FC<{
  methods: PaymentMethodStats[];
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}> = ({ methods, currentPage, onPageChange, itemsPerPage = 4 }) => {
  const totalPages = Math.ceil(methods.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMethods = methods.slice(startIndex, endIndex);

  return (
    <div>
      <div className="space-y-3">
        {currentMethods.map((method, index) => (
          <motion.div
            key={`${method.method}-${currentPage}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-dark-700 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">{method.method}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">
                  {formatCurrency(method.totalSpent)}
                </div>
                <div className="text-xs text-gray-400">
                  {method.count} orders
                </div>
              </div>
            </div>

            <div className="w-full bg-dark-600 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${method.percentage}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
              />
            </div>

            <div className="mt-2 text-xs text-gray-400">
              {method.percentage.toFixed(1)}% of total spending
            </div>
          </motion.div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        totalItems={methods.length}
      />
    </div>
  );
};

const SpendingDashboard: React.FC<SpendingDashboardProps> = ({
  data: rawData,
  analytics,
}) => {
  const { range } = useTimeDial();

  // Filter data based on global time dial
  const data = useMemo(() => {
    return filterOrdersByDateRange(rawData, range.start, range.end);
  }, [rawData, range]);

  // Pagination state
  const [spendingChartPage, setSpendingChartPage] = useState(0);
  const [paymentMethodPage, setPaymentMethodPage] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Calculate spending metrics
  const spendingMetrics = useMemo(() => {
    const monthlyData = getMonthlySpending(data);

    // Calculate trends (comparing last 3 months vs previous 3 months)
    const recentMonths = monthlyData.slice(-3);
    const previousMonths = monthlyData.slice(-6, -3);

    const recentSpending = recentMonths.reduce(
      (sum, month) => sum + month.totalSpent,
      0
    );
    const previousSpending = previousMonths.reduce(
      (sum, month) => sum + month.totalSpent,
      0
    );
    const spendingTrend =
      previousSpending > 0
        ? ((recentSpending - previousSpending) / previousSpending) * 100
        : 0;

    const recentFees = recentMonths.reduce(
      (sum, month) => sum + month.totalFees,
      0
    );
    const previousFees = previousMonths.reduce(
      (sum, month) => sum + month.totalFees,
      0
    );
    const feesTrend =
      previousFees > 0 ? ((recentFees - previousFees) / previousFees) * 100 : 0;

    const totalSpent = data.reduce((sum, order) => sum + order.orderTotal, 0);
    const totalFees = data.reduce(
      (sum, order) =>
        sum +
        order.deliveryCharges +
        order.packingCharges +
        order.convenienceFee +
        order.gst +
        order.serviceCharges,
      0
    );
    const totalOrders = data.length;

    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const avgMonthlySpending =
      monthlyData.reduce((sum, month) => sum + month.totalSpent, 0) /
      Math.max(monthlyData.length, 1);

    // Fees breakdown
    const feesBreakdown: FeesBreakdown = {
      deliveryFees: data.reduce((sum, order) => sum + order.deliveryCharges, 0),
      packingCharges: data.reduce(
        (sum, order) => sum + order.packingCharges,
        0
      ),
      convenienceFee: data.reduce(
        (sum, order) => sum + order.convenienceFee,
        0
      ),
      gst: data.reduce((sum, order) => sum + order.gst, 0),
      serviceCharges: data.reduce(
        (sum, order) => sum + order.serviceCharges,
        0
      ),
      total: totalFees,
    };

    // Payment method analysis
    const paymentMethods = new Map<
      string,
      { count: number; totalSpent: number }
    >();
    data.forEach((order) => {
      const method = order.paymentMethod || "Unknown";
      if (!paymentMethods.has(method)) {
        paymentMethods.set(method, { count: 0, totalSpent: 0 });
      }
      const current = paymentMethods.get(method)!;
      current.count += 1;
      current.totalSpent += order.orderTotal;
    });

    const paymentMethodStats: PaymentMethodStats[] = Array.from(
      paymentMethods.entries()
    )
      .map(([method, stats]) => ({
        method,
        count: stats.count,
        totalSpent: stats.totalSpent,
        percentage: totalSpent > 0 ? (stats.totalSpent / totalSpent) * 100 : 0,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);

    // Chart data
    const chartData: ChartDataPoint[] = monthlyData.map((month) => ({
      month: new Date(month.month + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      spending: month.totalSpent,
      fees: month.totalFees,
      tips: month.totalTips,
      orders: month.orderCount,
    }));

    // Available months for breakdown
    const availableMonths = [...new Set(data.map((order) => order.monthYear))]
      .sort()
      .reverse(); // Most recent first

    return {
      spendingTrend,
      feesTrend,
      avgOrderValue,
      avgMonthlySpending,
      feesBreakdown,
      paymentMethodStats,
      chartData,
      monthlyData,
      availableMonths,
      totalSpent,
      totalFees,
      totalOrders,
    };
  }, [data]);

  // Notable quick stats
  const quickStats = useMemo(() => {
    if (!data.length) return null;
    // Most expensive order
    const mostExpensive = data.reduce(
      (max, o) => (o.orderTotal > max.orderTotal ? o : max),
      data[0]
    );
    // Least expensive order
    const leastExpensive = data.reduce(
      (min, o) => (o.orderTotal < min.orderTotal ? o : min),
      data[0]
    );
    // Fastest delivered order (lowest deliveryTime > 0)
    const delivered = data.filter((o) => o.deliveryTime && o.deliveryTime > 0);
    const fastest = delivered.length
      ? delivered.reduce(
          (min, o) => (o.deliveryTime! < min.deliveryTime! ? o : min),
          delivered[0]
        )
      : null;
    const slowest = delivered.length
      ? delivered.reduce(
          (max, o) => (o.deliveryTime! > max.deliveryTime! ? o : max),
          delivered[0]
        )
      : null;
    // Latest delivered order (most recent orderTime)
    const latest = data.reduce(
      (max, o) => (o.orderTime > max.orderTime ? o : max),
      data[0]
    );
    // Most items
    const mostItems = data.reduce(
      (max, o) => (o.itemsCount > max.itemsCount ? o : max),
      data[0]
    );
    // Least items
    const leastItems = data.reduce(
      (min, o) => (o.itemsCount < min.itemsCount ? o : min),
      data[0]
    );
    return {
      mostExpensive,
      leastExpensive,
      fastest,
      slowest,
      latest,
      mostItems,
      leastItems,
    };
  }, [data]);

  const spendingCards: SpendingCard[] = [
    {
      title: "Total Spending",
      value: formatCurrency(spendingMetrics.totalSpent),
      subtitle: `${formatCurrency(
        spendingMetrics.avgMonthlySpending
      )} avg/month`,
      trend: {
        value: spendingMetrics.spendingTrend,
        isPositive: spendingMetrics.spendingTrend > 0,
      },
      icon: DollarSign,
      color: "green",
    },
    {
      title: "Average Order",
      value: formatCurrency(spendingMetrics.avgOrderValue),
      subtitle: `Across ${spendingMetrics.totalOrders} orders`,
      icon: ShoppingBag,
      color: "blue",
    },
    {
      title: "Total Fees",
      value: formatCurrency(spendingMetrics.totalFees),
      subtitle: `${(
        (spendingMetrics.totalFees / Math.max(spendingMetrics.totalSpent, 1)) *
        100
      ).toFixed(1)}% of total`,
      trend: {
        value: spendingMetrics.feesTrend,
        isPositive: spendingMetrics.feesTrend < 0, // Lower fees are better
      },
      icon: Receipt,
      color: "orange",
    },
    {
      title: "Orders Count",
      value: spendingMetrics.totalOrders.toString(),
      subtitle: `${(
        spendingMetrics.totalOrders /
        Math.max(spendingMetrics.chartData.length, 1)
      ).toFixed(0)} orders/month`,
      icon: Target,
      color: "purple",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Spending Analysis
          </h1>
          <p className="text-gray-400">
            Detailed spending patterns, trends, and cost breakdown
          </p>
        </div>
      </div>

      {/* Spending Cards */}
      <div className="responsive-grid">
        {spendingCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <SpendingCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Quick Stats Notables */}
      {quickStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          <div className="bg-dark-700 rounded-lg p-4 text-xs">
            <div className="font-semibold text-orange-400 mb-1">
              Most Expensive Order
            </div>
            <div>
              ₹{quickStats.mostExpensive.orderTotal.toLocaleString("en-IN")} at{" "}
              <span className="font-medium">
                {quickStats.mostExpensive.restaurantName}
              </span>
            </div>
            <div className="text-gray-400">
              {quickStats.mostExpensive.itemsCount} items,{" "}
              {quickStats.mostExpensive.orderTime.toLocaleDateString()}
            </div>
          </div>
          <div className="bg-dark-700 rounded-lg p-4 text-xs">
            <div className="font-semibold text-green-400 mb-1">
              Least Expensive Order
            </div>
            <div>
              ₹{quickStats.leastExpensive.orderTotal.toLocaleString("en-IN")} at{" "}
              <span className="font-medium">
                {quickStats.leastExpensive.restaurantName}
              </span>
            </div>
            <div className="text-gray-400">
              {quickStats.leastExpensive.itemsCount} items,{" "}
              {quickStats.leastExpensive.orderTime.toLocaleDateString()}
            </div>
          </div>
          <div className="bg-dark-700 rounded-lg p-4 text-xs">
            <div className="font-semibold text-blue-400 mb-1">
              Fastest Delivery
            </div>
            {quickStats.fastest ? (
              <>
                <div>
                  {Math.round(quickStats.fastest.deliveryTime / 60)} min to{" "}
                  <span className="font-medium">
                    {quickStats.fastest.restaurantName}
                  </span>
                </div>
                <div className="text-gray-400">
                  {quickStats.fastest.itemsCount} items,{" "}
                  {quickStats.fastest.orderTime.toLocaleDateString()}
                </div>
              </>
            ) : (
              <div className="text-gray-400">No data</div>
            )}
          </div>
          <div className="bg-dark-700 rounded-lg p-4 text-xs">
            <div className="font-semibold text-red-400 mb-1">
              Slowest Delivery
            </div>
            {quickStats.slowest ? (
              <>
                <div>
                  {Math.round(quickStats.slowest.deliveryTime / 60)} min to{" "}
                  <span className="font-medium">
                    {quickStats.slowest.restaurantName}
                  </span>
                </div>
                <div className="text-gray-400">
                  {quickStats.slowest.itemsCount} items,{" "}
                  {quickStats.slowest.orderTime.toLocaleDateString()}
                </div>
              </>
            ) : (
              <div className="text-gray-400">No data</div>
            )}
          </div>
          <div className="bg-dark-700 rounded-lg p-4 text-xs">
            <div className="font-semibold text-purple-400 mb-1">
              Latest Order
            </div>
            <div>
              ₹{quickStats.latest.orderTotal.toLocaleString("en-IN")} at{" "}
              <span className="font-medium">
                {quickStats.latest.restaurantName}
              </span>
            </div>
            <div className="text-gray-400">
              {quickStats.latest.itemsCount} items,{" "}
              {quickStats.latest.orderTime.toLocaleDateString()}
            </div>
          </div>
          <div className="bg-dark-700 rounded-lg p-4 text-xs">
            <div className="font-semibold text-yellow-400 mb-1">Most Items</div>
            <div>
              {quickStats.mostItems.itemsCount} items at{" "}
              <span className="font-medium">
                {quickStats.mostItems.restaurantName}
              </span>
            </div>
            <div className="text-gray-400">
              ₹{quickStats.mostItems.orderTotal.toLocaleString("en-IN")},{" "}
              {quickStats.mostItems.orderTime.toLocaleDateString()}
            </div>
          </div>
          <div className="bg-dark-700 rounded-lg p-4 text-xs">
            <div className="font-semibold text-pink-400 mb-1">Least Items</div>
            <div>
              {quickStats.leastItems.itemsCount} items at{" "}
              <span className="font-medium">
                {quickStats.leastItems.restaurantName}
              </span>
            </div>
            <div className="text-gray-400">
              ₹{quickStats.leastItems.orderTotal.toLocaleString("en-IN")},{" "}
              {quickStats.leastItems.orderTime.toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Spending Trend with Pagination */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">
                Monthly Spending Trend
              </h2>
            </div>
            <div className="text-sm text-gray-400">
              {spendingMetrics.chartData.length} months total
            </div>
          </div>

          <SpendingChart
            data={spendingMetrics.chartData}
            currentPage={spendingChartPage}
            onPageChange={setSpendingChartPage}
            itemsPerPage={3}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
          />
        </motion.div>

        {/* Month Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card"
        >
          <div className="flex items-center space-x-2 mb-6">
            <PieChart className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl font-semibold text-white">
              Month Breakdown
            </h2>
          </div>

          <MonthBreakdown data={data} selectedMonth={selectedMonth} />
        </motion.div>
      </div>

      {/* Payment Methods & Insights */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Payment Methods with Pagination */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-semibold text-white">
                Payment Methods
              </h2>
            </div>
            <div className="text-sm text-gray-400">
              {spendingMetrics.paymentMethodStats.length} methods
            </div>
          </div>

          <PaymentMethodChart
            methods={spendingMetrics.paymentMethodStats}
            currentPage={paymentMethodPage}
            onPageChange={setPaymentMethodPage}
            itemsPerPage={4}
          />
        </motion.div>

        {/* Spending Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="card"
        >
          <div className="flex items-center space-x-2 mb-6">
            <Target className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">
              Spending Insights
            </h2>
          </div>

          <div className="space-y-4">
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-medium">Fees Impact</span>
              </div>
              <p className="text-gray-400 text-sm">
                You've paid{" "}
                <strong className="text-white">
                  {formatCurrency(spendingMetrics.totalFees)}
                </strong>{" "}
                in fees, which is{" "}
                <strong className="text-yellow-400">
                  {(
                    (spendingMetrics.totalFees /
                      Math.max(spendingMetrics.totalSpent, 1)) *
                    100
                  ).toFixed(1)}
                  %
                </strong>{" "}
                of your total spending.
              </p>
            </div>

            <div className="bg-dark-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="w-4 h-4 text-purple-400" />
                <span className="text-white font-medium">Generosity Score</span>
              </div>
              <p className="text-gray-400 text-sm">
                You've tipped{" "}
                <strong className="text-white">
                  {formatCurrency(
                    spendingMetrics.totalFees -
                      spendingMetrics.feesBreakdown.deliveryFees -
                      spendingMetrics.feesBreakdown.packingCharges -
                      spendingMetrics.feesBreakdown.convenienceFee -
                      spendingMetrics.feesBreakdown.gst -
                      spendingMetrics.feesBreakdown.serviceCharges
                  )}
                </strong>
                , averaging{" "}
                <strong className="text-purple-400">
                  {formatCurrency(
                    spendingMetrics.totalFees /
                      Math.max(spendingMetrics.totalOrders, 1)
                  )}
                </strong>{" "}
                per order.
              </p>
            </div>

            <div className="bg-dark-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">Spending Trend</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your spending has{" "}
                {spendingMetrics.spendingTrend > 0 ? "increased" : "decreased"}{" "}
                by{" "}
                <strong
                  className={
                    spendingMetrics.spendingTrend > 0
                      ? "text-red-400"
                      : "text-green-400"
                  }
                >
                  {Math.abs(spendingMetrics.spendingTrend).toFixed(1)}%
                </strong>{" "}
                in recent months.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SpendingDashboard;
