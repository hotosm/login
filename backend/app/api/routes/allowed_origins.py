"""Admin endpoints for the CORS allowlist.

Gated on Administrator rather than Account Manager: adding an origin lets that
site read authenticated responses from this backend cross-origin, which is a
security boundary rather than day-to-day user administration.
"""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.authz import AdminUser
from app.db.database import get_db
from app.db.models import AllowedOrigin
from app.schemas.allowed_origins import (
    AllowedOriginCreate,
    AllowedOriginRead,
    AllowedOriginUpdate,
)
from app.services import allowed_origins_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin/cors-origins", tags=["Admin"])

DbSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("", response_model=list[AllowedOriginRead])
async def list_origins(admin: AdminUser, db: DbSession) -> list[AllowedOrigin]:
    """List every origin, enabled or not, newest first."""
    result = await db.execute(
        select(AllowedOrigin).order_by(AllowedOrigin.created_at.desc())
    )
    return list(result.scalars().all())


@router.post("", response_model=AllowedOriginRead, status_code=status.HTTP_201_CREATED)
async def create_origin(
    payload: AllowedOriginCreate, admin: AdminUser, db: DbSession
) -> AllowedOrigin:
    """Add an origin. Takes effect on the next request, no deploy needed."""
    try:
        origin = allowed_origins_service.normalize_origin(payload.origin)
    except allowed_origins_service.InvalidOriginError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e

    row = AllowedOrigin(origin=origin, note=payload.note, created_by=admin.id)
    db.add(row)
    try:
        await db.commit()
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=409, detail="That origin is already in the list"
        ) from e
    await db.refresh(row)

    logger.info("CORS origin added: %s by %s", origin, admin.email)
    allowed_origins_service.invalidate()
    return row


@router.patch("/{origin_id}", response_model=AllowedOriginRead)
async def update_origin(
    payload: AllowedOriginUpdate,
    admin: AdminUser,
    db: DbSession,
    origin_id: str = Path(..., description="Row UUID"),
) -> AllowedOrigin:
    """Enable, disable, or re-label an origin."""
    row = await db.get(AllowedOrigin, origin_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Origin not found")

    if payload.note is not None:
        row.note = payload.note
    if payload.enabled is not None:
        row.enabled = payload.enabled
    await db.commit()
    await db.refresh(row)

    logger.info(
        "CORS origin updated: %s (enabled=%s) by %s", row.origin, row.enabled, admin.email
    )
    allowed_origins_service.invalidate()
    return row


@router.delete("/{origin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_origin(
    admin: AdminUser,
    db: DbSession,
    origin_id: str = Path(..., description="Row UUID"),
) -> None:
    """Remove an origin from the list.

    Disabling is usually the better move: it keeps the record of who added the
    origin and why.
    """
    row = await db.get(AllowedOrigin, origin_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Origin not found")

    origin = row.origin
    await db.delete(row)
    await db.commit()

    logger.info("CORS origin deleted: %s by %s", origin, admin.email)
    allowed_origins_service.invalidate()
