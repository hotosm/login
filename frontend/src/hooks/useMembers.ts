import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { GroupMember, MemberRole, MembersResponse } from '../types/groups';
import { backendUrl } from '../utils/api';
import { jsonBody, useApiRequest } from './useApiRequest';

export const MEMBERS_PAGE_SIZE = 20;

/** Display name for a member, falling back to email then id. */
export function memberName(member: GroupMember) {
  const full = `${member.first_name || ''} ${member.last_name || ''}`.trim();
  return full || member.email || member.hanko_user_id;
}

/**
 * An action held back until the viewer confirms it. `kind` is what the panel
 * keys its dialog copy off; the payload is what `confirmPending` replays.
 */
export type PendingMemberAction =
  | { kind: 'transferOwnership'; member: GroupMember; role: MemberRole }
  | { kind: 'leave'; member: GroupMember }
  | { kind: 'remove'; member: GroupMember };


export function useMembers(
  groupId: string,
  viewerRole: MemberRole | null,
  onLeft: () => void,
  onViewerRoleChanged?: () => void,
) {
  const request = useApiRequest();

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingMemberAction | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await request(
        `/groups/${groupId}/members?page=${page}&page_size=${MEMBERS_PAGE_SIZE}`,
      );
      if (!response) return;
      const data: MembersResponse = await response.json();
      setMembers(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [request, groupId, page]);

  useEffect(() => {
    refresh();
  }, [refresh]);


  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await fetch(`${backendUrl}/profile/me`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUserId(data.hanko_user_id || null);
        }
      } catch {
        // Non-critical
      }
    };
    fetchMe();
  }, []);

  const changeRole = useCallback(
    async (member: GroupMember, role: MemberRole) => {
      try {
        const response = await request(
          `/groups/${groupId}/members/${member.hanko_user_id}`,
          jsonBody({ role }, 'PATCH'),
        );
        if (!response) return false;
        await refresh();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'An error occurred');
        return false;
      }
    },
    [request, groupId, refresh],
  );


  const removeMember = useCallback(
    async (member: GroupMember) => {
      try {
        const response = await request(
          `/groups/${groupId}/members/${member.hanko_user_id}`,
          { method: 'DELETE' },
        );
        if (!response) return false;
        if (member.hanko_user_id !== currentUserId) await refresh();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'An error occurred');
        return false;
      }
    },
    [request, groupId, currentUserId, refresh],
  );

  const isSelf = useCallback(
    (member: GroupMember) => member.hanko_user_id === currentUserId,
    [currentUserId],
  );

  const selfRole =
    members.find((member) => member.hanko_user_id === currentUserId)?.role ??
    viewerRole;


  const requestRoleChange = useCallback(
    (member: GroupMember, role: MemberRole) => {
      if (role === member.role) return;
      if (role === 'owner') {
        setPending({ kind: 'transferOwnership', member, role });
        return;
      }
      changeRole(member, role);
    },
    [changeRole],
  );

  const requestRemove = useCallback(
    (member: GroupMember) => {
      setPending({ kind: isSelf(member) ? 'leave' : 'remove', member });
    },
    [isSelf],
  );

  const confirmPending = useCallback(async () => {
    if (!pending) return;
    setBusy(true);
    try {
      if (pending.kind === 'transferOwnership') {
        // Demotes the viewer to manager, so the page's group copy is now wrong
        if (await changeRole(pending.member, pending.role)) {
          onViewerRoleChanged?.();
        }
      } else if (await removeMember(pending.member)) {
        // Navigates away, so this must be the last thing the panel does
        if (pending.kind === 'leave') onLeft();
      }
    } finally {
      setBusy(false);
      setPending(null);
    }
  }, [pending, changeRole, removeMember, onLeft, onViewerRoleChanged]);

  const cancelPending = useCallback(() => setPending(null), []);

  return {
    members,
    loading,
    page,
    setPage,
    totalPages: Math.ceil(total / MEMBERS_PAGE_SIZE),
    isSelf,
    canChangeRoles: selfRole === 'owner',
    canManage: selfRole === 'owner' || selfRole === 'manager',
    refresh,
    pending,
    busy,
    requestRoleChange,
    requestRemove,
    confirmPending,
    cancelPending,
  };
}
