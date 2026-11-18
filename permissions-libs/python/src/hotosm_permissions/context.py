"""Who the user is and which Login groups they belong to, per request.

Build it once per request so a list of items is authorized without extra
calls to Login. Owner checks never need Login; everything that depends on
membership fails closed when Login can't be reached.
"""

from collections.abc import Iterable
from dataclasses import dataclass
from typing import Literal

GroupType = Literal["team", "organization"]
GroupRole = Literal["owner", "manager", "member"]

# Organization roles that may attribute an item to the organization.
ORG_MANAGER_ROLES: frozenset[str] = frozenset({"owner", "manager"})


@dataclass(frozen=True)
class Membership:
    """The user's membership in one Login team or organization.

    `status` is the group's approval status as returned by Login's
    `GET /api/groups` (e.g. `"approved"`), not a state of the membership.
    Only groups with `status == "approved"` count; a missing status counts as
    not approved.
    """

    group_type: GroupType
    group_id: str
    role: GroupRole
    status: str | None = None


@dataclass(frozen=True)
class PermissionContext:
    """A request-scoped snapshot of who the user is and what they belong to."""

    user_id: str | None
    memberships: tuple[Membership, ...] = ()
    login_ok: bool = True

    @classmethod
    def anonymous(cls) -> "PermissionContext":
        """Context for a request without a logged-in user."""
        return cls(user_id=None)

    @classmethod
    def login_unavailable(cls, user_id: str) -> "PermissionContext":
        """Context for a logged-in user whose groups could not be fetched."""
        return cls(user_id=user_id, login_ok=False)

    @classmethod
    def from_memberships(
        cls, user_id: str, memberships: Iterable[Membership]
    ) -> "PermissionContext":
        """Context for a logged-in user with the groups Login returned."""
        return cls(user_id=user_id, memberships=tuple(memberships))

    def _approved(
        self, group_type: str | None, group_id: str | None
    ) -> Membership | None:
        for m in self.memberships:
            if (
                m.group_type == group_type
                and m.group_id == group_id
                and m.status == "approved"
            ):
                return m
        return None

    def is_member(self, group_type: str | None, group_id: str | None) -> bool:
        """Whether the user belongs to the given approved group."""
        return self._approved(group_type, group_id) is not None

    def group_role(
        self, group_type: str | None, group_id: str | None
    ) -> GroupRole | None:
        """The user's role in the given approved group, or None."""
        membership = self._approved(group_type, group_id)
        return membership.role if membership else None

    def is_org_manager(self, org_id: str | None) -> bool:
        """Whether the user is an owner or manager of the approved organization."""
        return self.group_role("organization", org_id) in ORG_MANAGER_ROLES
