"""Schemas for teams, organizations, members and invitations.

This is the public contract consumed by portal (and later ChatMap), so field
names and shapes are kept stable and explicit.
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

GroupType = Literal["team", "organization"]
GroupStatus = Literal["pending", "approved", "rejected"]
MemberRole = Literal["owner", "manager", "member"]
InvitationStatus = Literal["pending", "accepted", "declined", "expired", "revoked"]


# --- Groups ----------------------------------------------------------------


class GroupCreate(BaseModel):
    """Request to create a team or organization."""

    type: GroupType
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(None, max_length=5000)
    contact_email: str | None = Field(None, max_length=320)
    website: str | None = Field(None, max_length=500)
    # Teams may seed members on creation by email (added directly, no invite).
    member_emails: list[str] | None = None


class GroupUpdate(BaseModel):
    """Editable group details. The ``name`` is NOT editable here.

    For organizations, changing the name goes through ``/name-change`` and
    requires account-manager approval.
    """

    description: str | None = Field(None, max_length=5000)
    contact_email: str | None = Field(None, max_length=320)
    website: str | None = Field(None, max_length=500)
    is_public: bool | None = None


class NameChangeRequest(BaseModel):
    """Request to change a group's name."""

    name: str = Field(..., min_length=1, max_length=200)


class GroupResponse(BaseModel):
    """Full group details (Details tab / management views)."""

    id: str
    type: GroupType
    name: str
    slug: str
    description: str | None = None
    contact_email: str | None = None
    website: str | None = None
    avatar_url: str | None = None
    banner_url: str | None = None
    status: GroupStatus
    pending_name: str | None = None
    is_public: bool
    created_by: str
    created_at: datetime
    updated_at: datetime | None = None
    # The requesting user's role in this group, when known.
    role: MemberRole | None = None
    members_count: int | None = None


class GroupListResponse(BaseModel):
    """Paginated list of groups."""

    items: list[GroupResponse]
    total: int
    page: int
    page_size: int


# --- Members ---------------------------------------------------------------


class MemberAdd(BaseModel):
    """Add a member directly by email (teams only)."""

    email: str = Field(..., min_length=3, max_length=320)
    role: MemberRole = "member"


class MemberRoleUpdate(BaseModel):
    """Change a member's role."""

    role: MemberRole


class MemberResponse(BaseModel):
    """A group member, enriched with profile data when available."""

    hanko_user_id: str
    role: MemberRole
    first_name: str | None = None
    last_name: str | None = None
    picture_url: str | None = None
    email: str | None = None
    created_at: datetime


class MemberListResponse(BaseModel):
    """Paginated list of members."""

    items: list[MemberResponse]
    total: int
    page: int
    page_size: int


# --- Invitations (organizations only) --------------------------------------


class InvitationCreate(BaseModel):
    """Invite a user to an organization by email."""

    email: str = Field(..., min_length=3, max_length=320)
    role: MemberRole = "member"


class InvitationResponse(BaseModel):
    """An organization invitation."""

    id: str
    group_id: str
    email: str
    role: MemberRole
    status: InvitationStatus
    invited_by: str
    created_at: datetime
    expires_at: datetime
    # Whether the invited email already has a HOT account. Set only on create;
    # None when unknown (e.g. Hanko unreachable) or in listings.
    recipient_exists: bool | None = None


class MyInvitationResponse(InvitationResponse):
    """An invitation as seen by its recipient, with group context.

    Includes the accept/decline ``token``: safe to expose here because the list
    is scoped to the recipient's own email.
    """

    token: str
    group_name: str
    group_type: GroupType


# --- Consumer contract (portal, ChatMap) -----------------------------------


class MyGroupItem(BaseModel):
    """A group the current user belongs to (for the plan scope selector)."""

    id: str
    type: GroupType
    slug: str
    name: str
    role: MemberRole
    status: GroupStatus
    avatar_url: str | None = None


class MyGroupsResponse(BaseModel):
    """The full set of groups a user belongs to (single call, no N+1)."""

    groups: list[MyGroupItem]


class MembershipCheckResponse(BaseModel):
    """Answer to 'is this user a member of this group (with >= role)?'."""

    is_member: bool
    role: MemberRole | None = None
    satisfies_min_role: bool


# --- Public profiles (rendered by portal in a later stage) -----------------


class PublicGroupResponse(BaseModel):
    """Public-facing group profile."""

    type: GroupType
    name: str
    slug: str
    description: str | None = None
    website: str | None = None
    avatar_url: str | None = None
    banner_url: str | None = None
    members_count: int


class PublicUserResponse(BaseModel):
    """Public-facing user profile."""

    slug: str
    first_name: str | None = None
    last_name: str | None = None
    picture_url: str | None = None
