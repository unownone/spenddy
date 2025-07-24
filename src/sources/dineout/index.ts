import { AbstractSource } from "../AbstractSource";
import { dineoutTransformer } from "./transformer";
import { ImportMethod } from "../BaseSource";

class DineoutSource extends AbstractSource {
  id = "swiggy-dineout";
  name = "Dineout";
  description = "Restaurant reservations & in-restaurant payments (Swiggy Dineout)";
  logo = "/dineout.png";
  importMethods: ImportMethod[] = ["extension"];
  extensionLink = "https://chromewebstore.google.com/detail/mibpmhoncjmniigifepbckapmoflkglo";

  rawStorageKey = "dineout_swiggy_data_raw";

  transformer = dineoutTransformer;
}

export const dineoutSource = new DineoutSource(); 