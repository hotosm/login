import AddMemberForm from '@/components/AddMemberForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import GroupNameField from '@/components/GroupNameField';
import Breadcrumb from '@/components/shared/Breadcrumb';
import BreadcrumbItem from '@/components/shared/BreadcrumbItem';
import Button from '@/components/shared/Button';
import ErrorBanner from '@/components/shared/ErrorBanner';
import Icon from '@/components/shared/Icon';
import Spinner from '@/components/shared/Spinner';
import { Tab, TabGroup, TabPanel } from '@/components/shared/Tabs';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import MembersPanel from '../components/MembersPanel';
import StatusBadge from '../components/shared/StatusBadge';
import { useLanguage } from '../contexts/LanguageContext';
import { useOrganization } from '../hooks/useOrgs';

type TabName = 'details' | 'members';

const panelStyle = { '--padding': '0' } as React.CSSProperties;

function OrganizationDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const {
    organization: org,
    loading,
    loadError,
    saving,
    deleting,
    canManage,
    canDelete,
    listPath,
    invitations,
    refresh,
    refreshInvitations,
    updateDetails,
    changeName,
    uploadImage,
    invite,
    cancelInvitation,
    deleteOrganization,
  } = useOrganization(id);

  const [activeTab, setActiveTab] = useState<TabName>('details');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // The pencils over the banner and avatar open these hidden pickers
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Editable details form, seeded from the loaded organization
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (!org) return;
    setDescription(org.description || '');
    setContactEmail(org.contact_email || '');
    setWebsite(org.website || '');
    setIsPublic(org.is_public);
  }, [org]);

  useEffect(() => {
    if (activeTab === 'members') refreshInvitations();
  }, [activeTab, refreshInvitations]);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateDetails({
        description: description || null,
        contact_email: contactEmail || null,
        website: website || null,
        is_public: isPublic,
      });
      if (updated) toast.success(t('detailsSaved'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleUpload = async (kind: 'avatar' | 'banner', file: File) => {
    try {
      await uploadImage(kind, file);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async () => {
    try {
      if (await deleteOrganization()) {
        // The Toaster is mounted above the router, so this survives the redirect
        toast.success(t('orgDeleted'));
        return;
      }
      setConfirmDelete(false);
    } catch (err) {
      setConfirmDelete(false);
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCancelInvite = async (invId: string) => {
    if (!window.confirm(t('cancelInviteConfirm'))) return;
    try {
      await cancelInvitation(invId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) return <Spinner />;

  if (!org) {
    return (
      <div>
        <ErrorBanner>{loadError || 'Not found'}</ErrorBanner>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl p-6">
      <div>
        <Breadcrumb>
          <BreadcrumbItem onClick={() => navigate(listPath)}>
            {t('navOrganizations')}
          </BreadcrumbItem>
          <BreadcrumbItem>{org.name}</BreadcrumbItem>
        </Breadcrumb>
        <div className="relative">
          <div
            className="h-[200px] bg-hot-gray-100 bg-cover bg-center"
            style={
              org.banner_url
                ? { backgroundImage: `url(${org.banner_url})` }
                : undefined
            }
          />
          {canManage && (
            <>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  // Clear it so picking the same file again still fires a change
                  e.target.value = '';
                  if (file) handleUpload('banner', file);
                }}
              />
              <Button
                appearance="filled"
                size="small"
                pill
                title={t('changeBanner')}
                className="absolute top-2 right-2"
                onClick={() => bannerInputRef.current?.click()}
              >
                <Icon name="pencil" label={t('changeBanner')} />
              </Button>
            </>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative -mt-12 z-10">
              <img
                src={
                  org.avatar_url ||
                  'https://www.gravatar.com/avatar/?d=identicon&s=96'
                }
                alt=""
                className="w-24 h-24 rounded-full object-cover border-2 border-white shadow bg-white"
              />
              {canManage && (
                <>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      // Clear it so picking the same file again still fires a change
                      e.target.value = '';
                      if (file) handleUpload('avatar', file);
                    }}
                  />
                  <Button
                    appearance="filled"
                    size="small"
                    pill
                    title={t('changeAvatar')}
                    className="absolute bottom-0 right-0"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Icon name="pencil" label={t('changeAvatar')} />
                  </Button>
                </>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-semibold text-hot-gray-900">
                  {org.name}
                </h1>
                <StatusBadge status={org.status} />
              </div>
              {org.pending_name && (
                <p className="text-xs text-hot-gray-500 mt-1">
                  {t('nameChangePending')}: {org.pending_name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TabGroup
        active={activeTab}
        onWaTabShow={(e) => setActiveTab(e.detail.name as TabName)}
      >
        <Tab panel="details">{t('detailsTab')}</Tab>
        <Tab panel="members">
          {t('membersTab')} ({org.members_count})
        </Tab>

        <TabPanel name="details" style={panelStyle}>
          <div className="pt-xl space-y-6">
            <GroupNameField
              name={org.name}
              canManage={canManage}
              onChangeName={changeName}
              pendingName={org.pending_name}
            />

            {canManage ? (
              <form onSubmit={handleSaveDetails} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                    {t('contactEmail')}
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                    {t('website')}
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                    {t('description')}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="input-field"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {canDelete && (
                    <Button
                      appearance="outlined"
                      variant="danger"
                      onClick={() => setConfirmDelete(true)}
                    >
                      {t('deleteGroupBtn')}
                    </Button>
                  )}
                  <Button type="submit" disabled={saving}>
                    {saving ? t('saving') : t('saveChanges')}
                  </Button>
                </div>
              </form>
            ) : (
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-hot-gray-700">
                    {t('contactEmail')}
                  </dt>
                  <dd className="text-hot-gray-600">
                    {org.contact_email || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-hot-gray-700">
                    {t('website')}
                  </dt>
                  <dd className="text-hot-gray-600">{org.website || '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-hot-gray-700">
                    {t('description')}
                  </dt>
                  <dd className="text-hot-gray-600 whitespace-pre-line">
                    {org.description || '—'}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </TabPanel>

        <TabPanel name="members" style={panelStyle}>
          {activeTab === 'members' && (
            <div className="pt-xl space-y-6">
              <MembersPanel
                groupId={id}
                viewerRole={org.role}
                onLeft={() => navigate(listPath)}
                onViewerRoleChanged={refresh}
                renderAdd={(onChanged) =>
                  org.status !== 'approved' ? (
                    <div className="text-sm text-hot-gray-500 bg-hot-gray-50 border border-hot-gray-200 rounded-lg px-3 py-2 mb-2">
                      You can invite members once this organization is approved.
                    </div>
                  ) : (
                    <AddMemberForm
                      submitLabel={t('inviteBtn')}
                      onSubmit={async (email, role) => {
                        const created = await invite(email, role);
                        if (!created) return false;
                        toast.success(
                          created.recipient_exists === false
                            ? `Invitation sent to ${email}. They don't have a HOT account yet — they'll need to sign up to accept.`
                            : `Invitation sent to ${email}.`,
                          // The no-account case is a long sentence worth reading
                          { duration: 8000 },
                        );
                        onChanged();
                        return true;
                      }}
                    >
                      {invitations.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-hot-gray-500 mb-2">
                            {t('sentInvitations')}
                          </h3>
                          <div className="divide-y divide-hot-gray-100">
                            {invitations.map((inv) => (
                              <div
                                key={inv.id}
                                className="flex items-center justify-between py-2 text-sm"
                              >
                                <span className="text-hot-gray-700">
                                  {inv.email}{' '}
                                  <span className="text-hot-gray-400">
                                    · {inv.role}
                                  </span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCancelInvite(inv.id)}
                                  className="text-xs text-hot-red-600 hover:underline"
                                >
                                  {t('cancelInvite')}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </AddMemberForm>
                  )
                }
              />
            </div>
          )}
        </TabPanel>
      </TabGroup>

      <ConfirmDialog
        open={confirmDelete}
        label={t('deleteOrgTitle')}
        message={t('deleteGroupConfirm')}
        confirmText={t('deleteGroupBtn')}
        danger
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export default OrganizationDetailPage;
