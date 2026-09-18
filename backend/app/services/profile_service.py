"""Business logic for user profile slugs (public profile at /user/{slug}).

Mirrors the slug helpers in ``groups_service``, but against ``UserProfile``'s
single global slug namespace (unlike ``Group``, which is unique per type).
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import UserProfile
from app.services import groups_service

SLUG_CHANGE_COOLDOWN_DAYS = 15


def _now() -> datetime:
    """Return the current UTC time."""
    return datetime.now(timezone.utc)


async def generate_unique_user_slug(
    db: AsyncSession, base: str, *, exclude_hanko_user_id: str | None = None
) -> str:
    """Suggest an available user-profile slug derived from ``base``.

    Disambiguates collisions with ``-2``, ``-3``, ... like
    ``groups_service.generate_unique_slug``, but checks against
    ``UserProfile.slug`` (a single namespace shared by all users).
    """
    normalized = groups_service.slugify(base)
    if not normalized or normalized in groups_service.RESERVED_SLUGS:
        normalized = "user"

    candidate = normalized
    suffix = 2
    while True:
        result = await db.execute(
            select(UserProfile.hanko_user_id).where(UserProfile.slug == candidate)
        )
        owner_id = result.scalar_one_or_none()
        if owner_id is None or owner_id == exclude_hanko_user_id:
            return candidate
        candidate = f"{normalized}-{suffix}"[:80]
        suffix += 1


def _as_aware_utc(value: datetime) -> datetime:
    """Treat a naive datetime as UTC.

    SQLite (used in tests; Postgres is used in production) drops tzinfo on a
    ``DateTime(timezone=True)`` column round-trip, so a value freshly loaded
    from the DB may come back naive even though it was always stored as UTC.
    """
    return value if value.tzinfo is not None else value.replace(tzinfo=timezone.utc)


def next_slug_change_at(profile: UserProfile) -> datetime | None:
    """Return when the profile's slug may next be changed, or None if unset."""
    if profile.slug_updated_at is None:
        return None
    return _as_aware_utc(profile.slug_updated_at) + timedelta(
        days=SLUG_CHANGE_COOLDOWN_DAYS
    )


def slug_change_on_cooldown(profile: UserProfile) -> bool:
    """Return True if changing the profile's slug now would violate the cooldown."""
    next_change = next_slug_change_at(profile)
    return next_change is not None and _now() < next_change
