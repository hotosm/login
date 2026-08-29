import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { ASSIGNABLE_ROLES, type AssignableRole } from '../utils/roles';
import RoleSelect from './RoleSelect';
import Button from './shared/Button';

interface AddMemberFormProps {
  /** Resolves to a falsy value when nothing was added, keeping the entered email. */
  onSubmit: (email: string, role: AssignableRole) => Promise<unknown>;
  /** Wording differs per group type: teams add members, organizations invite them. */
  submitLabel: string;
  /** Rendered under the form, e.g. the list of invitations already sent. */
  children?: ReactNode;
}

/** Email + role form shown above the member list of a group. */
function AddMemberForm({
  onSubmit,
  submitLabel,
  children,
}: AddMemberFormProps) {
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AssignableRole>('member');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!(await onSubmit(email, role))) return;
      setEmail('');
      setRole('member');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="space-y-4 mb-2">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm font-medium text-hot-gray-700 mb-1">
            {t('addMemberByEmail')}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="person@example.org"
            className="input-field"
          />
        </div>
        <RoleSelect value={role} roles={ASSIGNABLE_ROLES} onChange={setRole} />
        <Button type="submit">{submitLabel}</Button>
      </form>

      {children}

      <hr className="border-hot-gray-200" />
    </div>
  );
}

export default AddMemberForm;
