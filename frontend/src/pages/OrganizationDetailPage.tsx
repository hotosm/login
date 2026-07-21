import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MembersPanel from '../components/MembersPanel';
import StatusBadge from '../components/StatusBadge';
import { useLanguage } from '../contexts/LanguageContext';
import type {
  GroupResponse,
  Invitation,
  MemberRole,
} from '../types/groups';
import { backendUrl, readError } from '../utils/api';

function OrganizationDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'members'>('details');

  // Editable details form
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  // Name change
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  // Invitations (sent) + invite form
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [inviteRole, setInviteRole] = useState<MemberRole>('member');

  const goLogin = useCallback(() => {
    navigate('/?return_to=' + encodeURIComponent(window.location.href));
  }, [navigate]);

  const fetchGroup = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${backendUrl}/groups/${id}`, {
        credentials: 'include',
      });
      if (response.status === 401) return goLogin();
      if (!response.ok) throw new Error(await readError(response));
      const data: GroupResponse = await response.json();
      setGroup(data);
      setDescription(data.description || '');
      setContactEmail(data.contact_email || '');
      setWebsite(data.website || '');
      setIsPublic(data.is_public);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [id, goLogin]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const canManage = group?.role === 'owner' || group?.role === 'manager';
  const canDelete = group?.role === 'owner';

  const fetchInvitations = useCallback(async () => {
    if (!canManage) return;
    try {
      const response = await fetch(`${backendUrl}/groups/${id}/invitations`, {
        credentials: 'include',
      });
      if (response.ok) setInvitations(await response.json());
    } catch {
      // Non-critical
    }
  }, [id, canManage]);

  useEffect(() => {
    if (activeTab === 'members') fetchInvitations();
  }, [activeTab, fetchInvitations]);

  const flashSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/groups/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description || null,
          contact_email: contactEmail || null,
          website: website || null,
          is_public: isPublic,
        }),
      });
      if (response.status === 401) return goLogin();
      if (!response.ok) throw new Error(await readError(response));
      setGroup(await response.json());
      flashSuccess(t('detailsSaved'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/groups/${id}/name-change`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      if (response.status === 401) return goLogin();
      if (!response.ok) throw new Error(await readError(response));
      setGroup(await response.json());
      setEditingName(false);
      setNewName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleUpload = async (kind: 'avatar' | 'banner', file: File) => {
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch(`${backendUrl}/groups/${id}/${kind}`, {
        method: 'PUT',
        credentials: 'include',
        body: form,
      });
      if (response.status === 401) return goLogin();
      if (!response.ok) throw new Error(await readError(response));
      await fetchGroup();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('deleteGroupConfirm'))) return;
    try {
      const response = await fetch(`${backendUrl}/groups/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.status === 401) return goLogin();
      if (!response.ok) throw new Error(await readError(response));
      navigate('/organizations');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleInvite = async (e: React.FormEvent, onChanged: () => void) => {
    e.preventDefault();
    setError(null);
    setInviteMessage(null);
    const email = inviteEmail;
    try {
      const response = await fetch(`${backendUrl}/groups/${id}/invitations`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (response.status === 401) return goLogin();
      if (!response.ok) throw new Error(await readError(response));
      const created = await response.json();
      setInviteEmail('');
      setInviteRole('member');
      setInviteMessage(
        created.recipient_exists === false
          ? `Invitation sent to ${email}. They don't have a HOT account yet — they'll need to sign up to accept.`
          : `Invitation sent to ${email}.`,
      );
      await fetchInvitations();
      onChanged();
      setTimeout(() => setInviteMessage(null), 8000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCancelInvite = async (invId: string) => {
    if (!window.confirm(t('cancelInviteConfirm'))) return;
    try {
      const response = await fetch(
        `${backendUrl}/groups/${id}/invitations/${invId}`,
        { method: 'DELETE', credentials: 'include' },
      );
      if (response.status === 401) return goLogin();
      if (!response.ok) throw new Error(await readError(response));
      setInvitations((prev) => prev.filter((inv) => inv.id !== invId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-hot-red-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-hot-red-50 border border-hot-red-200 text-hot-red-700 px-4 py-3 rounded-lg">
          {error || 'Not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        type="button"
        onClick={() => navigate('/organizations')}
        className="text-sm text-hot-gray-500 hover:text-hot-red-600 transition-colors"
      >
        ← {t('navOrganizations')}
      </button>

      {error && (
        <div className="bg-hot-red-50 border border-hot-red-200 text-hot-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Header with banner + name */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div
          className="h-28 bg-hot-gray-100 bg-cover bg-center"
          style={
            group.banner_url
              ? { backgroundImage: `url(${group.banner_url})` }
              : undefined
          }
        />
        <div className="p-6">
          <div className="flex items-center gap-4">
            <img
              src={
                group.avatar_url ||
                'https://www.gravatar.com/avatar/?d=identicon&s=96'
              }
              alt=""
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow -mt-12 bg-white"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-semibold text-hot-gray-900">
                  {group.name}
                </h1>
                <StatusBadge status={group.status} />
              </div>
              {group.pending_name && (
                <p className="text-xs text-hot-gray-500 mt-1">
                  {t('nameChangePending')}: {group.pending_name}
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
          {t('membersTab')} ({group.members_count})
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
                <span className="text-sm text-hot-gray-900">{group.name}</span>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewName(group.name);
                      setEditingName(true);
                    }}
                    className="text-sm text-hot-red-600 hover:underline"
                  >
                    {t('changeName')}
                  </button>
                )}
              </div>
            )}
            {group.pending_name && (
              <p className="text-xs text-hot-gray-500 mt-1">
                {t('nameChangePending')}: {group.pending_name}
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
                    onClick={handleDelete}
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
                <dd className="text-hot-gray-600">{group.contact_email || '—'}</dd>
              </div>
              <div>
                <dt className="font-medium text-hot-gray-700">
                  {t('website')}
                </dt>
                <dd className="text-hot-gray-600">{group.website || '—'}</dd>
              </div>
              <div>
                <dt className="font-medium text-hot-gray-700">
                  {t('description')}
                </dt>
                <dd className="text-hot-gray-600 whitespace-pre-line">
                  {group.description || '—'}
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
            viewerRole={group.role}
            onLeft={() => navigate('/organizations')}
            renderAdd={(onChanged) =>
              group.status !== 'approved' ? (
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

                {inviteMessage && (
                  <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    {inviteMessage}
                  </div>
                )}

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
    </div>
  );
}

export default OrganizationDetailPage;
