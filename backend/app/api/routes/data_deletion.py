"""Data deletion request route.

Lets a logged-in user ask HOT admins to remove their data from
HOT apps (fAIr, drone-tm, OAM, ...). Sends an email to the
configured admin list. Independent from the Hanko account delete.
"""

import logging
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from hotosm_auth.models import HankoUser
from hotosm_auth_fastapi import get_current_user
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db import UserProfile, get_db
from app.services.email import EmailNotConfiguredError, send_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/profile/me", tags=["Data Deletion"])

CurrentUser = Annotated[HankoUser, Depends(get_current_user)]
DB = Annotated[AsyncSession, Depends(get_db)]


@router.post(
    "/request-data-deletion",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def request_data_deletion(user: CurrentUser, db: DB) -> None:
    """Email HOT admins asking them to wipe this user's data from all apps."""
    if not settings.admin_email_list:
        logger.error("No admin emails configured, cannot send deletion request")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin contact is not configured",
        )

    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.hanko_user_id == user.id)
    )
    profile = profile_result.scalar_one_or_none()

    osm_username = profile.osm_username if profile else None
    osm_user_id = profile.osm_user_id if profile else None
    requested_at = datetime.now(timezone.utc).isoformat()

    subject = f"[HOT] Data deletion request from {user.email or user.id}"
    text_body = (
        "A HOT user has requested deletion of their data from all HOT apps "
        "(fAIr, drone-tm, OAM, ...).\n\n"
        f"Hanko user ID: {user.id}\n"
        f"Email: {user.email or '(not provided)'}\n"
        f"OSM username: {osm_username or '(not linked)'}\n"
        f"OSM user ID: {osm_user_id or '(not linked)'}\n"
        f"Requested at: {requested_at}\n\n"
        "This is independent from deleting the Hanko account. "
        "The user may or may not have deleted their Hanko account.\n\n"
        "Please coordinate with the relevant app maintainers to remove "
        "this user's data."
    )

    try:
        await send_email(
            to=settings.admin_email_list,
            subject=subject,
            text_body=text_body,
        )
    except EmailNotConfiguredError as exc:
        logger.error("SMTP is not configured: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Email is not configured",
        ) from exc
    except Exception as exc:
        logger.exception("Failed to send data deletion email")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to send notification email",
        ) from exc

    logger.info(
        "Data deletion requested by hanko_user_id=%s email=%s",
        user.id,
        user.email,
    )
