"""Django middleware, decorators, and helpers for HOTOSM auth."""

import hashlib
from collections.abc import Awaitable
from datetime import datetime
from functools import wraps
from typing import Callable, Optional

from django.conf import settings
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.utils.functional import SimpleLazyObject

from hotosm_auth.config import AuthConfig
from hotosm_auth.crypto import CookieCrypto
from hotosm_auth.exceptions import (
    AuthenticationError,
    CookieDecryptionError,
    TokenExpiredError,
    TokenInvalidError,
)
from hotosm_auth.jwt_validator import JWTValidator
from hotosm_auth.logger import get_logger, log_auth_event
from hotosm_auth.models import HankoUser, OSMConnection

logger = get_logger(__name__)

PatResolver = Callable[[str, str], Awaitable[Optional[HankoUser]]]

# Global instances (initialized from Django settings)
_jwt_validator: Optional[JWTValidator] = None
_cookie_crypto: Optional[CookieCrypto] = None
_pat_resolver: Optional[PatResolver] = None
_app_name: Optional[str] = None


def init_auth_django(
    *,
    app_name: Optional[str] = None,
    pat_resolver: Optional[PatResolver] = None,
) -> None:
    """Configure PAT resolution for this Django project.

    Call this in your AppConfig.ready() or settings module.
    """
    global _pat_resolver, _app_name

    if pat_resolver and not app_name:
        raise ValueError("app_name is required when pat_resolver is provided")

    _pat_resolver = pat_resolver
    _app_name = app_name


def get_auth_config() -> AuthConfig:
    """Load auth config from env, or fallback to ``settings.HOTOSM_AUTH``."""
    # Method 1: Try environment variables first (recommended)
    if not hasattr(settings, "HOTOSM_AUTH"):
        try:
            return AuthConfig.from_env()
        except ValueError as e:
            raise ValueError(
                f"HOTOSM Auth not configured. Either set environment variables "
                f"(HANKO_API_URL, COOKIE_SECRET, etc.) or add HOTOSM_AUTH dict "
                f"to settings.py. Error: {e}"
            ) from e

    # Method 2: Use Django settings dict (legacy)
    config_dict = settings.HOTOSM_AUTH
    return AuthConfig(**config_dict)


def get_jwt_validator() -> JWTValidator:
    """Get or create JWT validator singleton."""
    global _jwt_validator

    if _jwt_validator is None:
        config = get_auth_config()
        _jwt_validator = JWTValidator(config)

    return _jwt_validator


def get_cookie_crypto() -> CookieCrypto:
    """Get or create cookie crypto singleton."""
    global _cookie_crypto

    if _cookie_crypto is None:
        config = get_auth_config()
        _cookie_crypto = CookieCrypto(config.cookie_secret)

    return _cookie_crypto


def get_token_from_request(request: HttpRequest) -> Optional[str]:
    """Extract JWT token from request.

    Priority:
    1. Authorization header (Bearer token)
    2. hanko cookie
    """
    # Try Authorization header first
    auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:]  # Remove "Bearer " prefix

    # Try cookie
    return request.COOKIES.get("hanko")


def _looks_like_jwt(token: str) -> bool:
    """Heuristic: JWTs have three base64 segments separated by dots."""
    parts = token.split(".")
    return len(parts) == 3 and all(parts)


async def get_current_user(request: HttpRequest) -> Optional[HankoUser]:
    """Get authenticated user from request (JWT or opaque PAT)."""
    token = get_token_from_request(request)

    if not token:
        logger.debug(f"No JWT token found in request to {request.path}")
        return None

    if _looks_like_jwt(token):
        try:
            validator = get_jwt_validator()
            logger.debug(f"Validating JWT for {request.path}")
            user = await validator.validate_token(token)
            logger.info(f"JWT validation successful for {user.email}")
            return user
        except (TokenExpiredError, TokenInvalidError, AuthenticationError) as e:
            logger.warning(
                f"JWT validation failed for {request.path}: {type(e).__name__}: {e}"
            )
            return None
        except Exception as e:
            logger.error(
                "Unexpected error during JWT validation for %s: %s: %s",
                request.path,
                type(e).__name__,
                e,
                exc_info=True,
            )
            return None

    # Opaque token — try PAT resolution
    if not _pat_resolver or not _app_name:
        logger.debug("Opaque bearer token but no PAT resolver configured")
        return None

    token_hash = hashlib.sha256(token.encode()).hexdigest()
    try:
        user = await _pat_resolver(token_hash, _app_name)
        if user:
            logger.info(f"PAT validation successful for {user.id} ({_app_name})")
        return user
    except Exception as e:
        logger.error(f"PAT resolution failed: {type(e).__name__}: {e}", exc_info=True)
        return None


def get_osm_connection(request: HttpRequest) -> Optional[OSMConnection]:
    """Get OSM connection from encrypted cookie."""
    encrypted = request.COOKIES.get("osm_connection")

    if not encrypted:
        return None

    try:
        crypto = get_cookie_crypto()
        return crypto.decrypt_osm_connection(encrypted)
    except CookieDecryptionError:
        return None


class _HOTOSMNamespace:
    """Namespace object for request.hotosm."""

    def __init__(self, request: HttpRequest):
        self._request = request
        self._user = None
        self._osm = None
        self._user_loaded = False
        self._osm_loaded = False

    @property
    def user(self) -> Optional[HankoUser]:
        """Get authenticated user (lazy-loaded)."""
        if not self._user_loaded:
            self._user = self._get_user_sync(self._request)
            self._user_loaded = True
        return self._user

    @property
    def osm(self) -> Optional[OSMConnection]:
        """Get OSM connection (lazy-loaded)."""
        if not self._osm_loaded:
            self._osm = get_osm_connection(self._request)
            self._osm_loaded = True
        return self._osm

    def _get_user_sync(self, request: HttpRequest) -> Optional[HankoUser]:
        """Synchronous wrapper for get_current_user."""
        import asyncio

        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        try:
            result = loop.run_until_complete(get_current_user(request))
            return result
        except Exception as e:
            logger.error(
                f"Exception in run_until_complete: {type(e).__name__}: {e}",
                exc_info=True,
            )
            return None


class HankoAuthMiddleware:
    """Attach lazy ``request.hotosm.user`` and ``request.hotosm.osm``."""

    def __init__(self, get_response: Callable):
        """Store next middleware/callable in the chain."""
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        """Attach auth namespace and delegate request handling."""
        # Add namespace with lazy-loaded user and OSM connection
        request.hotosm = _HOTOSMNamespace(request)

        # Backwards compatibility: also set old attribute names
        request.hanko_user = SimpleLazyObject(lambda: request.hotosm.user)
        request.osm_connection = SimpleLazyObject(lambda: request.hotosm.osm)

        return self.get_response(request)


def login_required(view_func: Callable) -> Callable:
    """Decorator to require authentication."""

    @wraps(view_func)
    def wrapper(request: HttpRequest, *args, **kwargs):
        if not hasattr(request, "hanko_user") or not request.hanko_user:
            return JsonResponse(
                {"error": "Authentication required"},
                status=401,
            )
        return view_func(request, *args, **kwargs)

    return wrapper


def osm_required(view_func: Callable) -> Callable:
    """Decorator to require OSM connection."""

    @wraps(view_func)
    def wrapper(request: HttpRequest, *args, **kwargs):
        if not hasattr(request, "osm_connection") or not request.osm_connection:
            return JsonResponse(
                {"error": "OSM connection required"},
                status=403,
            )
        return view_func(request, *args, **kwargs)

    return wrapper


def set_osm_cookie(
    response: HttpResponse,
    osm_connection: OSMConnection,
) -> None:
    """Set encrypted OSM connection cookie on response."""
    config = get_auth_config()
    crypto = get_cookie_crypto()

    encrypted = crypto.encrypt_osm_connection(osm_connection)

    # Calculate max_age from expires_at
    max_age = None
    if osm_connection.expires_at:
        delta = osm_connection.expires_at - datetime.utcnow()
        max_age = int(delta.total_seconds())

    response.set_cookie(
        key="osm_connection",
        value=encrypted,
        httponly=True,
        secure=config.cookie_secure,
        samesite=config.cookie_samesite,
        domain=config.cookie_domain,
        max_age=max_age,
        path="/",
    )


def clear_osm_cookie(response: HttpResponse) -> None:
    """Clear OSM connection cookie from response."""
    config = get_auth_config()

    logger.debug("Clearing OSM cookie")

    # Must use EXACT same parameters as set_osm_cookie to delete the cookie
    response.set_cookie(
        key="osm_connection",
        value="",
        httponly=True,
        secure=config.cookie_secure,
        samesite=config.cookie_samesite,
        domain=config.cookie_domain,
        max_age=0,
        path="/",
    )

    logger.debug("Cookie deletion command issued")


# ===================================================================
# User Mapping Helpers (Django version)
# ===================================================================


def get_mapped_user_id(
    hanko_user: HankoUser,
    app_name: str = "default",
    auto_create: bool = False,
    user_id_generator: Optional[Callable[[], str]] = None,
) -> Optional[str]:
    """Get mapped app user id for a Hanko user (Django variant)."""
    from django.db import connection

    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT app_user_id
            FROM hanko_user_mappings
            WHERE hanko_user_id = %s AND app_name = %s
            """,
            [hanko_user.id, app_name],
        )
        row = cursor.fetchone()

        if row:
            app_user_id = row[0]
            logger.debug(
                f"Found mapping: {hanko_user.id} -> {app_user_id} ({app_name})"
            )
            log_auth_event(
                "MAPPING_FOUND",
                app_name,
                hanko_user.id,
                email=hanko_user.email,
                app_user_id=app_user_id,
            )
            return app_user_id

        # No mapping found
        if not auto_create:
            logger.debug(
                f"No mapping found for Hanko user {hanko_user.id} in {app_name}"
            )
            return None

        # Auto-create mapping
        if not user_id_generator:
            raise ValueError("user_id_generator required when auto_create=True")

        new_user_id = user_id_generator()

        cursor.execute(
            """
            INSERT INTO hanko_user_mappings (
                hanko_user_id, app_user_id, app_name, created_at
            )
            VALUES (%s, %s, %s, NOW())
            """,
            [hanko_user.id, str(new_user_id), app_name],
        )

        logger.info(f"Created mapping: {hanko_user.id} -> {new_user_id} ({app_name})")
        log_auth_event(
            "MAPPING_CREATED",
            app_name,
            hanko_user.id,
            email=hanko_user.email,
            app_user_id=str(new_user_id),
            source="auto",
        )
        return str(new_user_id)


def get_auth_status(request: HttpRequest, app_name: str = "default") -> dict:
    """Return current auth + mapping status for the request."""
    # Check if hotosm middleware is present
    if not hasattr(request, "hotosm"):
        return {
            "logged_in": False,
            "has_mapping": False,
            "error": "HOTOSM middleware not configured",
        }

    hanko_user = request.hotosm.user

    # No Hanko session
    if not hanko_user:
        return {
            "logged_in": False,
            "has_mapping": False,
        }

    # Has Hanko session - check mapping
    mapped_user_id = get_mapped_user_id(hanko_user, app_name=app_name)

    if mapped_user_id is not None:
        # Fully authenticated
        return {
            "logged_in": True,
            "has_mapping": True,
            "needs_onboarding": False,
            "app_user_id": mapped_user_id,
            "hanko_user": {
                "id": hanko_user.id,
                "email": hanko_user.email,
            },
        }

    # Logged in but no mapping
    return {
        "logged_in": True,
        "has_mapping": False,
        "needs_onboarding": True,
        "hanko_user": {
            "id": hanko_user.id,
            "email": hanko_user.email,
        },
    }


def create_user_mapping(
    hanko_user_id: str,
    app_user_id: str,
    app_name: str = "default",
) -> None:
    """Create a mapping entry explicitly (Django variant)."""
    from django.db import connection

    with connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO hanko_user_mappings (
                hanko_user_id, app_user_id, app_name, created_at
            )
            VALUES (%s, %s, %s, NOW())
            ON CONFLICT (hanko_user_id) DO UPDATE
                SET app_user_id = EXCLUDED.app_user_id,
                    updated_at  = NOW()
            """,
            [hanko_user_id, app_user_id, app_name],
        )

    logger.info(f"Created mapping: {hanko_user_id} -> {app_user_id} ({app_name})")
    log_auth_event(
        "MAPPING_CREATED",
        app_name,
        hanko_user_id,
        app_user_id=app_user_id,
        source="manual",
    )
