"""Add pending_edit column to groups.

Revision ID: 009
Revises: 008
Create Date: 2026-09-29

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
    """Add nullable pending_edit JSON column for staged organization edits."""
    op.add_column(
        "groups",
        sa.Column("pending_edit", sa.JSON(), nullable=True),
    )


def downgrade() -> None:
    """Drop pending_edit column from groups."""
    op.drop_column("groups", "pending_edit")
