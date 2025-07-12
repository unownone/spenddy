import { OrderRecord, AnalyticsDataset } from "../types/CommonData";

/** Possible data import mechanisms a source may support */
export type ImportMethod = "extension" | "file" | "api" | "manual";

/**
 * Minimal contract every Spenddy data source must fulfil.
 */
export interface SourceDefinition {
  /** Unique identifier used in routes, e.g. "swiggy" */
  id: string;
  /** Display name */
  name: string;
  /** Short description for landing page cards */
  description: string;
  /** Refers to logo asset path or React element */
  logo?: string;
  /** Supported import mechanisms (one or many) */
  importMethods: ImportMethod[];

  /** Chrome/Edge extension link if importMethods includes "extension" */
  extensionLink?: string;

  /**
   * Transforms raw platform-specific JSON into Spenddy's OrderRecord []
   * This **must not** mutate the input array.
   */
  transformer: (raw: any) => OrderRecord[];

  /**
   * Optional extra processing step if the platform needs it (e.g. geo lookup)
   */
  postProcess?: (records: OrderRecord[]) => OrderRecord[];

  /**
   * Returns pre-computed analytics for the records; default implementation can
   * call the generic `generateAnalyticsDataset` utility.
   */
  analyticsGenerator?: (records: OrderRecord[]) => AnalyticsDataset;
}

/** Helper type for registry mapping */
export type SourceRegistry = Record<string, SourceDefinition>; 