"""User lookup by email (for adding members to teams).

Lets the team UI verify an email as it's typed, so members are added by email
instead of by raw Hanko user id.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from hotosm_auth.models import HankoUser
from hotosm_auth_fastapi import get_current_user
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.db.models import UserProfile
from app.services import hanko_lookup

router = APIRouter(prefix="/api/users", tags=["Users"])

CurrentUser = Annotated[HankoUser, Depends(get_current_user)]
DB = Annotated[AsyncSession, Depends(get_db)]


@router.get("/lookup")
async def lookup_user(
    user: CurrentUser, db: DB, email: Annotated[str, Query()]
) -> dict:
    """Resolve an email to a HOT account. ``{exists, hanko_user_id?, name?}``."""
    hanko_user_id = await hanko_lookup.email_to_user_id(email.strip().lower())
    if hanko_user_id is None:
        return {"exists": False}

    result = await db.execute(
        select(UserProfile).where(UserProfile.hanko_user_id == hanko_user_id)
    )
    profile = result.scalar_one_or_none()
    name = None
    if profile:
        name = " ".join(p for p in (profile.first_name, profile.last_name) if p) or None
    return {"exists": True, "hanko_user_id": hanko_user_id, "name": name}
