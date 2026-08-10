import type { MemberLookupResult } from '@/components/TeamCreateForm';
import { useCallback } from 'react';
import type { MemberRole } from '../types/groups';
import { jsonBody, useApiRequest } from './useApiRequest';
import { useGroup, useGroupList } from './useGroups';

export interface TeamCreateInput {
  name: string;
  description?: string;
  member_emails: string[];
}

export function useTeams() {
  const request = useApiRequest();
  const { groups, loading, loadError, submitting, refresh, createGroup } =
    useGroupList('team');

  const lookupMember = useCallback(
    async (email: string): Promise<MemberLookupResult | null> => {
      const response = await request(
        `/users/lookup?email=${encodeURIComponent(email)}`,
      );
      if (!response) return null;
      const data = await response.json();
      return { exists: Boolean(data.exists), name: data.name ?? null };
    },
    [request],
  );

  const createTeam = useCallback(
    (input: TeamCreateInput) => createGroup({ ...input }),
    [createGroup],
  );

  return {
    teams: groups,
    loading,
    loadError,
    submitting,
    refresh,
    createTeam,
    lookupMember,
  };
}

export function useTeam(id: string) {
  const { group, remove, groupRequest, ...rest } = useGroup(id, 'team');

  const addMember = useCallback(
    async (email: string, role: MemberRole) => {
      const response = await groupRequest(
        '/members',
        jsonBody({ email, role }),
      );
      return Boolean(response);
    },
    [groupRequest],
  );

  return { team: group, deleteTeam: remove, addMember, ...rest };
}
