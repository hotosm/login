# hotosm-permissions

Shared permissions for HOT tools: one catalog of permissions, one set of
roles, one rule to resolve a user's role on an item, and one REST contract for
sharing. Each tool keeps its own grants table; this library only decides what
those grants mean.

No framework code and no calls to Login: the only dependency is `pydantic`.

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

The schemas accept any grantable role; each tool must check it against its
`ToolRoles` and reject the ones it doesn't enable.

## Local development

The package isn't published yet. From
[hot-dev-env](https://github.com/hotosm/hot-dev-env), run:

```bash
make dev-portal-permissions
```

It starts Portal and Login with `permissions-libs/python/src` mounted into
`portal-backend` and added to its `PYTHONPATH`.
