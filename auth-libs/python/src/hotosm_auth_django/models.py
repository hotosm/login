"""
Django ORM models for HOTOSM authentication persistence.

These models are equivalent to the SQLAlchemy models in hotosm_auth.db_models,
allowing Django applications to use the same database schema.
"""

from django.db import models


class HankoUserMapping(models.Model):
    """Maps Hanko user IDs to application-specific user IDs.

    This table allows apps with existing user systems to maintain their
    existing user IDs while using Hanko for authentication.

    Schema matches SQLAlchemy model in hotosm_auth.db_models for cross-framework
    compatibility. Both FastAPI and Django apps can share the same table.

    Example usage:
        1. User logs in with Hanko -> gets hanko_user_id (UUID)
        2. Look up mapping: hanko_user_id -> app_user_id
        3. Use app_user_id for all application logic
    """

    class Meta:
        db_table = "hanko_user_mappings"
        constraints = [
            models.UniqueConstraint(
                fields=["hanko_user_id", "app_name"],
                name="uq_hanko_app",
            ),
        ]
        indexes = [
            models.Index(
                fields=["app_user_id", "app_name"],
                name="idx_app_user_id",
            ),
        ]

    # Hanko user UUID (from JWT)
    hanko_user_id = models.CharField(
        max_length=255,
        primary_key=True,
        help_text="Hanko user UUID from JWT",
    )

    # Application-specific user ID (your existing ID format)
    app_user_id = models.CharField(
        max_length=255,
        help_text="Application user ID",
    )

    # Application identifier (useful if sharing Hanko across multiple apps)
    app_name = models.CharField(
        max_length=255,
        default="default",
        help_text="Application name for multi-app deployments",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        hanko_short = self.hanko_user_id[:8] if self.hanko_user_id else "?"
        return f"HankoUserMapping(hanko={hanko_short}..., app_user={self.app_user_id})"
