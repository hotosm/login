/**
 * Complete a bare domain into a URL: `example.org` → `https://example.org`.
 *
 * `type="url"` inputs reject anything without a scheme, but people type website
 * addresses the way they say them. Run this on blur so the field ends up valid
 * and the user sees exactly what will be stored. Values that already carry a
 * scheme are left alone — including non-http ones, which `type="url"` accepts
 * too. An empty value stays empty so optional fields aren't forced to a URL.
 */
export function withScheme(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
