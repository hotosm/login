"""
SQLAlchemy models for HOTOSM authentication persistence.

These are REFERENCE IMPLEMENTATIONS. Each application should copy this
to their own codebase and adapt as needed.

For example:
    # In your app: app/models/auth.py
    from sqlalchemy import Column, String, DateTime, Index, UniqueConstraint
    from sqlalchemy.sql import func
    from app.database import Base

    class HankoUserMapping(Base):
        '''Maps Hanko user IDs to application-specific user IDs.'''
        __tablename__ = "hanko_user_mappings"

        hanko_user_id = Column(String, primary_key=True)
        app_user_id = Column(String, nullable=False)
        app_name = Column(String, nullable=False, default="my-app")
        created_at = Column(DateTime, server_default=func.now())
        updated_at = Column(DateTime, onupdate=func.now())

        __table_args__ = (
            UniqueConstraint('hanko_user_id', 'app_name'),
            Index('idx_app_user_id', 'app_user_id', 'app_name'),
        )
"""

from sqlalchemy import Column, DateTime, Index, String, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

# This is a standalone base - apps should use their own Base
Base = declarative_base()


class HankoUserMapping(Base):
    """Maps Hanko user IDs to application-specific user IDs.

    This table allows apps with existing user systems to maintain their
    existing user IDs while using Hanko for authentication.

    Example usage:
        1. User logs in with Hanko -> gets hanko_user_id (UUID)
        2. Look up mapping: hanko_user_id -> app_user_id
        3. Use app_user_id for all application logic

    This way foreign keys remain unchanged and data migrations are minimal.
    """

    __tablename__ = "hanko_user_mappings"

    # Hanko user UUID (from JWT)
    hanko_user_id = Column(String, primary_key=True, doc="Hanko user UUID from JWT")

    # Application-specific user ID (your existing ID format)
    app_user_id = Column(String, nullable=False, doc="Application user ID")

    # Application identifier (useful if sharing Hanko across multiple apps)
    app_name = Column(
        String,
        nullable=False,
        default="default",
        doc="Application name for multi-app deployments",
    )

    # Timestamps
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, onupdate=func.now())

    # Constraints and indexes
    __table_args__ = (
        # Each Hanko user can only map to one app user per app
        UniqueConstraint("hanko_user_id", "app_name", name="uq_hanko_app"),
        # Fast lookups by app_user_id
        Index("idx_app_user_id", "app_user_id", "app_name"),
    )

    def __repr__(self) -> str:
        return (
            f"<HankoUserMapping(hanko={self.hanko_user_id[:8]}..., "
            f"app_user={self.app_user_id}, app={self.app_name})>"
        )
