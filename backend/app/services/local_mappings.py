"""Mappings that live in login's own database.

Most apps keep their own ``hanko_user_mappings`` table, and the admin screens
reach them by proxying to each app's backend. LearnWorlds has no backend of
ours to ask — it is a SaaS — so login holds its mappings, and the same screens
read them from here instead.

The responses deliberately match what the proxied apps return, so the admin UI
does not have to care which kind of app it is looking at.
"""

from typing import Any

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import HankoUserMapping

# Apps whose mappings login stores itself. Anything not listed here is proxied
# to the app that owns it.
LOCAL_MAPPING_APPS = frozenset({"learnworlds"})


def is_local(app: str) -> bool:
    """Whether this app's mappings are kept here rather than in the app."""
    return app in LOCAL_MAPPING_APPS


def _serialize(row: HankoUserMapping) -> dict[str, Any]:
    return {
        "hanko_user_id": row.hanko_user_id,
        "app_user_id": row.app_user_id,
        "app_name": row.app_name,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }


async def list_mappings(
    db: AsyncSession, app: str, page: int, page_size: int
) -> dict[str, Any]:
    """One page of mappings, newest first."""
    total = await db.scalar(
        select(func.count())
        .select_from(HankoUserMapping)
        .where(HankoUserMapping.app_name == app)
    )
    result = await db.execute(
        select(HankoUserMapping)
        .where(HankoUserMapping.app_name == app)
        .order_by(HankoUserMapping.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return {
        "items": [_serialize(row) for row in result.scalars()],
        "total": total or 0,
        "page": page,
        "page_size": page_size,
    }


async def get_mapping(
    db: AsyncSession, app: str, hanko_user_id: str
) -> dict[str, Any] | None:
    """One mapping, or None when this person has no account in that app."""
    result = await db.execute(
        select(HankoUserMapping).where(
            HankoUserMapping.hanko_user_id == hanko_user_id,
            HankoUserMapping.app_name == app,
        )
    )
    row = result.scalar_one_or_none()
    return _serialize(row) if row else None


async def set_mapping(
    db: AsyncSession, app: str, hanko_user_id: str, app_user_id: str
) -> dict[str, Any]:
    """Point a person at an account in that app, creating or repointing it.

    Repointing is the whole reason support needs this: someone who signed up
    with a second address ends up linked to an empty account, and the fix is
    to send them back to the one holding their courses.
    """
    result = await db.execute(
        select(HankoUserMapping).where(
            HankoUserMapping.hanko_user_id == hanko_user_id,
            HankoUserMapping.app_name == app,
        )
    )
    row = result.scalar_one_or_none()
    if row:
        row.app_user_id = app_user_id
    else:
        row = HankoUserMapping(
            hanko_user_id=hanko_user_id, app_name=app, app_user_id=app_user_id
        )
        db.add(row)
    await db.commit()
    await db.refresh(row)
    return _serialize(row)


async def delete_mapping(db: AsyncSession, app: str, hanko_user_id: str) -> bool:
    """Forget the link. The next login resolves it again from scratch."""
    result = await db.execute(
        delete(HankoUserMapping).where(
            HankoUserMapping.hanko_user_id == hanko_user_id,
            HankoUserMapping.app_name == app,
        )
    )
    await db.commit()
    return bool(result.rowcount)
