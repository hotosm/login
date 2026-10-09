import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppNotification } from '../types/notifications';
import { useApiRequest } from './useApiRequest';

export function useNotifications() {
  const request = useApiRequest();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await request('/me/notifications');
      if (!response) return;
      const data: AppNotification[] = await response.json();
      setNotifications(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markRead = useCallback(
    async (id: string) => {
      const readAt = new Date().toISOString();
      // Optimistic: the row is already muted while the request is in flight.
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: n.read_at ?? readAt } : n,
        ),
      );
      try {
        await request(`/me/notifications/${id}/read`, { method: 'POST' });
      } catch {
        await refresh();
      }
    },
    [request, refresh],
  );

  const markAllRead = useCallback(async () => {
    const readAt = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at ?? readAt })),
    );
    try {
      await request('/me/notifications/read-all', { method: 'POST' });
    } catch {
      await refresh();
    }
  }, [request, refresh]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.read_at === null).length,
    [notifications],
  );

  return {
    notifications,
    unreadCount,
    loading,
    refresh,
    markRead,
    markAllRead,
  };
}
