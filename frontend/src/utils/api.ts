// Shared helpers for talking to the login backend.
// VITE_BACKEND_URL already includes the `/api` prefix (see .env), so paths are
// appended without it, e.g. `${backendUrl}/groups`. Falls back to `/api` so the
// Vite dev proxy can forward same-origin requests to the backend.
export const backendUrl = import.meta.env.VITE_BACKEND_URL || '/api';

// Backend errors are returned as { code, message }. Older admin endpoints use
// { detail }. Read whichever is present, with a sensible fallback.
export async function readError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data?.message || data?.detail || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}
