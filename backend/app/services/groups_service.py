"""Business logic for teams and organizations.

Keeps slug generation, membership/role resolution and serialization out of the
route handlers so they can be reused (and unit-tested) independently.
"""

import hashlib
import re
import secrets
from typing import NamedTuple

from fastapi import HTTPException, status
from hotosm_auth.models import HankoUser
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.authz import is_account_manager
from app.core.config import settings
from app.db.models import Group, GroupMembership, GroupTranslation, UserProfile
from app.schemas.groups import (
    BASE_LOCALES,
    TRANSLATABLE_GROUP_FIELDS,
    GroupResponse,
    GroupTranslationFields,
    MemberResponse,
    MyGroupItem,
)
from app.services import hanko_lookup

# Slugs that would collide with app/login routes must never be minted.
RESERVED_SLUGS = frozenset(
    {
        "org",
        "team",
        "user",
        "users",
        "api",
        "admin",
        "new",
        "edit",
        "me",
        "static",
        "assets",
        "groups",
        "organizations",
        "teams",
        "public",
        "internal",
        "login",
        "profile",
    }
)

_ROLE_RANK = {"member": 1, "manager": 2, "owner": 3}


def role_rank(role: str | None) -> int:
    """Return the numeric rank of a member role (owner high, None lowest)."""
    return _ROLE_RANK.get(role or "", 0)


def slugify(value: str) -> str:
    """Normalize a name into a URL slug (lowercase, dash-separated)."""
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value[:80]


async def generate_unique_slug(db: AsyncSession, group_type: str, name: str) -> str:
    """Generate a slug unique within the given group type.

    Falls back to a random-suffixed slug when the name yields an empty or
    reserved base, and disambiguates collisions with ``-2``, ``-3``, ...
    """
    base = slugify(name)
    if not base or base in RESERVED_SLUGS:
        base = f"{group_type}-{secrets.token_hex(3)}"

    candidate = base
    suffix = 2
    while True:
        exists = await db.execute(
            select(Group.id).where(Group.type == group_type, Group.slug == candidate)
        )
        if exists.scalar_one_or_none() is None:
            return candidate
        candidate = f"{base}-{suffix}"[:80]
        suffix += 1


async def get_group(db: AsyncSession, group_id: str) -> Group | None:
    """Load a group by id."""
    result = await db.execute(select(Group).where(Group.id == group_id))
    return result.scalar_one_or_none()


async def get_membership(
    db: AsyncSession, group_id: str, user_id: str
) -> GroupMembership | None:
    """Load a user's membership row within a group."""
    result = await db.execute(
        select(GroupMembership).where(
            GroupMembership.group_id == group_id,
            GroupMembership.hanko_user_id == user_id,
        )
    )
    return result.scalar_one_or_none()


async def get_user_role(db: AsyncSession, group_id: str, user_id: str) -> str | None:
    """Return the user's role in a group, or None if not a member."""
    membership = await get_membership(db, group_id, user_id)
    return membership.role if membership else None


async def get_owner_id(db: AsyncSession, group: Group) -> str:
    """Return the group's owner, falling back to whoever created it."""
    result = await db.execute(
        select(GroupMembership.hanko_user_id).where(
            GroupMembership.group_id == group.id,
            GroupMembership.role == "owner",
        )
    )
    return result.scalars().first() or group.created_by


async def load_group_or_404(db: AsyncSession, group_id: str) -> Group:
    """Load a group or raise 404."""
    group = await get_group(db, group_id)
    if group is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Group not found"
        )
    return group


async def require_access(db: AsyncSession, group: Group, user: HankoUser) -> str | None:
    """Require the user to be a member (returns role) or an account manager.

    Non-members who aren't account managers get 404 (don't leak existence).
    """
    role = await get_user_role(db, group.id, user.id)
    if role is not None:
        return role
    if await is_account_manager(user, db):
        return None
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")


async def require_role(
    db: AsyncSession, group: Group, user: HankoUser, min_role: str
) -> str:
    """Require the user to hold at least ``min_role`` within the group."""
    role = await get_user_role(db, group.id, user.id)
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Group not found"
        )
    if role_rank(role) < role_rank(min_role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient group role",
        )
    return role


async def require_manage_access(
    db: AsyncSession, group: Group, user: HankoUser, min_role: str
) -> str | None:
    """Require at least ``min_role`` in the group, or account-manager status.

    Account-manager status only bypasses the role check for organizations — it
    can manage any organization regardless of membership role.
    """
    if group.type == "organization" and await is_account_manager(user, db):
        return await get_user_role(db, group.id, user.id)
    return await require_role(db, group, user, min_role)


async def count_members(db: AsyncSession, group_id: str) -> int:
    """Count the members of a group."""
    result = await db.execute(
        select(func.count())
        .select_from(GroupMembership)
        .where(GroupMembership.group_id == group_id)
    )
    return int(result.scalar_one())


async def manager_ids(db: AsyncSession, group_id: str) -> list[str]:
    """Return the hanko user ids of a group's owner and managers."""
    result = await db.execute(
        select(GroupMembership.hanko_user_id).where(
            GroupMembership.group_id == group_id,
            GroupMembership.role.in_(("owner", "manager")),
        )
    )
    return list(result.scalars().all())


async def list_user_groups(
    db: AsyncSession, user_id: str, group_type: str | None = None
) -> list[tuple[Group, str]]:
    """Return (group, role) pairs for every group the user belongs to."""
    stmt = (
        select(Group, GroupMembership.role)
        .join(GroupMembership, GroupMembership.group_id == Group.id)
        .where(GroupMembership.hanko_user_id == user_id)
    )
    if group_type is not None:
        stmt = stmt.where(Group.type == group_type)
    stmt = stmt.order_by(Group.name)
    result = await db.execute(stmt)
    return [(row[0], row[1]) for row in result.all()]


def image_url(group_id: str, kind: str, key: str | None = None) -> str:
    """Build the URL that serves a group image.

    Appends a cache-busting ``?v=`` derived from the storage key so a changed
    image (new key on every upload) invalidates the browser cache despite the
    stable path, while still allowing a long Cache-Control on the endpoint.
    """
    base = (settings.backend_url or "").rstrip("/")
    url = f"{base}/api/groups/{group_id}/{kind}"
    if key:
        version = hashlib.sha256(key.encode()).hexdigest()[:8]
        url = f"{url}?v={version}"
    return url


class CreatorLabel(NamedTuple):
    """Ways to identify a group's creator, best first. Any field may be None."""

    name: str | None = None
    username: str | None = None
    email: str | None = None


async def creator_labels(
    db: AsyncSession, user_ids: list[str]
) -> dict[str, CreatorLabel]:
    """Resolve hanko user ids to display labels for moderation views.

    Names come from local profiles, usernames and emails from Hanko. Each source
    is optional, so the UI falls back down the tuple. Batched: one query each.
    """
    ids = list({uid for uid in user_ids if uid})
    if not ids:
        return {}
    result = await db.execute(
        select(UserProfile).where(UserProfile.hanko_user_id.in_(ids))
    )
    names: dict[str, str] = {}
    for profile in result.scalars().all():
        full = " ".join(
            part for part in (profile.first_name, profile.last_name) if part
        ).strip()
        if full:
            names[profile.hanko_user_id] = full
    usernames = await hanko_lookup.user_ids_to_usernames(ids)
    emails = await hanko_lookup.user_ids_to_emails(ids)
    return {
        uid: CreatorLabel(names.get(uid), usernames.get(uid), emails.get(uid))
        for uid in ids
    }


def serialize_group(
    group: Group,
    *,
    role: str | None = None,
    members_count: int | None = None,
    creator: CreatorLabel | None = None,
    translations: list[GroupTranslation] | None = None,
) -> GroupResponse:
    """Build a GroupResponse, deriving image URLs from stored keys."""
    creator = creator or CreatorLabel()
    return GroupResponse(
        id=group.id,
        type=group.type,
        name=group.name,
        slug=group.slug,
        description=group.description,
        tagline=group.tagline,
        video_url=group.video_url,
        contact_email=group.contact_email,
        website=group.website,
        avatar_url=(
            image_url(group.id, "avatar", group.avatar_key)
            if group.avatar_key
            else None
        ),
        banner_url=(
            image_url(group.id, "banner", group.banner_key)
            if group.banner_key
            else None
        ),
        status=group.status,
        pending_name=group.pending_name,
        is_public=group.is_public,
        default_locale=group.default_locale,
        translations={
            row.locale: GroupTranslationFields(
                **{field: getattr(row, field) for field in TRANSLATABLE_GROUP_FIELDS}
            )
            for row in translations or []
        },
        created_by=group.created_by,
        created_by_name=creator.name,
        created_by_username=creator.username,
        created_by_email=creator.email,
        created_at=group.created_at,
        updated_at=group.updated_at,
        role=role,
        members_count=members_count,
    )


# --- Translations ----------------------------------------------------------


def _has_text(value: str | None) -> bool:
    return bool(value and value.strip())


def _blank_to_none(value: str | None) -> str | None:
    return value if _has_text(value) else None


async def get_translations(db: AsyncSession, group_id: str) -> list[GroupTranslation]:
    """A group's translation rows (one query; call it for single-group reads)."""
    result = await db.execute(
        select(GroupTranslation)
        .where(GroupTranslation.group_id == group_id)
        .order_by(GroupTranslation.created_at)
    )
    return list(result.scalars().all())


def _translation_values(
    fields: GroupTranslationFields | None,
) -> dict[str, str | None]:
    """A translation's fields as they'd be stored (blank means none)."""
    return {
        field: _blank_to_none(getattr(fields, field)) if fields else None
        for field in TRANSLATABLE_GROUP_FIELDS
    }


async def translated_locales_after(
    db: AsyncSession,
    group: Group,
    translations: dict[str, GroupTranslationFields | None],
) -> set[str]:
    """Locales with a translation once a PATCH's translations are applied."""
    locales = {row.locale for row in await get_translations(db, group.id)}
    for locale, fields in translations.items():
        if any(_translation_values(fields).values()):
            locales.add(locale)
        else:
            locales.discard(locale)
    return locales


async def save_translations(
    db: AsyncSession,
    group: Group,
    translations: dict[str, GroupTranslationFields | None],
) -> None:
    """Apply a PATCH's translations to a group (caller commits).

    Each given locale's row is replaced by its fields, or removed when it is
    null or every field is blank. A row for the group's default locale is
    always removed: that content belongs in the base fields.
    """
    existing = {row.locale: row for row in await get_translations(db, group.id)}
    for locale, fields in translations.items():
        row = existing.pop(locale, None)
        values = _translation_values(fields)
        if not any(values.values()):
            if row is not None:
                await db.delete(row)
        elif row is None:
            db.add(GroupTranslation(group_id=group.id, locale=locale, **values))
        else:
            for field, value in values.items():
                setattr(row, field, value)
    stale = existing.get(group.default_locale)
    if stale is not None:
        await db.delete(stale)


def resolve_translations(
    group: Group, translations: list[GroupTranslation], locale: str | None
) -> tuple[dict[str, str | None], dict[str, str]]:
    """Pick each translatable field in ``locale``, falling back to the base.

    Returns the values and the locale each one is actually in. An unknown or
    missing locale gets the base values.
    """
    row = (
        next((r for r in translations if r.locale == locale), None)
        if locale in BASE_LOCALES
        else None
    )
    values: dict[str, str | None] = {}
    field_locales: dict[str, str] = {}
    for field in TRANSLATABLE_GROUP_FIELDS:
        translated = getattr(row, field) if row is not None else None
        if _has_text(translated):
            values[field], field_locales[field] = translated, row.locale
        else:
            values[field], field_locales[field] = (
                getattr(group, field),
                group.default_locale,
            )
    return values, field_locales


def available_locales(group: Group, translations: list[GroupTranslation]) -> list[str]:
    """The default locale first, then the translated ones in the order added."""
    translated = sorted(
        (r for r in translations if r.locale != group.default_locale),
        key=lambda r: r.created_at,
    )
    return [group.default_locale] + [r.locale for r in translated]


def to_my_group_item(group: Group, role: str) -> MyGroupItem:
    """Build the minimal consumer-facing group item."""
    return MyGroupItem(
        id=group.id,
        type=group.type,
        slug=group.slug,
        name=group.name,
        role=role,
        status=group.status,
        avatar_url=(
            image_url(group.id, "avatar", group.avatar_key)
            if group.avatar_key
            else None
        ),
    )


async def list_members(
    db: AsyncSession, group_id: str, page: int, page_size: int
) -> tuple[list[MemberResponse], int]:
    """List members of a group enriched with profile data (LEFT JOIN)."""
    total_result = await db.execute(
        select(func.count())
        .select_from(GroupMembership)
        .where(GroupMembership.group_id == group_id)
    )
    total = int(total_result.scalar_one())

    stmt = (
        select(GroupMembership, UserProfile)
        .outerjoin(
            UserProfile,
            UserProfile.hanko_user_id == GroupMembership.hanko_user_id,
        )
        .where(GroupMembership.group_id == group_id)
        .order_by(GroupMembership.created_at)
        .limit(page_size)
        .offset((page - 1) * page_size)
    )
    result = await db.execute(stmt)
    rows = result.all()
    # Resolve emails from Hanko so the UI can show them when a member has no
    # name in their profile (better than a raw user id).
    emails = await hanko_lookup.user_ids_to_emails(
        [membership.hanko_user_id for membership, _ in rows]
    )
    items = [
        MemberResponse(
            hanko_user_id=membership.hanko_user_id,
            role=membership.role,
            first_name=profile.first_name if profile else None,
            last_name=profile.last_name if profile else None,
            picture_url=profile.picture_url if profile else None,
            email=emails.get(membership.hanko_user_id),
            created_at=membership.created_at,
        )
        for membership, profile in rows
    ]
    return items, total
