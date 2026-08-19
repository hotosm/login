import type { Translations } from '../translations';
import type { MemberRole } from '../types/groups';

type Translate = (key: keyof Translations) => string;

export const ROLE_OPTIONS: readonly MemberRole[] = [
  'member',
  'manager',
  'owner',
];

export const ASSIGNABLE_ROLES = [
  'member',
  'manager',
] as const satisfies readonly MemberRole[];

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

/**
 * translations
 */
export function roleLabels(t: Translate): Record<MemberRole, string> {
  return {
    owner: t('roleOwner'),
    manager: t('roleManager'),
    member: t('roleMember'),
  };
}
