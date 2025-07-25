import React, { useMemo } from "react";
import { OrderRecord } from "../../types/CommonData";
import { Bar } from "react-chartjs-2";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  data: OrderRecord[];
}

const GroupSizeDashboard: React.FC<Props> = ({ data }) => {
  const dineoutData = data.filter((order) => order.source === "swiggy-dineout");

  const histogram = useMemo(() => {
    const buckets: Record<string, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      "6+": 0,
    };
    dineoutData.forEach((order) => {
      const pax = order.pax ?? 1;
      if (pax >= 6) buckets["6+"] += 1;
      else buckets[pax.toString()] += 1;
    });
    return buckets;
  }, [dineoutData]);

  const labels = Object.keys(histogram);
  const chartData = {
    labels,
    datasets: [
      {
        label: "Reservations",
        data: labels.map((l) => histogram[l]),
        backgroundColor: "rgba(249, 115, 22, 0.6)",
      },
    ],
  };

  const options = { responsive: true, plugins: { legend: { display: false } } };

  if (!dineoutData.length) {
    return (
      <div className="space-y-6 p-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Group Size Analysis</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              No dine-in reservation data available. Group size analysis is only
              applicable to dine-in orders from sources like Dineout.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Group Size Analysis</h1>
      <Card>
        <CardHeader>
          <CardTitle>Party Size Histogram</CardTitle>
          <CardDescription>
            Distribution of number of diners (pax) for dine-in reservations -{" "}
            {dineoutData.length} total reservations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Bar data={chartData} options={options} />
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupSizeDashboard; 