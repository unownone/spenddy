import React, { useMemo } from "react";
import { OrderRecord } from "../../types/CommonData";
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
import { Store, Trophy, Star, TrendingUp } from "lucide-react";

interface RestaurantsDashboardProps {
  data: OrderRecord[];
}

interface RestaurantStats {
  name: string;
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
  cuisines: string[];
  lastOrderDate: Date;
}

interface CuisineStats {
  cuisine: string;
  orderCount: number;
  totalSpent: number;
  restaurants: Set<string>;
  restaurantCount: number;
}

const RestaurantsDashboard: React.FC<RestaurantsDashboardProps> = ({
  data,
}) => {
  const { range } = useTimeDial();

  // Filter data based on global time dial
  const filteredData = useMemo(() => {
    return filterOrdersByDateRange(data, range.start, range.end);
  }, [data, range]);

  // Calculate restaurant statistics
  const restaurantStats = useMemo(() => {
    const restaurantMap = new Map<string, RestaurantStats>();

    filteredData.forEach((order) => {
      const name = order.restaurantName;

      if (!restaurantMap.has(name)) {
        restaurantMap.set(name, {
          name,
          orderCount: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          cuisines: [...new Set(order.restaurantCuisine)],
          lastOrderDate: order.orderTime,
        });
      }

      const stats = restaurantMap.get(name)!;
      stats.orderCount++;
      stats.totalSpent += order.orderTotal;
      stats.lastOrderDate =
        order.orderTime > stats.lastOrderDate
          ? order.orderTime
          : stats.lastOrderDate;
    });

    // Calculate averages and sort
    const statsArray = Array.from(restaurantMap.values()).map((stats) => ({
      ...stats,
      averageOrderValue: stats.totalSpent / stats.orderCount,
    }));

    return {
      byOrderCount: [...statsArray].sort((a, b) => b.orderCount - a.orderCount),
      bySpending: [...statsArray].sort((a, b) => b.totalSpent - a.totalSpent),
      byAverageOrder: [...statsArray].sort(
        (a, b) => b.averageOrderValue - a.averageOrderValue
      ),
    };
  }, [filteredData]);

  // Calculate cuisine statistics
  const cuisineStats = useMemo(() => {
    const cuisineMap = new Map<string, CuisineStats>();

    filteredData.forEach((order) => {
      order.restaurantCuisine.forEach((cuisine) => {
        if (!cuisineMap.has(cuisine)) {
          cuisineMap.set(cuisine, {
            cuisine,
            orderCount: 0,
            totalSpent: 0,
            restaurants: new Set(),
            restaurantCount: 0,
          });
        }

        const stats = cuisineMap.get(cuisine)!;
        stats.orderCount++;
        stats.totalSpent += order.orderTotal;
        stats.restaurants.add(order.restaurantName);
        stats.restaurantCount = stats.restaurants.size;
      });
    });

    return Array.from(cuisineMap.values()).sort(
      (a, b) => b.orderCount - a.orderCount
    );
  }, [filteredData]);

  // Overall metrics
  const metrics = useMemo(() => {
    const totalRestaurants = new Set(
      filteredData.map((order) => order.restaurantName)
    ).size;
    const totalCuisines = new Set(
      filteredData.flatMap((order) => order.restaurantCuisine)
    ).size;
    const totalSpent = filteredData.reduce(
      (sum, order) => sum + order.orderTotal,
      0
    );
    const totalOrders = filteredData.length;

    return {
      totalRestaurants,
      totalCuisines,
      totalSpent,
      totalOrders,
      averageOrdersPerRestaurant: totalOrders / Math.max(totalRestaurants, 1),
    };
  }, [filteredData]);

  if (filteredData.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-3xl font-bold mb-2">Restaurant Analytics</h1>
            <p className="text-muted-foreground">
              No data available for the selected time range
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Restaurant Analytics
        </h1>
        <p className="text-muted-foreground">
          Explore your favorite restaurants and cuisine preferences
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Restaurants
            </CardTitle>
            <Store className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {metrics.totalRestaurants}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.averageOrdersPerRestaurant.toFixed(1)} orders per
              restaurant
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cuisines Tried
            </CardTitle>
            <Star className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {metrics.totalCuisines}
            </div>
            <p className="text-xs text-muted-foreground">
              Different cuisine types
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(metrics.totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all restaurants
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Top Restaurant
            </CardTitle>
            <Trophy className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {restaurantStats.byOrderCount[0]?.orderCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {restaurantStats.byOrderCount[0]?.name || "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Restaurants by Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Top Restaurants by Orders</CardTitle>
            <CardDescription>
              Your most frequently ordered restaurants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {restaurantStats.byOrderCount
                .slice(0, 10)
                .map((restaurant, index) => (
                  <div
                    key={restaurant.name}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {restaurant.name}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{restaurant.orderCount} orders</span>
                        <span>•</span>
                        <span>{formatCurrency(restaurant.totalSpent)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {restaurant.cuisines.slice(0, 3).map((cuisine) => (
                          <Badge
                            key={cuisine}
                            variant="outline"
                            className="text-xs"
                          >
                            {cuisine}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatCurrency(restaurant.averageOrderValue)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        avg order
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Cuisines */}
        <Card>
          <CardHeader>
            <CardTitle>Favorite Cuisines</CardTitle>
            <CardDescription>Your most ordered cuisine types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cuisineStats.slice(0, 10).map((cuisine, index) => {
                const percentage =
                  (cuisine.orderCount / metrics.totalOrders) * 100;
                return (
                  <div key={cuisine.cuisine} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {cuisine.cuisine}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {cuisine.restaurantCount} restaurants
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {cuisine.orderCount} orders
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(cuisine.totalSpent)}
                        </div>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground text-right">
                      {percentage.toFixed(1)}% of total orders
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Spenders */}
      <Card>
        <CardHeader>
          <CardTitle>Highest Spending Restaurants</CardTitle>
          <CardDescription>
            Restaurants where you've spent the most money
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {restaurantStats.bySpending.slice(0, 6).map((restaurant, index) => (
              <div
                key={restaurant.name}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <span className="font-medium text-sm">
                      {restaurant.name}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Spent:</span>
                    <span className="font-medium">
                      {formatCurrency(restaurant.totalSpent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Orders:</span>
                    <span>{restaurant.orderCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Order:</span>
                    <span>{formatCurrency(restaurant.averageOrderValue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Order:</span>
                    <span>{restaurant.lastOrderDate.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {restaurant.cuisines.slice(0, 2).map((cuisine) => (
                    <Badge key={cuisine} variant="outline" className="text-xs">
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantsDashboard;
