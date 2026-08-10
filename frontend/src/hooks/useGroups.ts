import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { GroupResponse, GroupSummary, GroupType } from '../types/groups';
import { type ApiRequest, jsonBody, useApiRequest } from './useApiRequest';

// Teams and organizations are both groups

/** Where each group type's list page lives. */
export const groupListPath: Record<GroupType, string> = {
  team: '/teams',
  organization: '/organizations',
};

/** Editable fields of PATCH /groups/{id}. Teams only use a subset. */
export interface GroupDetailsPatch {
  description?: string | null;
  contact_email?: string | null;
  website?: string | null;
  is_public?: boolean;
}

/** Surfaces a hook's load error as a toast. */
export function useErrorToast(error: string | null) {
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);
}

/** PUTs an avatar or banner image for a group. */
export function uploadGroupImage(
  request: ApiRequest,
  id: string,
  kind: 'avatar' | 'banner',
  file: File,
) {
  const form = new FormData();
  form.append('file', file);
  return request(`/groups/${id}/${kind}`, { method: 'PUT', body: form });
}

/** The groups of one type the current user belongs to, plus creating one. */
export function useGroupList(type: GroupType) {
  const request = useApiRequest();

  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLoadError(null);
      const response = await request(`/groups?type=${type}`);
      if (!response) return;
      const data = await response.json();
      setGroups(data.groups || []);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [request, type]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Creates a group of this type and refreshes the list. `body` carries the
   * type-specific fields; `type` is added here. Resolves to `null` on 401.
   */
  const createGroup = useCallback(
    async (body: Record<string, unknown>) => {
      setSubmitting(true);
      try {
        const response = await request('/groups', jsonBody({ type, ...body }));
        if (!response) return null;
        const created: GroupResponse = await response.json();
        await refresh();
        return created;
      } finally {
        setSubmitting(false);
      }
    },
    [request, type, refresh],
  );

  return { groups, loading, loadError, submitting, refresh, createGroup };
}

/** A single group and the actions every group type supports. */
export function useGroup(id: string, type: GroupType) {
  const navigate = useNavigate();
  const request = useApiRequest();

  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  // Only the initial load failure needs state — it replaces the whole page
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Scoped to this group; the type-specific hooks build their own actions on it
  const groupRequest = useCallback<ApiRequest>(
    (path, init) => request(`/groups/${id}${path}`, init),
    [request, id],
  );

  const refresh = useCallback(async () => {
    try {
      setLoadError(null);
      const response = await groupRequest('');
      if (!response) return;
      setGroup(await response.json());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [groupRequest]);

  useEffect(() => {
    refresh();
  }, [refresh]);


  const updateDetails = useCallback(
    async (patch: GroupDetailsPatch) => {
      setSaving(true);
      try {
        const response = await groupRequest('', jsonBody(patch, 'PATCH'));
        if (!response) return null;
        const updated: GroupResponse = await response.json();
        setGroup(updated);
        return updated;
      } finally {
        setSaving(false);
      }
    },
    [groupRequest],
  );

  const changeName = useCallback(
    async (name: string) => {
      const response = await groupRequest('/name-change', jsonBody({ name }));
      if (!response) return null;
      const updated: GroupResponse = await response.json();
      setGroup(updated);
      return updated;
    },
    [groupRequest],
  );

  const remove = useCallback(async () => {
    setDeleting(true);
    try {
      const response = await groupRequest('', { method: 'DELETE' });
      if (!response) return false;
      navigate(groupListPath[type]);
      return true;
    } finally {
      setDeleting(false);
    }
  }, [groupRequest, navigate, type]);

  return {
    group,
    loading,
    loadError,
    saving,
    deleting,
    canManage: group?.role === 'owner' || group?.role === 'manager',
    canDelete: group?.role === 'owner',
    listPath: groupListPath[type],
    refresh,
    updateDetails,
    changeName,
    remove,
    groupRequest,
  };
}
