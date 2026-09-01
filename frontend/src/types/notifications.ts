/**
 * In-app notifications (GET /me/notifications).
 *
 * The backend stores no display text: `type` says which message to render and
 * `data` carries the values to interpolate, so the copy stays translatable here.
 */

export type NotificationType =
  | 'org_approved'
  | 'org_rejected'
  | 'org_name_approved'
  | 'org_name_rejected'
  | 'team_member_joined'
  | 'team_member_left'
  | 'member_left'
  | 'member_removed'
  | 'org_invite_accepted'
  | 'org_invite_declined'
  | 'org_invite_response_self';

export interface NotificationData {
  group_id?: string;
  group_name?: string;
  group_type?: 'team' | 'organization';
  new_name?: string;
  rejected_name?: string;
  reason?: string | null;
  member_name?: string | null;
  role?: string;
  response?: 'accepted' | 'declined';
}

/** Named AppNotification so it does not clash with the DOM Notification type. */
export interface AppNotification {
  id: string;
  type: NotificationType;
  data: NotificationData | null;
  read_at: string | null;
  created_at: string;
}
