import OrgNameChangeReviewForm from '@/components/OrgNameChangeReviewForm';
import OrgReviewForm from '@/components/OrgReviewForm';
import PanelHeader from '@/components/PanelHeader';
import Input from '@/components/forms/Input';
import Button from '@/components/shared/Button';
import Pagination from '@/components/shared/Pagination';
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
    setPage,
    query,
    setQuery,
    searchNow,
    debouncedQuery,
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

  const searchTerm = debouncedQuery.trim();

  // Full-page spinner only for the first load; later searches and page changes
  // keep the current list on screen and just mark it busy.
  if (
    rolesLoading ||
    (canModerate && loading && organizations.length === 0 && !searchTerm)
  ) {
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

        <Input
          type="search"
          label={t('searchOrganizationsLabel')}
          placeholder={t('searchOrganizationsPlaceholder')}
          withClear
          value={query}
          onValueChange={setQuery}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              searchNow();
            }
          }}
        />

        {organizations.length === 0 ? (
          <p className="text-sm text-hot-gray-500 py-6 text-center">
            {searchTerm
              ? t('noSearchResults', { query: searchTerm })
              : t('noManagedOrganizations')}
          </p>
        ) : (
          <div
            aria-busy={loading}
            className={`divide-y divide-hot-gray-200 transition-opacity ${loading ? 'opacity-60' : ''}`}
          >
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
                          {t('proposedName')}: {org.pending_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={org.status} />
                    {org.status === 'approved' && org.pending_name && (
                      <StatusBadge status="pending_name" />
                    )}
                    {needsReview(org) && (
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
                    )}
                    <Button
                      appearance="outlined"
                      type="button"
                      onClick={() => navigate(`/organizations/${org.id}`)}
                    >
                      {t('editBtn')}
                    </Button>
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
          <div className="flex justify-center pt-2">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default OrgsToApprovePage;
