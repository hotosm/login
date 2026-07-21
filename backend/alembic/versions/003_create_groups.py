"""Create groups table.

Revision ID: 003
Revises: 002
Create Date: 2026-07-20

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "003"
down_revision: str | None = "002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create groups table (teams and organizations)."""
    op.create_table(
        "groups",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("slug", sa.String(80), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("contact_email", sa.String(320), nullable=True),
        sa.Column("website", sa.String(500), nullable=True),
        sa.Column("avatar_key", sa.String(500), nullable=True),
        sa.Column("banner_key", sa.String(500), nullable=True),
        sa.Column(
            "status", sa.String(20), nullable=False, server_default="approved"
        ),
        sa.Column("pending_name", sa.String(200), nullable=True),
        sa.Column(
            "is_public",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column("created_by", sa.String(36), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "type IN ('team', 'organization')", name="ck_groups_type"
        ),
        sa.CheckConstraint(
            "status IN ('pending', 'approved', 'rejected')",
            name="ck_groups_status",
        ),
        sa.UniqueConstraint("type", "slug", name="ux_groups_type_slug"),
    )
    op.create_index("ix_groups_type_status", "groups", ["type", "status"])
    op.create_index("ix_groups_created_by", "groups", ["created_by"])


def downgrade() -> None:
    """Drop groups table."""
    op.drop_index("ix_groups_created_by", table_name="groups")
    op.drop_index("ix_groups_type_status", table_name="groups")
    op.drop_table("groups")
