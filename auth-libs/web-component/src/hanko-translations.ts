// Hanko's UI overwrites
import { en } from "@teamhanko/hanko-elements/i18n/en";
import { fr as hankoFr } from "@teamhanko/hanko-elements/i18n/fr";
import { enOverrides } from "./hanko-i18n-en";
import { es as esOverrides } from "./hanko-i18n-es";
import { fr as frOverrides } from "./hanko-i18n-fr";
import { pt as ptOverrides } from "./hanko-i18n-pt";

Object.assign(en.headlines, enOverrides.headlines);
Object.assign(en.labels, enOverrides.labels);
Object.assign(en.texts, enOverrides.texts);

const fr = JSON.parse(JSON.stringify(hankoFr));
Object.assign(fr.headlines, frOverrides.headlines);
Object.assign(fr.labels, frOverrides.labels);
Object.assign(fr.texts, frOverrides.texts);

const es = JSON.parse(JSON.stringify(en));
Object.assign(es.headlines, esOverrides.headlines);
Object.assign(es.labels, esOverrides.labels);
Object.assign(es.texts, esOverrides.texts);

const pt = JSON.parse(JSON.stringify(en));
Object.assign(pt.headlines, ptOverrides.headlines);
Object.assign(pt.labels, ptOverrides.labels);
Object.assign(pt.texts, ptOverrides.texts);

export function getTranslations() {
  return { en, es, fr, pt };
}
