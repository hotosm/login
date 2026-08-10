import ConfirmDialog from '@/components/ConfirmDialog';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import MembersPanel from '../components/MembersPanel';
import { useLanguage } from '../contexts/LanguageContext';
import { useTeam } from '../hooks/useTeams';
import type { MemberRole } from '../types/groups';

function TeamDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const {
    team,
    loading,
    loadError,
    saving,
    deleting,
    canManage,
    canDelete,
    listPath,
    updateDetails,
    changeName,
    deleteTeam,
    addMember,
  } = useTeam(id);

  const [activeTab, setActiveTab] = useState<'details' | 'members'>('details');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Editable details form, seeded from the loaded team
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Name change (applied directly for teams)
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  // Add member form (teams add members directly by email)
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<MemberRole>('member');

  useEffect(() => {
    if (!team) return;
    setDescription(team.description || '');
    setIsPublic(team.is_public);
  }, [team]);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateDetails({
        description: description || null,
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

  const handleDelete = async () => {
    try {
      if (await deleteTeam()) {
        // The Toaster is mounted above the router, so this survives the redirect
        toast.success(t('teamDeleted'));
        return;
      }
      setConfirmDelete(false);
    } catch (err) {
      setConfirmDelete(false);
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleAddMember = async (e: React.FormEvent, onChanged: () => void) => {
    e.preventDefault();
    try {
      if (!(await addMember(memberEmail, memberRole))) return;
      setMemberEmail('');
      setMemberRole('member');
      onChanged();
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

  if (!team) {
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
        ← {t('navTeams')}
      </button>

      {/* Header — teams have just a name (no logo/banner, no approval status) */}
      <div className="bg-white rounded-xl shadow-xl p-6">
        <h1 className="text-xl font-semibold text-hot-gray-900">{team.name}</h1>
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
          {t('membersTab')} ({team.members_count})
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
                <span className="text-sm text-hot-gray-900">{team.name}</span>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewName(team.name);
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
                  {t('description')}
                </dt>
                <dd className="text-hot-gray-600 whitespace-pre-line">
                  {team.description || '—'}
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
            viewerRole={team.role}
            onLeft={() => navigate(listPath)}
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

      <ConfirmDialog
        open={confirmDelete}
        label={t('deleteTeamTitle')}
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

export default TeamDetailPage;
