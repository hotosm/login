import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MembersPanel from '../components/MembersPanel';
import { useLanguage } from '../contexts/LanguageContext';
import type { GroupResponse, MemberRole } from '../types/groups';
import { backendUrl, readError } from '../utils/api';

function TeamDetailPage() {
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
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  // Name change (applied directly for teams)
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  // Add member form (teams add members directly by Hanko user ID)
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<MemberRole>('member');

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

  const handleDelete = async () => {
    if (!window.confirm(t('deleteGroupConfirm'))) return;
    try {
      const response = await fetch(`${backendUrl}/groups/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.status === 401) return goLogin();
      if (!response.ok) throw new Error(await readError(response));
      navigate('/teams');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleAddMember = async (e: React.FormEvent, onChanged: () => void) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/groups/${id}/members`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: memberEmail, role: memberRole }),
      });
      if (response.status === 401) return goLogin();
      if (!response.ok) throw new Error(await readError(response));
      setMemberEmail('');
      setMemberRole('member');
      onChanged();
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
        onClick={() => navigate('/teams')}
        className="text-sm text-hot-gray-500 hover:text-hot-red-600 transition-colors"
      >
        ← {t('navTeams')}
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

      {/* Header — teams have just a name (no logo/banner, no approval status) */}
      <div className="bg-white rounded-xl shadow-xl p-6">
        <h1 className="text-xl font-semibold text-hot-gray-900">
          {group.name}
        </h1>
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
          </div>

          {canManage ? (
            <form onSubmit={handleSaveDetails} className="space-y-4">
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
                  Teams have no logo/banner. */}

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
            onLeft={() => navigate('/teams')}
            renderAdd={(onChanged) => (
              <div className="space-y-4 mb-2">
                <form
                  onSubmit={(e) => handleAddMember(e, onChanged)}
                  className="flex flex-wrap items-end gap-2"
                >
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                      {t('addMemberByEmail')}
                    </label>
                    <input
                      type="email"
                      required
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      placeholder="person@example.org"
                      className="input-field"
                    />
                  </div>
                  <select
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value as MemberRole)}
                    className="input-field w-auto"
                  >
                    <option value="member">{t('roleMember')}</option>
                    <option value="manager">{t('roleManager')}</option>
                  </select>
                  <button
                    type="submit"
                    className="btn-primary-hot w-auto px-4 py-2 text-sm"
                  >
                    {t('addBtn')}
                  </button>
                </form>
                <hr className="border-hot-gray-200" />
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}

export default TeamDetailPage;
