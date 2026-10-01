import OrgNameChangeReviewForm from '@/components/OrgNameChangeReviewForm';
import OrgReviewForm from '@/components/OrgReviewForm';
import PanelHeader from '@/components/PanelHeader';
import Button from '@/components/shared/Button';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import StatusBadge from '../components/shared/StatusBadge';
import { useLanguage } from '../contexts/LanguageContext';
import { useManagedOrganizations } from '../hooks/useManagedOrganizations';
import { useRoles } from '../hooks/useRoles';
import type { GroupResponse } from '../types/groups';

// Organization requests awaiting moderation, plus every other organization for
// account managers/admins to search, view and manage. Same capability as the
// admin console's Organizations tab, but inside the account area: one panel,
// and each pending org is reviewed in a block that expands under its own row
// (no modals).
function OrgsToApprovePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAdmin, isAccountManager, loading: rolesLoading } = useRoles();
  const canModerate = isAdmin || isAccountManager;

  const {
    organizations,
    totalPages,
    page,
    goToPage,
    search,
    runSearch,
    loading,
    error,
    unauthorized,
    approve,
    reject,
    approveName,
    rejectName,
  } = useManagedOrganizations(canModerate);

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (unauthorized) {
      navigate('/?return_to=' + encodeURIComponent(window.location.href));
    }
  }, [unauthorized, navigate]);

  // The list load failure comes from the hook
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const needsReview = (org: GroupResponse) =>
    org.status === 'pending' || !!org.pending_name;

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

        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('searchOrganizationsPlaceholder')}
            className="flex-1 px-3 py-2 text-sm border border-hot-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hot-red-100 focus:border-hot-red-400"
          />
          <Button
            appearance="outlined"
            type="button"
            disabled={loading}
            onClick={() => runSearch(searchInput)}
          >
            {t('searchBtn')}
          </Button>
        </div>

        {organizations.length === 0 ? (
          <p className="text-sm text-hot-gray-500 py-6 text-center">
            {search ? t('noSearchResults') : t('noPendingOrgs')}
          </p>
        ) : (
          <div className="divide-y divide-hot-gray-200">
            {organizations.map((org) => (
              <div key={org.id}>
                <div className="flex items-center justify-between py-3 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
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
                    {needsReview(org) ? (
                      <Button
                        appearance="outlined"
                        type="button"
                        onClick={() =>
                          setReviewingId((id) =>
                            id === org.id ? null : org.id,
                          )
                        }
                      >
                        {reviewingId === org.id ? t('close') : t('review')}
                      </Button>
                    ) : (
                      <Button
                        appearance="outlined"
                        type="button"
                        onClick={() => navigate(`/organizations/${org.id}`)}
                      >
                        {t('viewDetailsBtn')}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Review block for this org — replaces the admin console's modal */}
                {reviewingId === org.id && (
                  <div className="mb-xl">
                    {org.pending_name ? (
                      <OrgNameChangeReviewForm
                        org={org}
                        submitting={submitting}
                        onCancel={() => setReviewingId(null)}
                        onApproveName={() =>
                          runAction(
                            () => approveName(org.id),
                            t('orgNameApproved'),
                          )
                        }
                        onRejectName={() =>
                          runAction(
                            () => rejectName(org.id),
                            t('orgNameRejected'),
                          )
                        }
                      />
                    ) : (
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
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
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
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="btn-secondary-small disabled:opacity-50"
            >
              {t('next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrgsToApprovePage;
