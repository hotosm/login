"""Auto-registered OSM OAuth routes for Litestar."""

import secrets
from urllib.parse import urlparse

from litestar import Request, Response, Router, get, post
from litestar.exceptions import HTTPException
from litestar.params import Parameter
from litestar.response import Redirect
from litestar.status_codes import HTTP_200_OK

from hotosm_auth.exceptions import OSMOAuthError
from hotosm_auth.logger import get_logger
from hotosm_auth.models import HankoUser, OSMConnection
from hotosm_auth.osm_oauth import OSMOAuthClient
from hotosm_auth_litestar.dependencies import (
    clear_osm_cookie,
    get_config,
    get_cookie_crypto,
    set_osm_cookie,
)

logger = get_logger(__name__)

# In-memory state storage (use Redis in production)
# Format: {state: {"user_id": str, "redirect_url": str}}
_oauth_states: dict[str, dict[str, str]] = {}


@get("/login")
async def osm_login(
    current_user: HankoUser,
    request: Request,
) -> Redirect:
    """Start OSM OAuth flow and redirect to OSM authorization."""
    config = get_config()
    if not config.osm_enabled:
        raise HTTPException(status_code=400, detail="OSM OAuth is not enabled")

    osm_client = OSMOAuthClient(config)
    state = secrets.token_urlsafe(32)

    referer = request.headers.get("referer", "")
    if referer:
        parsed = urlparse(referer)
        redirect_url = parsed.path
        if parsed.query:
            redirect_url += f"?{parsed.query}"
    else:
        path = str(request.url.path)
        redirect_url = path.rsplit("/auth/osm/login", 1)[0] or "/"

    _oauth_states[state] = {"user_id": current_user.id, "redirect_url": redirect_url}
    return Redirect(path=osm_client.get_authorization_url(state=state))


@get("/callback")
async def osm_callback(
    code: str,
    current_user: HankoUser,
    oauth_state: str = Parameter(query="state"),
) -> Redirect:
    """Handle OSM OAuth callback and set OSM cookie."""
    config = get_config()
    if not config.osm_enabled:
        raise HTTPException(status_code=400, detail="OSM OAuth is not enabled")

    state_data = _oauth_states.pop(oauth_state, None)
    if not state_data:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")

    if state_data.get("user_id") != current_user.id:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")

    try:
        osm_client = OSMOAuthClient(config)
        osm_connection = await osm_client.exchange_code(code)

        redirect_url = state_data.get("redirect_url", "/")
        redirect = Redirect(path=redirect_url, status_code=303)
        set_osm_cookie(redirect, osm_connection, config, get_cookie_crypto())
        return redirect
    except OSMOAuthError as exc:
        raise HTTPException(
            status_code=400,
            detail=f"OSM OAuth failed: {exc}",
        ) from exc


@get("/status")
async def osm_status(
    osm_connection: OSMConnection | None,
) -> dict[str, object]:
    """Check OSM connection status."""
    if not osm_connection:
        return {"connected": False}
    return {
        "connected": True,
        "osm_user_id": osm_connection.osm_user_id,
        "osm_username": osm_connection.osm_username,
        "osm_avatar_url": osm_connection.osm_avatar_url,
    }


@post("/disconnect", status_code=HTTP_200_OK)
async def osm_disconnect(
    osm_connection: OSMConnection | None,
) -> Response:
    """Disconnect OSM account and clear OSM cookie."""
    config = get_config()
    tokens_revoked = False

    if osm_connection and config.osm_enabled:
        try:
            osm_client = OSMOAuthClient(config)
            if osm_connection.access_token:
                await osm_client.revoke_token(
                    osm_connection.access_token, "access_token"
                )
            if osm_connection.refresh_token:
                await osm_client.revoke_token(
                    osm_connection.refresh_token, "refresh_token"
                )
            tokens_revoked = True
        except Exception as exc:  # pragma: no cover - best-effort cleanup
            logger.error(f"Failed to revoke OSM tokens: {exc}")

    response = Response({"status": "disconnected", "tokens_revoked": tokens_revoked})
    clear_osm_cookie(response, config)
    return response


osm_router = Router(
    path="/auth/osm",
    route_handlers=[osm_login, osm_callback, osm_status, osm_disconnect],
    tags=["OSM OAuth"],
)
