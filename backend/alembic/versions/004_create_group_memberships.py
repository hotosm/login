"""Create group_memberships table.

Revision ID: 004
Revises: 003
Create Date: 2026-07-20

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "004"
down_revision: str | None = "003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create group_memberships table."""
    op.create_table(
        "group_memberships",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "group_id",
            sa.String(36),
            sa.ForeignKey("groups.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("hanko_user_id", sa.String(36), nullable=False),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.CheckConstraint(
            "role IN ('owner', 'manager', 'member')",
            name="ck_group_memberships_role",
        ),
        sa.UniqueConstraint(
            "group_id", "hanko_user_id", name="ux_group_memberships_group_user"
        ),
    )
    op.create_index(
        "ix_group_memberships_user", "group_memberships", ["hanko_user_id"]
    )
    op.create_index(
        "ix_group_memberships_group", "group_memberships", ["group_id"]
    )


def downgrade() -> None:
    """Drop group_memberships table."""
    op.drop_index("ix_group_memberships_group", table_name="group_memberships")
    op.drop_index("ix_group_memberships_user", table_name="group_memberships")
    op.drop_table("group_memberships")
