import React from "react";
import { Routes, Route, useOutletContext } from "react-router-dom";
import ImportTab from "./ImportTab";
import {
  OverviewDashboard,
  SpendingDashboard,
  RestaurantsDashboard,
  LocationsDashboard,
  ItemsDashboard,
  GroupSizeDashboard,
} from "../../features/analytics";
import { AnalyticsDataset, OrderRecord } from "../../types/CommonData";
import { SourceDefinition } from "../../sources/BaseSource";

interface OutletCtx {
  sourceDef: SourceDefinition;
  dataset?: { records: OrderRecord[]; analytics: AnalyticsDataset };
}

const SourceRoutes: React.FC = () => {
  const { sourceDef, dataset } = useOutletContext<OutletCtx>();

  return (
    <Routes>
      <Route index element={<ImportTab source={sourceDef} />} />
      {dataset && (
        <>
          <Route
            path="overview"
            element={<OverviewDashboard data={dataset.analytics} />}
          />
          <Route
            path="spending"
            element={
              <SpendingDashboard
                data={dataset.records}
                analytics={dataset.analytics}
              />
            }
          />
          {/* Instamart specific routes */}
          {sourceDef.id === "swiggy-instamart" && (
            <Route
              path="items"
              element={<ItemsDashboard data={dataset.records} />}
            />
          )}

          {/* Dineout specific routes */}
          {sourceDef.id === "swiggy-dineout" && (
            <>
              <Route
                path="restaurants"
                element={<RestaurantsDashboard data={dataset.records} />}
              />
              <Route
                path="group-size"
                element={<GroupSizeDashboard data={dataset.records} />}
              />
            </>
          )}

          {/* General routes shown for Swiggy food delivery */}
          {sourceDef.id === "swiggy" && (
            <>
              <Route
                path="restaurants"
                element={<RestaurantsDashboard data={dataset.records} />}
              />
              <Route
                path="locations"
                element={<LocationsDashboard data={dataset.analytics} />}
              />
            </>
          )}
        </>
      )}
    </Routes>
  );
};

export default SourceRoutes; 