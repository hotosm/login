"""Business logic for teams and organizations.

Keeps slug generation, membership/role resolution and serialization out of the
route handlers so they can be reused (and unit-tested) independently.
"""

import hashlib
import re
import secrets

from fastapi import HTTPException, status
from hotosm_auth.models import HankoUser
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.authz import is_account_manager
from app.core.config import settings
from app.db.models import Group, GroupMembership, UserProfile
from app.schemas.groups import GroupResponse, MemberResponse, MyGroupItem
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


async def count_members(db: AsyncSession, group_id: str) -> int:
    """Count the members of a group."""
    result = await db.execute(
        select(func.count())
        .select_from(GroupMembership)
        .where(GroupMembership.group_id == group_id)
    )
    return int(result.scalar_one())


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


def serialize_group(
    group: Group,
    *,
    role: str | None = None,
    members_count: int | None = None,
) -> GroupResponse:
    """Build a GroupResponse, deriving image URLs from stored keys."""
    return GroupResponse(
        id=group.id,
        type=group.type,
        name=group.name,
        slug=group.slug,
        description=group.description,
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
        created_by=group.created_by,
        created_at=group.created_at,
        updated_at=group.updated_at,
        role=role,
        members_count=members_count,
    )


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
