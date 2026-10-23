import {
  TRANSLATABLE_GROUP_FIELDS,
  type TranslatableGroupField,
  isBaseLocale,
} from '../constants/locales';
import type { GroupResponse } from '../types/groups';

export type ContentFields = Record<TranslatableGroupField, string>;
// Keyed by locale: the base (any of BASE_LOCALES) plus the translations.
export type Drafts = Record<string, ContentFields>;

export function emptyFields(): ContentFields {
  return Object.fromEntries(
    TRANSLATABLE_GROUP_FIELDS.map((field) => [field, '']),
  ) as ContentFields;
}

export function baseLocaleOf(org: GroupResponse): string {
  return isBaseLocale(org.default_locale) ? org.default_locale : 'en';
}

// The base from the org's own fields, plus one draft per saved translation.
export function seedDrafts(org: GroupResponse): Drafts {
  const base = baseLocaleOf(org);
  const drafts: Drafts = {
    [base]: Object.fromEntries(
      TRANSLATABLE_GROUP_FIELDS.map((field) => [field, org[field] ?? '']),
    ) as ContentFields,
  };
  for (const [locale, stored] of Object.entries(org.translations ?? {})) {
    if (locale === base || !stored) continue;
    drafts[locale] = Object.fromEntries(
      TRANSLATABLE_GROUP_FIELDS.map((field) => [field, stored[field] ?? '']),
    ) as ContentFields;
  }
  return drafts;
}

// The org's languages: the base first, always (English for a new org), then
// the saved translations in the order they were added.
export function seedLocales(org: GroupResponse): string[] {
  const base = baseLocaleOf(org);
  const translated = Object.keys(org.translations ?? {}).filter(
    (locale) => locale !== base,
  );
  return [base, ...translated];
}

export function filledFields(fields: ContentFields): TranslatableGroupField[] {
  return TRANSLATABLE_GROUP_FIELDS.filter((field) => fields[field].trim());
}
