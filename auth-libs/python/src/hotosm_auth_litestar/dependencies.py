"""Litestar dependencies for HOTOSM authentication.

Provides:
- Dependency providers for HankoUser and OSMConnection
- Cookie management utilities
- User mapping helpers
"""

from dataclasses import dataclass
from datetime import datetime, timezone

from litestar import Request, Response
from litestar.di import Provide
from litestar.exceptions import HTTPException
from litestar.status_codes import HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN

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
_BEARER_PARTS_COUNT = 2


# Global instances (set by init_auth)
_config: AuthConfig | None = None
_jwt_validator: JWTValidator | None = None
_cookie_crypto: CookieCrypto | None = None


@dataclass
class AuthContext:
    """Combined authenticated context for Litestar handlers."""

    user: HankoUser
    osm: OSMConnection | None

    def require_osm(self) -> OSMConnection:
        """Require OSM connection or raise 403."""
        if not self.osm:
            raise HTTPException(
                status_code=HTTP_403_FORBIDDEN,
                detail="OSM connection required. Please connect your OSM account.",
            )
        return self.osm


@dataclass
class OptionalAuthContext:
    """Combined optional auth context for Litestar handlers."""

    user: HankoUser | None
    osm: OSMConnection | None


def init_auth(config: AuthConfig) -> None:
    """Initialize authentication for Litestar app."""
    global _config, _jwt_validator, _cookie_crypto

    _config = config
    _jwt_validator = JWTValidator(config)
    _cookie_crypto = CookieCrypto(config.cookie_secret)


def get_config() -> AuthConfig:
    """Get authentication configuration."""
    if _config is None:
        raise RuntimeError("Auth not initialized. Call init_auth() at startup.")
    return _config


def get_jwt_validator() -> JWTValidator:
    """Get JWT validator."""
    if _jwt_validator is None:
        raise RuntimeError("Auth not initialized. Call init_auth() at startup.")
    return _jwt_validator


def get_cookie_crypto() -> CookieCrypto:
    """Get cookie crypto."""
    if _cookie_crypto is None:
        raise RuntimeError("Auth not initialized. Call init_auth() at startup.")
    return _cookie_crypto


def get_token_from_request(request: Request) -> str | None:
    """Extract JWT token from Authorization header or cookie."""
    authorization = request.headers.get("authorization")
    if authorization:
        parts = authorization.split(" ", 1)
        if (
            len(parts) == _BEARER_PARTS_COUNT
            and parts[0].lower() == "bearer"
            and parts[1]
        ):
            return parts[1]

    return request.cookies.get("hanko")


async def get_current_user(request: Request) -> HankoUser:
    """Get currently authenticated user or raise 401."""
    token = get_token_from_request(request)
    if not token:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    validator = get_jwt_validator()
    try:
        return await validator.validate_token(token)
    except TokenExpiredError as exc:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    except (TokenInvalidError, AuthenticationError) as exc:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


async def get_current_user_optional(request: Request) -> HankoUser | None:
    """Get current user if authenticated, None otherwise."""
    token = get_token_from_request(request)
    if not token:
        return None

    validator = get_jwt_validator()
    try:
        return await validator.validate_token(token)
    except (TokenExpiredError, TokenInvalidError, AuthenticationError):
        return None


def get_osm_connection(request: Request) -> OSMConnection | None:
    """Get OSM connection from encrypted cookie."""
    encrypted = request.cookies.get("osm_connection")
    if not encrypted:
        return None

    try:
        return get_cookie_crypto().decrypt_osm_connection(encrypted)
    except CookieDecryptionError:
        return None


def require_osm_connection(osm_connection: OSMConnection | None) -> OSMConnection:
    """Require OSM connection."""
    if not osm_connection:
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN,
            detail="OSM connection required",
        )
    return osm_connection


async def provide_auth_context(
    current_user: HankoUser,
    osm_connection: OSMConnection | None,
) -> AuthContext:
    """Dependency provider for full auth context."""
    return AuthContext(user=current_user, osm=osm_connection)


async def provide_optional_auth_context(
    current_user_optional: HankoUser | None,
    osm_connection: OSMConnection | None,
) -> OptionalAuthContext:
    """Dependency provider for optional auth context."""
    return OptionalAuthContext(user=current_user_optional, osm=osm_connection)


def create_dependencies() -> dict[str, Provide]:
    """Create Litestar dependency mapping for HOTOSM auth."""
    return {
        "current_user": Provide(get_current_user),
        "current_user_optional": Provide(get_current_user_optional),
        "osm_connection": Provide(get_osm_connection, sync_to_thread=False),
        "osm_connection_required": Provide(
            require_osm_connection, sync_to_thread=False
        ),
        "auth": Provide(provide_auth_context),
        "optional_auth": Provide(provide_optional_auth_context),
    }


def set_osm_cookie(
    response: Response,
    osm_connection: OSMConnection,
    config: AuthConfig,
    crypto: CookieCrypto,
) -> None:
    """Set encrypted OSM connection cookie on response."""
    encrypted = crypto.encrypt_osm_connection(osm_connection)

    max_age = None
    if osm_connection.expires_at:
        delta = osm_connection.expires_at - datetime.now(timezone.utc)
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


def clear_osm_cookie(
    response: Response,
    config: AuthConfig,
) -> None:
    """Clear OSM connection cookie from response."""
    for secure in [True, False]:
        for samesite in ["lax", "strict", "none"]:
            if samesite == "none" and not secure:
                continue
            if config.cookie_domain:
                response.set_cookie(
                    key="osm_connection",
                    value="",
                    httponly=True,
                    secure=secure,
                    samesite=samesite,
                    domain=config.cookie_domain,
                    max_age=0,
                    path="/",
                )
            response.set_cookie(
                key="osm_connection",
                value="",
                httponly=True,
                secure=secure,
                samesite=samesite,
                max_age=0,
                path="/",
            )


async def get_mapped_user_id(
    hanko_user: HankoUser,
    db_conn,
    app_name: str = "default",
    auto_create: bool = True,
    email_lookup_fn=None,
    user_creator_fn=None,
    user_id_generator=None,
) -> str:
    """Get application-specific user ID for a Hanko user."""
    async with db_conn.cursor() as cur:
        await cur.execute(
            """
            SELECT app_user_id
            FROM hanko_user_mappings
            WHERE hanko_user_id = %s AND app_name = %s
            """,
            (hanko_user.id, app_name),
        )
        row = await cur.fetchone()

        if row:
            app_user_id = row[0]
            log_auth_event(
                "MAPPING_FOUND",
                app_name,
                hanko_user.id,
                email=hanko_user.email,
                app_user_id=app_user_id,
            )
            return app_user_id

        if not auto_create:
            raise HTTPException(
                status_code=HTTP_403_FORBIDDEN,
                detail=f"User not authorized for {app_name}",
            )

        new_user_id = await _resolve_new_user_id(
            hanko_user,
            db_conn,
            email_lookup_fn,
            user_creator_fn,
            user_id_generator,
        )

        await cur.execute(
            """
            INSERT INTO hanko_user_mappings (
                hanko_user_id, app_user_id, app_name, created_at
            )
            VALUES (%s, %s, %s, NOW())
            """,
            (hanko_user.id, new_user_id, app_name),
        )

        log_auth_event(
            "MAPPING_CREATED",
            app_name,
            hanko_user.id,
            email=hanko_user.email,
            app_user_id=new_user_id,
        )
        return new_user_id


async def _resolve_new_user_id(
    hanko_user: HankoUser,
    db_conn,
    email_lookup_fn,
    user_creator_fn,
    user_id_generator,
) -> str:
    """Resolve a new app user ID using lookup, creation, or fallback."""
    new_user_id = None

    if email_lookup_fn:
        existing_user_id = await email_lookup_fn(db_conn, hanko_user.email)
        if existing_user_id:
            new_user_id = existing_user_id

    if not new_user_id and user_creator_fn:
        new_user_id = await user_creator_fn(db_conn, hanko_user)

    if new_user_id:
        return new_user_id
    return user_id_generator() if user_id_generator else hanko_user.id


async def create_user_mapping(
    hanko_user_id: str,
    app_user_id: str,
    db_conn,
    app_name: str = "default",
) -> None:
    """Manually create a user mapping."""
    async with db_conn.cursor() as cur:
        await cur.execute(
            """
            INSERT INTO hanko_user_mappings (
                hanko_user_id, app_user_id, app_name, created_at
            )
            VALUES (%s, %s, %s, NOW())
            """,
            (hanko_user_id, app_user_id, app_name),
        )

    logger.info(
        f"Manually created mapping: {hanko_user_id} -> {app_user_id} ({app_name})"
    )
    log_auth_event(
        "MAPPING_CREATED",
        app_name,
        hanko_user_id,
        app_user_id=app_user_id,
        source="manual",
    )
