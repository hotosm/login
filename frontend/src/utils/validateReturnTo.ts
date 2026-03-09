const ALLOWED_DOMAINS = ["hotosm.org", "hotosm.test"];

export function validateReturnTo(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const isAllowed = ALLOWED_DOMAINS.some(
      (domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
    return isAllowed ? url : null;
  } catch {
    return null;
  }
}
