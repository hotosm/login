"""Create group_invitations table.

Revision ID: 005
Revises: 004
Create Date: 2026-07-20

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "005"
down_revision: str | None = "004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create group_invitations table (organizations only)."""
    op.create_table(
        "group_invitations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "group_id",
            sa.String(36),
            sa.ForeignKey("groups.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("email", sa.String(320), nullable=False),
        sa.Column(
            "role", sa.String(20), nullable=False, server_default="member"
        ),
        sa.Column(
            "status", sa.String(20), nullable=False, server_default="pending"
        ),
        sa.Column("token", sa.String(64), nullable=False, unique=True),
        sa.Column("invited_by", sa.String(36), nullable=False),
        sa.Column("invited_hanko_user_id", sa.String(36), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("responded_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "status IN ('pending', 'accepted', 'declined', 'expired', 'revoked')",
            name="ck_group_invitations_status",
        ),
        sa.CheckConstraint(
            "role IN ('owner', 'manager', 'member')",
            name="ck_group_invitations_role",
        ),
    )
    # At most one live (pending) invitation per (group, email).
    op.create_index(
        "ux_group_invitations_pending",
        "group_invitations",
        ["group_id", "email"],
        unique=True,
        postgresql_where=sa.text("status = 'pending'"),
    )
    op.create_index(
        "ix_group_invitations_email", "group_invitations", ["email"]
    )
    op.create_index(
        "ix_group_invitations_group", "group_invitations", ["group_id"]
    )


def downgrade() -> None:
    """Drop group_invitations table."""
    op.drop_index("ix_group_invitations_group", table_name="group_invitations")
    op.drop_index("ix_group_invitations_email", table_name="group_invitations")
    op.drop_index(
        "ux_group_invitations_pending", table_name="group_invitations"
    )
    op.drop_table("group_invitations")
