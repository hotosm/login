"""Django integration for HOTOSM auth middleware and helpers."""

default_app_config = 'hotosm_auth_django.apps.HotosmAuthDjangoConfig'

# Middleware and authentication
from hotosm_auth_django.middleware import (
    HankoAuthMiddleware,
    login_required,
    osm_required,
    get_auth_config,
    get_jwt_validator,
    get_cookie_crypto,
    get_token_from_request,
    get_current_user,
    get_osm_connection,
    set_osm_cookie,
    clear_osm_cookie,
    get_mapped_user_id,
    get_auth_status,
    create_user_mapping,
)

# Import admin routes, OSM views, and models from their modules after app init.

__all__ = [
    # Middleware
    "HankoAuthMiddleware",
    "login_required",
    "osm_required",
    # Config
    "get_auth_config",
    "get_jwt_validator",
    "get_cookie_crypto",
    # Request helpers
    "get_token_from_request",
    "get_current_user",
    "get_osm_connection",
    # Cookie management
    "set_osm_cookie",
    "clear_osm_cookie",
    # User mapping
    "get_mapped_user_id",
    "get_auth_status",
    "create_user_mapping",
]
