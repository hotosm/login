"""Create account_managers table.

Revision ID: 006
Revises: 005
Create Date: 2026-07-20

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "006"
down_revision: str | None = "005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create account_managers table."""
    op.create_table(
        "account_managers",
        sa.Column("hanko_user_id", sa.String(36), primary_key=True),
        sa.Column("granted_by", sa.String(36), nullable=False),
        sa.Column(
            "granted_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )


def downgrade() -> None:
    """Drop account_managers table."""
    op.drop_table("account_managers")
