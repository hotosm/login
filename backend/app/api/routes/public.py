"""Public profiles for organizations, teams and users (no auth).

Rendered by portal in a later stage. Only public, approved entities are
exposed. Data lives here in login; portal fetches it by slug.
"""

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.db.models import Group, GroupMembership, UserProfile
from app.schemas.groups import (
    PublicGroupProfileResponse,
    PublicGroupResponse,
    PublicUserGroupsResponse,
    PublicUserResponse,
)
from app.services import groups_service

router = APIRouter(prefix="/api/public", tags=["Public Profiles"])

DB = Annotated[AsyncSession, Depends(get_db)]


async def _public_group_by_slug(
    db: AsyncSession, group_type: str, slug: str, *, require_approved: bool
) -> Group:
    conditions = [
        Group.type == group_type,
        Group.slug == slug,
        Group.is_public.is_(True),
    ]
    if require_approved:
        conditions.append(Group.status == "approved")
    result = await db.execute(select(Group).where(*conditions))
    group = result.scalar_one_or_none()
    if group is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return group


async def _serialize_public_group(
    db: AsyncSession, group: Group
) -> PublicGroupResponse:
    members_result = await db.execute(
        select(func.count())
        .select_from(GroupMembership)
        .where(GroupMembership.group_id == group.id)
    )
    return PublicGroupResponse(
        type=group.type,
        name=group.name,
        slug=group.slug,
        description=group.description,
        tagline=group.tagline,
        video_url=group.video_url,
        contact_email=group.contact_email,
        website=group.website,
        avatar_url=(
            groups_service.image_url(group.id, "avatar", group.avatar_key)
            if group.avatar_key
            else None
        ),
        banner_url=(
            groups_service.image_url(group.id, "banner", group.banner_key)
            if group.banner_key
            else None
        ),
        members_count=int(members_result.scalar_one()),
    )


async def _serialize_public_group_profile(
    db: AsyncSession, group: Group, locale: str | None
) -> PublicGroupProfileResponse:
    """A group's own public profile, translatable fields resolved per field."""
    translations = await groups_service.get_translations(db, group.id)
    values, field_locales = groups_service.resolve_translations(
        group, translations, locale
    )
    base = await _serialize_public_group(db, group)
    return PublicGroupProfileResponse(
        **(base.model_dump() | values),
        id=group.id,
        default_locale=group.default_locale,
        field_locales=field_locales,
        available_locales=groups_service.available_locales(group, translations),
    )


# Not validated: an unknown locale simply gets the base content.
Locale = Annotated[str | None, Query()]


@router.get("/org/{slug}", response_model=PublicGroupProfileResponse)
async def public_organization(
    slug: str, db: DB, locale: Locale = None
) -> PublicGroupProfileResponse:
    """Public profile of an approved, public organization."""
    group = await _public_group_by_slug(db, "organization", slug, require_approved=True)
    return await _serialize_public_group_profile(db, group, locale)


@router.get("/team/{slug}", response_model=PublicGroupProfileResponse)
async def public_team(
    slug: str, db: DB, locale: Locale = None
) -> PublicGroupProfileResponse:
    """Public profile of a public team."""
    group = await _public_group_by_slug(db, "team", slug, require_approved=False)
    return await _serialize_public_group_profile(db, group, locale)


async def _public_profile_by_slug(db: AsyncSession, slug: str) -> UserProfile:
    result = await db.execute(
        select(UserProfile).where(
            UserProfile.slug == slug, UserProfile.is_public.is_(True)
        )
    )
    profile = result.scalar_one_or_none()
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return profile


@router.get("/user/{slug}", response_model=PublicUserResponse)
async def public_user(slug: str, db: DB) -> PublicUserResponse:
    """Public profile of a user by slug (opt-in via ``is_public``)."""
    profile = await _public_profile_by_slug(db, slug)
    return PublicUserResponse(
        slug=profile.slug,
        hanko_user_id=profile.hanko_user_id,
        first_name=profile.first_name,
        last_name=profile.last_name,
        picture_url=profile.picture_url,
    )


@router.get("/user/{slug}/groups", response_model=PublicUserGroupsResponse)
async def public_user_groups(
    slug: str,
    db: DB,
    type: Annotated[Literal["org", "team"], Query()] = "org",
) -> PublicUserGroupsResponse:
    """Public organizations/teams the user belongs to.

    Only ``is_public`` groups are listed; organizations are additionally
    required to be ``approved``. Any membership role counts (owner, manager
    or member).
    """
    profile = await _public_profile_by_slug(db, slug)
    group_type = "organization" if type == "org" else "team"
    conditions = [
        Group.type == group_type,
        Group.is_public.is_(True),
        GroupMembership.hanko_user_id == profile.hanko_user_id,
    ]
    if group_type == "organization":
        conditions.append(Group.status == "approved")

    result = await db.execute(
        select(Group)
        .join(GroupMembership, GroupMembership.group_id == Group.id)
        .where(*conditions)
    )
    groups = result.scalars().all()
    items = [await _serialize_public_group(db, group) for group in groups]
    return PublicUserGroupsResponse(items=items)
