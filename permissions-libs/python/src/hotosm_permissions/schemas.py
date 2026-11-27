"""The sharing REST contract every tool exposes, so one share dialog fits all.

Routes, relative to the item URL (e.g. `/api/plans/{plan_id}`):

- `GET /access`: owner, grants and link state. Owner only (the
  `*.share` permission); a viewer or editor gets 403.
- `PUT /access/link` (`LinkUpdate`): let anyone with the link access the item.
- `DELETE /access/link`: remove link access.
- `POST /access/user` (`UserGrantCreate`): share with a person, by email.
  Answers 404 when no account has that email and 409 when that person
  already owns the item.
- `PUT /access/{subject_type}/{subject_id}` (`GrantRoleUpdate`): set the role
  of a user, team or organization.
- `DELETE /access/{subject_type}/{subject_id}`: remove that access.
- `PUT /access/owner` (`OwnerTransfer`): make a person who already has a
  `user` grant the new owner. Owner only (403 otherwise). Answers 404 when
  `user_id` has no `user` grant on the item, 400 when
  `owner_transfer_enabled` is false, and 204 No Content on success (the
  caller is no longer the owner). The tool removes the new owner's `user`
  grant (owner implies everything), gives the previous owner a `user` grant
  with role `editor`, and leaves team, organization and link grants as they
  are. Anything tool-specific is up to the tool.

Every other write returns `ItemAccess`.

The role fields accept any grantable role key. Each tool must validate the
role against its `ToolRoles` (`role in tool_roles.grantable_roles`) and reject
roles it does not enable. Which roles a link may carry is the tool's decision.

Every `/access…` route accepts `?locale=` (`en`, `es`, `fr` or `pt`; default
`en`, anything unknown falls back to `en`) and passes it to
`ToolRoles.role_options(locale)` to build `available_roles`.

`ItemAccess` tells the dialog what the tool offers, so it needs no
tool-specific config:

- `link_roles`: the roles "anyone with the link" may get. `PUT /access/link`
  must reject any other role. Empty means the tool has no link sharing.
- `owner_transfer_enabled`: whether the owner may transfer ownership with
  `PUT /access/owner`.

`PUT /access/{team|organization}/{id}` accepts any group the owner belongs to
or any public group (public and approved, for organizations), not only the
owner's groups. The tool resolves the group's name for the grant snapshot:
the owner's groups from Login's `/api/groups`, others from
`/api/public/groups?ids=`.
"""

from typing import Literal

from pydantic import BaseModel, Field

from hotosm_permissions.context import GroupType
from hotosm_permissions.roles import GrantableRole, Role
from hotosm_permissions.tool_roles import RoleOption


class AccessOwner(BaseModel):
    """The user who owns the item."""

    id: str
    name: str | None = None


class AccessGrant(BaseModel):
    """Access given to a user, team or organization."""

    subject_type: Literal["user"] | GroupType
    subject_id: str
    subject_name: str | None = None
    role: GrantableRole


class ItemAccess(BaseModel):
    """Who owns an item, who else may access it, and the roles on offer."""

    owner: AccessOwner
    grants: list[AccessGrant]
    link_role: GrantableRole | None = None
    my_role: Role | None = None
    # The tool's roles, localized, so the dialog needs no tool-specific config.
    available_roles: list[RoleOption]
    # Roles "anyone with the link" may get; empty = no link sharing.
    link_roles: list[GrantableRole] = []
    # Whether `PUT /access/owner` is available.
    owner_transfer_enabled: bool = False


class GrantRoleUpdate(BaseModel):
    """Body of `PUT /access/{subject_type}/{subject_id}`."""

    role: GrantableRole


class UserGrantCreate(BaseModel):
    """Body of `POST /access/user`."""

    email: str = Field(..., min_length=3, max_length=320)
    role: GrantableRole = "viewer"


class LinkUpdate(BaseModel):
    """Body of `PUT /access/link`."""

    role: GrantableRole = "viewer"


class OwnerTransfer(BaseModel):
    """Body of `PUT /access/owner`."""

    user_id: str
