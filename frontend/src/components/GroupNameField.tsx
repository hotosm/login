import type WaInput from '@awesome.me/webawesome/dist/components/input/input.js';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import Input from './forms/Input';
import Button from './shared/Button';

interface GroupNameFieldProps {
  name: string;
  /** Managers and owners get the "change name" affordance. */
  canManage: boolean;
  /** Resolves to a falsy value when the change was rejected. */
  onChangeName: (name: string) => Promise<unknown>;
  /** A requested name still awaiting approval, shown under the field. */
  pendingName?: string | null;
  /** The new name only applies once an administrator approves it. */
  requiresApproval?: boolean;
}

/** The group name, with inline editing for anyone who can manage the group. */
function GroupNameField({
  name,
  canManage,
  onChangeName,
  pendingName,
  requiresApproval = false,
}: GroupNameFieldProps) {
  const { t } = useLanguage();

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const inputRef = useRef<WaInput>(null);

  // Keep showing the current name while not editing
  useEffect(() => {
    if (!editing) setNewName(name);
  }, [name, editing]);

  // Focus once the input is enabled — it can't take focus while disabled
  useEffect(() => {
    const input = inputRef.current;
    if (editing && input) input.updateComplete.then(() => input.focus());
  }, [editing]);

  const handleCancel = () => {
    setNewName(name);
    setEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!(await onChangeName(newName))) return;
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-end gap-2">
        <Input
          ref={inputRef}
          type="text"
          label={t('name')}
          required
          disabled={!editing}
          value={newName}
          onValueChange={setNewName}
          className="flex-1"
          hint={
            editing && requiresApproval
              ? t('nameChangeNeedsApproval')
              : undefined
          }
        />
        {canManage && !editing && (
          <Button appearance="plain" onClick={() => setEditing(true)}>
            {t('changeName')}
          </Button>
        )}
      </div>
      {editing && (
        <div className="flex justify-end gap-2">
          <Button appearance="plain" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button type="submit">{t('saveChanges')}</Button>
        </div>
      )}
      {pendingName && (
        <p className="text-xs text-hot-gray-500 mt-1">
          {t('nameChangePending')}: {pendingName}
        </p>
      )}
    </form>
  );
}

export default GroupNameField;
