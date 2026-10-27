// Mirrors backend/app/utils/youtube.py so a bad link is caught before saving;
// keep both in step. The backend stores the normalized form.

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
]);
// Path prefixes on the YouTube hosts that carry the video id right after them.
const ID_PATH_PREFIXES = ['/shorts/', '/embed/'];

function videoId(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.port || url.username) {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (host === 'youtu.be') return url.pathname.slice(1);
  if (!YOUTUBE_HOSTS.has(host)) return null;
  if (url.pathname === '/watch') return url.searchParams.get('v');
  const prefix = ID_PATH_PREFIXES.find((p) => url.pathname.startsWith(p));
  return prefix ? url.pathname.slice(prefix.length) : null;
}

/**
 * The canonical watch URL for a YouTube video link, '' for an empty value, or
 * null when it isn't one (watch?v=ID, youtu.be/ID, shorts/ID or embed/ID).
 */
export function normalizeYoutubeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const id = videoId(trimmed);
  return id && VIDEO_ID.test(id)
    ? `https://www.youtube.com/watch?v=${id}`
    : null;
}

export function isValidYoutubeUrl(value: string): boolean {
  return normalizeYoutubeUrl(value) !== null;
}
