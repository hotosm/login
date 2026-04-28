"""Create user_api_tokens table.

Revision ID: 002
Revises: 001
Create Date: 2026-04-16

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "002"
down_revision: str | None = "001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create user_api_tokens table."""
    op.create_table(
        "user_api_tokens",
        sa.Column(
            "id",
            sa.Uuid(),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "hanko_user_id",
            sa.String(36),
            sa.ForeignKey("user_profiles.hanko_user_id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("app", sa.Text(), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False, unique=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_index(
        "ux_user_api_tokens_one_per_user_per_app",
        "user_api_tokens",
        ["hanko_user_id", "app"],
        unique=True,
    )
    op.create_index(
        "ix_user_api_tokens_hanko_user_id",
        "user_api_tokens",
        ["hanko_user_id"],
    )


def downgrade() -> None:
    """Drop user_api_tokens table."""
    op.drop_index(
        "ix_user_api_tokens_hanko_user_id", table_name="user_api_tokens"
    )
    op.drop_index(
        "ux_user_api_tokens_one_per_user_per_app", table_name="user_api_tokens"
    )
    op.drop_table("user_api_tokens")
