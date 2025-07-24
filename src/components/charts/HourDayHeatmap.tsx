import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";

interface HeatmapProps {
  /** Array containing Date objects (orderTime) */
  timestamps: Date[];
  title?: string;
  description?: string;
}

/**
 * Renders a day-of-week × hour-of-day heatmap. Counts occurrences of timestamps.
 */
const HourDayHeatmap: React.FC<HeatmapProps> = ({ timestamps, title = "Order Activity Heatmap", description = "Your ordering patterns by day and hour" }) => {
  const heatmapData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayHourCounts: Record<string, Record<string, number>> = {};
    days.forEach((d) => {
      dayHourCounts[d] = {};
      for (let h = 0; h < 24; h++) dayHourCounts[d][h] = 0;
    });

    timestamps.forEach((ts) => {
      const day = days[ts.getDay()];
      const hour = ts.getHours();
      dayHourCounts[day][hour] += 1;
    });

    return dayHourCounts;
  }, [timestamps]);

  const getColorIntensity = (count: number) => {
    if (count === 0) return "bg-gray-800";
    if (count <= 2) return "bg-green-900";
    if (count <= 5) return "bg-green-700";
    if (count <= 10) return "bg-green-500";
    return "bg-green-300";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* hour header */}
          <div className="grid gap-0.5 text-xs" style={{ gridTemplateColumns: "auto repeat(24, minmax(0, 1fr))" }}>
            <div></div>
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="text-center text-gray-400 text-xs">
                {i}
              </div>
            ))}
          </div>
          {/* rows */}
          {Object.entries(heatmapData).map(([day, hourData]) => (
            <div key={day} className="grid gap-0.5 items-center" style={{ gridTemplateColumns: "auto repeat(24, minmax(0, 1fr))" }}>
              <div className="text-xs text-gray-400 w-8">{day}</div>
              {Object.entries(hourData).map(([hour, count]) => (
                <div
                  key={hour}
                  className={`w-3 h-3 rounded-sm ${getColorIntensity(Number(count))}`}
                  title={`${day} ${hour}:00 – ${count} orders`}
                />
              ))}
            </div>
          ))}
          <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
            <span>Less</span>
            <div className="flex space-x-0.5">
              <div className="w-3 h-3 rounded-sm bg-gray-800" />
              <div className="w-3 h-3 rounded-sm bg-green-900" />
              <div className="w-3 h-3 rounded-sm bg-green-700" />
              <div className="w-3 h-3 rounded-sm bg-green-500" />
              <div className="w-3 h-3 rounded-sm bg-green-300" />
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HourDayHeatmap; 