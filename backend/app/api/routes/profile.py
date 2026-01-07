"""Profile management routes."""

import hashlib
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from hotosm_auth.integrations.fastapi import get_current_user
from hotosm_auth.models import HankoUser
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import UserProfile, get_db
from app.schemas.profile import ProfileResponse, ProfileUpdate

router = APIRouter(prefix="/api/profile", tags=["Profile"])

# Type aliases
CurrentUser = Annotated[HankoUser, Depends(get_current_user)]
DB = Annotated[AsyncSession, Depends(get_db)]


def get_gravatar_url(email: str, size: int = 200) -> str:
    """Generate Gravatar URL from email."""
    email_hash = hashlib.md5(email.lower().strip().encode()).hexdigest()
    return f"https://www.gravatar.com/avatar/{email_hash}?s={size}&d=identicon"


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(user: CurrentUser, db: DB) -> ProfileResponse:
    """Get current user's profile.

    Creates a profile if it doesn't exist (using upsert to handle race conditions).
    """
    # Use INSERT ... ON CONFLICT DO NOTHING to handle race conditions
    stmt = insert(UserProfile).values(
        hanko_user_id=user.id,
        picture_url=get_gravatar_url(user.email) if user.email else None,
    ).on_conflict_do_nothing(index_elements=["hanko_user_id"])
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
        osm_user_id=profile.osm_user_id,
        osm_username=profile.osm_username,
        osm_avatar_url=profile.osm_avatar_url,
        preferences=profile.preferences,
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )


@router.patch("/me", response_model=ProfileResponse)
async def update_my_profile(
    user: CurrentUser,
    db: DB,
    profile_update: ProfileUpdate,
) -> ProfileResponse:
    """Update current user's profile."""
    # Use upsert to handle race conditions
    update_data = profile_update.model_dump(exclude_unset=True)

    # Build insert values, using gravatar as default only if picture_url not provided
    insert_values = {"hanko_user_id": user.id}
    if "picture_url" not in update_data:
        insert_values["picture_url"] = get_gravatar_url(user.email) if user.email else None
    insert_values.update(update_data)

    stmt = insert(UserProfile).values(**insert_values).on_conflict_do_update(
        index_elements=["hanko_user_id"],
        set_=update_data if update_data else {"hanko_user_id": user.id},
    )
    await db.execute(stmt)
    await db.commit()

    # Fetch updated profile
    result = await db.execute(
        select(UserProfile).where(UserProfile.hanko_user_id == user.id)
    )
    profile = result.scalar_one()

    return ProfileResponse(
        hanko_user_id=profile.hanko_user_id,
        email=user.email,
        first_name=profile.first_name,
        last_name=profile.last_name,
        picture_url=profile.picture_url,
        language=profile.language,
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
    from hotosm_auth.integrations.fastapi import get_osm_connection

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
        osm_user_id=profile.osm_user_id,
        osm_username=profile.osm_username,
        osm_avatar_url=profile.osm_avatar_url,
        preferences=None,  # Don't expose preferences publicly
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )
