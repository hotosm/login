"""Create notifications table.

Revision ID: 008
Revises: 007
Create Date: 2026-08-29

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "008"
down_revision: str | None = "007"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create the generic in-app notifications table."""
    op.create_table(
        "notifications",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("hanko_user_id", sa.String(36), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("data", sa.JSON(), nullable=True),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index(
        "ix_notifications_hanko_user_id", "notifications", ["hanko_user_id"]
    )
    # Unread counts and the per-user feed both start from this pair.
    op.create_index(
        "ix_notifications_user_read", "notifications", ["hanko_user_id", "read_at"]
    )


def downgrade() -> None:
    """Drop notifications table."""
    op.drop_index("ix_notifications_user_read", table_name="notifications")
    op.drop_index("ix_notifications_hanko_user_id", table_name="notifications")
    op.drop_table("notifications")
