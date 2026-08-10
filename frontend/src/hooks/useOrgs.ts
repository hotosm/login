import { useCallback, useEffect, useState } from 'react';
import type {
  GroupResponse,
  Invitation,
  MemberRole,
  MyInvitation,
} from '../types/groups';
import { jsonBody, useApiRequest } from './useApiRequest';
import { uploadGroupImage, useGroup, useGroupList } from './useGroups';

export interface OrgCreateInput {
  name: string;
  contact_email?: string;
  website?: string;
  description?: string;
  avatarFile?: File | null;
  bannerFile?: File | null;
}

export interface OrgCreateResult {
  org: GroupResponse;
  imagesFailed: boolean;
}

export function useMyInvitations() {
  const request = useApiRequest();

  const [invitations, setInvitations] = useState<MyInvitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);

  const refreshInvitations = useCallback(async () => {
    try {
      const response = await request('/me/invitations');
      if (!response) return;
      const data: MyInvitation[] = await response.json();
      setInvitations(data.filter((inv) => inv.group_type === 'organization'));
    } catch {
    } finally {
      setLoadingInvitations(false);
    }
  }, [request]);

  useEffect(() => {
    refreshInvitations();
  }, [refreshInvitations]);

  const respondToInvitation = useCallback(
    async (invitation: MyInvitation, action: 'accept' | 'decline') => {
      const response = await request(
        `/me/invitations/${invitation.token}/${action}`,
        { method: 'POST' },
      );
      if (!response) return false;
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id));
      return true;
    },
    [request],
  );

  return {
    invitations,
    loadingInvitations,
    refreshInvitations,
    respondToInvitation,
  };
}

export function useOrganizations() {
  const request = useApiRequest();
  const { groups, loading, loadError, submitting, refresh, createGroup } =
    useGroupList('organization');

  const createOrganization = useCallback(
    async (
      input: OrgCreateInput,
      onCreated?: (created: GroupResponse) => void,
    ): Promise<OrgCreateResult | null> => {
      const { avatarFile, bannerFile, ...fields } = input;
      const created = await createGroup(fields);
      if (!created) return null;
      onCreated?.(created);

      if (!avatarFile && !bannerFile)
        return { org: created, imagesFailed: false };
      try {
        if (avatarFile)
          await uploadGroupImage(request, created.id, 'avatar', avatarFile);
        if (bannerFile)
          await uploadGroupImage(request, created.id, 'banner', bannerFile);
      } catch {
        return { org: created, imagesFailed: true };
      }
      // Pick up the uploaded images in the list
      await refresh();
      return { org: created, imagesFailed: false };
    },
    [createGroup, refresh, request],
  );

  return {
    organizations: groups,
    loading,
    loadError,
    submitting,
    refresh,
    createOrganization,
  };
}

export function useOrganization(id: string) {
  const request = useApiRequest();
  const { group, remove, groupRequest, refresh, canManage, ...rest } = useGroup(
    id,
    'organization',
  );

  const [invitations, setInvitations] = useState<Invitation[]>([]);


  const refreshInvitations = useCallback(async () => {
    if (!canManage) return;
    try {
      const response = await groupRequest('/invitations');
      if (response) setInvitations(await response.json());
    } catch {
    }
  }, [groupRequest, canManage]);

  /** Invites someone by email. The result says whether they have an account. */
  const invite = useCallback(
    async (email: string, role: MemberRole) => {
      const response = await groupRequest(
        '/invitations',
        jsonBody({ email, role }),
      );
      if (!response) return null;
      const created: { recipient_exists?: boolean } = await response.json();
      await refreshInvitations();
      return created;
    },
    [groupRequest, refreshInvitations],
  );

  const cancelInvitation = useCallback(
    async (invitationId: string) => {
      const response = await groupRequest(`/invitations/${invitationId}`, {
        method: 'DELETE',
      });
      if (!response) return false;
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
      return true;
    },
    [groupRequest],
  );

  const uploadImage = useCallback(
    async (kind: 'avatar' | 'banner', file: File) => {
      const response = await uploadGroupImage(request, id, kind, file);
      if (!response) return false;
      await refresh();
      return true;
    },
    [request, id, refresh],
  );

  return {
    organization: group,
    canManage,
    invitations,
    refresh,
    refreshInvitations,
    invite,
    cancelInvitation,
    uploadImage,
    deleteOrganization: remove,
    ...rest,
  };
}
