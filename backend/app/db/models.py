"""Database models for login backend."""

import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


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
