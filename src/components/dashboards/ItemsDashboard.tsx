import React, { useMemo, useState } from "react";
import { OrderRecord } from "../../types/CommonData";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";

interface Props {
  data: OrderRecord[];
}

interface ItemAgg {
  name: string;
  quantity: number;
}

const ItemsDashboard: React.FC<Props> = ({ data }) => {
  const topItems = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((order) => {
      const items: any[] = (order as any).items ?? (order as any).item_list ?? [];
      items.forEach((it) => {
        const name: string = it.name ?? "Unknown";
        const qty: number = it.quantity ?? 1;
        map.set(name, (map.get(name) || 0) + qty);
      });
    });
    return Array.from(map.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 20);
  }, [data]);

  if (!data.length) {
    return <p className="p-4 text-muted-foreground">No Instamart data.</p>;
  }

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Most Bought Items</h1>
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>Your most frequently purchased items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-muted">
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Item</th>
                  <th className="py-2 pr-4 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item, idx) => (
                  <tr key={item.name} className="border-b border-muted last:border-0">
                    <td className="py-1 pr-4 text-muted-foreground">{idx + 1}</td>
                    <td className="py-1 pr-4">{item.name}</td>
                    <td className="py-1 pr-4 text-right font-medium">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemsDashboard; 