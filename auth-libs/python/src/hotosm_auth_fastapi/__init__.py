"""FastAPI integration package for HOTOSM auth."""

# Core dependencies
# Admin functionality
from hotosm_auth_fastapi.admin import (
    AdminUser,
    require_admin,
)
from hotosm_auth_fastapi.admin_routes import create_admin_mappings_router
from hotosm_auth_fastapi.admin_routes_psycopg import (
    create_admin_mappings_router_psycopg,
)

# SQLAlchemy models
from hotosm_auth_fastapi.db_models import Base, HankoUserMapping
from hotosm_auth_fastapi.dependencies import (
    # Type aliases
    CurrentUser,
    CurrentUserOptional,
    OSMConnectionDep,
    OSMConnectionRequired,
    clear_osm_cookie,
    create_user_mapping,
    get_config,
    get_cookie_crypto,
    get_current_user,
    get_current_user_optional,
    get_jwt_validator,
    get_mapped_user_id,
    get_osm_connection,
    init_auth,
    require_osm_connection,
    set_osm_cookie,
)

# OSM routes
from hotosm_auth_fastapi.osm_routes import router as osm_router

# Simple setup API
from hotosm_auth_fastapi.setup import (
    Auth,
    OptionalAuth,
    setup_auth,
)

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
