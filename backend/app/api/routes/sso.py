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

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from hotosm_auth_fastapi import CurrentUser, CurrentUserOptional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db import get_db
from app.db.models import HankoUserMapping, UserProfile
from app.schemas.sso import LinkRequest, MappingResponse
from app.services import hanko_lookup
from app.services.learnworlds import LearnWorldsError, learnworlds_client

logger = logging.getLogger(__name__)

# Under /api on purpose: that is the prefix both the dev-env Traefik and the
# production ingress already route to this service. A bare /sso would 404 before
# reaching the app.
router = APIRouter(prefix="/api/sso", tags=["SSO"])

# Service-to-service, same shared secret the PAT resolver uses. Separate router
# because this is not part of the browser-facing SSO flow.
internal_router = APIRouter(prefix="/api/internal", tags=["Internal"])

DB = Annotated[AsyncSession, Depends(get_db)]

APP_NAME = "learnworlds"

# LearnWorlds sends one of these three; it delegates all of them to us.
VALID_ACTIONS = ("login", "signup", "passwordreset")

# LearnWorlds sends back whatever page the user was on, which for anyone who
# clicked the sign-in button is its own login page. Returning a logged-in user
# there lands them on "Looks like you are lost", so those paths go home instead.
DEAD_END_PATHS = ("/signin", "/login", "/signup", "/register")


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
        target = urlparse(redirect_url)
    except ValueError:
        return school_url

    if target.hostname and target.hostname == school_host:
        if target.path.rstrip("/").lower() in DEAD_END_PATHS:
            return school_url
        return redirect_url

    logger.warning(
        "Discarding off-school redirectUrl for %s: %s", APP_NAME, redirect_url
    )
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


async def _match_by_email(user) -> str | None:
    """Find the person's LearnWorlds account by any of their verified emails.

    Only verified addresses count: an unverified one proves nothing, and
    matching on it would hand someone else's courses to whoever signed up with
    their address.
    """
    addresses = await hanko_lookup.verified_emails(user.id)
    if not addresses and user.email and user.email_verified:
        # Hanko unreachable: fall back to the address in the validated JWT.
        addresses = [user.email]

    for address in addresses:
        try:
            existing = await learnworlds_client.get_user_by_email(address)
        except LearnWorldsError as exc:
            logger.exception("LearnWorlds lookup failed for %s", user.id)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="LearnWorlds is not responding",
            ) from exc
        if existing and existing.get("id"):
            return existing["id"]
    return None


def _linking_page_redirect(request: Request, redirect_url: str) -> RedirectResponse:
    """Send the person to the screen that looks for their existing courses."""
    origin = (settings.frontend_url or str(request.base_url)).rstrip("/")
    page = f"{origin}/app/link/learnworlds?" + urlencode({"redirectUrl": redirect_url})
    return RedirectResponse(page, status_code=status.HTTP_302_FOUND)


async def _profile_fields(db: AsyncSession, user) -> dict[str, str]:
    """Name and avatar for the LearnWorlds profile, taken from our own.

    Without this a created account is named after the email, which reads badly
    in the LMS. We already hold the real name in ``user_profiles``, so there is
    nothing extra to ask the person.
    """
    result = await db.execute(
        select(UserProfile).where(UserProfile.hanko_user_id == user.id)
    )
    profile = result.scalar_one_or_none()

    first = (profile.first_name or "").strip() if profile else ""
    last = (profile.last_name or "").strip() if profile else ""
    full_name = " ".join(part for part in (first, last) if part)

    fields = {"username": full_name or user.display_name}
    if first:
        fields["first_name"] = first
    if last:
        fields["last_name"] = last
    if profile and profile.picture_url:
        fields["avatar"] = profile.picture_url
    return fields


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
    start_fresh: bool = Query(False, alias="new"),
) -> RedirectResponse:
    """Log a HOT user into LearnWorlds and bounce them back to the LMS.

    **Authentication**: a Hanko session is optional here — without one the
    visitor is sent to the login page and returns to this same URL.

    ``new=1`` is what the linking screen sends back when the person says they
    are new: it skips the screen and lets LearnWorlds create the account.

    **Returns**:
    - 302: to the LearnWorlds one-time login URL, to our login page, or to the
      linking screen
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

    if not learnworlds_user_id:
        learnworlds_user_id = await _match_by_email(user)
        matched_by_email = learnworlds_user_id is not None

    # Nothing matched: the person may still own an account under an address
    # they have not added to their HOT account yet. Ask before creating
    # anything — the call below would make a second, empty account, and the
    # courses on the old one would be out of their reach.
    if not learnworlds_user_id and not start_fresh:
        return _linking_page_redirect(request, target)

    # Name and avatar only when LearnWorlds is about to create the account.
    # An account that already exists has its own profile, and ours is often
    # worse: with no name on file it is the local part of an email, which
    # would overwrite a real name with something like "jane.doe+lms".
    profile = {} if learnworlds_user_id else await _profile_fields(db, user)

    try:
        login_url, resolved_id = await learnworlds_client.sso_login(
            user_id=learnworlds_user_id,
            email=None if learnworlds_user_id else user.email,
            redirect_url=target,
            **profile,
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


@router.get("/learnworlds/status")
async def learnworlds_status(db: DB, user: CurrentUser) -> dict:
    """What the linking screen needs to know before showing anything.

    **Authentication**: requires a Hanko session.
    """
    linked = await _linked_user_id(db, user.id)
    return {
        "linked": linked is not None,
        "emails": await hanko_lookup.verified_emails(user.id)
        or ([user.email] if user.email else []),
    }


@router.post("/learnworlds/link")
async def learnworlds_link(db: DB, user: CurrentUser, payload: LinkRequest) -> dict:
    """Link the account that owns ``email`` to this HOT user.

    The address must already be a **verified** email on their HOT account: the
    browser adds and verifies it through Hanko's own flow, and this only acts
    on the result. Checking it here rather than trusting the request is what
    stops anyone from claiming another person's courses.

    **Authentication**: requires a Hanko session.

    **Returns**:
    - 200: linked, with how many courses came back
    - 403: the address is not a verified email on this account
    - 404: no LearnWorlds account uses that address
    - 409: this HOT account is already linked
    """
    if await _linked_user_id(db, user.id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This account is already linked",
        )

    address = payload.email.strip().lower()
    if address not in await hanko_lookup.verified_emails(user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="That address is not a verified email on your account",
        )

    try:
        existing = await learnworlds_client.get_user_by_email(address)
    except LearnWorldsError as exc:
        logger.exception("LearnWorlds lookup failed while linking %s", user.id)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="LearnWorlds is not responding",
        ) from exc

    if not existing or not existing.get("id"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No courses are associated with that address",
        )

    await _link(db, user.id, existing["id"])

    try:
        courses = await learnworlds_client.count_courses(existing["id"])
    except LearnWorldsError:
        # The link is what matters; the count is only there to reassure.
        logger.warning("Could not count courses for %s", existing["id"])
        courses = None

    return {"linked": True, "courses": courses}


@internal_router.get(
    "/mappings/{app_name}/{hanko_user_id}", response_model=MappingResponse
)
async def resolve_mapping(
    app_name: str,
    hanko_user_id: str,
    db: DB,
    x_internal_key: Annotated[str, Header()],
) -> MappingResponse:
    """Resolve a Hanko user to their account in an external app.

    Login owns this mapping because LearnWorlds is a SaaS with no database of
    ours behind it. Other HOTOSM services ask here rather than keeping their
    own copy, and then talk to that app themselves.

    Works for any user, not just the caller: a public profile shows data about
    the person being looked at, and there is no session for them. That is why
    this is behind the shared secret and not the cookie.

    **Authentication**: ``X-Internal-Key`` (LOGIN_INTERNAL_API_KEY).

    **Returns**:
    - 200: the mapping, with ``app_user_id`` null when there is none
    - 401: wrong key
    - 503: no internal key configured on this deployment
    """
    if not settings.login_internal_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Internal mapping resolution is not configured",
        )
    if x_internal_key != settings.login_internal_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid internal key",
        )

    result = await db.execute(
        select(HankoUserMapping.app_user_id).where(
            HankoUserMapping.hanko_user_id == hanko_user_id,
            HankoUserMapping.app_name == app_name,
        )
    )
    return MappingResponse(
        hanko_user_id=hanko_user_id,
        app_name=app_name,
        app_user_id=result.scalar_one_or_none(),
    )
