/* overrides for Hanko's UI */

import { en } from "@teamhanko/hanko-elements/i18n/en";
import { enOverrides } from "./hanko-i18n-en";
import { es } from "./hanko-i18n-es";
import { fr } from "./hanko-i18n-fr";
import { pt } from "./hanko-i18n-pt";

Object.assign(en.headlines, enOverrides.headlines);
Object.assign(en.labels, enOverrides.labels);
Object.assign(en.texts, enOverrides.texts);

export function getTranslations() {
  return { en, es, fr, pt };
}
