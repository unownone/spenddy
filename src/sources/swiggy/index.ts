import { AbstractSource } from "../AbstractSource";
import { swiggyTransformer } from "./transformer";
import { ImportMethod } from "../BaseSource";

class SwiggySource extends AbstractSource {
  id = "swiggy";
  name = "Swiggy";
  description = "Food delivery orders from Swiggy";
  logo = "/swiggy.svg";
  importMethods: ImportMethod[] = ["extension"];
  extensionLink = "https://chromewebstore.google.com/detail/mibpmhoncjmniigifepbckapmoflkglo";

  transformer = swiggyTransformer;
}

export const swiggySource = new SwiggySource(); 