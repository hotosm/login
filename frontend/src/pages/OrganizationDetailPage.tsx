import ConfirmDialog from '@/components/ConfirmDialog';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import MembersPanel from '../components/MembersPanel';
import StatusBadge from '../components/shared/StatusBadge';
import { useLanguage } from '../contexts/LanguageContext';
import { useOrganization } from '../hooks/useOrgs';
import type { MemberRole } from '../types/groups';

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
    refreshInvitations,
    updateDetails,
    changeName,
    uploadImage,
    invite,
    cancelInvitation,
    deleteOrganization,
  } = useOrganization(id);

  const [activeTab, setActiveTab] = useState<'details' | 'members'>('details');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Editable details form, seeded from the loaded organization
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Name change
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('member');

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

  const handleChangeName = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!(await changeName(newName))) return;
      setEditingName(false);
      setNewName('');
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

  const handleInvite = async (e: React.FormEvent, onChanged: () => void) => {
    e.preventDefault();
    const email = inviteEmail;
    try {
      const created = await invite(inviteEmail, inviteRole);
      if (!created) return;
      setInviteEmail('');
      setInviteRole('member');
      toast.success(
        created.recipient_exists === false
          ? `Invitation sent to ${email}. They don't have a HOT account yet — they'll need to sign up to accept.`
          : `Invitation sent to ${email}.`,
        // The no-account case is a long sentence worth reading
        { duration: 8000 },
      );
      onChanged();
    } catch (err) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-hot-red-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!org) {
    return (
      <div>
        <div className="bg-hot-red-50 border border-hot-red-200 text-hot-red-700 px-4 py-3 rounded-lg">
          {loadError || 'Not found'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(listPath)}
        className="text-sm text-hot-gray-500 hover:text-hot-red-600 transition-colors"
      >
        ← {t('navOrganizations')}
      </button>

      {/* Header with banner + name */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div
          className="h-28 bg-hot-gray-100 bg-cover bg-center"
          style={
            org.banner_url
              ? { backgroundImage: `url(${org.banner_url})` }
              : undefined
          }
        />
        <div className="p-6">
          <div className="flex items-center gap-4">
            <img
              src={
                org.avatar_url ||
                'https://www.gravatar.com/avatar/?d=identicon&s=96'
              }
              alt=""
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow -mt-12 bg-white"
            />
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
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`admin-tab ${activeTab === 'details' ? 'active' : ''}`}
        >
          {t('detailsTab')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`admin-tab ${activeTab === 'members' ? 'active' : ''}`}
        >
          {t('membersTab')} ({org.members_count})
        </button>
      </div>

      {activeTab === 'details' && (
        <div className="bg-white rounded-xl shadow-xl p-6 space-y-6">
          {/* Name change */}
          <div>
            <label className="block text-sm font-medium text-hot-gray-700 mb-1">
              {t('name')}
            </label>
            {editingName ? (
              <form onSubmit={handleChangeName} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input-field"
                />
                <button
                  type="submit"
                  className="btn-primary-hot w-auto px-4 py-2 text-sm"
                >
                  {t('saveChanges')}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingName(false)}
                  className="btn-secondary-hot w-auto px-4 py-2 text-sm"
                >
                  {t('cancel')}
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-hot-gray-900">{org.name}</span>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewName(org.name);
                      setEditingName(true);
                    }}
                    className="text-sm text-hot-red-600 hover:underline"
                  >
                    {t('changeName')}
                  </button>
                )}
              </div>
            )}
            {org.pending_name && (
              <p className="text-xs text-hot-gray-500 mt-1">
                {t('nameChangePending')}: {org.pending_name}
              </p>
            )}
          </div>

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
              {/* Public-profile toggle hidden until portal public profiles ship.
                  The is_public state is still submitted (unchanged) so nothing breaks. */}

              {/* Avatar / banner upload */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                    {t('avatarLabel')}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleUpload('avatar', e.target.files[0])
                    }
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                    {t('bannerLabel')}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleUpload('banner', e.target.files[0])
                    }
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary-hot w-auto px-4 py-2 text-sm disabled:opacity-50"
                >
                  {saving ? t('saving') : t('saveChanges')}
                </button>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="btn-danger-small"
                  >
                    {t('deleteGroupBtn')}
                  </button>
                )}
              </div>
            </form>
          ) : (
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium text-hot-gray-700">
                  {t('contactEmail')}
                </dt>
                <dd className="text-hot-gray-600">{org.contact_email || '—'}</dd>
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
      )}

      {activeTab === 'members' && (
        <div className="bg-white rounded-xl shadow-xl p-6">
          <MembersPanel
            groupId={id}
            viewerRole={org.role}
            onLeft={() => navigate(listPath)}
            renderAdd={(onChanged) =>
              org.status !== 'approved' ? (
                <div className="text-sm text-hot-gray-500 bg-hot-gray-50 border border-hot-gray-200 rounded-lg px-3 py-2 mb-2">
                  You can invite members once this organization is approved.
                </div>
              ) : (
                <div className="space-y-4 mb-2">
                <form
                  onSubmit={(e) => handleInvite(e, onChanged)}
                  className="flex flex-wrap items-end gap-2"
                >
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                      {t('addMemberByEmail')}
                    </label>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="person@example.org"
                      className="input-field"
                    />
                  </div>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as MemberRole)}
                    className="input-field w-auto"
                  >
                    <option value="member">{t('roleMember')}</option>
                    <option value="manager">{t('roleManager')}</option>
                  </select>
                  <button
                    type="submit"
                    className="btn-primary-hot w-auto px-4 py-2 text-sm"
                  >
                    {t('inviteBtn')}
                  </button>
                </form>

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
                            <span className="text-hot-gray-400">· {inv.role}</span>
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
                <hr className="border-hot-gray-200" />
                </div>
              )
            }
          />
        </div>
      )}

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
