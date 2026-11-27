# hotosm-permissions

Shared permissions for HOT tools: one way to define permissions, one set of
roles, one rule to resolve a user's role on an item, and one REST contract for
sharing. Each tool keeps its own grants table; this library only decides what
those grants mean.

No framework code. Dependencies: `pydantic`, and `httpx` for the Login client.

## Roles

Every tool uses the same ordered roles: `viewer < contributor < editor <
owner`. `owner` belongs to whoever owns the item and is never granted. Roles
are cumulative: a higher role has every permission of the lower ones.

## Permission keys

Permissions are strings `tool:resource.action`, e.g. `portal:plans.edit`.
Each tool defines its own permissions in its own code; this library holds no
tool's catalog.

## Registering a tool's roles

A tool defines its `ToolCatalog` (its permissions, the roles it enables,
always including `owner`, and the role that first gets each permission) and
passes it to `ToolRoles`. It may override how roles are shown, only for roles
it enables. Each text is resolved in this order: the tool's override in the
requested locale, the tool's override in English, the default from `roles.py`
(en, es, fr, pt) in the requested locale, and the default in English.

```python
from hotosm_permissions import (
    Permission,
    PermissionContext,
    RoleDisplay,
    ToolCatalog,
    ToolRoles,
    can,
)

CHATMAP_CATALOG = ToolCatalog(
    tool="chatmap",
    available_roles=("viewer", "contributor", "editor", "owner"),
    permissions=(
        Permission("chatmap:maps.view", "View a map"),
        Permission("chatmap:tags.edit", "Edit tags on points"),
        Permission("chatmap:points.edit", "Edit points"),
        Permission("chatmap:maps.share", "Share a map with others"),
        Permission("chatmap:maps.delete", "Delete a map"),
    ),
    role_permissions={
        "viewer": ("chatmap:maps.view",),
        "contributor": ("chatmap:tags.edit",),
        "editor": ("chatmap:points.edit",),
        "owner": ("chatmap:maps.share", "chatmap:maps.delete"),
    },
)

CHATMAP_ROLES = ToolRoles(
    CHATMAP_CATALOG,
    display={
        "contributor": RoleDisplay(
            label={"en": "Edit tags"},
            description={"en": "Can edit tags on points, but not the points"},
        ),
    },
)

ctx = PermissionContext.from_memberships(user_id, memberships)
if can("chatmap:points.edit", map.owner_id, map.grants, ctx, CHATMAP_ROLES):
    ...
```

`effective_role` returns `owner` when the user owns the item (checked locally,
so it works when Login is down); otherwise the highest grant that matches the
user, an approved team/organization they belong to, or the link. Anything
unknown fails closed.

Tools return `ToolRoles.permissions_for(role)` (the sorted permission keys of
the user's role on the item) as `my_permissions`, so their frontend checks
permission keys, not roles.

## Talking to Login

`LoginClient` wraps the Login endpoints a tool needs:

- `GET /api/groups`: the user's groups (`get_user_groups`), forwarding the
  `hanko` cookie. Cached per user for `groups_ttl` seconds (60 by default);
  concurrent misses for the same user share one request. A rejected session
  (401/403) returns `[]` without caching it. Call `invalidate(user_id)` after
  a membership change.
- `GET /api/users/lookup?email=`: resolve an email to an account
  (`lookup_user_by_email`). Not cached.
- `GET /api/public/groups`: search public teams and organizations
  (`list_public_groups`). No cookie, not cached. Pass `ids=` to resolve
  public groups by id (e.g. names for share grants).

Every failure (unreachable Login, an error response, a malformed payload)
raises `LoginUnavailable` and is never cached, so the tool can fail closed.

```python
from hotosm_permissions import LoginClient, LoginUnavailable, PermissionContext

login = LoginClient("https://login.hotosm.org")  # once, at startup

# per request
try:
    groups = await login.get_user_groups(user.id, hanko_cookie)
    ctx = PermissionContext.from_login_groups(user.id, groups)
except LoginUnavailable:
    ctx = PermissionContext.login_unavailable(user.id)
```

## Adding a permission

In your tool, add a `Permission("tool:resource.action", "Short description")`
to your `ToolCatalog` and add its key to the `role_permissions` entry of the
lowest role that should get it. Nothing changes in this library.

## REST contract

Every tool exposes the same routes, relative to the item URL, using the models
in `schemas.py`. Every write except `PUT /access/owner` returns `ItemAccess`, which includes
`available_roles` so the share dialog can render the tool's roles.

| Method           | Path                                  | Body                |
| ---------------- | ------------------------------------- | ------------------- |
| `GET`            | `/access`                             |                     |
| `PUT`            | `/access/link`                        | `LinkUpdate`        |
| `DELETE`         | `/access/link`                        |                     |
| `POST`           | `/access/user`                        | `UserGrantCreate`   |
| `PUT`            | `/access/{subject_type}/{subject_id}` | `GrantRoleUpdate`   |
| `DELETE`         | `/access/{subject_type}/{subject_id}` |                     |
| `PUT`            | `/access/owner`                       | `OwnerTransfer`     |

`GET /access` is owner only (the `*.share` permission): viewers and editors
must not see who else has access, so a non-owner gets 403.

`POST /access/user` answers 404 when no account has that email and 409 when
that person already owns the item.

`PUT /access/owner` makes a person who already has a `user` grant the new
owner; never a team, organization or the link. Owner only (403 otherwise).
It answers 404 when `user_id` has no `user` grant on the item, 400 when
`owner_transfer_enabled` is false, and **204 No Content** on success, since
the caller is no longer the owner. The tool removes the new owner's `user`
grant (owner implies everything), gives the previous owner a `user` grant
with role `editor`, and leaves team, organization and link grants unchanged.
Anything tool-specific (e.g. resetting attribution) is the tool's business.

The schemas accept any grantable role; each tool must check it against its
`ToolRoles` and reject the ones it doesn't enable.

Every `/access…` route accepts `?locale=` (`en`, `es`, `fr`, `pt`; default
`en`, unknown values fall back to `en`) and passes it to
`ToolRoles.role_options(locale)` to localize `available_roles`.

`ItemAccess` also says what the tool offers, so the dialog needs no
tool-specific config:

- `link_roles`: roles "anyone with the link" may get. `PUT /access/link` must
  reject any other role. Empty means the tool has no link sharing.
- `owner_transfer_enabled` (default `false`): whether `PUT /access/owner` is
  available, so the dialog offers "Make owner".

`PUT /access/{team|organization}/{id}` accepts any group the owner belongs to
or any public group (public and approved, for organizations), not only the
owner's groups. The tool resolves the group's name for the grant snapshot:
the owner's groups from `/api/groups`, others from `/api/public/groups?ids=`.

## Local development

The package isn't published yet. From
[hot-dev-env](https://github.com/hotosm/hot-dev-env), run:

```bash
make dev-portal-permissions
```

It starts Portal and Login with `permissions-libs/python/src` mounted into
`portal-backend` and added to its `PYTHONPATH`.
