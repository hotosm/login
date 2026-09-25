import OrgRequestForm from '@/components/OrgRequestForm';
import type { OrgRequestPayload } from '@/components/OrgRequestForm';
import PanelHeader from '@/components/PanelHeader';
import { Tab, TabGroup } from '@/components/shared/Tabs';
import { useState } from 'react';
import { toast } from 'sonner';
import GroupCard from '../components/GroupCard';
import { useLanguage } from '../contexts/LanguageContext';
import { useErrorToast } from '../hooks/useGroups';
import { useOrganizations } from '../hooks/useOrgs';
import { useAllOrganizations } from '../hooks/usePendingOrgs';
import { useRoles } from '../hooks/useRoles';

type ListView = 'mine' | 'all';

function OrganizationsPage() {
  const { t } = useLanguage();
  const { organizations, loading, loadError, submitting, createOrganization } =
    useOrganizations();
  useErrorToast(loadError);

  const { isAccountManager } = useRoles();
  const [listView, setListView] = useState<ListView>('mine');
  const {
    organizations: allOrganizations,
    loading: allLoading,
    error: allError,
  } = useAllOrganizations(isAccountManager);
  useErrorToast(allError);

  const showingAll = isAccountManager && listView === 'all';
  const visibleOrganizations = showingAll ? allOrganizations : organizations;
  const listLoading = showingAll ? allLoading : loading;

  // Create/request form — field state lives in OrgRequestForm
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (payload: OrgRequestPayload) => {
    try {
      const result = await createOrganization(
        {
          name: payload.name,
          contact_email: payload.contactEmail || undefined,
          website: payload.website || undefined,
          description: payload.description || undefined,
          avatarFile: payload.avatarFile,
          bannerFile: payload.bannerFile,
        },
        // The org exists now — close the form before the image uploads so a
        // failed upload can't lead to a duplicate org on retry. Unmounting the
        // form is what clears the fields.
        () => setShowForm(false),
      );
      if (!result) return;
      if (result.imagesFailed) {
        toast.error(
          'Organization created, but the image upload failed — you can add it later from the org page.',
        );
      }
      toast.success(t('orgRequestSubmitted'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-hot-red-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Organizations list */}
      <div className="bg-white rounded-xl shadow-xl p-6 flex flex-col gap-lg">

      <PanelHeader sectionName={t('organizations')}  buttonText={t('requestOrganization')} buttonOnPress={() => setShowForm((v) => !v)} hideButton={showForm} />


      {/* Request organization form */}
      {showForm && (
        <div className='mb-xl'>
          <h2 className='text-lg mb-sx'>{t('requestOrgTitle')}</h2>
          <p className='text-sm mb-lg'>{t('requestOrgIntro')}</p>
          <OrgRequestForm
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            submitting={submitting}
          />
        </div>
      )}

      {/* My organizations / all organizations toggle (account managers only) */}
      {isAccountManager && (
        <TabGroup
          active={listView}
          onWaTabShow={(e) => setListView(e.detail.name as ListView)}
        >
          <Tab panel="mine">{t('myOrganizations')}</Tab>
          <Tab panel="all">{t('allOrganizations')}</Tab>
        </TabGroup>
      )}

      {/* panel content */}
      {listLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-hot-red-600 border-t-transparent"></div>
        </div>
      ) : visibleOrganizations.length === 0 ? (
        <p className="text-sm text-hot-gray-500 py-6 text-center">
          {t('noOrganizations')}
        </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visibleOrganizations.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                to={`/organizations/${group.id}`}
                showStatus
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

}

export default OrganizationsPage;
