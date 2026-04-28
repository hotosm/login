"""API token management routes."""

import hashlib
import secrets
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, status
from hotosm_auth.models import HankoUser
from hotosm_auth_fastapi import get_current_user
from pydantic import BaseModel
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.apps import AllowedApp
from app.core.config import settings
from app.db import get_db
from app.db.models import UserApiToken, UserProfile
from app.schemas.api_token import (
    ApiTokenCreated,
    ApiTokenCreateRequest,
    ApiTokenMetadata,
)

router = APIRouter(prefix="/api/profile/me/api-tokens", tags=["API Tokens"])
internal_router = APIRouter(prefix="/api/internal", tags=["Internal"])

CurrentUser = Annotated[HankoUser, Depends(get_current_user)]
DB = Annotated[AsyncSession, Depends(get_db)]


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


@router.get("", response_model=list[ApiTokenMetadata])
async def list_my_tokens(user: CurrentUser, db: DB) -> list[ApiTokenMetadata]:
    """List all API tokens for the current user."""
    result = await db.execute(
        select(UserApiToken)
        .where(UserApiToken.hanko_user_id == user.id)
        .order_by(UserApiToken.created_at.desc())
    )
    return [ApiTokenMetadata.model_validate(row) for row in result.scalars().all()]


@router.post("", response_model=ApiTokenCreated, status_code=status.HTTP_201_CREATED)
async def generate_token(
    user: CurrentUser, db: DB, body: ApiTokenCreateRequest
) -> ApiTokenCreated:
    """Generate (or regenerate) a token for the given app.

    If a token already exists for this (user, app) pair, it is replaced.
    The plaintext token is returned only in this response.
    """
    plaintext = secrets.token_urlsafe(32)
    token_hash = _hash_token(plaintext)

    async with db.begin():
        await db.execute(
            delete(UserApiToken).where(
                UserApiToken.hanko_user_id == user.id,
                UserApiToken.app == body.app.value,
            )
        )
        token_row = UserApiToken(
            hanko_user_id=user.id,
            app=body.app.value,
            token_hash=token_hash,
        )
        db.add(token_row)
        await db.flush()

    await db.commit()
    await db.refresh(token_row)

    return ApiTokenCreated(
        id=token_row.id,
        app=AllowedApp(token_row.app),
        token=plaintext,
        created_at=token_row.created_at,
    )


@router.delete("/{token_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_token(user: CurrentUser, db: DB, token_id: UUID) -> None:
    """Revoke a single API token."""
    result = await db.execute(
        select(UserApiToken).where(
            UserApiToken.id == token_id,
            UserApiToken.hanko_user_id == user.id,
        )
    )
    token_row = result.scalar_one_or_none()
    if not token_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found",
        )
    await db.delete(token_row)
    await db.commit()


# --- Internal endpoint for consumer projects ---


class ResolveTokenRequest(BaseModel):
    """Request body for the internal resolve-token endpoint."""

    token_hash: str
    app: str


class ResolveTokenResponse(BaseModel):
    """HankoUser-shaped response for resolved tokens."""

    id: str
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    osm_user_id: int | None = None
    osm_username: str | None = None


@internal_router.post("/resolve-token", response_model=ResolveTokenResponse)
async def resolve_token(
    body: ResolveTokenRequest,
    db: DB,
    x_internal_key: Annotated[str, Header()],
) -> ResolveTokenResponse:
    """Resolve a PAT hash to a user profile.

    Protected by a shared secret (LOGIN_INTERNAL_API_KEY).
    Called by consumer projects via auth-libs' remote_pat_resolver.
    """
    if not settings.login_internal_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Internal token resolution is not configured",
        )
    if x_internal_key != settings.login_internal_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid internal key",
        )

    result = await db.execute(
        select(UserApiToken).where(
            UserApiToken.token_hash == body.token_hash,
            UserApiToken.app == body.app,
        )
    )
    token_row = result.scalar_one_or_none()
    if not token_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found",
        )

    token_row.last_used_at = func.now()
    await db.commit()

    # Load user profile
    profile_result = await db.execute(
        select(UserProfile).where(
            UserProfile.hanko_user_id == token_row.hanko_user_id
        )
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    return ResolveTokenResponse(
        id=profile.hanko_user_id,
        email=None,
        first_name=profile.first_name,
        last_name=profile.last_name,
        osm_user_id=profile.osm_user_id,
        osm_username=profile.osm_username,
    )
