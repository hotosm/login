import { type ReactNode, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  type PendingMemberAction,
  memberName,
  useMembers,
} from '../hooks/useMembers';
import type { MemberRole } from '../types/groups';
import { ROLE_OPTIONS, roleLabels } from '../utils/roles';
import ConfirmDialog from './ConfirmDialog';
import Button from './shared/Button';
import Dropdown from './shared/Dropdown';
import DropdownItem from './shared/DropdownItem';

interface MembersPanelProps {
  groupId: string;
  viewerRole: MemberRole | null;
  onLeft: () => void;
  onViewerRoleChanged?: () => void;
  renderAdd?: (onChanged: () => void) => ReactNode;
}

function MembersPanel({
  groupId,
  viewerRole,
  onLeft,
  onViewerRoleChanged,
  renderAdd,
}: MembersPanelProps) {
  const { t } = useLanguage();

  const {
    members,
    loading,
    page,
    setPage,
    totalPages,
    isSelf,
    canChangeRoles,
    canManage,
    refresh,
    pending,
    busy,
    requestRoleChange,
    requestRemove,
    confirmPending,
    cancelPending,
  } = useMembers(groupId, viewerRole, onLeft, onViewerRoleChanged);

  // Used for both the role dropdown and the read-only role badge
  const labels = roleLabels(t);

  // confirmation dialogs texts
  const confirmCopy: Record<
    PendingMemberAction['kind'],
    { label: string; message: string; confirmText: string }
  > = {
    transferOwnership: {
      label: t('transferOwnershipConfirm'),
      message: t('transferOwnershipDetail'),
      confirmText: t('transferOwnershipBtn'),
    },
    leave: {
      label: t('leaveGroupConfirm'),
      message: t('leaveGroupDetail'),
      confirmText: t('leaveGroup'),
    },
    remove: {
      label: t('removeMemberConfirm'),
      message: t('removeMemberDetail'),
      confirmText: t('removeMember'),
    },
  };

  const lastKind = useRef<PendingMemberAction['kind']>('remove');
  if (pending) lastKind.current = pending.kind;

  return (
    <div className="space-y-4">
      {canManage && renderAdd && renderAdd(refresh)}

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
            const self = isSelf(member);
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
                  {canChangeRoles && !self ? (
                    <Dropdown
                      size="small"
                      onSelect={(e) => {
                        const { value } = e.detail.item as HTMLElement & {
                          value?: string;
                        };
                        if (value)
                          requestRoleChange(member, value as MemberRole);
                      }}
                    >
                      <Button
                        slot="trigger"
                        size="small"
                        appearance="outlined"
                        withCaret
                      >
                        {labels[member.role]}
                      </Button>
                      {ROLE_OPTIONS.map((role) => (
                        <DropdownItem
                          key={role}
                          value={role}
                          type="checkbox"
                          checked={member.role === role}
                        >
                          {labels[role]}
                        </DropdownItem>
                      ))}
                    </Dropdown>
                  ) : (
                    <span className="text-white font-semibold bg-hot-neutral-800 rounded-xl px-xs py-2xs">
                      {labels[member.role]}
                    </span>
                  )}

                  {self ? (
                   <Button
                      appearance="outlined"
                      size='small'
                      variant='danger'
                      onClick={() => requestRemove(member)}
                    >
                      {t('leaveGroup')}
                    </Button>
                  ) : (
                    canManage && (
                      <Button
                        appearance="outlined"
                        size='small'
                        onClick={() => requestRemove(member)}
                        variant='danger'
                      >
                        {t('removeMember')}
                      </Button>
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

      <ConfirmDialog
        open={pending !== null}
        {...confirmCopy[lastKind.current]}
        danger
        busy={busy}
        onConfirm={confirmPending}
        onCancel={cancelPending}
      />
    </div>
  );
}

export default MembersPanel;
