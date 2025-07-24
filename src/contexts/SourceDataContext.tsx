import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { sources } from "../sources";
import { OrderRecord, AnalyticsDataset } from "../types/CommonData";
import { SourceDefinition } from "../sources/BaseSource";
import { toCommonOrderRecord } from "../utils/dataProcessor";
import { loadDataFromIndexedDB, hasIndexedDBData } from "../utils/indexedDB";

interface PerSourceData {
  records: OrderRecord[];
  analytics: AnalyticsDataset;
}

interface SourceDataContextType {
  dataMap: Record<string, PerSourceData | undefined>;
  /** Load raw JSON for a source and cache */
  importData: (sourceId: string, raw: any) => void;
  /** Refresh data from IndexedDB for a specific source */
  refreshFromIndexedDB: (sourceId: string) => Promise<boolean>;
  /** Load data for a specific source (lazy loading) */
  loadSourceData: (sourceId: string) => Promise<boolean>;
  /** Check if data is loaded for a source */
  isDataLoaded: (sourceId: string) => boolean;
  /** Unload data for a specific source to free memory */
  unloadSourceData: (sourceId: string) => void;
  sources: Record<string, SourceDefinition>;
}

const SourceDataContext = createContext<SourceDataContextType | undefined>(
  undefined
);

export const SourceDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dataMap, setDataMap] = useState<Record<string, PerSourceData>>({});
  const [loadedSources, setLoadedSources] = useState<Set<string>>(new Set());
  const lastAccessTime = useRef<Record<string, number>>({});

  const importData = (sourceId: string, raw: any) => {
    const def = sources[sourceId];
    if (!def) return;
    const records = def.transformer(raw);
    const analytics = def.analyticsGenerator
      ? def.analyticsGenerator(records)
      : ({} as AnalyticsDataset);
    setDataMap((prev) => ({ ...prev, [sourceId]: { records, analytics } }));
    setLoadedSources((prev) => new Set(prev).add(sourceId));
    lastAccessTime.current[sourceId] = Date.now();

    // persist to localStorage for reloads
    const rawKey = def.rawStorageKey ?? `${sourceId}_raw_data`;
    localStorage.setItem(rawKey, JSON.stringify(raw));
    localStorage.setItem(`${sourceId}_records`, JSON.stringify(records));
    localStorage.setItem(`${sourceId}_analytics`, JSON.stringify(analytics));
  };

  const refreshFromIndexedDB = async (sourceId: string): Promise<boolean> => {
    const def = sources[sourceId];
    if (!def) return false;

    try {
      const indexedDBData = await loadDataFromIndexedDB(sourceId);
      if (indexedDBData) {
        console.log(`Transforming ${sourceId} data:`, indexedDBData.raw);
        const records = def.transformer(indexedDBData.raw);
        console.log(`Transformed ${sourceId} records:`, records.slice(0, 2));
        const analytics = def.analyticsGenerator
          ? def.analyticsGenerator(records)
          : ({} as AnalyticsDataset);
        setDataMap((prev) => ({ ...prev, [sourceId]: { records, analytics } }));
        setLoadedSources((prev) => new Set(prev).add(sourceId));
        lastAccessTime.current[sourceId] = Date.now();

        // Cache the processed data
        const recordsKey = `${sourceId}_records`;
        const analyticsKey = `${sourceId}_analytics`;
        localStorage.setItem(recordsKey, JSON.stringify(records));
        localStorage.setItem(analyticsKey, JSON.stringify(analytics));

        return true;
      }
      return false;
    } catch (error) {
      console.error(
        "Failed to refresh data from IndexedDB for",
        sourceId,
        error
      );
      return false;
    }
  };

  const loadSourceData = async (sourceId: string): Promise<boolean> => {
    // If already loaded, just update access time and return true
    if (loadedSources.has(sourceId)) {
      lastAccessTime.current[sourceId] = Date.now();
      return true;
    }

    console.log(`Loading data for source: ${sourceId}`);
    const def = sources[sourceId];
    if (!def) return false;

    const rawKey = def.rawStorageKey ?? `${sourceId}_raw_data`;
    const recordsKey = `${sourceId}_records`;
    const analyticsKey = `${sourceId}_analytics`;

    try {
      // First check IndexedDB for extension data
      const hasExtensionData = await hasIndexedDBData(sourceId);
      if (hasExtensionData) {
        const indexedDBData = await loadDataFromIndexedDB(sourceId);
        if (indexedDBData) {
          const records = def.transformer(indexedDBData.raw);
          const analytics = def.analyticsGenerator
            ? def.analyticsGenerator(records)
            : ({} as AnalyticsDataset);
          setDataMap((prev) => ({
            ...prev,
            [sourceId]: { records, analytics },
          }));
          setLoadedSources((prev) => new Set(prev).add(sourceId));
          lastAccessTime.current[sourceId] = Date.now();

          // Cache the processed data for faster future loads
          localStorage.setItem(recordsKey, JSON.stringify(records));
          localStorage.setItem(analyticsKey, JSON.stringify(analytics));
          console.log(
            `Loaded ${records.length} records for ${sourceId} from IndexedDB`
          );
          return true;
        }
      }

      // Fallback to localStorage if no IndexedDB data
      const rawJson = localStorage.getItem(rawKey);
      const recordsJson = localStorage.getItem(recordsKey);
      const analyticsJson = localStorage.getItem(analyticsKey);

      if (recordsJson && analyticsJson) {
        const records: OrderRecord[] = JSON.parse(recordsJson, (k, v) => {
          if (k === "orderTime") return new Date(v);
          return v;
        });
        const analytics: AnalyticsDataset = JSON.parse(
          analyticsJson,
          (k, v) => {
            if (
              (k === "start" || k === "end" || k === "orderTime") &&
              typeof v === "string"
            ) {
              return new Date(v);
            }
            return v;
          }
        );
        setDataMap((prev) => ({ ...prev, [sourceId]: { records, analytics } }));
        setLoadedSources((prev) => new Set(prev).add(sourceId));
        lastAccessTime.current[sourceId] = Date.now();
        console.log(
          `Loaded ${records.length} records for ${sourceId} from localStorage`
        );
        return true;
      } else if (rawJson) {
        // derive records/analytics from raw data
        const raw = JSON.parse(rawJson);
        const records = def.transformer(raw);
        const analytics = def.analyticsGenerator
          ? def.analyticsGenerator(records)
          : ({} as AnalyticsDataset);
        setDataMap((prev) => ({ ...prev, [sourceId]: { records, analytics } }));
        setLoadedSources((prev) => new Set(prev).add(sourceId));
        lastAccessTime.current[sourceId] = Date.now();
        // persist derived for faster future loads
        localStorage.setItem(recordsKey, JSON.stringify(records));
        localStorage.setItem(analyticsKey, JSON.stringify(analytics));
        console.log(
          `Loaded ${records.length} records for ${sourceId} from raw data`
        );
        return true;
      }
      console.log(`No data found for ${sourceId}`);
      return false;
    } catch (e) {
      console.error("Failed to load cached data for", sourceId, e);
      return false;
    }
  };

  const isDataLoaded = (sourceId: string): boolean => {
    return loadedSources.has(sourceId);
  };

  const unloadSourceData = (sourceId: string) => {
    console.log(`Unloading data for source: ${sourceId}`);
    setDataMap((prev) => {
      const newMap = { ...prev };
      delete newMap[sourceId];
      return newMap;
    });
    setLoadedSources((prev) => {
      const newSet = new Set(prev);
      newSet.delete(sourceId);
      return newSet;
    });
    delete lastAccessTime.current[sourceId];
  };

  // Set up periodic refresh for extension data (every 30 seconds) - only for loaded sources
  useEffect(() => {
    const interval = setInterval(async () => {
      for (const sourceId of loadedSources) {
        const def = sources[sourceId];
        if (def && def.importMethods.includes("extension")) {
          try {
            const hasExtensionData = await hasIndexedDBData(sourceId);
            if (hasExtensionData) {
              const indexedDBData = await loadDataFromIndexedDB(sourceId);
              if (indexedDBData) {
                const records = def.transformer(indexedDBData.raw);
                const analytics = def.analyticsGenerator
                  ? def.analyticsGenerator(records)
                  : ({} as AnalyticsDataset);

                // Only update if data has changed
                const currentData = dataMap[sourceId];
                if (
                  !currentData ||
                  currentData.records.length !== records.length ||
                  JSON.stringify(currentData.records) !==
                    JSON.stringify(records)
                ) {
                  setDataMap((prev) => ({
                    ...prev,
                    [sourceId]: { records, analytics },
                  }));

                  // Update cache
                  const recordsKey = `${sourceId}_records`;
                  const analyticsKey = `${sourceId}_analytics`;
                  localStorage.setItem(recordsKey, JSON.stringify(records));
                  localStorage.setItem(analyticsKey, JSON.stringify(analytics));
                }
              }
            }
          } catch (error) {
            console.error(
              "Failed to refresh extension data for",
              sourceId,
              error
            );
          }
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loadedSources, dataMap]);

  // Cleanup old data every 5 minutes (unload sources not accessed in the last 10 minutes)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const tenMinutesAgo = now - 10 * 60 * 1000; // 10 minutes

      for (const sourceId of loadedSources) {
        const lastAccess = lastAccessTime.current[sourceId] || 0;
        if (lastAccess < tenMinutesAgo) {
          console.log(
            `Unloading old data for ${sourceId} (last accessed ${Math.round(
              (now - lastAccess) / 1000 / 60
            )} minutes ago)`
          );
          unloadSourceData(sourceId);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(cleanupInterval);
  }, [loadedSources]);

  return (
    <SourceDataContext.Provider
      value={{
        dataMap,
        importData,
        refreshFromIndexedDB,
        loadSourceData,
        isDataLoaded,
        unloadSourceData,
        sources,
      }}
    >
      {children}
    </SourceDataContext.Provider>
  );
};

export const useSourceData = () => {
  const ctx = useContext(SourceDataContext);
  if (!ctx) throw new Error("useSourceData must be used within provider");
  return ctx;
};
