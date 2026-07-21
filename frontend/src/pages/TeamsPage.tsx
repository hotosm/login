import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupCard from '../components/GroupCard';
import { useLanguage } from '../contexts/LanguageContext';
import type { GroupSummary } from '../types/groups';
import { backendUrl, readError } from '../utils/api';

function TeamsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create form
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState<
    { email: string; name: string | null }[]
  >([]);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [checkingMember, setCheckingMember] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const goLogin = useCallback(() => {
    navigate('/?return_to=' + encodeURIComponent(window.location.href));
  }, [navigate]);

  const fetchGroups = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${backendUrl}/groups?type=team`, {
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

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleAddMember = async () => {
    const email = memberInput.trim().toLowerCase();
    setMemberError(null);
    if (!email) return;
    if (members.some((m) => m.email === email)) {
      setMemberError('Already added.');
      return;
    }
    setCheckingMember(true);
    try {
      const response = await fetch(
        `${backendUrl}/users/lookup?email=${encodeURIComponent(email)}`,
        { credentials: 'include' },
      );
      if (response.status === 401) return goLogin();
      if (!response.ok) throw new Error(await readError(response));
      const data = await response.json();
      if (!data.exists) {
        setMemberError('No HOT account found with that email.');
        return;
      }
      setMembers((prev) => [...prev, { email, name: data.name }]);
      setMemberInput('');
    } catch (err) {
      setMemberError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCheckingMember(false);
    }
  };

  const removeMember = (email: string) => {
    setMembers((prev) => prev.filter((m) => m.email !== email));
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
          type: 'team',
          name,
          description: description || undefined,
          member_emails: members.map((m) => m.email),
        }),
      });
      if (response.status === 401) return goLogin();
      if (!response.ok) throw new Error(await readError(response));
      setShowForm(false);
      setName('');
      setDescription('');
      setMembers([]);
      setMemberInput('');
      await fetchGroups();
      setSuccess(t('teamCreated'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
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

      {/* Teams list */}
      <div className="bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-semibold text-hot-gray-900">
            {t('teams')}
          </h1>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="btn-primary-hot w-auto px-4 py-2 text-sm"
          >
            {t('createTeam')}
          </button>
        </div>
        <p className="text-sm text-hot-gray-500 mb-4">{t('teamsSubtitle')}</p>

        {groups.length === 0 ? (
          <p className="text-sm text-hot-gray-500 py-6 text-center">
            {t('noTeams')}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                to={`/teams/${group.id}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create team form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-hot-gray-900 mb-4">
            {t('createTeamTitle')}
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
                {t('description')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-hot-gray-700 mb-1">
                {t('membersTab')}
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMember();
                    }
                  }}
                  placeholder="person@example.org"
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  disabled={checkingMember}
                  className="btn-secondary-hot w-auto px-4 py-2 text-sm disabled:opacity-50"
                >
                  {checkingMember ? '…' : 'Add'}
                </button>
              </div>
              {memberError && (
                <p className="text-xs text-hot-red-600 mt-1">{memberError}</p>
              )}
              {members.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {members.map((m) => (
                    <span
                      key={m.email}
                      className="inline-flex items-center gap-1 text-xs bg-hot-gray-100 text-hot-gray-700 rounded-full px-2 py-1"
                    >
                      {m.name || m.email}
                      <button
                        type="button"
                        onClick={() => removeMember(m.email)}
                        className="text-hot-gray-400 hover:text-hot-red-600"
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary-hot w-auto px-4 py-2 text-sm disabled:opacity-50"
              >
                {submitting ? t('saving') : t('create')}
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

export default TeamsPage;
