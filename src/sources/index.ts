import { SourceRegistry } from "./BaseSource";
import { swiggySource } from "./swiggy";
import { instamartSource } from "./instamart";
import { dineoutSource } from "./dineout";

export const sources: SourceRegistry = {
  swiggy: swiggySource,
  "swiggy-instamart": instamartSource,
  "swiggy-dineout": dineoutSource,
}; 