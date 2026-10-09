import { useLanguage } from '../contexts/LanguageContext';
import type { MemberRole } from '../types/groups';
import { roleLabels } from '../utils/roles';
import Button from './shared/Button';
import Dropdown from './shared/Dropdown';
import DropdownItem from './shared/DropdownItem';

interface RoleSelectProps<Role extends MemberRole> {
  value: Role;
  /** Roles offered, e.g. `ASSIGNABLE_ROLES` when inviting or `ROLE_OPTIONS`. */
  roles: readonly Role[];
  onChange: (role: Role) => void;
  size?: 'small' | 'medium' | 'large';
}

/** Dropdown of member roles, labelled in the current language. */
function RoleSelect<Role extends MemberRole>({
  value,
  roles,
  onChange,
  size,
}: RoleSelectProps<Role>) {
  const { t } = useLanguage();
  const labels = roleLabels(t);

  return (
    <Dropdown
      size={size}
      onSelect={(e) => {
        const { value: selected } = e.detail.item as HTMLElement & {
          value?: string;
        };
        if (selected) onChange(selected as Role);
      }}
    >
      <Button slot="trigger" size={size} appearance="outlined" withCaret>
        {labels[value]}
      </Button>
      {roles.map((role) => (
        <DropdownItem
          key={role}
          value={role}
          type="checkbox"
          checked={value === role}
        >
          {labels[role]}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}

export default RoleSelect;
