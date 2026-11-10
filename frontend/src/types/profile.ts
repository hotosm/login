export interface ApiTokenMeta {
  id: string;
  app: string;
  created_at: string;
  last_used_at: string | null;
}

export interface UserProfile {
  hanko_user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  picture_url: string | null;
  language: string;
  is_public: boolean;
  slug: string | null;
  // null means the slug can be changed now; a future date means it's locked.
  next_slug_change_at: string | null;
  osm_user_id: number | null;
  osm_username: string | null;
  osm_avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
}
