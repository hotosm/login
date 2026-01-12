"""
hotosm_auth_fastapi: FastAPI integration for HOTOSM authentication.

This package provides FastAPI-specific functionality:
- Dependency injection for authentication
- SQLAlchemy models for user mapping
- Admin routes for managing mappings
- OSM OAuth routes

Quick Start:
    from fastapi import FastAPI
    from hotosm_auth_fastapi import setup_auth, Auth

    app = FastAPI()
    setup_auth(app)  # Loads config from .env

    @app.get("/me")
    async def me(auth: Auth):
        return {"user": auth.user.email}

For more control:
    from hotosm_auth_fastapi import (
        init_auth,
        CurrentUser,
        CurrentUserOptional,
        OSMConnectionRequired,
    )
"""

# Core dependencies
from hotosm_auth_fastapi.dependencies import (
    init_auth,
    get_config,
    get_jwt_validator,
    get_cookie_crypto,
    get_current_user,
    get_current_user_optional,
    get_osm_connection,
    require_osm_connection,
    set_osm_cookie,
    clear_osm_cookie,
    get_mapped_user_id,
    create_user_mapping,
    # Type aliases
    CurrentUser,
    CurrentUserOptional,
    OSMConnectionDep,
    OSMConnectionRequired,
)

# Simple setup API
from hotosm_auth_fastapi.setup import (
    setup_auth,
    Auth,
    OptionalAuth,
)

# Admin functionality
from hotosm_auth_fastapi.admin import (
    require_admin,
    AdminUser,
)

from hotosm_auth_fastapi.admin_routes import create_admin_mappings_router
from hotosm_auth_fastapi.admin_routes_psycopg import create_admin_mappings_router_psycopg

# SQLAlchemy models
from hotosm_auth_fastapi.db_models import HankoUserMapping, Base

# OSM routes
from hotosm_auth_fastapi.osm_routes import router as osm_router

__all__ = [
    # Setup
    "setup_auth",
    "init_auth",
    "Auth",
    "OptionalAuth",
    # Dependencies
    "get_config",
    "get_jwt_validator",
    "get_cookie_crypto",
    "get_current_user",
    "get_current_user_optional",
    "get_osm_connection",
    "require_osm_connection",
    "set_osm_cookie",
    "clear_osm_cookie",
    "get_mapped_user_id",
    "create_user_mapping",
    # Type aliases
    "CurrentUser",
    "CurrentUserOptional",
    "OSMConnectionDep",
    "OSMConnectionRequired",
    # Admin
    "require_admin",
    "AdminUser",
    "create_admin_mappings_router",
    "create_admin_mappings_router_psycopg",
    # Models
    "HankoUserMapping",
    "Base",
    # Routes
    "osm_router",
]
