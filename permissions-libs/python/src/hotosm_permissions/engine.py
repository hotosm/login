"""Resolve a user's role on an item from its owner and its grants."""

from collections.abc import Iterable
from typing import Literal, Protocol, cast

from hotosm_permissions.context import PermissionContext
from hotosm_permissions.roles import ROLE_RANK, Role
from hotosm_permissions.tool_roles import ToolRoles

SubjectType = Literal["user", "team", "organization", "link"]


class GrantLike(Protocol):
    """Anything with these attributes works as a grant (ORM row, pydantic model).

    `subject_type` is one of `SubjectType`; `subject_id` is None for `link`.
    """

    @property
    def subject_type(self) -> str:
        """Who the grant is for."""

    @property
    def subject_id(self) -> str | None:
        """Login user or group id; None for a link grant."""

    @property
    def role(self) -> str:
        """The granted role."""


def _matches(grant: GrantLike, ctx: PermissionContext) -> bool:
    if grant.subject_type == "link":
        return True
    if grant.subject_type == "user":
        return ctx.user_id is not None and grant.subject_id == ctx.user_id
    if grant.subject_type in ("team", "organization"):
        return ctx.is_member(grant.subject_type, grant.subject_id)
    return False


def effective_role(
    owner_id: str | None,
    grants: Iterable[GrantLike],
    ctx: PermissionContext,
    tool_roles: ToolRoles,
) -> Role | None:
    """The highest role the context holds on an item, or None for no access.

    `owner` when `ctx.user_id == owner_id`, checked locally so it works when
    Login is down. Otherwise the highest matching grant: a link grant matches
    anyone, a user grant matches `ctx.user_id`, a team/organization grant
    matches an approved membership. Grants whose role is `owner` or is not
    enabled in `tool_roles` are ignored.
    """
    if ctx.user_id is not None and ctx.user_id == owner_id:
        return "owner"

    grantable = set(tool_roles.grantable_roles)
    best: Role | None = None
    for grant in grants:
        if grant.role not in grantable or not _matches(grant, ctx):
            continue
        if best is None or ROLE_RANK[grant.role] > ROLE_RANK[best]:
            best = cast(Role, grant.role)
    return best


def can(
    permission: str,
    owner_id: str | None,
    grants: Iterable[GrantLike],
    ctx: PermissionContext,
    tool_roles: ToolRoles,
) -> bool:
    """Whether the context's role on an item includes the permission."""
    role = effective_role(owner_id, grants, ctx, tool_roles)
    return role is not None and tool_roles.has_permission(role, permission)
