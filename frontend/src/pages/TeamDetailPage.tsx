import ConfirmDialog from '@/components/ConfirmDialog';
import PanelHeader from '@/components/PanelHeader';
import Breadcrumb from '@/components/shared/Breadcrumb';
import BreadcrumbItem from '@/components/shared/BreadcrumbItem';
import Button from '@/components/shared/Button';
import Dropdown from '@/components/shared/Dropdown';
import DropdownItem from '@/components/shared/DropdownItem';
import { Tab, TabGroup, TabPanel } from '@/components/shared/Tabs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import MembersPanel from '../components/MembersPanel';
import { useLanguage } from '../contexts/LanguageContext';
import { useTeam } from '../hooks/useTeams';
import {
  ASSIGNABLE_ROLES,
  type AssignableRole,
  roleLabels,
} from '../utils/roles';

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

  const labels = roleLabels(t);

  const [activeTab, setActiveTab] = useState<TabName>('details');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<AssignableRole>('member');

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
                    <Button
                      type="submit"
                    >
                      {t('saveChanges')}
                    </Button>
                     <Button
                      appearance='plain'
                      onClick={() => setEditingName(false)}
                    >
                      {t('cancel')}
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-hot-gray-900">
                      {team.name}
                    </span>
                    {canManage && (
                      <Button
                        appearance='plain'
                        onClick={() => {
                          setNewName(team.name);
                          setEditingName(true);
                        }}
                      >
                        {t('changeName')}
                      </Button>
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

                  <div className="flex items-center justify-between pt-2">
                    
                    {canDelete && (
                      <Button
                        appearance='outlined'
                        variant='danger'
                        onClick={() => setConfirmDelete(true)}
                      >
                        {t('deleteGroupBtn')}
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={saving}
                    >
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
                        <Dropdown
                          onSelect={(e) => {
                            const { value } = e.detail.item as HTMLElement & {
                              value?: string;
                            };
                            if (value) setMemberRole(value as AssignableRole);
                          }}
                        >
                          <Button
                            slot="trigger"
                            appearance="outlined"
                            withCaret
                          >
                            {labels[memberRole]}
                          </Button>
                          {ASSIGNABLE_ROLES.map((role) => (
                            <DropdownItem
                              key={role}
                              value={role}
                              type="checkbox"
                              checked={memberRole === role}
                            >
                              {labels[role]}
                            </DropdownItem>
                          ))}
                        </Dropdown>
                        <Button type="submit">{t('addBtn')}</Button>
                      </form>
                      <hr className="border-hot-gray-200" />
                    </div>
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
