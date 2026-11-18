# hotosm-permissions

Shared permissions for HOT tools: one catalog of permissions, one set of
roles, one rule to resolve a user's role on an item, and one REST contract for
sharing. Each tool keeps its own grants table; this library only decides what
those grants mean.

No framework code. Dependencies: `pydantic`, and `httpx` for the Login client.

## Roles

Every tool uses the same ordered roles: `viewer < contributor < editor <
owner`. `owner` belongs to whoever owns the item and is never granted. Roles
are cumulative: a higher role has every permission of the lower ones.

## Permission keys

Permissions are strings `tool:resource.action`, e.g. `portal:plans.edit`. The
catalog (`catalog.py`) lists each tool's permissions, the roles available in
that tool, and the role that first gets each permission.

| Tool      | Roles available                         | Permissions (role that gets it)                                                                             |
| --------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `portal`  | viewer, editor, owner                   | `plans.view` (viewer), `plans.edit` (editor), `plans.share`, `plans.attribute`, `plans.delete` (owner)      |
| `chatmap` | viewer, contributor, editor, owner      | `maps.view` (viewer), `tags.add` (contributor), `points.edit` (editor), `maps.share`, `maps.delete` (owner) |
| `oam`     | viewer, owner                           | `imagery.view` (viewer), `imagery.attribute`, `imagery.delete` (owner)                                      |

## Registering a tool's roles

A tool picks the roles it enables (always including `owner`) and may override
how they are shown, only for roles it enables. Each text is resolved in this
order: the tool's override in the requested locale, the tool's override in
English, the default from `roles.py` (en, es, fr, pt) in the requested locale,
and the default in English.

```python
from hotosm_permissions import PermissionContext, RoleDisplay, ToolRoles, can

CHATMAP_ROLES = ToolRoles(
    "chatmap",
    roles=["viewer", "contributor", "editor", "owner"],
    display={
        "contributor": RoleDisplay(
            label={"en": "Add tags"},
            description={"en": "Can add tags to points, but not edit them"},
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
Whether Login is enabled at all is the tool's decision.

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

1. Add a `Permission("tool:resource.action", "Short description")` to the
   tool's `ToolCatalog` in `catalog.py`.
2. Add its key to the `role_permissions` entry of the lowest role that should
   get it.
3. Note it in `CHANGELOG.md`.

A new tool needs its own `ToolCatalog`, registered in `CATALOGS`.

## REST contract

Every tool exposes the same routes, relative to the item URL, using the models
in `schemas.py`. Every write returns `ItemAccess`, which includes
`available_roles` so the share dialog can render the tool's roles.

| Method           | Path                                  | Body                |
| ---------------- | ------------------------------------- | ------------------- |
| `GET`            | `/access`                             |                     |
| `PUT`            | `/access/link`                        | `LinkUpdate`        |
| `DELETE`         | `/access/link`                        |                     |
| `POST`           | `/access/user`                        | `UserGrantCreate`   |
| `PUT`            | `/access/{subject_type}/{subject_id}` | `GrantRoleUpdate`   |
| `DELETE`         | `/access/{subject_type}/{subject_id}` |                     |
| `PUT`            | `/attribution`                        | `AttributionUpdate` |

`GET /access` is owner only (the `*.share` permission): viewers and editors
must not see who else has access, so a non-owner gets 403.

The schemas accept any grantable role; each tool must check it against its
`ToolRoles` and reject the ones it doesn't enable.

Every `/access…` and `/attribution` route accepts `?locale=` (`en`, `es`,
`fr`, `pt`; default `en`, unknown values fall back to `en`) and passes it to
`ToolRoles.role_options(locale)` to localize `available_roles`.

`ItemAccess` also says what the tool offers, so the dialog needs no
tool-specific config:

- `link_roles`: roles "anyone with the link" may get. `PUT /access/link` must
  reject any other role. Empty means the tool has no link sharing.
- `attribution_enabled`: whether the tool offers the "By" (attribute to an
  organization). `PUT /attribution` must answer 400 when it is false.

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
