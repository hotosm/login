"""
Auto-registered OSM OAuth routes for FastAPI.

These routes are automatically included when calling setup_auth() with OSM enabled.

Routes:
    GET  /auth/osm/login - Start OSM OAuth flow
    GET  /auth/osm/callback - Handle OSM OAuth callback
    GET  /auth/osm/status - Check OSM connection status
    POST /auth/osm/disconnect - Revoke OAuth tokens and disconnect OSM account
"""

import secrets
from typing import Optional

from fastapi import APIRouter, Request, Response, Depends, HTTPException
from fastapi.responses import RedirectResponse

from hotosm_auth.models import HankoUser, OSMConnection
from hotosm_auth.osm_oauth import OSMOAuthClient
from hotosm_auth.exceptions import OSMOAuthError
from hotosm_auth_fastapi.dependencies import (
    get_current_user,
    get_osm_connection,
    set_osm_cookie,
    clear_osm_cookie,
    get_config,
    get_cookie_crypto,
)
from hotosm_auth.logger import get_logger

logger = get_logger(__name__)


router = APIRouter(prefix="/auth/osm", tags=["OSM OAuth"])

# In-memory state storage (use Redis in production)
# TODO: Make this configurable to use Redis
# Format: {state: {"user_id": str, "redirect_url": str}}
_oauth_states = {}


@router.get("/login")
async def osm_login(
    user: HankoUser = Depends(get_current_user),
    request: Request = None,
):
    """
    Start OSM OAuth flow.

    Requires Hanko authentication first.
    Redirects to OSM authorization page.
    """
    config = get_config()

    if not config.osm_enabled:
        raise HTTPException(400, "OSM OAuth is not enabled")

    # Create OSM OAuth client
    osm_client = OSMOAuthClient(config)

    # Generate random state for CSRF protection
    state = secrets.token_urlsafe(32)

    # Store user ID and the page they came from for redirect after OAuth
    referer = request.headers.get('referer', '')
    if referer:
        from urllib.parse import urlparse
        parsed = urlparse(referer)
        # Store the full path (including query params if any)
        redirect_url = parsed.path
        if parsed.query:
            redirect_url += '?' + parsed.query
    else:
        # Fallback to current app's base path
        path = str(request.url.path)
        redirect_url = path.rsplit('/auth/osm/login', 1)[0] or '/'

    logger.debug(f"OSM login: storing state with redirect_url={redirect_url}")
    _oauth_states[state] = {
        "user_id": user.id,
        "redirect_url": redirect_url
    }

    # Generate authorization URL
    auth_url = osm_client.get_authorization_url(state=state)

    return RedirectResponse(auth_url)


@router.get("/callback")
async def osm_callback(
    code: str,
    state: str,
    request: Request,
    response: Response,
    user: HankoUser = Depends(get_current_user),
):
    """
    Handle OSM OAuth callback.

    OSM redirects here after user authorizes.
    Exchanges code for token and stores in httpOnly cookie.
    """
    config = get_config()

    if not config.osm_enabled:
        raise HTTPException(400, "OSM OAuth is not enabled")

    # Verify state (CSRF protection)
    state_data = _oauth_states.pop(state, None)
    if not state_data:
        raise HTTPException(400, "Invalid OAuth state")

    # Handle both old format (just user_id string) and new format (dict)
    if isinstance(state_data, dict):
        stored_user_id = state_data.get("user_id")
        redirect_url = state_data.get("redirect_url", "/")
    else:
        # Legacy format: just user_id
        stored_user_id = state_data
        redirect_url = "/"

    if stored_user_id != user.id:
        raise HTTPException(400, "Invalid OAuth state")

    try:
        # Create OSM OAuth client
        osm_client = OSMOAuthClient(config)

        # Exchange code for tokens
        osm_connection = await osm_client.exchange_code(code)

        logger.info(f"OSM OAuth successful: {osm_connection.osm_username}")

        # Create redirect response first
        redirect_response = RedirectResponse(redirect_url, status_code=303)

        # Set encrypted cookie on the redirect response
        crypto = get_cookie_crypto()
        set_osm_cookie(redirect_response, osm_connection, config, crypto)

        logger.debug(f"OSM callback: redirecting to {redirect_url}")

        # Return the redirect response with the cookie
        return redirect_response

    except OSMOAuthError as e:
        raise HTTPException(400, f"OSM OAuth failed: {str(e)}")


@router.get("/status")
async def osm_status(
    osm: Optional[OSMConnection] = Depends(get_osm_connection),
):
    """
    Check OSM connection status.

    Returns connection details if connected, or {connected: false} if not.
    """
    if not osm:
        return {"connected": False}

    return {
        "connected": True,
        "osm_user_id": osm.osm_user_id,
        "osm_username": osm.osm_username,
        "osm_avatar_url": osm.osm_avatar_url,
    }


@router.post("/disconnect")
async def osm_disconnect(
    response: Response,
    osm: Optional[OSMConnection] = Depends(get_osm_connection),
):
    """
    Disconnect OSM account.

    Revokes OAuth tokens on OpenStreetMap and removes OSM connection cookie.
    User can reconnect later via /auth/osm/login.

    Note: This endpoint does NOT require Hanko authentication because it's called
    during logout when the JWT may have already been cleared.
    """
    config = get_config()
    tokens_revoked = False

    # Revoke tokens on OSM if we have a connection
    if osm and config.osm_enabled:
        try:
            osm_client = OSMOAuthClient(config)

            # Revoke access token
            if osm.access_token:
                logger.info(f"Revoking OSM access token for user {osm.osm_username}")
                await osm_client.revoke_token(osm.access_token, "access_token")

            # Revoke refresh token
            if osm.refresh_token:
                logger.info(f"Revoking OSM refresh token for user {osm.osm_username}")
                await osm_client.revoke_token(osm.refresh_token, "refresh_token")

            tokens_revoked = True
            logger.info(f"Successfully revoked OSM tokens for {osm.osm_username}")

        except Exception as e:
            # Log error but don't fail - we'll still clear the cookie
            logger.error(f"Failed to revoke OSM tokens: {e}")

    # Clear the cookie regardless of revocation result
    logger.info(f"Clearing OSM cookie with domain={config.cookie_domain}, secure={config.cookie_secure}, samesite={config.cookie_samesite}")
    clear_osm_cookie(response, config)
    logger.info("Cookie clear command sent to response")

    return {"status": "disconnected", "tokens_revoked": tokens_revoked}
