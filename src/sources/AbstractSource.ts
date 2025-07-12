import { SourceDefinition, ImportMethod } from "./BaseSource";
import { OrderRecord, AnalyticsDataset } from "../types/CommonData";
import { generateAnalyticsDataset } from "../utils/dataProcessor";

export abstract class AbstractSource implements SourceDefinition {
  abstract id: string;
  abstract name: string;
  abstract description: string;
  abstract importMethods: ImportMethod[];
  logo?: string;

  // Each concrete source must provide a transformer
  abstract transformer(raw: any): OrderRecord[];

  analyticsGenerator(records: OrderRecord[]): AnalyticsDataset {
    return generateAnalyticsDataset(records);
  }
} 