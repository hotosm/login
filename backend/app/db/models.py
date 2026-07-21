"""Database models for login backend."""

import uuid
from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


def _uuid_str() -> str:
    """Generate a UUID4 as a string (portable across Postgres and SQLite)."""
    return str(uuid.uuid4())


class UserProfile(Base):
    """User profile information.

    Stores extended profile data for users authenticated via Hanko.
    The hanko_user_id links to Hanko's users table.
    """

    __tablename__ = "user_profiles"

    # Primary key - same as Hanko user ID (UUID string)
    hanko_user_id: Mapped[str] = mapped_column(String(36), primary_key=True)

    # Profile fields
    first_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    picture_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)

    # Public profile slug (/user/{slug}); generated lazily from username/email.
    slug: Mapped[str | None] = mapped_column(String(80), nullable=True, unique=True)

    # OSM connection (cached from OAuth)
    osm_user_id: Mapped[int | None] = mapped_column(nullable=True)
    osm_username: Mapped[str | None] = mapped_column(String(255), nullable=True)
    osm_avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Preferences (flexible JSON field)
    preferences: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        onupdate=func.now(),
        nullable=True,
    )

    def __repr__(self) -> str:
        """Return short debug representation for logging."""
        return f"<UserProfile(hanko_user_id={self.hanko_user_id[:8]}...)>"


class UserApiToken(Base):
    """One non-expiring API token per (user, app) pair."""

    __tablename__ = "user_api_tokens"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        server_default=func.gen_random_uuid(),
    )
    hanko_user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("user_profiles.hanko_user_id", ondelete="CASCADE"),
        nullable=False,
    )
    app: Mapped[str] = mapped_column(Text, nullable=False)
    token_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    last_used_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    def __repr__(self) -> str:
        """Return short debug representation for logging."""
        return f"<UserApiToken(user={self.hanko_user_id[:8]}..., app={self.app})>"


# --- Teams & Organizations -------------------------------------------------
#
# A single ``groups`` table models both informal teams and official
# organizations, discriminated by ``type``. User references are stored as bare
# ``hanko_user_id`` strings (no FK to user_profiles): a member, invitee or
# account manager may exist in Hanko without ever having created a local
# profile row. Foreign keys are used only between the group-domain tables.

GROUP_TYPES = ("team", "organization")
GROUP_STATUSES = ("pending", "approved", "rejected")
MEMBER_ROLES = ("owner", "manager", "member")
INVITATION_STATUSES = ("pending", "accepted", "declined", "expired", "revoked")


class Group(Base):
    """A team (informal) or organization (official, needs approval)."""

    __tablename__ = "groups"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid_str)
    type: Mapped[str] = mapped_column(String(20), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Organization-only fields (nullable; enforced by business rules per type)
    contact_email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)
    avatar_key: Mapped[str | None] = mapped_column(String(500), nullable=True)
    banner_key: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Teams are always 'approved'; orgs move pending -> approved/rejected.
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="approved")
    # Proposed name change awaiting account-manager approval (orgs only).
    pending_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    # Whether the group exposes a public profile in portal (opt-in).
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_by: Mapped[str] = mapped_column(String(36), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True
    )

    __table_args__ = (
        CheckConstraint("type IN ('team', 'organization')", name="ck_groups_type"),
        CheckConstraint(
            "status IN ('pending', 'approved', 'rejected')",
            name="ck_groups_status",
        ),
        # Slug is unique per type: /org/{slug} and /team/{slug} are separate
        # namespaces, so the same slug may exist as both an org and a team.
        UniqueConstraint("type", "slug", name="ux_groups_type_slug"),
        Index("ix_groups_type_status", "type", "status"),
        Index("ix_groups_created_by", "created_by"),
    )

    def __repr__(self) -> str:
        """Return short debug representation for logging."""
        return f"<Group(id={self.id[:8]}..., type={self.type}, slug={self.slug})>"


class GroupMembership(Base):
    """A user's membership and role within a group.

    Roles govern group administration inside login only (not plan permissions,
    which look at membership rather than role). Hierarchy: owner > manager >
    member. Exactly one owner per group (enforced by business rules).
    """

    __tablename__ = "group_memberships"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid_str)
    group_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("groups.id", ondelete="CASCADE"),
        nullable=False,
    )
    hanko_user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        CheckConstraint(
            "role IN ('owner', 'manager', 'member')",
            name="ck_group_memberships_role",
        ),
        UniqueConstraint(
            "group_id", "hanko_user_id", name="ux_group_memberships_group_user"
        ),
        Index("ix_group_memberships_user", "hanko_user_id"),
        Index("ix_group_memberships_group", "group_id"),
    )

    def __repr__(self) -> str:
        """Return short debug representation for logging."""
        return (
            f"<GroupMembership(group={self.group_id[:8]}..., "
            f"user={self.hanko_user_id[:8]}..., role={self.role})>"
        )


class GroupInvitation(Base):
    """An email-anchored invitation to join an organization.

    Anchored on ``email`` (not hanko_user_id) because the invitee may not have
    an account yet: the hanko_user_id is resolved only when they accept.
    Teams do not use invitations (members are added directly).
    """

    __tablename__ = "group_invitations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid_str)
    group_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("groups.id", ondelete="CASCADE"),
        nullable=False,
    )
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="member")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    token: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    invited_by: Mapped[str] = mapped_column(String(36), nullable=False)
    invited_hanko_user_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    responded_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'accepted', 'declined', 'expired', 'revoked')",
            name="ck_group_invitations_status",
        ),
        CheckConstraint(
            "role IN ('owner', 'manager', 'member')",
            name="ck_group_invitations_role",
        ),
        # At most one live (pending) invitation per (group, email). Partial
        # unique index is supported by both Postgres and SQLite (>= 3.8).
        Index(
            "ux_group_invitations_pending",
            "group_id",
            "email",
            unique=True,
            postgresql_where=text("status = 'pending'"),
            sqlite_where=text("status = 'pending'"),
        ),
        Index("ix_group_invitations_email", "email"),
        Index("ix_group_invitations_group", "group_id"),
    )

    def __repr__(self) -> str:
        """Return short debug representation for logging."""
        return (
            f"<GroupInvitation(group={self.group_id[:8]}..., "
            f"email={self.email}, status={self.status})>"
        )


class AccountManager(Base):
    """Platform-level Account Manager role.

    Assigned by an Administrator (ADMIN_EMAILS). Administrators implicitly have
    this role in code, so they are not persisted here.
    """

    __tablename__ = "account_managers"

    hanko_user_id: Mapped[str] = mapped_column(String(36), primary_key=True)
    granted_by: Mapped[str] = mapped_column(String(36), nullable=False)
    granted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        """Return short debug representation for logging."""
        return f"<AccountManager(user={self.hanko_user_id[:8]}...)>"
