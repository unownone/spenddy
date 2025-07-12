import { SourceRegistry } from "./BaseSource";
import { swiggySource } from "./swiggy";

export const sources: SourceRegistry = {
  swiggy: swiggySource,
}; 