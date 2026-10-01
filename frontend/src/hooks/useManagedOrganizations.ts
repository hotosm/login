import { useCallback, useEffect, useState } from 'react';
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
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  // Fetches one page, with an explicit page/search rather than reading state,
  // so the caller controls exactly when a request fires — the search box only
  // searches on submit, not on every keystroke.
  const load = useCallback(async (loadPage: number, loadSearch: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(loadPage),
        page_size: String(ORGS_PAGE_SIZE),
      });
      if (loadSearch.trim()) params.set('search', loadSearch.trim());
      const response = await fetch(
        `${backendUrl}/admin/organizations?${params}`,
        { credentials: 'include' },
      );
      // Session expired — the caller sends the user back to login
      if (response.status === 401) {
        setUnauthorized(true);
        return;
      }
      if (!response.ok) throw new Error(await readError(response));
      const data = await response.json();
      setOrganizations(data.items || []);
      setTotal(data.total || 0);
      setPage(loadPage);
      setSearch(loadSearch);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load organizations',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) load(1, '');
    // `load` is stable (empty dep array below), so this only fires when the
    // panel becomes enabled, never on search/page changes.
  }, [enabled, load]);

  const goToPage = useCallback(
    (newPage: number) => load(newPage, search),
    [load, search],
  );

  // Runs a search from page 1 — called on submit, not as-you-type.
  const runSearch = useCallback((term: string) => load(1, term), [load]);

  const refresh = useCallback(() => load(page, search), [load, page, search]);

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
    goToPage,
    search,
    runSearch,
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
