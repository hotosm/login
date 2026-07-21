"""Account-manager and administrator endpoints.

Account managers approve/reject organizations and moderate their names.
Administrators (env allowlist) grant/revoke the account-manager role.
"""

import logging
from datetime import datetime
from typing import Annotated

from fastapi import (
    APIRouter,
    BackgroundTasks,
    HTTPException,
    Query,
    Response,
    status,
)
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.authz import (
    DB as _DB,
)
from app.core.authz import (
    AccountManagerUser,
    AdminUser,
    get_roles,
)
from app.core.authz import (
    CurrentUser as _CurrentUser,
)
from app.core.config import settings
from app.db.models import AccountManager, Group
from app.schemas.groups import GroupListResponse
from app.services import groups_service, hanko_lookup
from app.services.email import send_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["Organizations Admin"])
me_router = APIRouter(prefix="/api/me", tags=["Me"])

CurrentUser = _CurrentUser
DB = _DB


def _org_link(group_id: str) -> str:
    base = (settings.frontend_url or "").rstrip("/")
    return f"{base}/app/organizations/{group_id}"


async def _send_owner_email_safe(*, to: str, subject: str, body: str) -> None:
    """BackgroundTask: notify an org owner, never raise."""
    try:
        await send_email(to=[to], subject=subject, text_body=body)
    except Exception:
        logger.exception("Failed to send org moderation email to %s", to)


async def _notify_owner(
    background_tasks: BackgroundTasks,
    group: Group,
    *,
    approved: bool,
    reason: str | None = None,
) -> None:
    """Email the org's owner about an approval/rejection decision."""
    email = await hanko_lookup.user_id_to_email(group.created_by)
    if not email:
        return
    if approved:
        subject = f"[HOT] Your organization {group.name} was approved"
        body = (
            f"Good news! Your organization '{group.name}' has been approved.\n\n"
            f"You can now invite members from its page:\n{_org_link(group.id)}"
        )
    else:
        subject = f"[HOT] Your organization {group.name} was not approved"
        body = f"Your organization request '{group.name}' was not approved."
        if reason:
            body += f"\n\nReason: {reason}"
    background_tasks.add_task(
        _send_owner_email_safe, to=email, subject=subject, body=body
    )


class RejectRequest(BaseModel):
    """Optional reason when rejecting an organization."""

    reason: str | None = None


class AccountManagerResponse(BaseModel):
    """An account-manager grant record."""

    hanko_user_id: str
    granted_by: str
    granted_at: datetime

    model_config = {"from_attributes": True}


# --- Roles (for the frontend to gate the Users/Organizations tabs) ---------


@me_router.get("/roles")
async def get_my_roles(user: CurrentUser, db: DB) -> dict[str, bool]:
    """Return the current user's platform roles."""
    return await get_roles(user, db)


# --- Organization moderation (account managers) ----------------------------


@router.get("/organizations", response_model=GroupListResponse)
async def list_organizations(
    admin: AccountManagerUser,
    db: DB,
    status_filter: Annotated[str | None, Query(alias="status")] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 50,
) -> GroupListResponse:
    """List organizations for moderation (optionally filtered by status)."""
    conditions = [Group.type == "organization"]
    if status_filter:
        conditions.append(Group.status == status_filter)

    total_result = await db.execute(
        select(func.count()).select_from(Group).where(*conditions)
    )
    total = int(total_result.scalar_one())

    result = await db.execute(
        select(Group)
        .where(*conditions)
        .order_by(Group.created_at.desc())
        .limit(page_size)
        .offset((page - 1) * page_size)
    )
    items = [
        groups_service.serialize_group(g) for g in result.scalars().all()
    ]
    return GroupListResponse(
        items=items, total=total, page=page, page_size=page_size
    )


async def _load_org_or_404(db: AsyncSession, group_id: str) -> Group:
    group = await groups_service.get_group(db, group_id)
    if group is None or group.type != "organization":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found",
        )
    return group


@router.post("/organizations/{group_id}/approve", status_code=status.HTTP_204_NO_CONTENT)
async def approve_organization(
    group_id: str,
    admin: AccountManagerUser,
    db: DB,
    background_tasks: BackgroundTasks,
) -> Response:
    """Approve a pending (or previously rejected) organization."""
    group = await _load_org_or_404(db, group_id)
    group.status = "approved"
    await db.commit()
    await _notify_owner(background_tasks, group, approved=True)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/organizations/{group_id}/reject", status_code=status.HTTP_204_NO_CONTENT)
async def reject_organization(
    group_id: str,
    payload: RejectRequest,
    admin: AccountManagerUser,
    db: DB,
    background_tasks: BackgroundTasks,
) -> Response:
    """Reject an organization request."""
    group = await _load_org_or_404(db, group_id)
    group.status = "rejected"
    await db.commit()
    await _notify_owner(
        background_tasks, group, approved=False, reason=payload.reason
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/organizations/{group_id}/approve-name", status_code=status.HTTP_204_NO_CONTENT)
async def approve_name_change(
    group_id: str, admin: AccountManagerUser, db: DB
) -> Response:
    """Apply an organization's pending name change and regenerate its slug."""
    group = await _load_org_or_404(db, group_id)
    if not group.pending_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending name change",
        )
    group.name = group.pending_name
    group.slug = await groups_service.generate_unique_slug(
        db, group.type, group.pending_name
    )
    group.pending_name = None
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


class NamePayload(BaseModel):
    """Direct name override by an account manager."""

    name: str


@router.patch("/organizations/{group_id}/name", status_code=status.HTTP_204_NO_CONTENT)
async def set_organization_name(
    group_id: str, payload: NamePayload, admin: AccountManagerUser, db: DB
) -> Response:
    """Set an organization's name directly (account manager)."""
    group = await _load_org_or_404(db, group_id)
    group.name = payload.name
    group.slug = await groups_service.generate_unique_slug(
        db, group.type, payload.name
    )
    group.pending_name = None
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Account-manager role management (administrators only) -----------------


@router.get("/account-managers", response_model=list[AccountManagerResponse])
async def list_account_managers(
    admin: AdminUser, db: DB
) -> list[AccountManagerResponse]:
    """List all account managers."""
    result = await db.execute(
        select(AccountManager).order_by(AccountManager.granted_at.desc())
    )
    return [
        AccountManagerResponse.model_validate(am, from_attributes=True)
        for am in result.scalars().all()
    ]


@router.put("/account-managers/{hanko_user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def grant_account_manager(
    hanko_user_id: str, admin: AdminUser, db: DB
) -> Response:
    """Grant the account-manager role to a user."""
    existing = await db.execute(
        select(AccountManager).where(
            AccountManager.hanko_user_id == hanko_user_id
        )
    )
    if existing.scalar_one_or_none() is None:
        db.add(
            AccountManager(hanko_user_id=hanko_user_id, granted_by=admin.id)
        )
        await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/account-managers/{hanko_user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_account_manager(
    hanko_user_id: str, admin: AdminUser, db: DB
) -> Response:
    """Revoke the account-manager role from a user."""
    result = await db.execute(
        select(AccountManager).where(
            AccountManager.hanko_user_id == hanko_user_id
        )
    )
    am = result.scalar_one_or_none()
    if am is not None:
        await db.delete(am)
        await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
