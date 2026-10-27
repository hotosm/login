// Portal serves public pages under a locale prefix and falls back to English
// for anything it doesn't ship.
export const PORTAL_LOCALES = ['en', 'es', 'fr'];

/** Build a Portal URL for `path` (e.g. `org/hot`) in the given language. */
export function portalUrl(path: string, language?: string): string {
  const base = import.meta.env.VITE_PORTAL_URL || 'https://portal.hotosm.org';
  const locale =
    language && PORTAL_LOCALES.includes(language) ? language : 'en';
  return `${base}/${locale}/${path}`;
}

// Matches the backend's limit on tagline for orgs.
export const TAGLINE_MAX = 120;