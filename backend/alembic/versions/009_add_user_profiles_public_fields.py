"""Add is_public and slug_updated_at to user_profiles.

Revision ID: 009
Revises: 008
Create Date: 2026-09-17

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "009"
down_revision: str | None = "008"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add the public-profile opt-in flag and slug change-cooldown timestamp."""
    op.add_column(
        "user_profiles",
        sa.Column(
            "is_public", sa.Boolean(), nullable=False, server_default=sa.false()
        ),
    )
    op.add_column(
        "user_profiles",
        sa.Column("slug_updated_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    """Drop is_public and slug_updated_at from user_profiles."""
    op.drop_column("user_profiles", "slug_updated_at")
    op.drop_column("user_profiles", "is_public")
