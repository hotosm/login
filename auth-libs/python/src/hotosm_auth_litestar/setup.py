"""Simplified setup API for Litestar authentication.

Usage:
    from litestar import Litestar
    from hotosm_auth_litestar import setup_auth

    deps, route_handlers = setup_auth()
    app = Litestar(route_handlers=route_handlers, dependencies=deps)

Or with custom config:
    from hotosm_auth import AuthConfig

    config = AuthConfig(hanko_api_url="...", cookie_secret="...", osm_enabled=True)
    deps, route_handlers = setup_auth(config=config)
    app = Litestar(route_handlers=route_handlers, dependencies=deps)
"""

from litestar import Router
from litestar.di import Provide

from hotosm_auth.config import AuthConfig
from hotosm_auth.logger import get_logger
from hotosm_auth_litestar.dependencies import create_dependencies, init_auth
from hotosm_auth_litestar.osm_routes import osm_router

logger = get_logger(__name__)


def setup_auth(
    config: AuthConfig | None = None,
    auto_osm_routes: bool = True,
) -> tuple[dict[str, Provide], list[Router]]:
    """Setup HOTOSM authentication for a Litestar app.

    Initializes auth and returns (dependencies, route_handlers) to pass
    directly to ``Litestar()``.

    Litestar freezes dependencies at init time, so this function returns
    the values rather than mutating an existing app instance.

    Args:
        config: Optional AuthConfig. If None, loads from environment variables.
        auto_osm_routes: If True, include OSM OAuth routes. Default: True.

    Returns:
        Tuple of (dependencies dict, list of Router instances) to unpack
        into the ``Litestar()`` constructor.

    Example::

        deps, route_handlers = setup_auth()
        app = Litestar(route_handlers=route_handlers, dependencies=deps)
    """
    if config is None:
        config = AuthConfig.from_env()

    init_auth(config)
    deps = create_dependencies()

    route_handlers: list[Router] = []
    if auto_osm_routes and config.osm_enabled:
        route_handlers.append(osm_router)
        logger.info("OSM OAuth routes included at /auth/osm/*")

    logger.info(f"HOTOSM Auth initialized (Hanko: {config.hanko_api_url})")
    return deps, route_handlers
