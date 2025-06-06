import React, { useMemo } from "react";
import { AnalyticsData, ProcessedOrder } from "../../types/SwiggyData";
import { useTimeDial } from "../../App";
import {
  filterOrdersByDateRange,
  formatCurrency,
} from "../../utils/dataProcessor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { MapPin, Navigation, Clock, TrendingUp } from "lucide-react";

interface LocationsDashboardProps {
  data: AnalyticsData | null;
}

interface LocationStats {
  area: string;
  city: string;
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
  restaurants: Set<string>;
  restaurantCount: number;
  averageDistance?: number;
  lastOrderDate: Date;
}

const LocationsDashboard: React.FC<LocationsDashboardProps> = ({ data }) => {
  const { range } = useTimeDial();

  // Filter data based on global time dial
  const filteredData = useMemo(() => {
    if (!data) return [];
    return filterOrdersByDateRange(data.orders, range.start, range.end);
  }, [data, range]);

  // Calculate location statistics
  const locationStats = useMemo(() => {
    const locationMap = new Map<string, LocationStats>();

    filteredData.forEach((order) => {
      const key = `${order.deliveryArea}, ${order.deliveryCity}`;

      if (!locationMap.has(key)) {
        locationMap.set(key, {
          area: order.deliveryArea,
          city: order.deliveryCity,
          orderCount: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          restaurants: new Set(),
          restaurantCount: 0,
          averageDistance: undefined,
          lastOrderDate: order.orderTime,
        });
      }

      const stats = locationMap.get(key)!;
      stats.orderCount++;
      stats.totalSpent += order.orderTotal;
      stats.restaurants.add(order.restaurantName);
      stats.restaurantCount = stats.restaurants.size;
      stats.lastOrderDate =
        order.orderTime > stats.lastOrderDate
          ? order.orderTime
          : stats.lastOrderDate;

      if (order.distance && stats.averageDistance !== undefined) {
        stats.averageDistance = (stats.averageDistance + order.distance) / 2;
      } else if (order.distance) {
        stats.averageDistance = order.distance;
      }
    });

    // Calculate averages and sort
    const statsArray = Array.from(locationMap.values()).map((stats) => ({
      ...stats,
      averageOrderValue: stats.totalSpent / stats.orderCount,
      restaurantCount: stats.restaurants.size,
      restaurants: stats.restaurants, // Keep the Set for the interface
    }));

    return {
      byOrderCount: [...statsArray].sort((a, b) => b.orderCount - a.orderCount),
      bySpending: [...statsArray].sort((a, b) => b.totalSpent - a.totalSpent),
      byDistance: [...statsArray]
        .filter((stats) => stats.averageDistance !== undefined)
        .sort((a, b) => (a.averageDistance || 0) - (b.averageDistance || 0)),
    };
  }, [filteredData]);

  // Calculate delivery time analysis
  const deliveryTimeStats = useMemo(() => {
    const ordersWithDeliveryTime = filteredData.filter(
      (order) => order.deliveryTime && order.deliveryTime > 0
    );

    if (ordersWithDeliveryTime.length === 0) {
      return {
        averageDeliveryTime: 0,
        fastestDelivery: null,
        slowestDelivery: null,
        deliveryTimeByArea: {},
      };
    }

    const totalDeliveryTime = ordersWithDeliveryTime.reduce(
      (sum, order) => sum + (order.deliveryTime || 0),
      0
    );
    const averageDeliveryTime =
      totalDeliveryTime / ordersWithDeliveryTime.length;

    const fastest = ordersWithDeliveryTime.reduce((min, order) =>
      (order.deliveryTime || 0) < (min.deliveryTime || 0) ? order : min
    );

    const slowest = ordersWithDeliveryTime.reduce((max, order) =>
      (order.deliveryTime || 0) > (max.deliveryTime || 0) ? order : max
    );

    // Average delivery time by area
    const areaTimeMap = new Map<string, { totalTime: number; count: number }>();
    ordersWithDeliveryTime.forEach((order) => {
      const area = order.deliveryArea;
      if (!areaTimeMap.has(area)) {
        areaTimeMap.set(area, { totalTime: 0, count: 0 });
      }
      const stats = areaTimeMap.get(area)!;
      stats.totalTime += order.deliveryTime || 0;
      stats.count++;
    });

    const deliveryTimeByArea = Object.fromEntries(
      Array.from(areaTimeMap.entries()).map(([area, stats]) => [
        area,
        stats.totalTime / stats.count,
      ])
    );

    return {
      averageDeliveryTime: averageDeliveryTime / 60, // Convert to minutes
      fastestDelivery: {
        ...fastest,
        deliveryTime: (fastest.deliveryTime || 0) / 60,
      },
      slowestDelivery: {
        ...slowest,
        deliveryTime: (slowest.deliveryTime || 0) / 60,
      },
      deliveryTimeByArea: Object.fromEntries(
        Object.entries(deliveryTimeByArea).map(([area, time]) => [
          area,
          time / 60,
        ])
      ),
    };
  }, [filteredData]);

  // Overall metrics
  const metrics = useMemo(() => {
    const totalAreas = new Set(filteredData.map((order) => order.deliveryArea))
      .size;
    const totalCities = new Set(filteredData.map((order) => order.deliveryCity))
      .size;
    const totalSpent = filteredData.reduce(
      (sum, order) => sum + order.orderTotal,
      0
    );
    const totalOrders = filteredData.length;

    const ordersWithDistance = filteredData.filter(
      (order) => order.distance && order.distance > 0
    );
    const averageDistance =
      ordersWithDistance.length > 0
        ? ordersWithDistance.reduce(
            (sum, order) => sum + (order.distance || 0),
            0
          ) / ordersWithDistance.length
        : 0;

    return {
      totalAreas,
      totalCities,
      totalSpent,
      totalOrders,
      averageDistance,
      averageOrdersPerArea: totalOrders / Math.max(totalAreas, 1),
    };
  }, [filteredData]);

  if (!data || filteredData.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-3xl font-bold mb-2">Location Analysis</h1>
            <p className="text-muted-foreground">
              {!data
                ? "No data available"
                : "No data available for the selected time range"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Location Analysis</h1>
        <p className="text-muted-foreground">
          Explore delivery locations and geographical insights
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Delivery Areas
            </CardTitle>
            <MapPin className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {metrics.totalAreas}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.averageOrdersPerArea.toFixed(1)} orders per area
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cities</CardTitle>
            <Navigation className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {metrics.totalCities}
            </div>
            <p className="text-xs text-muted-foreground">Different cities</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Distance</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {metrics.averageDistance > 0
                ? `${metrics.averageDistance.toFixed(1)}km`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Per delivery</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Delivery Time
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {deliveryTimeStats.averageDeliveryTime > 0
                ? `${Math.round(deliveryTimeStats.averageDeliveryTime)}m`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Average time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Delivery Areas */}
        <Card>
          <CardHeader>
            <CardTitle>Top Delivery Areas</CardTitle>
            <CardDescription>
              Your most frequently used delivery locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locationStats.byOrderCount
                .slice(0, 10)
                .map((location, index) => (
                  <div
                    key={`${location.area}-${location.city}`}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {location.area}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{location.city}</span>
                        <span>•</span>
                        <span>{location.orderCount} orders</span>
                        <span>•</span>
                        <span>{location.restaurantCount} restaurants</span>
                      </div>
                      {location.averageDistance && (
                        <div className="text-xs text-muted-foreground">
                          Avg distance: {location.averageDistance.toFixed(1)}km
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatCurrency(location.totalSpent)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        total spent
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Time Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Time by Area</CardTitle>
            <CardDescription>
              Average delivery times for your top areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(deliveryTimeStats.deliveryTimeByArea)
                .sort(([, a], [, b]) => a - b)
                .slice(0, 10)
                .map(([area, avgTime]) => {
                  const maxTime = Math.max(
                    ...Object.values(deliveryTimeStats.deliveryTimeByArea)
                  );
                  const percentage = (avgTime / maxTime) * 100;

                  return (
                    <div key={area} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{area}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {Math.round(avgTime)} min
                          </div>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spending by Location */}
      <Card>
        <CardHeader>
          <CardTitle>Highest Spending Locations</CardTitle>
          <CardDescription>
            Locations where you've spent the most money
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {locationStats.bySpending.slice(0, 6).map((location, index) => (
              <div
                key={`${location.area}-${location.city}`}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <span className="font-medium text-sm">{location.area}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">City:</span>
                    <span>{location.city}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Spent:</span>
                    <span className="font-medium">
                      {formatCurrency(location.totalSpent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Orders:</span>
                    <span>{location.orderCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Restaurants:</span>
                    <span>{location.restaurantCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Order:</span>
                    <span>{formatCurrency(location.averageOrderValue)}</span>
                  </div>
                  {location.averageDistance && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Avg Distance:
                      </span>
                      <span>{location.averageDistance.toFixed(1)}km</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Order:</span>
                    <span>{location.lastOrderDate.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Time Records */}
      {(deliveryTimeStats.fastestDelivery ||
        deliveryTimeStats.slowestDelivery) && (
        <div className="grid gap-6 md:grid-cols-2">
          {deliveryTimeStats.fastestDelivery && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">
                  Fastest Delivery
                </CardTitle>
                <CardDescription>
                  Your quickest food delivery record
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(deliveryTimeStats.fastestDelivery.deliveryTime)}{" "}
                  minutes
                </div>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Restaurant:</strong>{" "}
                    {deliveryTimeStats.fastestDelivery.restaurantName}
                  </div>
                  <div>
                    <strong>Location:</strong>{" "}
                    {deliveryTimeStats.fastestDelivery.deliveryArea}
                  </div>
                  <div>
                    <strong>Date:</strong>{" "}
                    {deliveryTimeStats.fastestDelivery.orderTime.toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Order Value:</strong>{" "}
                    {formatCurrency(
                      deliveryTimeStats.fastestDelivery.orderTotal
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {deliveryTimeStats.slowestDelivery && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Slowest Delivery</CardTitle>
                <CardDescription>Your longest wait time record</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold text-red-600">
                  {Math.round(deliveryTimeStats.slowestDelivery.deliveryTime)}{" "}
                  minutes
                </div>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Restaurant:</strong>{" "}
                    {deliveryTimeStats.slowestDelivery.restaurantName}
                  </div>
                  <div>
                    <strong>Location:</strong>{" "}
                    {deliveryTimeStats.slowestDelivery.deliveryArea}
                  </div>
                  <div>
                    <strong>Date:</strong>{" "}
                    {deliveryTimeStats.slowestDelivery.orderTime.toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Order Value:</strong>{" "}
                    {formatCurrency(
                      deliveryTimeStats.slowestDelivery.orderTotal
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationsDashboard;
