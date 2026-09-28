"""SSO endpoints for third-party SaaS that cannot talk to Hanko directly.

LearnWorlds (learn.hotosm.org) redirects its visitors here with ``action`` and
``redirectUrl``; we validate the Hanko session, resolve which LearnWorlds
account belongs to this person, and bounce them to a one-time login URL.

Hanko is a session verifier, not an OIDC provider, so this is a "Custom SSO"
integration rather than a standard protocol. See
LEARNWORLDS_SSO_IMPLEMENTATION_PLAN.md for why.
"""

import logging
from typing import Annotated
from urllib.parse import urlencode, urlparse

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from hotosm_auth_fastapi import CurrentUserOptional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db import get_db
from app.db.models import HankoUserMapping
from app.services.learnworlds import LearnWorldsError, learnworlds_client

logger = logging.getLogger(__name__)

# Under /api on purpose: that is the prefix both the dev-env Traefik and the
# production ingress already route to this service. A bare /sso would 404 before
# reaching the app.
router = APIRouter(prefix="/api/sso", tags=["SSO"])

DB = Annotated[AsyncSession, Depends(get_db)]

APP_NAME = "learnworlds"

# LearnWorlds sends one of these three; it delegates all of them to us.
VALID_ACTIONS = ("login", "signup", "passwordreset")


def _safe_redirect_url(redirect_url: str | None) -> str:
    """Keep the redirect inside the school, falling back to its home page.

    ``redirectUrl`` arrives from the browser, so an unchecked value would turn
    this endpoint into an open redirect for anyone who can send a user here.
    """
    school_url = learnworlds_client.school_url
    if not redirect_url:
        return school_url

    school_host = urlparse(school_url).hostname
    try:
        target_host = urlparse(redirect_url).hostname
    except ValueError:
        return school_url

    if target_host and target_host == school_host:
        return redirect_url

    logger.warning("Discarding off-school redirectUrl for %s: %s", APP_NAME, redirect_url)
    return school_url


def _login_page_redirect(
    request: Request, action: str, redirect_url: str
) -> RedirectResponse:
    """Send an anonymous visitor to our login page and back here afterwards.

    The login page only honours an absolute ``return_to`` under hotosm.org, so
    both URLs are built absolute, falling back to this request's own origin when
    the deployment does not set the public URLs.
    """
    origin = (settings.backend_url or str(request.base_url)).rstrip("/")
    return_to = f"{origin}/api/sso/learnworlds?" + urlencode(
        {"action": action, "redirectUrl": redirect_url}
    )
    frontend = (settings.frontend_url or origin).rstrip("/")
    login_page = f"{frontend}/app/?" + urlencode({"return_to": return_to})
    return RedirectResponse(login_page, status_code=status.HTTP_302_FOUND)


async def _linked_user_id(db: AsyncSession, hanko_user_id: str) -> str | None:
    """Return the LearnWorlds user id already linked to this Hanko user."""
    result = await db.execute(
        select(HankoUserMapping.app_user_id).where(
            HankoUserMapping.hanko_user_id == hanko_user_id,
            HankoUserMapping.app_name == APP_NAME,
        )
    )
    return result.scalar_one_or_none()


async def _link(db: AsyncSession, hanko_user_id: str, app_user_id: str) -> None:
    """Remember the link so later logins no longer depend on the email."""
    db.add(
        HankoUserMapping(
            hanko_user_id=hanko_user_id,
            app_name=APP_NAME,
            app_user_id=app_user_id,
        )
    )
    await db.commit()
    logger.info("Linked hanko %s -> %s %s", hanko_user_id, APP_NAME, app_user_id)


@router.get("/learnworlds")
async def learnworlds_sso(
    request: Request,
    db: DB,
    user: CurrentUserOptional,
    action: str = Query("login"),
    redirect_url: str | None = Query(None, alias="redirectUrl"),
) -> RedirectResponse:
    """Log a HOT user into LearnWorlds and bounce them back to the LMS.

    **Authentication**: a Hanko session is optional here — without one the
    visitor is sent to the login page and returns to this same URL.

    **Returns**:
    - 302: to the LearnWorlds one-time login URL, or to our login page
    - 400: unknown ``action``
    - 502/503: LearnWorlds unreachable or credentials not configured
    """
    if not learnworlds_client.is_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LearnWorlds SSO is not configured",
        )

    if action not in VALID_ACTIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown action: {action}",
        )

    target = _safe_redirect_url(redirect_url)

    # signup and passwordreset land on the same page: Hanko's flow covers
    # registration and recovery, and both end with a session, which is all we
    # need to continue.
    if user is None:
        return _login_page_redirect(request, action, target)

    learnworlds_user_id = await _linked_user_id(db, user.id)
    matched_by_email = False

    # Not linked yet: try to adopt an existing LearnWorlds account with the same
    # email. Only a verified email proves the person owns it — without that
    # check anyone could claim someone else's courses by signing up with their
    # address.
    if not learnworlds_user_id and user.email and user.email_verified:
        try:
            existing = await learnworlds_client.get_user_by_email(user.email)
        except LearnWorldsError as exc:
            logger.exception("LearnWorlds lookup failed for %s", user.id)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="LearnWorlds is not responding",
            ) from exc
        if existing and existing.get("id"):
            learnworlds_user_id = existing["id"]
            matched_by_email = True

    # TODO (phase 3): when nothing matched, the user may still own an account
    # under a different email. The linking screens go here, before the call
    # below — which creates an account as a side effect.
    try:
        login_url, resolved_id = await learnworlds_client.sso_login(
            user_id=learnworlds_user_id,
            email=None if learnworlds_user_id else user.email,
            username=user.display_name,
            redirect_url=target,
        )
    except LearnWorldsError as exc:
        logger.exception("LearnWorlds SSO failed for %s", user.id)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="LearnWorlds could not start the session",
        ) from exc

    if not await _linked_user_id(db, user.id):
        await _link(db, user.id, resolved_id)
        logger.info(
            "learnworlds sso: %s (%s)",
            user.id,
            "matched by email" if matched_by_email else "new or created account",
        )

    return RedirectResponse(login_url, status_code=status.HTTP_302_FOUND)
