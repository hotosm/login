import { useCallback, useEffect, useState } from 'react';
import type { GroupResponse } from '../types/groups';
import { backendUrl, readError } from '../utils/api';

// Every organization plus the moderation actions on them
// (GET/POST /admin/organizations*, admin or account manager only).
// Actions throw on failure so each screen can pick its own error surface.
export function useManagedOrganizations(enabled: boolean) {
  const [organizations, setOrganizations] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${backendUrl}/admin/organizations?page=1&page_size=100`,
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
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load organizations',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) refresh();
  }, [enabled, refresh]);

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

  const approveEdit = useCallback(
    (orgId: string) => post(`/admin/organizations/${orgId}/approve-edit`),
    [post],
  );

  const rejectEdit = useCallback(
    (orgId: string) => post(`/admin/organizations/${orgId}/reject-edit`),
    [post],
  );

  return {
    organizations,
    loading,
    error,
    unauthorized,
    refresh,
    approve,
    reject,
    approveName,
    rejectName,
    approveEdit,
    rejectEdit,
  };
}
