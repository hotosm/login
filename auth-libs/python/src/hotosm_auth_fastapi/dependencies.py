"""FastAPI authentication dependencies and helpers."""

import hashlib
from collections.abc import Awaitable, Callable
from datetime import datetime
from typing import Annotated, Optional

from fastapi import Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

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

# Global instances (set by init_auth)
_config: Optional[AuthConfig] = None
_jwt_validator: Optional[JWTValidator] = None
_cookie_crypto: Optional[CookieCrypto] = None
_pat_resolver: Optional[PatResolver] = None
_app_name: Optional[str] = None

# Security scheme for Swagger UI
bearer_scheme = HTTPBearer(auto_error=False)


def init_auth(
    config: AuthConfig,
    *,
    app_name: Optional[str] = None,
    pat_resolver: Optional[PatResolver] = None,
) -> None:
    """Initialize module-level auth dependencies for the app.

    Args:
        config: Auth configuration (Hanko URL, cookie secret, etc.).
        app_name: Identifier for this project (e.g. "fair", "drone-tm").
            Required when pat_resolver is provided.
        pat_resolver: Async callable(token_hash, app_name) -> HankoUser | None.
            If provided, opaque bearer tokens are resolved via this function
            instead of being rejected as invalid JWTs.
    """
    global _config, _jwt_validator, _cookie_crypto, _pat_resolver, _app_name

    if pat_resolver and not app_name:
        raise ValueError("app_name is required when pat_resolver is provided")

    _config = config
    _jwt_validator = JWTValidator(config)
    _cookie_crypto = CookieCrypto(config.cookie_secret)
    _pat_resolver = pat_resolver
    _app_name = app_name


def get_config() -> AuthConfig:
    """Get authentication configuration (dependency)."""
    if _config is None:
        raise RuntimeError("Auth not initialized. Call init_auth() at startup.")
    return _config


def get_jwt_validator() -> JWTValidator:
    """Get JWT validator (dependency)."""
    if _jwt_validator is None:
        raise RuntimeError("Auth not initialized. Call init_auth() at startup.")
    return _jwt_validator


def get_cookie_crypto() -> CookieCrypto:
    """Get cookie crypto (dependency)."""
    if _cookie_crypto is None:
        raise RuntimeError("Auth not initialized. Call init_auth() at startup.")
    return _cookie_crypto


async def get_token_from_request(
    request: Request,
    credentials: Annotated[
        Optional[HTTPAuthorizationCredentials], Depends(bearer_scheme)
    ],
) -> Optional[str]:
    """Extract JWT token from Authorization header or cookie."""
    # Try Authorization header first
    if credentials and credentials.scheme.lower() == "bearer":
        return credentials.credentials

    # Try cookie
    token = request.cookies.get("hanko")
    return token


def _looks_like_jwt(token: str) -> bool:
    """Heuristic: JWTs have three base64 segments separated by dots."""
    parts = token.split(".")
    return len(parts) == 3 and all(parts)


async def get_current_user(
    request: Request,
    validator: Annotated[JWTValidator, Depends(get_jwt_validator)],
    credentials: Annotated[
        Optional[HTTPAuthorizationCredentials], Depends(bearer_scheme)
    ],
) -> HankoUser:
    """Validate JWT or opaque PAT and return the authenticated user."""
    token = await get_token_from_request(request, credentials)

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # If the token looks like a JWT, validate it the existing way.
    # Otherwise try resolving it as an opaque PAT via the injected resolver.
    if _looks_like_jwt(token):
        try:
            user = await validator.validate_token(token)
            return user
        except TokenExpiredError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            ) from exc
        except (TokenInvalidError, AuthenticationError) as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e),
                headers={"WWW-Authenticate": "Bearer"},
            ) from e

    # Opaque token — try PAT resolution
    if not _pat_resolver or not _app_name:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_hash = hashlib.sha256(token.encode()).hexdigest()
    user = await _pat_resolver(token_hash, _app_name)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def get_current_user_optional(
    request: Request,
    validator: Annotated[JWTValidator, Depends(get_jwt_validator)],
    credentials: Annotated[
        Optional[HTTPAuthorizationCredentials], Depends(bearer_scheme)
    ],
) -> Optional[HankoUser]:
    """Return the current user, or ``None`` when unauthenticated."""
    token = await get_token_from_request(request, credentials)

    if not token:
        return None

    try:
        user = await validator.validate_token(token)
        return user
    except (TokenExpiredError, TokenInvalidError, AuthenticationError):
        return None


async def get_osm_connection(
    request: Request,
    crypto: Annotated[CookieCrypto, Depends(get_cookie_crypto)],
) -> Optional[OSMConnection]:
    """Read and decrypt the OSM connection cookie."""
    encrypted = request.cookies.get("osm_connection")

    logger.debug(f"Looking for OSM connection cookie: found={encrypted is not None}")

    if not encrypted:
        logger.debug("No OSM cookie found, returning None")
        return None

    try:
        logger.debug("Attempting to decrypt OSM cookie...")
        osm = crypto.decrypt_osm_connection(encrypted)
        logger.debug(f"OSM connection decrypted successfully: {osm.osm_username}")
        return osm
    except CookieDecryptionError as e:
        logger.debug(f"OSM cookie decryption failed: {e}")
        return None


async def require_osm_connection(
    osm: Annotated[Optional[OSMConnection], Depends(get_osm_connection)],
) -> OSMConnection:
    """Return OSM connection or raise 403."""
    if not osm:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="OSM connection required",
        )
    return osm


def set_osm_cookie(
    response: Response,
    osm_connection: OSMConnection,
    config: AuthConfig,
    crypto: CookieCrypto,
) -> None:
    """Set encrypted OSM connection cookie on response."""
    encrypted = crypto.encrypt_osm_connection(osm_connection)

    # Calculate max_age from expires_at
    max_age = None
    if osm_connection.expires_at:
        delta = osm_connection.expires_at - datetime.utcnow()
        max_age = int(delta.total_seconds())

    logger.debug("Setting OSM cookie")

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
    """Clear OSM cookie using multiple attribute combinations."""
    for secure in [True, False]:
        for samesite in ["lax", "strict", "none"]:
            # SameSite=None requires Secure
            if samesite == "none" and not secure:
                continue
            # With domain
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

            # Without domain
            response.set_cookie(
                key="osm_connection",
                value="",
                httponly=True,
                secure=secure,
                samesite=samesite,
                max_age=0,
                path="/",
            )


# Type aliases for cleaner dependency injection
CurrentUser = Annotated[HankoUser, Depends(get_current_user)]
CurrentUserOptional = Annotated[Optional[HankoUser], Depends(get_current_user_optional)]
OSMConnectionDep = Annotated[Optional[OSMConnection], Depends(get_osm_connection)]
OSMConnectionRequired = Annotated[OSMConnection, Depends(require_osm_connection)]


# ===================================================================
# User Mapping Helpers
# ===================================================================


async def _resolve_new_user_id(
    hanko_user: HankoUser,
    db_conn,
    email_lookup_fn,
    user_creator_fn,
    user_id_generator,
) -> str:
    """Resolve app user ID via email lookup, user creation, or fallback."""
    new_user_id = None

    if email_lookup_fn:
        logger.debug(f"Searching for existing user with email: {hanko_user.email}")
        existing_user_id = await email_lookup_fn(db_conn, hanko_user.email)
        if existing_user_id:
            logger.info(
                "Found existing user by email: %s -> %s",
                hanko_user.email,
                existing_user_id,
            )
            new_user_id = existing_user_id

    if not new_user_id and user_creator_fn:
        logger.debug(f"Creating new user for Hanko user: {hanko_user.id}")
        new_user_id = await user_creator_fn(db_conn, hanko_user)
        logger.info(f"Created new user: {new_user_id}")

    if new_user_id:
        return new_user_id
    return user_id_generator() if user_id_generator else hanko_user.id


async def get_mapped_user_id(
    hanko_user: HankoUser,
    db_conn,  # psycopg Connection or AsyncConnection
    app_name: str = "default",
    auto_create: bool = True,
    email_lookup_fn=None,  # Optional: async (conn, email) -> Optional[user_id]
    user_creator_fn=None,  # Optional: async (conn, hanko_user) -> user_id
    user_id_generator=None,  # Optional: func() -> str to generate new IDs
) -> str:
    """Get or create an app-specific user ID for a Hanko user."""
    # Look up existing mapping
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
            logger.debug(f"Found mapping: {hanko_user.id} -> {app_user_id}")
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
            logger.warning(f"No mapping found for Hanko user {hanko_user.id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User not authorized for {app_name}",
            )

        new_user_id = await _resolve_new_user_id(
            hanko_user,
            db_conn,
            email_lookup_fn,
            user_creator_fn,
            user_id_generator,
        )

        # Create mapping
        await cur.execute(
            """
            INSERT INTO hanko_user_mappings (
                hanko_user_id, app_user_id, app_name, created_at
            )
            VALUES (%s, %s, %s, NOW())
            """,
            (hanko_user.id, new_user_id, app_name),
        )

        logger.info(f"Created mapping: {hanko_user.id} -> {new_user_id} ({app_name})")
        log_auth_event(
            "MAPPING_CREATED",
            app_name,
            hanko_user.id,
            email=hanko_user.email,
            app_user_id=new_user_id,
        )
        return new_user_id


async def create_user_mapping(
    hanko_user_id: str,
    app_user_id: str,
    db_conn,  # psycopg Connection or AsyncConnection
    app_name: str = "default",
) -> None:
    """Create a mapping entry explicitly."""
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
