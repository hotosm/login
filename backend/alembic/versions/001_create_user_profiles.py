"""Create user_profiles table.

Revision ID: 001
Revises:
Create Date: 2026-01-07

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create user_profiles table."""
    op.create_table(
        "user_profiles",
        sa.Column("hanko_user_id", sa.String(36), primary_key=True),
        sa.Column("first_name", sa.String(100), nullable=True),
        sa.Column("last_name", sa.String(100), nullable=True),
        sa.Column("picture_url", sa.String(500), nullable=True),
        sa.Column("language", sa.String(10), nullable=False, server_default="en"),
        sa.Column("osm_user_id", sa.Integer(), nullable=True),
        sa.Column("osm_username", sa.String(255), nullable=True),
        sa.Column("osm_avatar_url", sa.String(500), nullable=True),
        sa.Column("preferences", sa.JSON(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    # Create index on osm_user_id for lookups
    op.create_index("ix_user_profiles_osm_user_id", "user_profiles", ["osm_user_id"])


def downgrade() -> None:
    """Drop user_profiles table."""
    op.drop_index("ix_user_profiles_osm_user_id", table_name="user_profiles")
    op.drop_table("user_profiles")
