"""Organization invitations.

Invitations are email-anchored: the invitee may not have an account yet, so
the ``hanko_user_id`` is resolved only on accept. Teams do not use invitations
(members are added directly via ``routes/groups.py``).
"""

import logging
import secrets
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
    Response,
    status,
)
from hotosm_auth.models import HankoUser
from hotosm_auth_fastapi import get_current_user
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db import get_db
from app.db.models import Group, GroupInvitation, GroupMembership
from app.schemas.groups import (
    InvitationCreate,
    InvitationResponse,
    MyInvitationResponse,
)
from app.services import groups_service, hanko_lookup
from app.services.email import send_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/groups", tags=["Invitations"])
me_router = APIRouter(prefix="/api/me/invitations", tags=["Invitations"])

CurrentUser = Annotated[HankoUser, Depends(get_current_user)]
DB = Annotated[AsyncSession, Depends(get_db)]

_INVITE_TTL_DAYS = 14
_MAX_EMAIL_LEN = 320


def _looks_like_email(value: str) -> bool:
    """Cheap email sanity check (no external validator dependency)."""
    if "@" not in value or len(value) > _MAX_EMAIL_LEN:
        return False
    _, _, domain = value.partition("@")
    return "." in domain and not domain.endswith(".")


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _as_aware(value: datetime) -> datetime:
    """Treat naive datetimes (SQLite) as UTC for comparison."""
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def _invite_link(token: str) -> str:
    base = (settings.frontend_url or "").rstrip("/")
    return f"{base}/app/invite?token={token}"


async def _send_invite_email_safe(*, to: str, group_name: str, token: str) -> None:
    """BackgroundTask: send the invite email, never raise."""
    try:
        link = _invite_link(token)
        await send_email(
            to=[to],
            subject=f"[HOT] You've been invited to {group_name}",
            text_body=(
                f"You have been invited to join the organization "
                f"'{group_name}' on HOT.\n\n"
                f"Accept the invitation here: {link}\n\n"
                "If you don't have a HOT account yet, sign up first and then "
                "open the link above."
            ),
        )
        logger.info("Invitation email sent to %s for group %s", to, group_name)
    except Exception:
        logger.exception("Failed to send invitation email to %s", to)


# --- Group-side invitation management (owner/manager) ----------------------


@router.post(
    "/{group_id}/invitations",
    response_model=InvitationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_invitation(
    group_id: str,
    payload: InvitationCreate,
    user: CurrentUser,
    db: DB,
    background_tasks: BackgroundTasks,
) -> InvitationResponse:
    """Invite a user to an organization by email (owner/manager)."""
    group = await groups_service.load_group_or_404(db, group_id)
    await groups_service.require_role(db, group, user, "manager")
    if group.type != "organization":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only organizations use invitations",
        )
    if group.status != "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Approve the organization before inviting members",
        )
    email = payload.email.strip().lower()
    if not _looks_like_email(email):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid email address",
        )

    existing = await db.execute(
        select(GroupInvitation).where(
            GroupInvitation.group_id == group_id,
            GroupInvitation.email == email,
            GroupInvitation.status == "pending",
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A pending invitation already exists for this email",
        )

    invitation = GroupInvitation(
        group_id=group_id,
        email=email,
        role=payload.role,
        token=secrets.token_urlsafe(32),
        invited_by=user.id,
        expires_at=_now() + timedelta(days=_INVITE_TTL_DAYS),
    )
    db.add(invitation)
    await db.commit()
    await db.refresh(invitation)

    background_tasks.add_task(
        _send_invite_email_safe,
        to=email,
        group_name=group.name,
        token=invitation.token,
    )
    response = InvitationResponse.model_validate(invitation, from_attributes=True)
    response.recipient_exists = await hanko_lookup.email_has_account(email)
    return response


@router.get("/{group_id}/invitations", response_model=list[InvitationResponse])
async def list_invitations(
    group_id: str, user: CurrentUser, db: DB
) -> list[InvitationResponse]:
    """List pending invitations for an organization (owner/manager)."""
    group = await groups_service.load_group_or_404(db, group_id)
    await groups_service.require_role(db, group, user, "manager")
    result = await db.execute(
        select(GroupInvitation)
        .where(
            GroupInvitation.group_id == group_id,
            GroupInvitation.status == "pending",
        )
        .order_by(GroupInvitation.created_at.desc())
    )
    return [
        InvitationResponse.model_validate(inv, from_attributes=True)
        for inv in result.scalars().all()
    ]


@router.delete(
    "/{group_id}/invitations/{invitation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def revoke_invitation(
    group_id: str, invitation_id: str, user: CurrentUser, db: DB
) -> Response:
    """Revoke a pending invitation (owner/manager)."""
    group = await groups_service.load_group_or_404(db, group_id)
    await groups_service.require_role(db, group, user, "manager")
    result = await db.execute(
        select(GroupInvitation).where(
            GroupInvitation.id == invitation_id,
            GroupInvitation.group_id == group_id,
        )
    )
    invitation = result.scalar_one_or_none()
    if invitation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found"
        )
    invitation.status = "revoked"
    invitation.responded_at = _now()
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Recipient-side (the invited user) -------------------------------------


async def _get_pending_invitation(db: AsyncSession, token: str) -> GroupInvitation:
    result = await db.execute(
        select(GroupInvitation).where(GroupInvitation.token == token)
    )
    invitation = result.scalar_one_or_none()
    if invitation is None or invitation.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found"
        )
    return invitation


@me_router.get("", response_model=list[MyInvitationResponse])
async def list_my_invitations(user: CurrentUser, db: DB) -> list[MyInvitationResponse]:
    """List the current user's pending, unexpired invitations."""
    if not user.email:
        return []
    email = user.email.strip().lower()
    result = await db.execute(
        select(GroupInvitation, Group)
        .join(Group, Group.id == GroupInvitation.group_id)
        .where(
            GroupInvitation.email == email,
            GroupInvitation.status == "pending",
        )
        .order_by(GroupInvitation.created_at.desc())
    )
    now = _now()
    items: list[MyInvitationResponse] = []
    for invitation, group in result.all():
        if _as_aware(invitation.expires_at) < now:
            continue
        items.append(
            MyInvitationResponse(
                id=invitation.id,
                group_id=invitation.group_id,
                email=invitation.email,
                role=invitation.role,
                status=invitation.status,
                invited_by=invitation.invited_by,
                created_at=invitation.created_at,
                expires_at=invitation.expires_at,
                token=invitation.token,
                group_name=group.name,
                group_type=group.type,
            )
        )
    return items


@me_router.post("/{token}/accept", status_code=status.HTTP_204_NO_CONTENT)
async def accept_invitation(token: str, user: CurrentUser, db: DB) -> Response:
    """Accept an invitation, creating the membership."""
    invitation = await _get_pending_invitation(db, token)
    if not user.email or user.email.strip().lower() != invitation.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This invitation was sent to a different email",
        )
    if _as_aware(invitation.expires_at) < _now():
        invitation.status = "expired"
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_410_GONE, detail="Invitation has expired"
        )

    existing = await groups_service.get_membership(db, invitation.group_id, user.id)
    if existing is None:
        db.add(
            GroupMembership(
                group_id=invitation.group_id,
                hanko_user_id=user.id,
                role=invitation.role,
            )
        )
    invitation.status = "accepted"
    invitation.invited_hanko_user_id = user.id
    invitation.responded_at = _now()
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@me_router.post("/{token}/decline", status_code=status.HTTP_204_NO_CONTENT)
async def decline_invitation(token: str, user: CurrentUser, db: DB) -> Response:
    """Decline an invitation."""
    invitation = await _get_pending_invitation(db, token)
    if not user.email or user.email.strip().lower() != invitation.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This invitation was sent to a different email",
        )
    invitation.status = "declined"
    invitation.responded_at = _now()
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
