"""FastAPI setup helpers and auth dependency aliases."""

from typing import Optional, Annotated
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from hotosm_auth.config import AuthConfig
from hotosm_auth.models import HankoUser, OSMConnection
from hotosm_auth.logger import get_logger
from hotosm_auth_fastapi.dependencies import (
    init_auth as _init_auth,
    get_current_user,
    get_current_user_optional,
    get_osm_connection,
)

logger = get_logger(__name__)


class _AuthDep:
    """Auth dependency wrapper exposing ``user`` and optional ``osm``."""

    def __init__(
        self,
        user: HankoUser = Depends(get_current_user),
        osm: Optional[OSMConnection] = Depends(get_osm_connection),
    ):
        self.user = user
        self.osm = osm

    def require_osm(self) -> OSMConnection:
        """Require OSM connection or raise 403."""
        if not self.osm:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="OSM connection required. Please connect your OSM account.",
            )
        return self.osm


# Type alias for main authentication dependency
Auth = Annotated[_AuthDep, Depends(_AuthDep)]


# Type alias for optional authentication
OptionalAuth = Annotated[Optional[HankoUser], Depends(get_current_user_optional)]


def setup_auth(
    app: FastAPI,
    config: Optional[AuthConfig] = None,
    auto_osm_routes: bool = True,
    cors_origins: Optional[list[str]] = None,
) -> None:
    """Initialize auth, CORS, and optional OSM routes for a FastAPI app."""
    # Load config from environment if not provided
    if config is None:
        config = AuthConfig.from_env()

    # Initialize auth system
    _init_auth(config)

    # Add CORS middleware for cookie support
    if cors_origins is None:
        cors_origins = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://localhost:4000",
            "http://localhost:5000",
            "http://localhost:8001",
        ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register OSM OAuth routes if enabled
    if auto_osm_routes and config.osm_enabled:
        from hotosm_auth_fastapi.osm_routes import router as osm_router
        app.include_router(osm_router)
        logger.info("OSM OAuth routes registered at /auth/osm/*")

    logger.info(f"HOTOSM Auth initialized (Hanko: {config.hanko_api_url})")
