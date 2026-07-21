import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupCard from '../components/GroupCard';
import { useLanguage } from '../contexts/LanguageContext';
import type { GroupSummary, MyInvitation } from '../types/groups';
import { backendUrl, readError } from '../utils/api';

function OrganizationsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [invitations, setInvitations] = useState<MyInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create/request form
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const goLogin = useCallback(() => {
    navigate('/?return_to=' + encodeURIComponent(window.location.href));
  }, [navigate]);

  const fetchGroups = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${backendUrl}/groups?type=organization`, {
        credentials: 'include',
      });
      if (response.status === 401) return goLogin();
      if (!response.ok) throw new Error(await readError(response));
      const data = await response.json();
      setGroups(data.groups || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [goLogin]);

  const fetchInvitations = useCallback(async () => {
    try {
      const response = await fetch(`${backendUrl}/me/invitations`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data: MyInvitation[] = await response.json();
        // Only organizations use the invitation flow
        setInvitations(data.filter((inv) => inv.group_type === 'organization'));
      }
    } catch {
      // Non-critical: invitations tray just stays empty
    }
  }, []);

  useEffect(() => {
    fetchGroups();
    fetchInvitations();
  }, [fetchGroups, fetchInvitations]);

  const uploadImage = async (
    id: string,
    kind: 'avatar' | 'banner',
    file: File,
  ) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${backendUrl}/groups/${id}/${kind}`, {
      method: 'PUT',
      credentials: 'include',
      body: form,
    });
    if (!res.ok) throw new Error(await readError(res));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`${backendUrl}/groups`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'organization',
          name,
          contact_email: contactEmail || undefined,
          website: website || undefined,
          description: description || undefined,
        }),
      });
      if (response.status === 401) return goLogin();
      if (!response.ok) throw new Error(await readError(response));
      const created = await response.json();

      // Org exists now — reset the form regardless of the image outcome so a
      // failed upload can't lead to a duplicate org on retry.
      setShowForm(false);
      setName('');
      setContactEmail('');
      setWebsite('');
      setDescription('');
      const avatar = avatarFile;
      const banner = bannerFile;
      setAvatarFile(null);
      setBannerFile(null);

      // Upload images best-effort: if one fails the org is still created and it
      // can be added later from the org's Details page.
      try {
        if (avatar) await uploadImage(created.id, 'avatar', avatar);
        if (banner) await uploadImage(created.id, 'banner', banner);
      } catch {
        setError(
          'Organization created, but the image upload failed — you can add it later from the org page.',
        );
      }

      setSuccess(t('orgRequestSubmitted'));
      await fetchGroups();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const respondToInvitation = async (
    invitation: MyInvitation,
    action: 'accept' | 'decline',
  ) => {
    try {
      const response = await fetch(
        `${backendUrl}/me/invitations/${invitation.token}/${action}`,
        { method: 'POST', credentials: 'include' },
      );
      if (response.status === 401) return goLogin();
      if (!response.ok) throw new Error(await readError(response));
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id));
      if (action === 'accept') await fetchGroups();
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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

      {/* Pending invitations tray */}
      {invitations.length > 0 && (
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-hot-gray-900 mb-4">
            {t('pendingInvitations')}
          </h2>
          <div className="divide-y divide-hot-gray-200">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between py-3 gap-3"
              >
                <div>
                  <p className="text-sm font-medium text-hot-gray-900">
                    {inv.group_name}
                  </p>
                  <p className="text-xs text-hot-gray-500">
                    {t('invitedToJoin')} · {inv.role}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => respondToInvitation(inv, 'accept')}
                    className="btn-success-small"
                  >
                    {t('accept')}
                  </button>
                  <button
                    type="button"
                    onClick={() => respondToInvitation(inv, 'decline')}
                    className="btn-secondary-small"
                  >
                    {t('decline')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Organizations list */}
      <div className="bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-semibold text-hot-gray-900">
            {t('organizations')}
          </h1>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="btn-primary-hot w-auto px-4 py-2 text-sm"
          >
            {t('requestOrganization')}
          </button>
        </div>
        <p className="text-sm text-hot-gray-500 mb-4">
          {t('organizationsSubtitle')}
        </p>

        {groups.length === 0 ? (
          <p className="text-sm text-hot-gray-500 py-6 text-center">
            {t('noOrganizations')}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groups.map((group) => (
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

      {/* Request organization form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-hot-gray-900 mb-4">
            {t('requestOrgTitle')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                {t('name')}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>
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
                placeholder="https://example.org"
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
            <p className="text-xs text-hot-gray-400">
              You can invite members from the org page once it's approved.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                  {t('avatarLabel')}
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                  className="text-sm text-hot-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                  {t('bannerLabel')}
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
                  className="text-sm text-hot-gray-600"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary-hot w-auto px-4 py-2 text-sm disabled:opacity-50"
              >
                {submitting ? t('saving') : t('submitRequest')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary-hot w-auto px-4 py-2 text-sm"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default OrganizationsPage;
