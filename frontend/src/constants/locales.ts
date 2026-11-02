// Locales a group's content can be written in, base or translation. Mirrors
// the backend's BASE_LOCALES (backend/app/schemas/groups.py): every current
// two-letter ISO 639-1 code (he/id/yi, not the withdrawn iw/in/ji), except
// Swahili ("sw"), which is left out on purpose.
export const BASE_LOCALES: ReadonlySet<string> = new Set(
  (
    'aa ab ae af ak am an ar as av ay az ba be bg bi bm bn bo br bs ' +
    'ca ce ch co cr cs cu cv cy da de dv dz ee el en eo es et eu ' +
    'fa ff fi fj fo fr fy ga gd gl gn gu gv ha he hi ho hr ht hu hy hz ' +
    'ia id ie ig ii ik io is it iu ja jv ' +
    'ka kg ki kj kk kl km kn ko kr ks ku kv kw ky ' +
    'la lb lg li ln lo lt lu lv mg mh mi mk ml mn mr ms mt my ' +
    'na nb nd ne ng nl nn no nr nv ny oc oj om or os pa pi pl ps pt qu ' +
    'rm rn ro ru rw sa sc sd se sg si sk sl sm sn so sq sr ss st su sv ' +
    'ta te tg th ti tk tl tn to tr ts tt tw ty ug uk ur uz ve vi vo wa wo ' +
    'xh yi yo za zh zu '
  )
    .split(' ')
    .filter(Boolean),
);

export function isBaseLocale(value: string): boolean {
  return BASE_LOCALES.has(value);
}

// Group fields that can be translated. Mirrors the backend's
// TRANSLATABLE_GROUP_FIELDS; adding one here also needs its input.
export const TRANSLATABLE_GROUP_FIELDS = [
  'description',
  'tagline',
  'video_url',
] as const;
export type TranslatableGroupField = (typeof TRANSLATABLE_GROUP_FIELDS)[number];

// Translatable fields that must be filled in. Only checked in the base
// locale; translations may always be partial. None today.
export const REQUIRED_GROUP_FIELDS: readonly TranslatableGroupField[] = [];

/** A locale's name in the UI's language, e.g. `es` → "Spanish" / "Español". */
export function localeName(locale: string, uiLanguage: string): string {
  const name = new Intl.DisplayNames([uiLanguage], { type: 'language' }).of(
    locale,
  );
  if (!name) return locale;
  return name.charAt(0).toLocaleUpperCase(uiLanguage) + name.slice(1);
}
