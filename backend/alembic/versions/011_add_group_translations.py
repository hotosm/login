"""Add default_locale, tagline and video_url to groups; create group_translations.

Revision ID: 011
Revises: 010
Create Date: 2026-10-19

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "011"
down_revision: str | None = "010"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add the groups' base locale and a table for per-locale content.

    Allowed locales are validated in the app, not here, so a new language
    needs no migration. Existing content stays in groups as the base locale.
    """
    op.add_column(
        "groups",
        sa.Column("default_locale", sa.String(10), nullable=False, server_default="en"),
    )
    op.add_column("groups", sa.Column("tagline", sa.String(120), nullable=True))
    op.add_column("groups", sa.Column("video_url", sa.String(500), nullable=True))
    op.create_table(
        "group_translations",
        sa.Column(
            "group_id",
            sa.String(36),
            sa.ForeignKey("groups.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("locale", sa.String(10), primary_key=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("tagline", sa.String(120), nullable=True),
        sa.Column("video_url", sa.String(500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    """Drop group_translations and the columns added to groups."""
    op.drop_table("group_translations")
    op.drop_column("groups", "video_url")
    op.drop_column("groups", "tagline")
    op.drop_column("groups", "default_locale")
