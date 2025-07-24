import { AbstractSource } from "../AbstractSource";
import { instamartTransformer } from "./transformer";
import { ImportMethod } from "../BaseSource";

class InstamartSource extends AbstractSource {
  id = "swiggy-instamart";
  name = "Instamart";
  description = "10-minute grocery orders from Swiggy Instamart";
  logo = "/instamart.png";
  importMethods: ImportMethod[] = ["extension"];
  extensionLink = "https://chromewebstore.google.com/detail/mibpmhoncjmniigifepbckapmoflkglo";

  // The browser extension stores raw JSON under this key
  rawStorageKey = "instamart_swiggy_data_raw";

  transformer = instamartTransformer;
}

export const instamartSource = new InstamartSource(); 