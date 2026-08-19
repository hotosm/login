import PanelHeader from '@/components/PanelHeader';
import TeamCreateForm from '@/components/TeamCreateForm';
import type { TeamCreatePayload } from '@/components/TeamCreateForm';
import { useState } from 'react';
import { toast } from 'sonner';
import GroupCard from '../components/GroupCard';
import { useLanguage } from '../contexts/LanguageContext';
import { useErrorToast } from '../hooks/useGroups';
import { useTeams } from '../hooks/useTeams';

function TeamsPage() {
  const { t } = useLanguage();
  const { teams, loading, loadError, submitting, createTeam, lookupMember } =
    useTeams();
  useErrorToast(loadError);

  // Create form — field state lives in TeamCreateForm
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (payload: TeamCreatePayload) => {
    try {
      const created = await createTeam({
        name: payload.name,
        description: payload.description || undefined,
        member_emails: payload.members.map((m) => m.email),
      });
      if (!created) return;
      // Unmounting the form is what clears the fields
      setShowForm(false);
      toast.success(t('teamCreated'));
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
      {/* Teams list */}
      <div className="bg-white rounded-xl shadow-xl p-6">
        <PanelHeader sectionName={t('teams')} buttonText={t('createTeam')} buttonOnPress={() => setShowForm((v) => !v)} hideButton={showForm} />

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

        {teams.length === 0 ? (
          <p className="text-sm text-hot-gray-500 py-6 text-center">
            {t('noTeams')}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teams.map((group) => (
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
