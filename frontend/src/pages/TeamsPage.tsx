import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupCard from '../components/GroupCard';
import { useLanguage } from '../contexts/LanguageContext';
import type { GroupSummary } from '../types/groups';
import { backendUrl, readError } from '../utils/api';
import PanelHeader from '@/components/PanelHeader';
import TeamCreateForm from '@/components/TeamCreateForm';
import type {
  MemberLookupResult,
  TeamCreatePayload,
} from '@/components/TeamCreateForm';

function TeamsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create form — field state lives in TeamCreateForm
  const [showForm, setShowForm] = useState(false);
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

  const lookupMember = async (
    email: string,
  ): Promise<MemberLookupResult | null> => {
    const response = await fetch(
      `${backendUrl}/users/lookup?email=${encodeURIComponent(email)}`,
      { credentials: 'include' },
    );
    if (response.status === 401) {
      goLogin();
      return null;
    }
    if (!response.ok) throw new Error(await readError(response));
    const data = await response.json();
    return { exists: Boolean(data.exists), name: data.name ?? null };
  };

  const handleSubmit = async (payload: TeamCreatePayload) => {
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
          name: payload.name,
          description: payload.description || undefined,
          member_emails: payload.members.map((m) => m.email),
        }),
      });
      if (response.status === 401) return goLogin();
      if (!response.ok) throw new Error(await readError(response));
      // Unmounting the form is what clears the fields
      setShowForm(false);
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
    <div>
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
        <PanelHeader sectionName={t('teams')} buttonText={t('createTeam')} buttonOnPress={() => setShowForm((v) => !v)} />
          
        {/* Create team form */}
      {showForm && (
        <div className='mb-xl'>
          <h2 className="text-lg font-semibold text-hot-gray-900 mb-4">
            {t('createTeamTitle')}
          </h2>
          <TeamCreateForm
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            onLookupMember={lookupMember}
            submitting={submitting}
          />
        </div>
      )}

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

    </div>
  );
}

export default TeamsPage;
