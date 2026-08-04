import type { GroupResponse } from '../types/groups';

/**
 * How to address the person who requested an organization: "Name - email".
 *
 * Every part is optional, so the label degrades instead of showing stray
 * separators — a user with no profile name falls back to their Hanko username,
 * and one with neither shows the email alone. Returns null when the backend
 * resolved nothing (e.g. non-moderation endpoints, which never look up the
 * creator at all).
 */
export function creatorLabel(org: GroupResponse): string | null {
  const who = org.created_by_name || org.created_by_username;
  const email = org.created_by_email;
  if (who && email) return `${who} - ${email}`;
  return who || email || null;
}
