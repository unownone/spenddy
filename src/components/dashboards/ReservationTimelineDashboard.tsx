import React from "react";
import { OrderRecord } from "../../types/CommonData";
import HourDayHeatmap from "../charts/HourDayHeatmap";

interface Props {
  data: OrderRecord[];
}

const ReservationTimelineDashboard: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-6 p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Reservation Timeline</h1>
      <HourDayHeatmap
        timestamps={data.map((o) => o.orderTime)}
        title="Reservations Heatmap"
        description="When you usually dine out"
      />
    </div>
  );
};

export default ReservationTimelineDashboard; 