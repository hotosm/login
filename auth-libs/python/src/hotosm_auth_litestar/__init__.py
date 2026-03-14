"""hotosm_auth_litestar: Litestar integration for HOTOSM authentication.

This package provides Litestar-specific functionality:
- Dependency injection for authentication
- Admin routes for managing user mappings (psycopg)
- OSM OAuth routes

Quick Start:
    from litestar import Litestar
    from hotosm_auth_litestar import setup_auth, AuthContext

    deps, route_handlers = setup_auth()
    app = Litestar(route_handlers=route_handlers, dependencies=deps)

    @get("/me")
    async def me(auth: AuthContext) -> dict:
        return {"user": auth.user.email}

For more control:
    from hotosm_auth_litestar import (
        init_auth,
        create_dependencies,
        get_current_user,
        get_current_user_optional,
    )
"""

# Core dependencies
# Admin functionality
from hotosm_auth_litestar.admin import AdminUser, require_admin
from hotosm_auth_litestar.admin_routes import (
    create_admin_mappings_router,
)
from hotosm_auth_litestar.dependencies import (
    AuthContext,
    OptionalAuthContext,
    clear_osm_cookie,
    create_dependencies,
    create_user_mapping,
    get_config,
    get_cookie_crypto,
    get_current_user,
    get_current_user_optional,
    get_jwt_validator,
    get_mapped_user_id,
    get_osm_connection,
    init_auth,
    provide_auth_context,
    provide_optional_auth_context,
    require_osm_connection,
    set_osm_cookie,
)

# OSM routes
from hotosm_auth_litestar.osm_routes import osm_router

# Simple setup API
from hotosm_auth_litestar.setup import setup_auth

# Type aliases matching FastAPI naming conventions
Auth = AuthContext
OptionalAuth = OptionalAuthContext

__all__ = [
    # Setup
    "setup_auth",
    "init_auth",
    "create_dependencies",
    # Auth contexts
    "AuthContext",
    "OptionalAuthContext",
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
    # Dependency providers
    "provide_auth_context",
    "provide_optional_auth_context",
    # Admin
    "require_admin",
    "AdminUser",
    "create_admin_mappings_router",
    # Routes
    "osm_router",
]
