import AddMemberForm from '@/components/AddMemberForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import GroupNameField from '@/components/GroupNameField';
import OrganizationContentPanel from '@/components/OrganizationContentPanel';
import Switch from '@/components/forms/Switch';
import Breadcrumb from '@/components/shared/Breadcrumb';
import BreadcrumbItem from '@/components/shared/BreadcrumbItem';
import Button from '@/components/shared/Button';
import ErrorBanner from '@/components/shared/ErrorBanner';
import Icon from '@/components/shared/Icon';
import Spinner from '@/components/shared/Spinner';
import { Tab, TabGroup, TabPanel } from '@/components/shared/Tabs';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import MembersPanel from '../components/MembersPanel';
import { useLanguage } from '../contexts/LanguageContext';
import { useOrganization } from '../hooks/useOrgs';
import { rasterizeSvg } from '../utils/rasterizeSvg';

type TabName = 'general' | 'profile' | 'members';

const panelStyle = { '--padding': '0' } as React.CSSProperties;

function OrganizationDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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
    updateGeneral,
    changeName,
    uploadImage,
    invite,
    cancelInvitation,
    deleteOrganization,
  } = useOrganization(slug);

  const [activeTab, setActiveTab] = useState<TabName>('general');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // The pencils over the banner and avatar open these hidden pickers
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Editable general form, seeded from the loaded organization
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Keyed on these fields rather than `org`, so saving the Public profile tab
  // (which also replaces `org`) doesn't wipe unsaved edits here.
  const savedContactEmail = org?.contact_email;
  const savedWebsite = org?.website;
  const savedIsPublic = org?.is_public;
  useEffect(() => {
    setContactEmail(savedContactEmail || '');
    setWebsite(savedWebsite || '');
    setIsPublic(savedIsPublic ?? false);
  }, [savedContactEmail, savedWebsite, savedIsPublic]);

  useEffect(() => {
    if (activeTab === 'members') refreshInvitations();
  }, [activeTab, refreshInvitations]);

  // The Public profile tab is managers only, so leave it if the role goes.
  useEffect(() => {
    if (!canManage && activeTab === 'profile') setActiveTab('general');
  }, [canManage, activeTab]);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateGeneral({
        contact_email: contactEmail || null,
        website: website || null,
        is_public: isPublic,
      });
      if (updated) toast.success(t('generalSaved'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCancel = () => {
    // 'default' means the page was opened directly, so there is no in-app history to go back to
    if (location.key !== 'default') navigate(-1);
    else navigate(listPath);
  };

  // The slug follows the name, so a rename applied right away moves the page.
  // A rename pending approval keeps the slug, so it stays put.
  const handleChangeName = async (name: string) => {
    const updated = await changeName(name);
    if (updated && updated.slug !== slug) {
      navigate(`/org/${updated.slug}`, { replace: true });
    }
    return updated;
  };

  const handleUpload = async (kind: 'avatar' | 'banner', file: File) => {
    try {
      await uploadImage(kind, await rasterizeSvg(file, kind));
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
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
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
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
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
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <h1 className="text-xl font-semibold text-hot-gray-900">
                    {org.name}
                  </h1>
                </div>
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
        <Tab panel="general">{t('generalTab')}</Tab>
        {canManage && <Tab panel="profile">{t('orgPublicProfileTab')}</Tab>}
        <Tab panel="members">
          {t('membersTab')} ({org.members_count})
        </Tab>

        <TabPanel name="general" style={panelStyle}>
          <div className="pt-xl space-y-6">
            <GroupNameField
              name={org.name}
              canManage={canManage}
              onChangeName={handleChangeName}
              pendingName={org.pending_name}
              requiresApproval={org.status === 'approved'}
            />

            {canManage ? (
              <form onSubmit={handleSaveGeneral} className="space-y-4">
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
                {/* On means draft: the org isn't shown in Portal. */}
                <Switch
                  checked={!isPublic}
                  onCheckedChange={(checked) => setIsPublic(!checked)}
                  hint={t(
                    !isPublic
                      ? 'orgDraftHint'
                      : org.status === 'approved'
                        ? 'orgPublicHint'
                        : 'orgPublicHintPending',
                  )}
                >
                  {t('orgDraftLabel')}
                </Switch>

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
                  <div className="flex gap-2 ml-auto">
                    <Button
                      appearance="plain"
                      type="button"
                      onClick={handleCancel}
                    >
                      {t('cancel')}
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? t('saving') : t('saveChanges')}
                    </Button>
                  </div>
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
                    {t('orgVisibility')}
                  </dt>
                  <dd className="text-hot-gray-600">
                    {t(
                      org.is_public
                        ? 'orgVisibilityPublic'
                        : 'orgVisibilityPrivate',
                    )}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </TabPanel>

        {/* Always mounted, so drafts survive switching tabs */}
        {canManage && (
          <TabPanel name="profile" style={panelStyle}>
            <div className="pt-xl">
              <OrganizationContentPanel
                org={org}
                saving={saving}
                updateGeneral={updateGeneral}
              />
            </div>
          </TabPanel>
        )}

        <TabPanel name="members" style={panelStyle}>
          {activeTab === 'members' && (
            <div className="pt-xl space-y-6">
              <MembersPanel
                groupId={org.id}
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
