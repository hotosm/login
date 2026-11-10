import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { validateReturnTo } from '../utils/validateReturnTo';

const STORAGE_KEY = 'hot_login_return_to';

// Returns the validated `return_to` URL of the tool the user came from.
// Persists it in sessionStorage so it survives navigation between pages.
export function useReturnTo(): string | null {
  const { search } = useLocation();

  return useMemo(() => {
    const fromUrl = validateReturnTo(
      new URLSearchParams(search).get('return_to'),
    );

    if (fromUrl) {
      try {
        sessionStorage.setItem(STORAGE_KEY, fromUrl);
      } catch {
        // sessionStorage may be unavailable (e.g. private mode)
      }
      return fromUrl;
    }

    try {
      return validateReturnTo(sessionStorage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  }, [search]);
}
