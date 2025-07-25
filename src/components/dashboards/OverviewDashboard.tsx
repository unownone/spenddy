import React, { useMemo } from "react";
import { TrendingUp, BarChart3, Store, Award, Upload } from "lucide-react";
import { AnalyticsDataset, OrderRecord } from "../../types/CommonData";
import { filterOrdersByDateRange } from "../../utils/dataProcessor";
import { useTimeDial } from "../../App";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { Line } from "react-chartjs-2";
import HourDayHeatmap from "../charts/HourDayHeatmap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface OverviewDashboardProps {
  data: AnalyticsDataset | null;
}

const OverviewChart: React.FC<{
  data: OrderRecord[];
}> = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Group by month
    const monthlyData = data.reduce((acc, order) => {
      const monthKey = order.orderTime.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });

      if (!acc[monthKey]) {
        acc[monthKey] = {
          totalSpent: 0,
          orderCount: 0,
        };
      }

      acc[monthKey].totalSpent += order.orderTotal;
      acc[monthKey].orderCount += 1;

      return acc;
    }, {} as Record<string, { totalSpent: number; orderCount: number }>);

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    return {
      labels: sortedMonths,
      datasets: [
        {
          label: "Monthly Spending (₹)",
          data: sortedMonths.map((month) => monthlyData[month].totalSpent),
          borderColor: "rgb(249, 115, 22)",
          backgroundColor: "rgba(249, 115, 22, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [data]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return "₹" + Number(value).toLocaleString("en-IN");
          },
        },
      },
    },
  };

  if (!chartData) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No data available for chart
      </div>
    );
  }

  return <Line data={chartData} options={options} />;
};

// OrderActivityHeatmap has been moved to reusable HourDayHeatmap

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ data }) => {
  const { range } = useTimeDial();

  // Debug: Log the data being received
  console.log("OverviewDashboard received data:", {
    totalOrders: data?.totalOrders,
    totalSpent: data?.totalSpent,
    averageOrderValue: data?.averageOrderValue,
    uniqueRestaurants: data?.uniqueRestaurants,
    ordersLength: data?.orders?.length,
  });

  // Filter data based on global time dial
  const filteredData = useMemo(() => {
    if (!data) return [];
    return filterOrdersByDateRange(data.orders, range.start, range.end)
      .slice()
      .sort((a, b) => b.orderTime.getTime() - a.orderTime.getTime());
  }, [data, range]);

  // Calculate discount metrics from filtered data
  const discountMetrics = useMemo(() => {
    if (!filteredData.length)
      return { totalDiscounts: 0, discountPercentage: 0 };

    const totalDiscounts = filteredData.reduce((sum, order) => {
      return sum + order.orderDiscount + order.couponDiscount;
    }, 0);

    const totalSpentForFiltered = filteredData.reduce((sum, order) => {
      return sum + order.orderTotal;
    }, 0);

    const discountPercentage =
      totalSpentForFiltered > 0
        ? (totalDiscounts / totalSpentForFiltered) * 100
        : 0;

    return { totalDiscounts, discountPercentage };
  }, [filteredData]);

  if (!data) {
    return (
      <Card className="flex flex-col items-center justify-center h-96">
        <CardContent className="text-center space-y-4 pt-6">
          <Upload className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No Data Available</h3>
            <p className="text-muted-foreground">
              Upload your Swiggy data to see analytics
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Food Delivery Analytics
        </h1>
        <p className="text-muted-foreground">
          Your comprehensive Swiggy ordering insights
        </p>
      </div>

      {/* Order Activity Heatmap */}
      <HourDayHeatmap
        timestamps={filteredData.map((o) => o.orderTime)}
        title="Order Activity Heatmap"
        description="Your ordering patterns by day and hour"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              ₹
              {isNaN(data.totalSpent)
                ? "0"
                : data.totalSpent.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground">Across all orders</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {data.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Order Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              ₹
              {isNaN(data.averageOrderValue)
                ? "0"
                : Math.round(data.averageOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">Per order average</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Discounts
            </CardTitle>
            <Award className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              ₹{discountMetrics.totalDiscounts.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground">
              ({discountMetrics.discountPercentage.toFixed(1)}% of spending)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restaurants</CardTitle>
            <Store className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {data.uniqueRestaurants}
            </div>
            <p className="text-xs text-muted-foreground">Unique venues</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Spending Overview</CardTitle>
            <CardDescription>
              Your food ordering trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OverviewChart data={filteredData} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Average</span>
                <span className="font-medium">
                  ₹{Math.round(data.totalSpent / 12).toLocaleString()}
                </span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Orders per Month</span>
                <span className="font-medium">
                  {Math.round(data.totalOrders / 12)}
                </span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Spending Breakdown</CardTitle>
          <CardDescription>
            Complete breakdown of your total spending
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="font-medium">Total Spent</span>
                <span className="text-lg font-bold text-orange-500">
                  ₹{data.totalSpent.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">Food Items</span>
                  </div>
                  <span className="text-sm font-medium">
                    ₹{(data.totalSpent * 0.85).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm">Delivery Fees</span>
                  </div>
                  <span className="text-sm font-medium">
                    ₹{(data.totalSpent * 0.1).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-sm">Tips & Others</span>
                  </div>
                  <span className="text-sm font-medium">
                    ₹{(data.totalSpent * 0.05).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <span className="font-medium text-green-500">
                  Total Discounts
                </span>
                <span className="text-lg font-bold text-green-500">
                  ₹{discountMetrics.totalDiscounts.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                You saved{" "}
                <span className="font-bold text-green-500">
                  {discountMetrics.discountPercentage.toFixed(1)}%
                </span>{" "}
                on your total spending!
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewDashboard;
