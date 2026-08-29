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
  | 'org_name_rejected';

export interface NotificationData {
  group_id?: string;
  group_name?: string;
  new_name?: string;
  rejected_name?: string;
  reason?: string | null;
}

/** Named AppNotification so it does not clash with the DOM Notification type. */
export interface AppNotification {
  id: string;
  type: NotificationType;
  data: NotificationData | null;
  read_at: string | null;
  created_at: string;
}
