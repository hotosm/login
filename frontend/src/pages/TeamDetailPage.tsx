import AddMemberForm from '@/components/AddMemberForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import GroupNameField from '@/components/GroupNameField';
import PanelHeader from '@/components/PanelHeader';
import Breadcrumb from '@/components/shared/Breadcrumb';
import BreadcrumbItem from '@/components/shared/BreadcrumbItem';
import Button from '@/components/shared/Button';
import ErrorBanner from '@/components/shared/ErrorBanner';
import Spinner from '@/components/shared/Spinner';
import { Tab, TabGroup, TabPanel } from '@/components/shared/Tabs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import MembersPanel from '../components/MembersPanel';
import { useLanguage } from '../contexts/LanguageContext';
import { useTeam } from '../hooks/useTeams';

type TabName = 'details' | 'members';

const panelStyle = { '--padding': '0' } as React.CSSProperties;

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
    refresh,
  } = useTeam(id);

  const [activeTab, setActiveTab] = useState<TabName>('details');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

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

  const handleDelete = async () => {
    try {
      if (await deleteTeam()) {
        toast.success(t('teamDeleted'));
        return;
      }
      setConfirmDelete(false);
    } catch (err) {
      setConfirmDelete(false);
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) return <Spinner />;

  if (!team) {
    return (
      <div>
        <ErrorBanner>{loadError || 'Not found'}</ErrorBanner>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-xl shadow-xl p-6">
        <Breadcrumb>
          <BreadcrumbItem onClick={() => navigate(listPath)}>
            {t('navTeams')}
          </BreadcrumbItem>
          <BreadcrumbItem>{team.name}</BreadcrumbItem>
        </Breadcrumb>

        <PanelHeader sectionName={team.name} />

        {/* Tabs */}
        <TabGroup
          active={activeTab}
          onWaTabShow={(e) => setActiveTab(e.detail.name as TabName)}
        >
          <Tab panel="details">{t('detailsTab')}</Tab>
          <Tab panel="members">
            {t('membersTab')} ({team.members_count})
          </Tab>

          <TabPanel name="details" style={panelStyle}>
            <div className="pt-xl space-y-6">
              <GroupNameField
                name={team.name}
                canManage={canManage}
                onChangeName={changeName}
              />

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
                      {t('description')}
                    </dt>
                    <dd className="text-hot-gray-600 whitespace-pre-line">
                      {team.description || '—'}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </TabPanel>

          <TabPanel name="members" style={panelStyle}>
            <div className="pt-lg">
              {activeTab === 'members' && (
                <MembersPanel
                  groupId={id}
                  viewerRole={team.role}
                  onLeft={() => navigate(listPath)}
                  onViewerRoleChanged={refresh}
                  renderAdd={(onChanged) => (
                    <AddMemberForm
                      submitLabel={t('addBtn')}
                      onSubmit={async (email, role) => {
                        if (!(await addMember(email, role))) return false;
                        onChanged();
                        return true;
                      }}
                    />
                  )}
                />
              )}
            </div>
          </TabPanel>
        </TabGroup>

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
    </div>
  );
}

export default TeamDetailPage;
