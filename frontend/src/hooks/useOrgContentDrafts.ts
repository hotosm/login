import { useEffect, useMemo, useState } from 'react';
import {
  BASE_LOCALES,
  REQUIRED_GROUP_FIELDS,
  TRANSLATABLE_GROUP_FIELDS,
  type TranslatableGroupField,
  localeName,
} from '../constants/locales';
import { useLanguage } from '../contexts/LanguageContext';
import type {
  GroupResponse,
  GroupTranslationFields,
  GroupTranslationsPatch,
} from '../types/groups';
import {
  type ContentFields,
  type Drafts,
  baseLocaleOf,
  emptyFields,
  filledFields,
  seedDrafts,
  seedLocales,
} from '../utils/orgContent';
import { PORTAL_LOCALES } from '../utils/portal';
import { isValidYoutubeUrl } from '../utils/youtube';
import type { GroupDetailsPatch } from './useGroups';

export type TranslationStatus = 'empty' | 'partial' | 'complete';

export type SavePayloadResult =
  | { ok: true; payload: GroupDetailsPatch }
  | { ok: false; error: 'required' | 'video'; locale: string };

// Editing state for an org's translatable content: the base plus one draft
// per translation, seeded from `org` and re-seeded when its content changes.
export function useOrgContentDrafts(org: GroupResponse) {
  const { currentLanguage } = useLanguage();

  const savedBase = baseLocaleOf(org);
  // Only re-seed when the content itself changed, so saving the Details tab
  // (which also replaces `org`) doesn't wipe unsaved edits here.
  const contentKey = JSON.stringify([
    org.default_locale,
    TRANSLATABLE_GROUP_FIELDS.map((field) => org[field]),
    org.translations,
  ]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on contentKey on purpose
  const savedDrafts = useMemo(() => seedDrafts(org), [contentKey]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on contentKey on purpose
  const savedLocales = useMemo(() => seedLocales(org), [contentKey]);

  const [drafts, setDrafts] = useState<Drafts>(savedDrafts);
  // The org's languages, the base first, then the rest in the order added.
  const [listedLocales, setListedLocales] = useState<string[]>(savedLocales);
  // The one open group: the base on load, then whichever is opened or added.
  const [openLocale, setOpenLocale] = useState<string | null>(savedBase);
  const [removingLocale, setRemovingLocale] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-seed only when the saved content changes
  useEffect(() => {
    setDrafts(savedDrafts);
    setListedLocales(savedLocales);
  }, [savedDrafts]);

  const baseLocale = listedLocales[0] ?? savedBase;
  const draftOf = (locale: string) => drafts[locale] ?? emptyFields();
  const hasContent = (fields: ContentFields | undefined) =>
    !!fields && filledFields(fields).length > 0;
  const baseHasSavedContent = hasContent(savedDrafts[baseLocale]);

  // Locales not listed yet: Portal's first, in its order, then every other
  // one by its name in the UI's language.
  const addablePortalLocales = PORTAL_LOCALES.filter(
    (code) => !listedLocales.includes(code),
  );
  const addableOtherLocales = useMemo(
    () =>
      [...BASE_LOCALES]
        .filter(
          (code) =>
            !listedLocales.includes(code) && !PORTAL_LOCALES.includes(code),
        )
        .map((code) => ({ code, name: localeName(code, currentLanguage) }))
        .sort((a, b) => a.name.localeCompare(b.name, currentLanguage)),
    [listedLocales, currentLanguage],
  );

  const setOpen = (locale: string, open: boolean) => {
    if (open) setOpenLocale(locale);
    else setOpenLocale((previous) => (previous === locale ? null : previous));
  };

  const setDraftField = (
    locale: string,
    field: TranslatableGroupField,
    value: string,
  ) => {
    setDrafts((previous) => ({
      ...previous,
      [locale]: { ...(previous[locale] ?? emptyFields()), [field]: value },
    }));
  };

  const hasUnsavedChanges = (locale: string) =>
    TRANSLATABLE_GROUP_FIELDS.some(
      (field) =>
        draftOf(locale)[field] !==
        (savedDrafts[locale] ?? emptyFields())[field],
    );

  // Complete: every field the base has is filled here too. Partial: some
  // are. Empty: nothing written yet.
  const translationStatus = (locale: string): TranslationStatus => {
    const filled = filledFields(draftOf(locale));
    if (filled.length === 0) return 'empty';
    const covered = filledFields(draftOf(baseLocale)).every((field) =>
      filled.includes(field),
    );
    return covered ? 'complete' : 'partial';
  };

  // English, when present, is always the base: added later, it takes over and
  // the old base, content and all, becomes its first translation.
  const addLanguage = (locale: string) => {
    setDrafts((previous) => ({ ...previous, [locale]: emptyFields() }));
    if (locale === 'en') {
      setListedLocales([locale, ...listedLocales]);
    } else {
      setListedLocales([...listedLocales, locale]);
    }
    setOpen(locale, true);
  };

  const requestRemove = (locale: string) => setRemovingLocale(locale);

  const cancelRemove = () => setRemovingLocale(null);

  const confirmRemove = () => {
    if (!removingLocale) return;
    setDrafts((previous) => {
      const { [removingLocale]: _removed, ...rest } = previous;
      return rest;
    });
    setListedLocales(
      listedLocales.filter((locale) => locale !== removingLocale),
    );
    setOpen(removingLocale, false);
    setRemovingLocale(null);
  };

  // Non-base locales (`locales[0]` is the base) whose content differs from
  // what's stored as their translation: an object when there's content, null
  // to drop an existing one. Stored translations that are no longer one
  // (removed this session, or now the base) are dropped.
  const buildTranslationsPatch = (
    locales: string[],
  ): GroupTranslationsPatch => {
    const patch: GroupTranslationsPatch = {};
    const translated = locales.slice(1);
    for (const locale of translated) {
      const draft = draftOf(locale);
      const stored = org.translations?.[locale];
      if (filledFields(draft).length > 0) {
        const fields = Object.fromEntries(
          TRANSLATABLE_GROUP_FIELDS.map((field) => [
            field,
            draft[field].trim() ? draft[field] : null,
          ]),
        ) as GroupTranslationFields;
        const changed =
          !stored ||
          TRANSLATABLE_GROUP_FIELDS.some(
            (field) => (stored[field] ?? '') !== (fields[field] ?? ''),
          );
        if (changed) patch[locale] = fields;
      } else if (stored) {
        patch[locale] = null;
      }
    }
    for (const locale of Object.keys(org.translations ?? {})) {
      if (!translated.includes(locale)) patch[locale] = null;
    }
    return patch;
  };

  const buildSavePayload = (): SavePayloadResult => {
    // English is the base only once it has content; otherwise the first
    // language that has some (in list order) takes its place.
    let locales = listedLocales;
    if (locales[0] === 'en' && !hasContent(draftOf('en'))) {
      const firstFilled = locales.find((locale) => hasContent(draftOf(locale)));
      if (firstFilled) {
        locales = [
          firstFilled,
          ...locales.filter(
            (locale) => locale !== 'en' && locale !== firstFilled,
          ),
        ];
      }
    }
    const base = locales[0] ?? baseLocale;
    // Required content only has to exist in the base locale.
    const missingRequired = REQUIRED_GROUP_FIELDS.some(
      (field) => !draftOf(base)[field].trim(),
    );
    if (missingRequired) return { ok: false, error: 'required', locale: base };
    // Same rule as the backend, so a bad link never makes it to the request.
    const badVideo = listedLocales.find(
      (locale) => !isValidYoutubeUrl(draftOf(locale).video_url),
    );
    if (badVideo) return { ok: false, error: 'video', locale: badVideo };
    return {
      ok: true,
      payload: {
        ...(Object.fromEntries(
          TRANSLATABLE_GROUP_FIELDS.map((field) => [
            field,
            draftOf(base)[field] || null,
          ]),
        ) as GroupTranslationFields),
        default_locale: base,
        translations: buildTranslationsPatch(locales),
      },
    };
  };

  const reset = () => {
    setDrafts(savedDrafts);
    setListedLocales(savedLocales);
  };

  return {
    listedLocales,
    openLocale,
    removingLocale,
    baseLocale,
    baseHasSavedContent,
    draftOf,
    hasContent,
    hasUnsavedChanges,
    translationStatus,
    addablePortalLocales,
    addableOtherLocales,
    setOpen,
    setDraftField,
    addLanguage,
    requestRemove,
    cancelRemove,
    confirmRemove,
    reset,
    buildSavePayload,
  };
}
