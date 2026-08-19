import Button from '@/components/shared/Button';
import OrgReviewForm from '@/components/OrgReviewForm';
import PanelHeader from '@/components/PanelHeader';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import StatusBadge from '../components/shared/StatusBadge';
import { useLanguage } from '../contexts/LanguageContext';
import { usePendingOrgs } from '../hooks/usePendingOrgs';
import { useRoles } from '../hooks/useRoles';

// Organization requests awaiting moderation. Same capability as the admin
// console's Organizations tab, but inside the account area: one panel, and each
// org is reviewed in a block that expands under its own row (no modals).
function OrgsToApprovePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAdmin, isAccountManager, loading: rolesLoading } = useRoles();
  const canModerate = isAdmin || isAccountManager;

  const {
    pendingOrgs,
    loading,
    error,
    unauthorized,
    approve,
    reject,
    approveName,
  } = usePendingOrgs(canModerate);

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (unauthorized) {
      navigate('/?return_to=' + encodeURIComponent(window.location.href));
    }
  }, [unauthorized, navigate]);

  // The list load failure comes from the hook
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Every action closes the review block and reports through a toast
  const runAction = async (action: () => Promise<void>, message: string) => {
    setSubmitting(true);
    try {
      await action();
      setReviewingId(null);
      toast.success(message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (rolesLoading || (canModerate && loading)) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-hot-red-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!canModerate) {
    return (
      <div className="bg-white rounded-xl shadow-xl p-6">
        <PanelHeader sectionName={t('orgsToApprove')} />
        <p className="text-sm text-hot-gray-500 py-6 text-center">
          {t('orgsToApproveNoAccess')}{' '}
          <Link to="/profile" className="text-hot-red-600 hover:underline">
            {t('navProfile')}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-xl shadow-xl p-6 flex flex-col gap-lg">
        <PanelHeader sectionName={t('orgsToApprove')} />

        {pendingOrgs.length === 0 ? (
          <p className="text-sm text-hot-gray-500 py-6 text-center">
            {t('noPendingOrgs')}
          </p>
        ) : (
          <div className="divide-y divide-hot-gray-200">
            {pendingOrgs.map((org) => (
              <div key={org.id}>
                <div className="flex items-center justify-between py-3 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {org.avatar_url ? (
                      <img
                        src={org.avatar_url}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-hot-gray-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-hot-gray-100 text-hot-gray-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {org.name[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-hot-gray-900 truncate">
                        {org.name}
                      </p>
                      <p className="text-xs text-hot-gray-500 truncate">
                        {org.contact_email ? `${org.contact_email} · ` : ''}
                        {t('requestedOn')}{' '}
                        {new Date(org.created_at).toLocaleDateString()}
                      </p>
                      {org.pending_name && (
                        <p className="text-xs text-hot-gray-500 truncate">
                          {t('nameChangePending')}: {org.pending_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={org.status} />
                    <Button
                      appearance="outlined"
                      type="button"
                      onClick={() =>
                        setReviewingId((id) => (id === org.id ? null : org.id))
                      }
                    >
                      {reviewingId === org.id ? t('close') : t('review')}
                    </Button>
                  </div>
                </div>

                {/* Review block for this org — replaces the admin console's modal */}
                {reviewingId === org.id && (
                  <div className="mb-xl">
                    <OrgReviewForm
                      org={org}
                      submitting={submitting}
                      onCancel={() => setReviewingId(null)}
                      onApprove={() =>
                        runAction(() => approve(org.id), t('orgApproved'))
                      }
                      onReject={(reason) =>
                        runAction(
                          () => reject(org.id, reason.trim() || undefined),
                          t('orgRejected'),
                        )
                      }
                      onApproveName={() =>
                        runAction(
                          () => approveName(org.id),
                          t('orgNameApproved'),
                        )
                      }
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrgsToApprovePage;
