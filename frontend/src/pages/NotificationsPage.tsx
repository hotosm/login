import ConfirmDialog from '@/components/ConfirmDialog';
import PanelHeader from '@/components/PanelHeader';
import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { useMyInvitations } from '../hooks/useOrgs';
import type { MyInvitation } from '../types/groups';
import Button from '@/components/shared/Button';

function NotificationsPage() {
  const { t } = useLanguage();
  const { invitations, loadingInvitations, respondToInvitation } =
    useMyInvitations();
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

  if (loadingInvitations) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-hot-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-xl shadow-xl p-6">
        <PanelHeader sectionName={t('notifications')} />

        {invitations.length === 0 ? (
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
