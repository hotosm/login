"""Create allowed_origins table for admin-managed CORS.

Seeds it with the list that used to be hardcoded in app/main.py, so the
behaviour right after this migration is identical to before it.

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

_SEED_ORIGINS = [
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3040",
        "http://127.0.0.1:3040",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "https://portal.hotosm.test",
        "https://login.hotosm.test",
        "https://dronetm.hotosm.test",
        "https://fair.hotosm.test",
        "https://openaerialmap.hotosm.test",
        "https://chatmap.hotosm.test",
        "https://umap.hotosm.test",
        "https://export-tool.hotosm.test",
        "https://portal.hotosm.org",
        "https://dev.portal.hotosm.org",
        "https://dev.login.hotosm.org",
        "https://login.hotosm.org",
        "https://chatmap.hotosm.org",
        "https://chatmap-dev.hotosm.org",
        "https://dev.chatmap.hotosm.org",
        "https://fair.hotosm.org",
        "https://fair-dev.hotosm.org",
        "https://stage.ai.hotosm.org",
        "https://dev.ai.hotosm.org",
        "https://umap.hotosm.org",
        "https://umap-dev.hotosm.org",
        "https://field.hotosm.org",
        "https://fieldtm.hotosm.org",
        "https://stage.imagery.hotosm.org",
        "https://upload.stage.imagery.hotosm.org",
        "https://dronetm.testlogin.hotosm.org",
        "https://fair.testlogin.hotosm.org",
        "https://umap.testlogin.hotosm.org",
        "https://export.testlogin.hotosm.org",
        "https://fieldtm.testlogin.hotosm.org",
        "https://drone.hotosm.org",
        "https://drone-dev.hotosm.org",
        "https://dev.drone.hotosm.org",
]


def upgrade() -> None:
    """Create the table and seed it from the previously hardcoded list."""
    op.create_table(
        "allowed_origins",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("origin", sa.String(255), nullable=False),
        sa.Column("note", sa.String(255), nullable=True),
        sa.Column(
            "enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")
        ),
        sa.Column("created_by", sa.String(36), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.UniqueConstraint("origin", name="uq_allowed_origins_origin"),
    )

    # Seeded with a deterministic id so re-running on a fresh database gives the
    # same rows, and so the seed can be told apart from rows added by hand.
    import uuid

    namespace = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")
    op.bulk_insert(
        sa.table(
            "allowed_origins",
            sa.column("id", sa.String),
            sa.column("origin", sa.String),
            sa.column("note", sa.String),
        ),
        [
            {
                "id": str(uuid.uuid5(namespace, origin)),
                "origin": origin,
                "note": "seeded from app/main.py",
            }
            for origin in _SEED_ORIGINS
        ],
    )


def downgrade() -> None:
    """Drop the table; the hardcoded list is restored by reverting the code."""
    op.drop_table("allowed_origins")
