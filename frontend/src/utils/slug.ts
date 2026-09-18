/**
 * Normalize a name into a URL slug (lowercase, dash-separated).
 *
 * Mirrors `groups_service.slugify` on the backend, so what the user sees while
 * typing is exactly what gets stored: runs of anything outside `[a-z0-9]`
 * become a single dash, leading/trailing dashes are dropped, and the result is
 * capped at 80 characters.
 */
export function slugify(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized.slice(0, 80);
}

/**
 * Live variant for text fields, where `slugify` alone would fight the typist:
 * it drops the dash a space just produced, so a second word can never be
 * started. This one keeps a trailing dash (`ada ` → `ada-`) and only trims the
 * leading one. Run `slugify` on the value before sending it or previewing it.
 */
export function slugifyInput(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-/, '');
  return normalized.slice(0, 80);
}
