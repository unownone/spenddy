import { SwiggyOrder } from "../../types/SwiggyData";
import { OrderRecord } from "../../types/CommonData";
import { processOrderData, toCommonOrderRecord } from "../../utils/dataProcessor";

/**
 * Convert raw Swiggy JSON (as collected by spenddy-link extension) into
 * Spenddy's cross-platform `OrderRecord` array.
 */
export const swiggyTransformer = (raw: SwiggyOrder[]): OrderRecord[] => {
  const processed = processOrderData(raw);
  return toCommonOrderRecord(processed, "swiggy");
}; 