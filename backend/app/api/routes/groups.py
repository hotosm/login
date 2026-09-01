"""Teams and organizations: CRUD, members and images.

Invitations live in ``routes/invitations.py``; account-manager and public
endpoints live in ``routes/organizations_admin.py`` and ``routes/public.py``.
"""

import io
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    Response,
    UploadFile,
    status,
)
from hotosm_auth.models import HankoUser
from hotosm_auth_fastapi import get_current_user
from PIL import Image, ImageOps
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.db.models import Group, GroupMembership
from app.schemas.groups import (
    GroupCreate,
    GroupResponse,
    GroupUpdate,
    MemberAdd,
    MemberListResponse,
    MemberRoleUpdate,
    MembershipCheckResponse,
    MyGroupsResponse,
    NameChangeRequest,
)
from app.services import groups_service, hanko_lookup, notifications_service, s3_service

router = APIRouter(prefix="/api/groups", tags=["Groups"])

CurrentUser = Annotated[HankoUser, Depends(get_current_user)]
DB = Annotated[AsyncSession, Depends(get_db)]

_ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
_MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB
_AVATAR_SIZE = 512  # square side, px
_BANNER_MAX_WIDTH = 1600  # px


_load_group_or_404 = groups_service.load_group_or_404
_require_access = groups_service.require_access
_require_role = groups_service.require_role


async def _add_team_members_by_email(
    db: AsyncSession, group: Group, emails: list[str], owner_id: str
) -> None:
    """Resolve emails to accounts and add them as members (skip unknown/dupes)."""
    seen = {owner_id}
    for raw in emails:
        member_id = await hanko_lookup.email_to_user_id(raw.strip().lower())
        if member_id is None or member_id in seen:
            continue
        seen.add(member_id)
        db.add(
            GroupMembership(group_id=group.id, hanko_user_id=member_id, role="member")
        )
        await _notify_member_joined(db, group, member_id)


async def _notify_member_joined(db: AsyncSession, group: Group, member_id: str) -> None:
    """Tell a user they were added to a team (caller commits)."""
    await notifications_service.create(
        db,
        recipient_id=member_id,
        type="team_member_joined",
        data={"group_id": group.id, "group_name": group.name},
    )


async def _notify_member_left(
    db: AsyncSession, group: Group, member_id: str, actor_id: str
) -> None:
    """Tell a group's owner and managers that a member is gone (caller commits).

    Neither the departing member nor whoever removed them is notified.
    """
    label = (await groups_service.creator_labels(db, [member_id])).get(member_id)
    member_name = (label.name or label.username or label.email) if label else None
    recipient_ids = set(await groups_service.manager_ids(db, group.id)) - {
        member_id,
        actor_id,
    }
    for recipient_id in recipient_ids:
        await notifications_service.create(
            db,
            recipient_id=recipient_id,
            type="member_left",
            data={
                "group_id": group.id,
                "group_name": group.name,
                "group_type": group.type,
                "member_name": member_name,
            },
        )


async def _notify_member_removed(
    db: AsyncSession, group: Group, member_id: str
) -> None:
    """Tell a user that a manager removed them from a group (caller commits)."""
    await notifications_service.create(
        db,
        recipient_id=member_id,
        type="member_removed",
        data={
            "group_id": group.id,
            "group_name": group.name,
            "group_type": group.type,
        },
    )


# --- Group CRUD ------------------------------------------------------------


@router.post("", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
async def create_group(
    payload: GroupCreate, user: CurrentUser, db: DB
) -> GroupResponse:
    """Create a team (approved) or organization (pending approval)."""
    slug = await groups_service.generate_unique_slug(db, payload.type, payload.name)
    group = Group(
        type=payload.type,
        name=payload.name,
        slug=slug,
        description=payload.description,
        contact_email=payload.contact_email,
        website=payload.website,
        status="pending" if payload.type == "organization" else "approved",
        created_by=user.id,
    )
    db.add(group)
    await db.flush()

    db.add(GroupMembership(group_id=group.id, hanko_user_id=user.id, role="owner"))
    # Teams may seed members directly by email; orgs use invitations.
    if payload.type == "team" and payload.member_emails:
        await _add_team_members_by_email(db, group, payload.member_emails, user.id)
    await db.commit()
    await db.refresh(group)
    members_count = await groups_service.count_members(db, group.id)
    return groups_service.serialize_group(
        group, role="owner", members_count=members_count
    )


@router.get("", response_model=MyGroupsResponse)
async def list_my_groups(
    user: CurrentUser,
    db: DB,
    type: Annotated[str | None, Query()] = None,
) -> MyGroupsResponse:
    """List the groups the current user belongs to (consumer contract).

    This is the canonical endpoint portal consumes (forwarding the hanko
    cookie) to resolve membership, and that the login frontend uses to render
    the Organizations/Teams lists. Optional ``type`` filters team|organization.
    """
    pairs = await groups_service.list_user_groups(db, user.id, type)
    return MyGroupsResponse(
        groups=[groups_service.to_my_group_item(g, role) for g, role in pairs]
    )


@router.get("/{group_id}", response_model=GroupResponse)
async def get_group(group_id: str, user: CurrentUser, db: DB) -> GroupResponse:
    """Get a group's details (members and account managers only)."""
    group = await _load_group_or_404(db, group_id)
    role = await _require_access(db, group, user)
    members_count = await groups_service.count_members(db, group.id)
    return groups_service.serialize_group(group, role=role, members_count=members_count)


@router.patch("/{group_id}", response_model=GroupResponse)
async def update_group(
    group_id: str, payload: GroupUpdate, user: CurrentUser, db: DB
) -> GroupResponse:
    """Update group details (owner/manager). The name is not editable here."""
    group = await _load_group_or_404(db, group_id)
    role = await _require_role(db, group, user, "manager")

    data = payload.model_dump(exclude_unset=True)
    for field in ("description", "contact_email", "website", "is_public"):
        if field in data:
            setattr(group, field, data[field])
    await db.commit()
    await db.refresh(group)
    members_count = await groups_service.count_members(db, group.id)
    return groups_service.serialize_group(group, role=role, members_count=members_count)


@router.post("/{group_id}/name-change", response_model=GroupResponse)
async def change_group_name(
    group_id: str, payload: NameChangeRequest, user: CurrentUser, db: DB
) -> GroupResponse:
    """Change a group's name (owner only).

    Teams apply the change directly. Approved organizations stage it in
    ``pending_name`` for account-manager approval; pending orgs apply directly.
    """
    group = await _load_group_or_404(db, group_id)
    role = await _require_role(db, group, user, "owner")

    if group.type == "organization" and group.status == "approved":
        group.pending_name = payload.name
    else:
        group.name = payload.name
        group.slug = await groups_service.generate_unique_slug(
            db, group.type, payload.name
        )
    await db.commit()
    await db.refresh(group)
    members_count = await groups_service.count_members(db, group.id)
    return groups_service.serialize_group(group, role=role, members_count=members_count)


@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_group(group_id: str, user: CurrentUser, db: DB) -> Response:
    """Delete a group (owner only). Memberships cascade."""
    group = await _load_group_or_404(db, group_id)
    await _require_role(db, group, user, "owner")
    await db.delete(group)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Members ---------------------------------------------------------------


@router.get(
    "/{group_id}/membership/{member_user_id}",
    response_model=MembershipCheckResponse,
)
async def check_membership(
    group_id: str,
    member_user_id: str,
    user: CurrentUser,
    db: DB,
    min_role: Annotated[str, Query()] = "member",
) -> MembershipCheckResponse:
    """Check whether a user is a member of a group (with >= min_role).

    Consumer contract for other apps. The requester must be a member of the
    group (or an account manager) to query it.
    """
    group = await _load_group_or_404(db, group_id)
    await _require_access(db, group, user)
    role = await groups_service.get_user_role(db, group_id, member_user_id)
    satisfies = role is not None and groups_service.role_rank(
        role
    ) >= groups_service.role_rank(min_role)
    return MembershipCheckResponse(
        is_member=role is not None, role=role, satisfies_min_role=satisfies
    )


@router.get("/{group_id}/members", response_model=MemberListResponse)
async def list_group_members(
    group_id: str,
    user: CurrentUser,
    db: DB,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 50,
) -> MemberListResponse:
    """List a group's members (members and account managers only)."""
    group = await _load_group_or_404(db, group_id)
    await _require_access(db, group, user)
    items, total = await groups_service.list_members(db, group_id, page, page_size)
    return MemberListResponse(items=items, total=total, page=page, page_size=page_size)


@router.post(
    "/{group_id}/members",
    response_model=MemberListResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_group_member(
    group_id: str, payload: MemberAdd, user: CurrentUser, db: DB
) -> MemberListResponse:
    """Add a member directly by email (teams only).

    Resolves the email to a HOT account; organizations must use invitations.
    """
    group = await _load_group_or_404(db, group_id)
    await _require_role(db, group, user, "manager")
    if group.type == "organization":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organizations add members via invitations",
        )
    member_id = await hanko_lookup.email_to_user_id(payload.email.strip().lower())
    if member_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No HOT account found with that email",
        )
    existing = await groups_service.get_membership(db, group_id, member_id)
    if existing is None:
        db.add(
            GroupMembership(
                group_id=group_id, hanko_user_id=member_id, role=payload.role
            )
        )
        await _notify_member_joined(db, group, member_id)
        await db.commit()
    items, total = await groups_service.list_members(db, group_id, 1, 50)
    return MemberListResponse(items=items, total=total, page=1, page_size=50)


@router.patch("/{group_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def update_member_role(
    group_id: str,
    member_id: str,
    payload: MemberRoleUpdate,
    user: CurrentUser,
    db: DB,
) -> Response:
    """Change a member's role (owner only).

    Setting ``owner`` transfers ownership: the current owner becomes a manager,
    keeping exactly one owner per group.
    """
    group = await _load_group_or_404(db, group_id)
    await _require_role(db, group, user, "owner")

    target = await groups_service.get_membership(db, group_id, member_id)
    if target is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Member not found"
        )
    if payload.role == "owner" and member_id != user.id:
        current = await groups_service.get_membership(db, group_id, user.id)
        if current is not None:
            current.role = "manager"
    target.role = payload.role
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete(
    "/{group_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def remove_group_member(
    group_id: str, member_id: str, user: CurrentUser, db: DB
) -> Response:
    """Remove a member (owner/manager) or leave the group (self)."""
    group = await _load_group_or_404(db, group_id)
    target = await groups_service.get_membership(db, group_id, member_id)
    if target is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Member not found"
        )
    if member_id == user.id:
        # Self-removal (leave); the sole owner must transfer or delete instead.
        if target.role == "owner":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Owner must transfer ownership or delete the group",
            )
    else:
        actor_role = await _require_role(db, group, user, "manager")
        if target.role == "owner" or (
            target.role == "manager" and actor_role != "owner"
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot remove this member",
            )
    await db.delete(target)
    if member_id == user.id:
        await _notify_member_left(db, group, member_id, actor_id=user.id)
    else:
        await _notify_member_removed(db, group, member_id)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Avatar / banner -------------------------------------------------------


def _process_image(data: bytes, kind: str) -> bytes:
    """Resize/normalize an image to WEBP (avatar square, banner wide)."""
    img = Image.open(io.BytesIO(data)).convert("RGB")
    if kind == "avatar":
        img = ImageOps.fit(img, (_AVATAR_SIZE, _AVATAR_SIZE))
    elif img.width > _BANNER_MAX_WIDTH:
        ratio = _BANNER_MAX_WIDTH / img.width
        img = img.resize((_BANNER_MAX_WIDTH, int(img.height * ratio)))
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=85)
    return buf.getvalue()


async def _set_group_image(
    group_id: str, kind: str, file: UploadFile, user: HankoUser, db: AsyncSession
) -> dict[str, str]:
    group = await _load_group_or_404(db, group_id)
    await _require_role(db, group, user, "manager")

    if file.content_type not in _ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported image type")
    data = await file.read()
    if len(data) > _MAX_IMAGE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 5 MB)")

    processed = _process_image(data, kind)
    key = s3_service.store_image(processed, group_id, kind, ".webp", "image/webp")

    old_key = group.avatar_key if kind == "avatar" else group.banner_key
    if kind == "avatar":
        group.avatar_key = key
    else:
        group.banner_key = key
    await db.commit()
    if old_key:
        s3_service.remove_image(old_key)
    return {f"{kind}_url": groups_service.image_url(group_id, kind, key)}


@router.put("/{group_id}/avatar")
async def upload_avatar(
    group_id: str, user: CurrentUser, db: DB, file: UploadFile = File(...)
) -> dict[str, str]:
    """Upload a group's avatar (owner/manager)."""
    return await _set_group_image(group_id, "avatar", file, user, db)


@router.put("/{group_id}/banner")
async def upload_banner(
    group_id: str, user: CurrentUser, db: DB, file: UploadFile = File(...)
) -> dict[str, str]:
    """Upload a group's banner (owner/manager)."""
    return await _set_group_image(group_id, "banner", file, user, db)


async def _serve_group_image(group_id: str, kind: str, db: AsyncSession) -> Response:
    group = await _load_group_or_404(db, group_id)
    key = group.avatar_key if kind == "avatar" else group.banner_key
    if not key:
        raise HTTPException(status_code=404, detail="Image not found")
    data, content_type = s3_service.load_image(key)
    return Response(
        content=data,
        media_type=content_type,
        headers={"Cache-Control": "public, max-age=3600"},
    )


@router.get("/{group_id}/avatar", include_in_schema=False)
async def get_avatar(group_id: str, db: DB) -> Response:
    """Serve a group's avatar image."""
    return await _serve_group_image(group_id, "avatar", db)


@router.get("/{group_id}/banner", include_in_schema=False)
async def get_banner(group_id: str, db: DB) -> Response:
    """Serve a group's banner image."""
    return await _serve_group_image(group_id, "banner", db)
