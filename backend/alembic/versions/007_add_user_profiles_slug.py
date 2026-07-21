"""Add slug column to user_profiles.

Revision ID: 007
Revises: 006
Create Date: 2026-07-20

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "007"
down_revision: str | None = "006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add nullable unique slug for public user profiles (/user/{slug})."""
    op.add_column(
        "user_profiles",
        sa.Column("slug", sa.String(80), nullable=True),
    )
    op.create_index(
        "ux_user_profiles_slug", "user_profiles", ["slug"], unique=True
    )


def downgrade() -> None:
    """Drop slug column from user_profiles."""
    op.drop_index("ux_user_profiles_slug", table_name="user_profiles")
    op.drop_column("user_profiles", "slug")
