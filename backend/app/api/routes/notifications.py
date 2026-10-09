"""In-app notifications for the current user.

Read-only feed plus read-state management. Notifications are created by the
features that emit them (see ``routes/organizations_admin.py``); there is no
public endpoint to create one.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from hotosm_auth.models import HankoUser
from hotosm_auth_fastapi import get_current_user
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas.notifications import NotificationResponse
from app.services import notifications_service

me_router = APIRouter(prefix="/api/me/notifications", tags=["Notifications"])

CurrentUser = Annotated[HankoUser, Depends(get_current_user)]
DB = Annotated[AsyncSession, Depends(get_db)]


@me_router.get("", response_model=list[NotificationResponse])
async def list_my_notifications(
    user: CurrentUser, db: DB
) -> list[NotificationResponse]:
    """List the current user's notifications, newest first."""
    notifications = await notifications_service.list_for_user(db, user.id)
    return [
        NotificationResponse.model_validate(n, from_attributes=True)
        for n in notifications
    ]


@me_router.post("/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_notification_read(
    notification_id: str, user: CurrentUser, db: DB
) -> Response:
    """Mark one of the current user's notifications as read."""
    await notifications_service.mark_read(db, user.id, notification_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@me_router.post("/read-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_notifications_read(user: CurrentUser, db: DB) -> Response:
    """Mark every notification of the current user as read."""
    await notifications_service.mark_all_read(db, user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
