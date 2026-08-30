import { useCallback, useEffect, useState } from 'react';
import type { GroupResponse } from '../types/groups';
import { backendUrl, readError } from '../utils/api';

// Pending organization requests + the moderation actions on them
// (GET/POST /admin/organizations*, admin or account manager only).
// Actions throw on failure so each screen can pick its own error surface.
export function usePendingOrgs(enabled: boolean) {
  const [pendingOrgs, setPendingOrgs] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${backendUrl}/admin/organizations?pending_action=true&page=1&page_size=50`,
        { credentials: 'include' },
      );
      // Session expired — the caller sends the user back to login
      if (response.status === 401) {
        setUnauthorized(true);
        return;
      }
      if (!response.ok) throw new Error(await readError(response));
      const data = await response.json();
      setPendingOrgs(data.items || []);
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

  const approve = useCallback(async (orgId: string) => {
    const response = await fetch(
      `${backendUrl}/admin/organizations/${orgId}/approve`,
      { method: 'POST', credentials: 'include' },
    );
    if (!response.ok) throw new Error(await readError(response));
    // Approved orgs leave the pending list
    setPendingOrgs((prev) => prev.filter((o) => o.id !== orgId));
  }, []);

  const reject = useCallback(async (orgId: string, reason?: string) => {
    const response = await fetch(
      `${backendUrl}/admin/organizations/${orgId}/reject`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      },
    );
    if (!response.ok) throw new Error(await readError(response));
    setPendingOrgs((prev) => prev.filter((o) => o.id !== orgId));
  }, []);

  // Only clears the pending name — the org itself stays in the list, so refetch
  const approveName = useCallback(
    async (orgId: string) => {
      const response = await fetch(
        `${backendUrl}/admin/organizations/${orgId}/approve-name`,
        { method: 'POST', credentials: 'include' },
      );
      if (!response.ok) throw new Error(await readError(response));
      await refresh();
    },
    [refresh],
  );
  
    const rejectName = useCallback(
    async (orgId: string) => {
      const response = await fetch(
        `${backendUrl}/admin/organizations/${orgId}/reject-name`,
        { method: 'POST', credentials: 'include' },
      );
      if (!response.ok) throw new Error(await readError(response));
      await refresh();
    },
    [refresh],
  );

  return {
    pendingOrgs,
    loading,
    error,
    unauthorized,
    refresh,
    approve,
    reject,
    approveName,
    rejectName
  };
}
