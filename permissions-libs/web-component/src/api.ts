/**
 * Typed fetch helpers for the share dialog, mirroring the hotosm-permissions
 * REST contract (permissions-libs/python/src/hotosm_permissions/schemas.py)
 * and Login's group endpoints.
 */

export type Role = "viewer" | "contributor" | "editor" | "owner";
export type GrantableRole = Exclude<Role, "owner">;
export type GroupType = "team" | "organization";
export type SubjectType = "user" | GroupType;

export interface RoleOption {
  key: Role;
  label: string;
  description: string;
}

export interface AccessGrant {
  subject_type: SubjectType;
  subject_id: string;
  subject_name: string | null;
  role: GrantableRole;
}

export interface ItemAccess {
  owner: { id: string; name: string | null };
  attribution: { id: string; name: string | null } | null;
  grants: AccessGrant[];
  link_role: GrantableRole | null;
  my_role: Role | null;
  available_roles: RoleOption[];
  link_roles: GrantableRole[];
  attribution_enabled: boolean;
}

/** A group the caller belongs to (Login `GET /api/groups`). */
export interface MyGroup {
  id: string;
  type: GroupType;
  slug: string;
  name: string;
  role: "owner" | "manager" | "member";
  status: string;
  avatar_url: string | null;
}

/** A public group (Login `GET /api/public/groups`). */
export interface PublicGroup {
  id: string;
  type: GroupType;
  slug: string;
  name: string;
  avatar_url: string | null;
}

/** A non-2xx answer from the tool's `/access…` or `/attribution` routes. */
export class AccessError extends Error {
  constructor(public status: number) {
    super(`[${status}] Access request failed`);
  }
}

type Method = "GET" | "POST" | "PUT" | "DELETE";

function trimSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Call `{accessUrl}{path}?locale=` on the tool. Every route answers with the
 * full `ItemAccess`.
 */
export async function accessRequest(
  accessUrl: string,
  path: string,
  locale: string,
  method: Method = "GET",
  body?: unknown,
): Promise<ItemAccess> {
  const url = `${trimSlash(accessUrl)}${path}?locale=${encodeURIComponent(locale)}`;
  const response = await fetch(url, {
    method,
    credentials: "include",
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new AccessError(response.status);
  return response.json();
}

/** The caller's groups from Login; [] if Login fails. */
export async function fetchMyGroups(loginUrl: string): Promise<MyGroup[]> {
  try {
    const response = await fetch(`${trimSlash(loginUrl)}/api/groups`, {
      credentials: "include",
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data?.groups) ? data.groups : [];
  } catch {
    return [];
  }
}

/** Public groups whose name matches `q`; [] if Login fails. */
export async function searchPublicGroups(
  loginUrl: string,
  q: string,
  signal?: AbortSignal,
): Promise<PublicGroup[]> {
  const params = new URLSearchParams({ q, page_size: "10" });
  try {
    const response = await fetch(
      `${trimSlash(loginUrl)}/api/public/groups?${params}`,
      { signal },
    );
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data?.items) ? data.items : [];
  } catch {
    return [];
  }
}
