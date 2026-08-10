import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import Button from './shared/Button';
import Input from './forms/Input';
import Textarea from './forms/Textarea';

export interface TeamMemberDraft {
  email: string;
  name: string | null;
}

export interface TeamCreatePayload {
  name: string;
  description: string;
  members: TeamMemberDraft[];
}

/** Result of looking a member up by email — resolved by the parent page. */
export interface MemberLookupResult {
  exists: boolean;
  name: string | null;
}

const EMPTY: TeamCreatePayload = {
  name: '',
  description: '',
  members: [],
};

interface TeamCreateFormProps {
  onSubmit: (payload: TeamCreatePayload) => void | Promise<void>;
  onCancel: () => void;
  /**
   * Checks whether an email belongs to a HOT account. Returning `null` means the
   * parent already handled the outcome (e.g. redirected to login), so the form
   * stays quiet.
   */
  onLookupMember: (email: string) => Promise<MemberLookupResult | null>;
  submitting?: boolean;
}

function TeamCreateForm({
  onSubmit,
  onCancel,
  onLookupMember,
  submitting = false,
}: TeamCreateFormProps) {
  const { t } = useLanguage();
  const [values, setValues] = useState<TeamCreatePayload>(EMPTY);
  const [memberInput, setMemberInput] = useState('');
  const [memberError, setMemberError] = useState<string | null>(null);
  const [checkingMember, setCheckingMember] = useState(false);

  const set = <K extends keyof TeamCreatePayload>(
    key: K,
    value: TeamCreatePayload[K],
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleAddMember = async () => {
    const email = memberInput.trim().toLowerCase();
    setMemberError(null);
    if (!email) return;
    if (values.members.some((m) => m.email === email)) {
      setMemberError('Already added.');
      return;
    }
    setCheckingMember(true);
    try {
      const result = await onLookupMember(email);
      if (!result) return;
      if (!result.exists) {
        setMemberError('No HOT account found with that email.');
        return;
      }
      setValues((prev) => ({
        ...prev,
        members: [...prev.members, { email, name: result.name }],
      }));
      setMemberInput('');
    } catch (err) {
      setMemberError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCheckingMember(false);
    }
  };

  const removeMember = (email: string) => {
    setValues((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.email !== email),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-xl border-b pb-xl"
    >
      <div className="space-y-4">
        <div>
          <Input
            type="text"
            label={t('name')}
            required
            value={values.name}
            onValueChange={(value) => set('name', value)}
          />
        </div>
        <div>
          <Textarea
            label={t('description')}
            value={values.description}
            onValueChange={(value) => set('description', value)}
            rows={3}
          />
        </div>
        <div>
          <div className="flex gap-2">
            <Input
              label={t('membersTab')}
              className="flex-1"
              type="email"
              value={memberInput}
              onValueChange={setMemberInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMember();
                }
              }}
              placeholder="person@example.org"
            />
            <Button
              appearance="outlined"
              type="button"
              onClick={handleAddMember}
              disabled={checkingMember}
              className='pt-7'
            >
              {checkingMember ? '…' : 'Add'}
            </Button>
          </div>
          {memberError && (
            <p className="text-xs text-hot-red-600 mt-1">{memberError}</p>
          )}
          {values.members.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {values.members.map((m) => (
                <span
                  key={m.email}
                  className="inline-flex items-center gap-1 text-xs bg-hot-gray-100 text-hot-gray-700 rounded-lg px-sm"
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
      </div>
      <div className="flex justify-end gap-2">
        <Button appearance="plain" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button appearance="accent" type="submit" disabled={submitting}>
          {submitting ? t('saving') : t('create')}
        </Button>
      </div>
    </form>
  );
}

export default TeamCreateForm;
