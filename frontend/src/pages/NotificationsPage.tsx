import ConfirmDialog from '@/components/ConfirmDialog';
import PanelHeader from '@/components/PanelHeader';
import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../hooks/useNotifications';
import { useMyInvitations } from '../hooks/useOrgs';
import type { MyInvitation } from '../types/groups';
import type { AppNotification } from '../types/notifications';
import Button from '@/components/shared/Button';

type Translate = ReturnType<typeof useLanguage>['t'];

// The templates carry {placeholder}s that t() fills in from its params.
const messageFor = (n: AppNotification, t: Translate): string => {
  const d = n.data ?? {};
  switch (n.type) {
    case 'org_approved':
      return t('notifOrgApproved', { name: d.group_name ?? '' });
    case 'org_rejected':
      return t('notifOrgRejected', { name: d.group_name ?? '' });
    case 'org_name_approved':
      return t('notifOrgNameApproved', {
        name: d.new_name ?? d.group_name ?? '',
      });
    case 'org_name_rejected':
      return t('notifOrgNameRejected', { name: d.rejected_name ?? '' });
    case 'team_member_joined':
      return t('notifTeamMemberJoined', { name: d.group_name ?? '' });
    case 'team_member_left':
      return t('notifTeamMemberLeft', {
        member: d.member_name ?? t('aMember'),
        team: d.group_name ?? '',
      });
    case 'member_left':
      return t('notifMemberLeft', {
        member: d.member_name ?? t('aMember'),
        name: d.group_name ?? '',
      });
    case 'member_removed':
      return t('notifMemberRemoved', { name: d.group_name ?? '' });
    case 'org_invite_accepted':
      return t('notifOrgInviteAccepted', {
        member: d.member_name ?? t('aMember'),
        name: d.group_name ?? '',
      });
    case 'org_invite_declined':
      return t('notifOrgInviteDeclined', {
        member: d.member_name ?? t('aMember'),
        name: d.group_name ?? '',
      });
    case 'org_invite_response_self':
      return d.response === 'declined'
        ? t('notifInviteDeclinedSelf', { name: d.group_name ?? '' })
        : t('notifInviteAcceptedSelf', { name: d.group_name ?? '' });
    default:
      return '';
  }
};

function NotificationRow({
  notification,
  onRead,
}: {
  notification: AppNotification;
  onRead: () => void;
}) {
  const { t } = useLanguage();
  const unread = notification.read_at === null;
  const rowClass = `py-3 pl-3 border-l-2 break-words ${
    unread ? 'border-hot-red-600' : 'border-transparent text-hot-gray-500'
  }`;
  const body = (
    <>
      <p className={unread ? 'font-medium' : undefined}>
        {messageFor(notification, t)}
      </p>
      {notification.type === 'org_rejected' && notification.data?.reason && (
        <p className="text-xs text-hot-gray-500">
          {t('rejectReason')}: {notification.data.reason}
        </p>
      )}
      <p className="text-xs text-hot-gray-500">
        {new Date(notification.created_at).toLocaleString()}
      </p>
    </>
  );

  if (!unread) return <div className={rowClass}>{body}</div>;

  return (
    <div className={`${rowClass} relative hover:bg-hot-gray-50`}>
      {body}
      <button
        type="button"
        className="absolute inset-0 cursor-pointer"
        aria-label={t('markRead')}
        onClick={onRead}
      />
    </div>
  );
}

function NotificationsPage() {
  const { t } = useLanguage();
  const { invitations, loadingInvitations, respondToInvitation } =
    useMyInvitations();
  const { notifications, unreadCount, loading, markRead, markAllRead } =
    useNotifications();
  const [confirmDecline, setConfirmDecline] = useState<MyInvitation | null>(
    null,
  );
  const [responding, setResponding] = useState(false);

  const handleRespond = async (
    invitation: MyInvitation,
    action: 'accept' | 'decline',
  ) => {
    setResponding(true);
    try {
      if (await respondToInvitation(invitation, action)) {
        toast.success(
          action === 'accept' ? t('inviteAccepted') : t('inviteDeclined'),
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setResponding(false);
      setConfirmDecline(null);
    }
  };

  if (loadingInvitations || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-hot-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-xl shadow-xl p-6">
        <PanelHeader
          sectionName={t('notifications')}
          buttonText={t('markAllRead')}
          buttonOnPress={() => markAllRead()}
          hideButton={unreadCount === 0}
        />

        {notifications.length === 0 && invitations.length === 0 ? (
          <p className="text-sm text-hot-gray-500 py-6 text-center">
            {t('noNotifications')}
          </p>
        ) : (
          <div className="divide-y divide-hot-gray-200">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between py-3 gap-3"
              >
                <div>
                  <p>
                    {inv.group_name}
                  </p>
                  <p className="text-xs text-hot-gray-500">
                    {t('invitedToJoin')} {inv.role}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={responding}
                    onClick={() => handleRespond(inv, 'accept')}
                  >
                    {t('accept')}
                  </Button>
                  <Button
                    appearance='outlined'
                    variant='danger'
                    disabled={responding}
                    onClick={() => setConfirmDecline(inv)}
                  >
                    {t('decline')}
                  </Button>
                </div>
              </div>
            ))}
            {notifications.map((n) => (
              <NotificationRow
                key={n.id}
                notification={n}
                onRead={() => markRead(n.id)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDecline !== null}
        label={t('declineInviteTitle')}
        message={t('declineInviteConfirm')}
        confirmText={t('decline')}
        danger
        busy={responding}
        onConfirm={() => {
          if (confirmDecline) handleRespond(confirmDecline, 'decline');
        }}
        onCancel={() => setConfirmDecline(null)}
      />
    </div>
  );
}

export default NotificationsPage;
