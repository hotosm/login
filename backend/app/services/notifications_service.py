"""In-app notification service.

Generic on purpose: any feature can emit a notification by picking a ``type``
and a JSON ``data`` payload. ``create`` only adds to the session so an emitter
can bundle the notification into the same transaction as its own change.
"""

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Notification


def _now() -> datetime:
    return datetime.now(timezone.utc)


async def create(
    db: AsyncSession,
    *,
    recipient_id: str,
    type: str,
    data: dict | None = None,
) -> Notification:
    """Stage a notification for a user (the caller commits)."""
    notification = Notification(
        hanko_user_id=recipient_id,
        type=type,
        data=data,
        # Set here rather than relying on the server default: the feed is
        # ordered by this column and SQLite's now() only has second precision.
        created_at=_now(),
    )
    db.add(notification)
    return notification


async def list_for_user(db: AsyncSession, user_id: str) -> list[Notification]:
    """Return a user's notifications, newest first."""
    result = await db.execute(
        select(Notification)
        .where(Notification.hanko_user_id == user_id)
        .order_by(Notification.created_at.desc(), Notification.id.desc())
    )
    return list(result.scalars().all())


async def mark_read(db: AsyncSession, user_id: str, notification_id: str) -> None:
    """Mark one notification read, scoped to its owner."""
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.hanko_user_id == user_id,
        )
    )
    notification = result.scalar_one_or_none()
    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    if notification.read_at is None:
        notification.read_at = _now()
    await db.commit()


async def mark_all_read(db: AsyncSession, user_id: str) -> None:
    """Mark every unread notification of a user as read."""
    await db.execute(
        update(Notification)
        .where(
            Notification.hanko_user_id == user_id,
            Notification.read_at.is_(None),
        )
        .values(read_at=_now())
    )
    await db.commit()


async def unread_count(db: AsyncSession, user_id: str) -> int:
    """Count a user's unread notifications."""
    result = await db.execute(
        select(func.count())
        .select_from(Notification)
        .where(
            Notification.hanko_user_id == user_id,
            Notification.read_at.is_(None),
        )
    )
    return int(result.scalar_one())
