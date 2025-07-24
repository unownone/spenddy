import React, { useMemo, useState } from "react";
import { OrderRecord } from "../../types/CommonData";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { useTimeDial } from "../../App";
import { filterOrdersByDateRange } from "../../utils/dataProcessor";

interface Props {
  data: OrderRecord[];
}

interface ItemAgg {
  name: string;
  quantity: number;
  lastOrderDate: Date;
}

const ItemsDashboard: React.FC<Props> = ({ data }) => {
  const { range } = useTimeDial();

  // Filter data based on global time dial
  const filteredData = useMemo(() => {
    return filterOrdersByDateRange(data, range.start, range.end);
  }, [data, range]);

  const topItems = useMemo(() => {
    const map = new Map<string, { quantity: number; lastOrderDate: Date }>();

    filteredData.forEach((order) => {
      const items: any[] =
        (order as any).items ?? (order as any).item_list ?? [];
      items.forEach((it) => {
        const name: string = it.name ?? "Unknown";
        const qty: number = it.quantity ?? 1;
        const existing = map.get(name);

        if (existing) {
          map.set(name, {
            quantity: existing.quantity + qty,
            lastOrderDate:
              order.orderTime > existing.lastOrderDate
                ? order.orderTime
                : existing.lastOrderDate,
          });
        } else {
          map.set(name, {
            quantity: qty,
            lastOrderDate: order.orderTime,
          });
        }
      });
    });

    return Array.from(map.entries())
      .map(([name, { quantity, lastOrderDate }]) => ({
        name,
        quantity,
        lastOrderDate,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10); // Changed from 20 to 10
  }, [filteredData]); // Changed dependency from data to filteredData

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <Badge className="bg-yellow-500 text-yellow-900 hover:bg-yellow-500">
            🥇 #1
          </Badge>
        );
      case 1:
        return (
          <Badge className="bg-gray-400 text-gray-900 hover:bg-gray-400">
            🥈 #2
          </Badge>
        );
      case 2:
        return (
          <Badge className="bg-amber-600 text-amber-100 hover:bg-amber-600">
            🥉 #3
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            #{index + 1}
          </Badge>
        );
    }
  };

  const getCardStyle = (index: number) => {
    switch (index) {
      case 0:
        return "border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900";
      case 1:
        return "border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900";
      case 2:
        return "border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900";
      default:
        return "border-border";
    }
  };

  if (!data.length) {
    return <p className="p-4 text-muted-foreground">No Instamart data.</p>;
  }

  if (!filteredData.length) {
    return (
      <div className="space-y-6 p-4 max-w-6xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Most Bought Items</h1>
          <p className="text-muted-foreground">
            Your most frequently purchased items ranked by quantity
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">
              No items found in the selected time period.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Most Bought Items</h1>
        <p className="text-muted-foreground">
          Your top 10 most frequently purchased items ranked by quantity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topItems.map((item, index) => (
          <Card
            key={item.name}
            className={`relative transition-all hover:scale-105 ${getCardStyle(
              index
            )}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle
                    className="text-base leading-tight mb-2 overflow-hidden"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical" as any,
                      lineHeight: "1.2em",
                      maxHeight: "2.4em",
                    }}
                  >
                    {item.name}
                  </CardTitle>
                </div>
                <div className="ml-2 flex-shrink-0">{getRankBadge(index)}</div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Quantity
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    {item.quantity}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">
                    Last Ordered
                  </span>
                  <div className="text-sm font-medium">
                    {format(item.lastOrderDate, "MMM dd, yyyy")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(item.lastOrderDate, "h:mm a")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {topItems.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">
              No items found in your orders for the selected time period.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ItemsDashboard; 