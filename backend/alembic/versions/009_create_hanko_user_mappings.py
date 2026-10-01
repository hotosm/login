"""Create hanko_user_mappings table.

Links a Hanko user to their account in an external app. Used by the LearnWorlds
Custom SSO endpoint; the shape matches the table auth-libs creates in the apps
that own a database, so its helpers work against it unchanged.

Revision ID: 009
Revises: 008
Create Date: 2026-09-28

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
    """Create hanko_user_mappings table."""
    op.create_table(
        "hanko_user_mappings",
        sa.Column("hanko_user_id", sa.String(255), primary_key=True),
        sa.Column(
            "app_name",
            sa.String(255),
            primary_key=True,
            server_default="default",
        ),
        sa.Column("app_user_id", sa.String(255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        # Naming the constraint makes the primary key come out as uq_hanko_app,
        # which is the name auth-libs looks for before adding its own unique
        # constraint. Same columns, so its idempotent SQL finds it and moves on.
        sa.UniqueConstraint("hanko_user_id", "app_name", name="uq_hanko_app"),
    )
    op.create_index(
        "idx_app_user_id",
        "hanko_user_mappings",
        ["app_user_id", "app_name"],
    )


def downgrade() -> None:
    """Drop hanko_user_mappings table."""
    op.drop_index("idx_app_user_id", table_name="hanko_user_mappings")
    op.drop_table("hanko_user_mappings")
