import { useCallback, useEffect, useRef, useState } from 'react';
import type { GroupResponse } from '../types/groups';
import { backendUrl, readError } from '../utils/api';

export const ORGS_PAGE_SIZE = 20;

// Every organization plus the moderation actions on them
// (GET/POST /admin/organizations*, admin or account manager only).
// Actions throw on failure so each screen can pick its own error surface.
export function useManagedOrganizations(enabled: boolean) {
  const [organizations, setOrganizations] = useState<GroupResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  // Bumped by `refresh` to re-run the fetch effect with the same term and page
  const [reloadKey, setReloadKey] = useState(0);
  // Resolves the pending `refresh` once the re-fetch it triggered settles
  const refreshDone = useRef<(() => void) | null>(null);

  // A new term starts over from the first page. Both updates land in the same
  // render, so no request goes out for the new term on the old page.
  const applyQuery = useCallback(
    (term: string) => {
      if (term === debouncedQuery) return;
      setDebouncedQuery(term);
      setPage(1);
    },
    [debouncedQuery],
  );

  // Live search: wait until typing pauses before searching
  useEffect(() => {
    const timer = setTimeout(() => applyQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query, applyQuery]);

  // Enter searches right away instead of waiting for the debounce
  const searchNow = useCallback(() => applyQuery(query), [applyQuery, query]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reloadKey only re-runs the fetch for refresh()
  useEffect(() => {
    if (!enabled) return;
    // Each fetch aborts the previous one, so a slow stale response can never
    // overwrite the results for the current term/page.
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          page_size: String(ORGS_PAGE_SIZE),
        });
        const term = debouncedQuery.trim();
        if (term) params.set('search', term);
        const response = await fetch(
          `${backendUrl}/admin/organizations?${params}`,
          { credentials: 'include', signal: controller.signal },
        );
        // Session expired — the caller sends the user back to login
        if (response.status === 401) {
          setUnauthorized(true);
          setLoading(false);
          return;
        }
        if (!response.ok) throw new Error(await readError(response));
        const data = await response.json();
        // The previous list stays on screen until this replaces it
        setOrganizations(data.items || []);
        setTotal(data.total || 0);
        setLoading(false);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(
          err instanceof Error ? err.message : 'Failed to load organizations',
        );
        setLoading(false);
      } finally {
        if (!controller.signal.aborted) {
          refreshDone.current?.();
          refreshDone.current = null;
        }
      }
    };
    load();
    return () => controller.abort();
  }, [enabled, debouncedQuery, page, reloadKey]);

  // Re-fetches the current term and page (e.g. after a moderation action)
  const refresh = useCallback(
    () =>
      new Promise<void>((resolve) => {
        refreshDone.current = resolve;
        setReloadKey((key) => key + 1);
      }),
    [],
  );

  const post = useCallback(
    async (path: string, body?: unknown) => {
      const response = await fetch(`${backendUrl}${path}`, {
        method: 'POST',
        credentials: 'include',
        ...(body !== undefined
          ? {
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            }
          : {}),
      });
      if (!response.ok) throw new Error(await readError(response));
      await refresh();
    },
    [refresh],
  );

  const approve = useCallback(
    (orgId: string) => post(`/admin/organizations/${orgId}/approve`),
    [post],
  );

  const reject = useCallback(
    (orgId: string, reason?: string) =>
      post(`/admin/organizations/${orgId}/reject`, { reason }),
    [post],
  );

  const approveName = useCallback(
    (orgId: string) => post(`/admin/organizations/${orgId}/approve-name`),
    [post],
  );

  const rejectName = useCallback(
    (orgId: string) => post(`/admin/organizations/${orgId}/reject-name`),
    [post],
  );

  return {
    organizations,
    totalPages: Math.ceil(total / ORGS_PAGE_SIZE),
    page,
    setPage,
    query,
    setQuery,
    searchNow,
    debouncedQuery,
    loading,
    error,
    unauthorized,
    refresh,
    approve,
    reject,
    approveName,
    rejectName,
  };
}
