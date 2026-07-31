import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupCard from '../components/GroupCard';
import { useLanguage } from '../contexts/LanguageContext';
import type { GroupSummary, MyInvitation } from '../types/groups';
import { backendUrl, readError } from '../utils/api';
import PanelHeader from '@/components/PanelHeader';
import OrgRequestForm from '@/components/OrgRequestForm';
import type { OrgRequestPayload } from '@/components/OrgRequestForm';

function OrganizationsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [invitations, setInvitations] = useState<MyInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create/request form — field state lives in OrgRequestForm
  const [showForm, setShowForm] = useState(false);
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

  const handleSubmit = async (payload: OrgRequestPayload) => {
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
          name: payload.name,
          contact_email: payload.contactEmail || undefined,
          website: payload.website || undefined,
          description: payload.description || undefined,
        }),
      });
      if (response.status === 401) return goLogin();
      if (!response.ok) throw new Error(await readError(response));
      const created = await response.json();

      // Org exists now — close the form regardless of the image outcome so a
      // failed upload can't lead to a duplicate org on retry. Unmounting the
      // form is what clears the fields.
      setShowForm(false);

      // Upload images best-effort: if one fails the org is still created and it
      // can be added later from the org's Details page.
      try {
        if (payload.avatarFile)
          await uploadImage(created.id, 'avatar', payload.avatarFile);
        if (payload.bannerFile)
          await uploadImage(created.id, 'banner', payload.bannerFile);
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
      <div className="bg-white rounded-xl shadow-xl p-6 flex flex-col gap-lg">
        
      <PanelHeader sectionName={t('organizations')}  buttonText={t('requestOrganization')} buttonOnPress={() => setShowForm((v) => !v)} />
    

      {/* Request organization form */}
      {showForm && (
        <div className='mb-xl'>
          <h2 className='text-lg mb-sx'>{t('requestOrgTitle')}</h2>
          {/* TODO needs translation once approved */}
          <p className='text-sm mb-lg'>New organizations require manager approval before activation. Once approved, you can invite team members and share projects. Please choose your Organization Name carefully—it cannot be changed later, though all other information can be edited anytime.</p>
          <OrgRequestForm
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            submitting={submitting}
          />
        </div>
      )}
      
      {/* panel content */}
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
    </div>
  );
  
}

export default OrganizationsPage;
