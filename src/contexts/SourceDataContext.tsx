import React, { createContext, useContext, useState, useEffect } from "react";
import { sources } from "../sources";
import { OrderRecord, AnalyticsDataset } from "../types/CommonData";
import { SourceDefinition } from "../sources/BaseSource";
import { toCommonOrderRecord } from "../utils/dataProcessor";

interface PerSourceData {
  records: OrderRecord[];
  analytics: AnalyticsDataset;
}

interface SourceDataContextType {
  dataMap: Record<string, PerSourceData | undefined>;
  /** Load raw JSON for a source and cache */
  importData: (sourceId: string, raw: any) => void;
  sources: Record<string, SourceDefinition>;
}

const SourceDataContext = createContext<SourceDataContextType | undefined>(
  undefined
);

export const SourceDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dataMap, setDataMap] = useState<Record<string, PerSourceData>>({});

  const importData = (sourceId: string, raw: any) => {
    const def = sources[sourceId];
    if (!def) return;
    const records = def.transformer(raw);
    const analytics = def.analyticsGenerator
      ? def.analyticsGenerator(records)
      : ({} as AnalyticsDataset);
    setDataMap((prev) => ({ ...prev, [sourceId]: { records, analytics } }));

    // persist to localStorage for reloads
    localStorage.setItem(`${sourceId}_raw_data`, JSON.stringify(raw));
    localStorage.setItem(`${sourceId}_records`, JSON.stringify(records));
    localStorage.setItem(`${sourceId}_analytics`, JSON.stringify(analytics));
  };

  // Load cached data on mount
  useEffect(() => {
    Object.values(sources).forEach((def) => {
      const rawKey = `${def.id}_raw_data`;
      const recordsKey = `${def.id}_records`;
      const analyticsKey = `${def.id}_analytics`;

      try {
        const rawJson = localStorage.getItem(rawKey);
        const recordsJson = localStorage.getItem(recordsKey);
        const analyticsJson = localStorage.getItem(analyticsKey);

        if (recordsJson && analyticsJson) {
          const records: OrderRecord[] = JSON.parse(recordsJson, (k, v) => {
            if (k === "orderTime") return new Date(v);
            return v;
          });
          const analytics: AnalyticsDataset = JSON.parse(analyticsJson, (k, v) => {
            if ((k === "start" || k === "end" || k === "orderTime") && typeof v === "string") {
              return new Date(v);
            }
            return v;
          });
          setDataMap((prev) => ({ ...prev, [def.id]: { records, analytics } }));
        } else if (rawJson) {
          // derive records/analytics from raw data
          const raw = JSON.parse(rawJson);
          const records = def.transformer(raw);
          const analytics = def.analyticsGenerator
            ? def.analyticsGenerator(records)
            : ({} as AnalyticsDataset);
          setDataMap((prev) => ({ ...prev, [def.id]: { records, analytics } }));
          // persist derived for faster future loads
          localStorage.setItem(recordsKey, JSON.stringify(records));
          localStorage.setItem(analyticsKey, JSON.stringify(analytics));
        }
      } catch (e) {
        console.error("Failed to load cached data for", def.id, e);
      }
    });
  }, []);

  return (
    <SourceDataContext.Provider value={{ dataMap, importData, sources }}>
      {children}
    </SourceDataContext.Provider>
  );
};

export const useSourceData = () => {
  const ctx = useContext(SourceDataContext);
  if (!ctx) throw new Error("useSourceData must be used within provider");
  return ctx;
}; 