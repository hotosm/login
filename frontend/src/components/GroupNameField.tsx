import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import Button from './shared/Button';

interface GroupNameFieldProps {
  name: string;
  /** Managers and owners get the "change name" affordance. */
  canManage: boolean;
  /** Resolves to a falsy value when the change was rejected. */
  onChangeName: (name: string) => Promise<unknown>;
  /** A requested name still awaiting approval, shown under the field. */
  pendingName?: string | null;
}

/** The group name, with inline editing for anyone who can manage the group. */
function GroupNameField({
  name,
  canManage,
  onChangeName,
  pendingName,
}: GroupNameFieldProps) {
  const { t } = useLanguage();

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!(await onChangeName(newName))) return;
      setEditing(false);
      setNewName('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-hot-gray-700 mb-1">
        {t('name')}
      </label>
      {editing ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="input-field"
          />
          <Button type="submit">{t('saveChanges')}</Button>
          <Button appearance="plain" onClick={() => setEditing(false)}>
            {t('cancel')}
          </Button>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-sm text-hot-gray-900">{name}</span>
          {canManage && (
            <Button
              appearance="plain"
              onClick={() => {
                setNewName(name);
                setEditing(true);
              }}
            >
              {t('changeName')}
            </Button>
          )}
        </div>
      )}
      {pendingName && (
        <p className="text-xs text-hot-gray-500 mt-1">
          {t('nameChangePending')}: {pendingName}
        </p>
      )}
    </div>
  );
}

export default GroupNameField;
