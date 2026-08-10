import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import type { GroupMember, MemberRole, MembersResponse } from '../types/groups';
import { backendUrl, readError } from '../utils/api';

const PAGE_SIZE = 20;

interface MembersPanelProps {
  groupId: string;
  // The viewer's role in this group (from GroupResponse.role)
  viewerRole: MemberRole | null;
  // Called after the current user leaves the group
  onLeft: () => void;
  // Renders the add/invite UI (differs between teams and organizations).
  // Receives a callback to refresh the member list after a change.
  renderAdd?: (onChanged: () => void) => ReactNode;
}

// Member list with role management shared by team and organization detail pages.
function MembersPanel({
  groupId,
  viewerRole,
  onLeft,
  renderAdd,
}: MembersPanelProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const canChangeRoles = viewerRole === 'owner';
  const canManage = viewerRole === 'owner' || viewerRole === 'manager';

  const goLogin = useCallback(() => {
    navigate('/?return_to=' + encodeURIComponent(window.location.href));
  }, [navigate]);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch(
        `${backendUrl}/groups/${groupId}/members?page=${page}&page_size=${PAGE_SIZE}`,
        { credentials: 'include' },
      );
      if (response.status === 401) return goLogin();
      if (!response.ok) throw new Error(await readError(response));
      const data: MembersResponse = await response.json();
      setMembers(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [groupId, page, goLogin]);

  // Identify the current user to show "Leave" and hide self-targeted actions
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

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleChangeRole = async (member: GroupMember, role: MemberRole) => {
    if (role === member.role) return;
    if (role === 'owner' && !window.confirm(t('transferOwnershipConfirm')))
      return;
    try {
      const response = await fetch(
        `${backendUrl}/groups/${groupId}/members/${member.hanko_user_id}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role }),
        },
      );
      if (response.status === 401) return goLogin();
      if (!response.ok) throw new Error(await readError(response));
      await fetchMembers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleRemove = async (member: GroupMember, isSelf: boolean) => {
    const confirmMsg = isSelf ? t('leaveGroupConfirm') : t('removeMemberConfirm');
    if (!window.confirm(confirmMsg)) return;
    try {
      const response = await fetch(
        `${backendUrl}/groups/${groupId}/members/${member.hanko_user_id}`,
        { method: 'DELETE', credentials: 'include' },
      );
      if (response.status === 401) return goLogin();
      if (!response.ok) throw new Error(await readError(response));
      if (isSelf) {
        onLeft();
      } else {
        await fetchMembers();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const memberName = (m: GroupMember) => {
    const full = `${m.first_name || ''} ${m.last_name || ''}`.trim();
    return full || m.email || m.hanko_user_id;
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {canManage && renderAdd && renderAdd(fetchMembers)}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-hot-red-600 border-t-transparent"></div>
        </div>
      ) : members.length === 0 ? (
        <p className="text-sm text-hot-gray-500 py-6 text-center">
          {t('noMembers')}
        </p>
      ) : (
        <div className="divide-y divide-hot-gray-200">
          {members.map((member) => {
            const isSelf = member.hanko_user_id === currentUserId;
            return (
              <div
                key={member.hanko_user_id}
                className="flex items-center justify-between py-3 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={
                      member.picture_url ||
                      'https://www.gravatar.com/avatar/?d=identicon&s=64'
                    }
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border border-hot-gray-200 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-hot-gray-900 truncate">
                      {memberName(member)}
                    </p>
                    <p className="text-xs text-hot-gray-400">
                      {t('memberSince')}{' '}
                      {new Date(member.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {canChangeRoles && !isSelf ? (
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleChangeRole(member, e.target.value as MemberRole)
                      }
                      className="text-xs border border-hot-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:border-hot-red-400"
                    >
                      <option value="member">{t('roleMember')}</option>
                      <option value="manager">{t('roleManager')}</option>
                      <option value="owner">{t('roleOwner')}</option>
                    </select>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded bg-hot-gray-100 text-hot-gray-600">
                      {member.role === 'owner'
                        ? t('roleOwner')
                        : member.role === 'manager'
                          ? t('roleManager')
                          : t('roleMember')}
                    </span>
                  )}

                  {isSelf ? (
                    <button
                      type="button"
                      onClick={() => handleRemove(member, true)}
                      className="btn-secondary-small"
                    >
                      {t('leaveGroup')}
                    </button>
                  ) : (
                    canManage && (
                      <button
                        type="button"
                        onClick={() => handleRemove(member, false)}
                        className="btn-danger-small"
                      >
                        {t('removeMember')}
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="btn-secondary-small disabled:opacity-50"
          >
            {t('previous')}
          </button>
          <span className="text-sm text-hot-gray-500">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
            className="btn-secondary-small disabled:opacity-50"
          >
            {t('next')}
          </button>
        </div>
      )}
    </div>
  );
}

export default MembersPanel;
