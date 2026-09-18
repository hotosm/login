"""Profile management routes."""

import hashlib
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from hotosm_auth.models import HankoUser
from hotosm_auth_fastapi import get_current_user
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import UserProfile, get_db
from app.schemas.profile import ProfileResponse, ProfileUpdate
from app.services import groups_service, profile_service

router = APIRouter(prefix="/api/profile", tags=["Profile"])

# Type aliases
CurrentUser = Annotated[HankoUser, Depends(get_current_user)]
DB = Annotated[AsyncSession, Depends(get_db)]


def get_gravatar_url(email: str, size: int = 200) -> str:
    """Generate Gravatar URL from email."""
    email_hash = hashlib.md5(email.lower().strip().encode()).hexdigest()  # noqa: S324
    return f"https://www.gravatar.com/avatar/{email_hash}?s={size}&d=identicon"


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(user: CurrentUser, db: DB) -> ProfileResponse:
    """Get current user's profile.

    Creates a profile if it doesn't exist (using upsert to handle race conditions).
    """
    # Use INSERT ... ON CONFLICT DO NOTHING to handle race conditions
    stmt = (
        insert(UserProfile)
        .values(
            hanko_user_id=user.id,
            picture_url=get_gravatar_url(user.email) if user.email else None,
        )
        .on_conflict_do_nothing(index_elements=["hanko_user_id"])
    )
    await db.execute(stmt)
    await db.commit()

    # Now fetch the profile (either newly created or existing)
    result = await db.execute(
        select(UserProfile).where(UserProfile.hanko_user_id == user.id)
    )
    profile = result.scalar_one()

    # Build response with email from Hanko
    return ProfileResponse(
        hanko_user_id=profile.hanko_user_id,
        email=user.email,
        first_name=profile.first_name,
        last_name=profile.last_name,
        picture_url=profile.picture_url,
        language=profile.language,
        slug=profile.slug,
        is_public=profile.is_public,
        next_slug_change_at=profile_service.next_slug_change_at(profile),
        osm_user_id=profile.osm_user_id,
        osm_username=profile.osm_username,
        osm_avatar_url=profile.osm_avatar_url,
        preferences=profile.preferences,
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )


async def _apply_slug_update(
    db: AsyncSession, user: HankoUser, profile: UserProfile, requested_slug: str
) -> str:
    """Validate and normalize a requested slug change, raising on conflict.

    Returns the normalized slug to apply. Raises 422 for an empty slug, 429 if
    the 15-day change cooldown hasn't elapsed, and 409 (with a suggested
    alternative) if the slug is reserved or already taken by another profile.
    """
    normalized = groups_service.slugify(requested_slug)
    if not normalized:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid slug",
        )
    if normalized == profile.slug:
        return normalized

    if profile.slug is not None and profile_service.slug_change_on_cooldown(profile):
        next_change = profile_service.next_slug_change_at(profile)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Slug can only be changed once every "
            f"{profile_service.SLUG_CHANGE_COOLDOWN_DAYS} days; "
            f"next change available at {next_change.isoformat()}",
        )

    taken = normalized in groups_service.RESERVED_SLUGS
    if not taken:
        result = await db.execute(
            select(UserProfile.hanko_user_id).where(
                UserProfile.slug == normalized,
                UserProfile.hanko_user_id != user.id,
            )
        )
        taken = result.scalar_one_or_none() is not None
    if taken:
        suggestion = await profile_service.generate_unique_user_slug(
            db, normalized, exclude_hanko_user_id=user.id
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": "slug_taken", "suggestion": suggestion},
        )

    return normalized


@router.patch("/me", response_model=ProfileResponse)
async def update_my_profile(
    user: CurrentUser,
    db: DB,
    profile_update: ProfileUpdate,
) -> ProfileResponse:
    """Update current user's profile."""
    update_data = profile_update.model_dump(exclude_unset=True)
    requested_slug = update_data.pop("slug", None)

    # Ensure the profile row exists (handles race conditions), then load it so
    # slug changes can be validated against its current slug/cooldown state.
    ensure_stmt = (
        insert(UserProfile)
        .values(
            hanko_user_id=user.id,
            picture_url=get_gravatar_url(user.email) if user.email else None,
        )
        .on_conflict_do_nothing(index_elements=["hanko_user_id"])
    )
    await db.execute(ensure_stmt)
    result = await db.execute(
        select(UserProfile).where(UserProfile.hanko_user_id == user.id)
    )
    profile = result.scalar_one()

    if requested_slug is not None:
        update_data["slug"] = await _apply_slug_update(
            db, user, profile, requested_slug
        )
        if update_data["slug"] != profile.slug:
            update_data["slug_updated_at"] = datetime.now(timezone.utc)

    if update_data.get("is_public") and not update_data.get("slug", profile.slug):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A public profile requires a slug",
        )

    # Checked against the resulting state, so that clearing a name on an
    # already public profile is rejected too (not only publishing without one).
    will_be_public = update_data.get("is_public", profile.is_public)
    first_name = (update_data.get("first_name", profile.first_name) or "").strip()
    last_name = (update_data.get("last_name", profile.last_name) or "").strip()
    if will_be_public and not (first_name and last_name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A public profile requires first and last name",
        )

    for field, value in update_data.items():
        setattr(profile, field, value)
    await db.commit()
    await db.refresh(profile)

    return ProfileResponse(
        hanko_user_id=profile.hanko_user_id,
        email=user.email,
        first_name=profile.first_name,
        last_name=profile.last_name,
        picture_url=profile.picture_url,
        language=profile.language,
        slug=profile.slug,
        is_public=profile.is_public,
        next_slug_change_at=profile_service.next_slug_change_at(profile),
        osm_user_id=profile.osm_user_id,
        osm_username=profile.osm_username,
        osm_avatar_url=profile.osm_avatar_url,
        preferences=profile.preferences,
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )


@router.post("/me/sync-osm")
async def sync_osm_to_profile(user: CurrentUser, db: DB) -> dict:
    """Sync OSM connection data to profile.

    Call this after connecting OSM to cache the OSM user info in the profile.
    """
    # Try to get OSM connection
    # Note: This would need the request object, so we'll handle this differently
    # For now, this endpoint can be called with OSM data in the body

    return {"message": "Use PATCH /api/profile/me with osm fields instead"}


@router.get("/{hanko_user_id}", response_model=ProfileResponse)
async def get_user_profile(hanko_user_id: str, db: DB) -> ProfileResponse:
    """Get a user's public profile by Hanko user ID."""
    result = await db.execute(
        select(UserProfile).where(UserProfile.hanko_user_id == hanko_user_id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    # Return profile without email (privacy)
    return ProfileResponse(
        hanko_user_id=profile.hanko_user_id,
        email=None,  # Don't expose email publicly
        first_name=profile.first_name,
        last_name=profile.last_name,
        picture_url=profile.picture_url,
        language=profile.language,
        slug=profile.slug,
        is_public=profile.is_public,
        osm_user_id=profile.osm_user_id,
        osm_username=profile.osm_username,
        osm_avatar_url=profile.osm_avatar_url,
        preferences=None,  # Don't expose preferences publicly
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )
