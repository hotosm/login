// Shared types for Teams & Organizations (groups).

export type GroupType = 'team' | 'organization';
export type MemberRole = 'owner' | 'manager' | 'member';

// Short shape returned by GET /groups
export interface GroupSummary {
  id: string;
  type: GroupType;
  slug: string;
  name: string;
  role: MemberRole | null;
  status: string;
  avatar_url: string | null;
}

// Full shape returned by GET /groups/{id} and the create/update endpoints
export interface GroupResponse {
  id: string;
  type: GroupType;
  name: string;
  slug: string;
  description: string | null;
  contact_email: string | null;
  website: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  status: string;
  pending_name: string | null;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string | null;
  role: MemberRole | null;
  members_count: number;
}

export interface GroupMember {
  hanko_user_id: string;
  role: MemberRole;
  first_name: string | null;
  last_name: string | null;
  picture_url: string | null;
  email: string | null;
  created_at: string;
}

export interface MembersResponse {
  items: GroupMember[];
  total: number;
  page: number;
  page_size: number;
}

export interface Invitation {
  id: string;
  group_id: string;
  email: string;
  role: MemberRole;
  status: string;
  invited_by: string;
  created_at: string;
  expires_at: string;
}

// Invitation enriched with group info, returned by GET /me/invitations
export interface MyInvitation extends Invitation {
  token: string;
  group_name: string;
  group_type: GroupType;
}
