"""Admin-managed CORS origins: cache, validation and CRUD.

The list used to be hardcoded in ``app.main``, so adding a site meant editing
Python and deploying. It now lives in the ``allowed_origins`` table and is read
through a short-lived in-process cache, so saving in the admin dashboard takes
effect on the next request.

Scope: this governs requests the browser makes to *this* backend. The Hanko API
is a separate service the browser talks to directly; its own CORS and redirect
allowlists live in ``hanko-config.yaml``.
"""

import logging
import re
import time

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import async_session_maker
from app.db.models import AllowedOrigin

logger = logging.getLogger(__name__)

# How long a loaded list is trusted before the next request refreshes it. Short
# enough that an admin sees their change almost immediately, long enough that a
# busy endpoint does not query on every request. Note each worker/pod keeps its
# own cache: a write invalidates the cache of the worker that served it, and the
# others catch up within this window.
CACHE_TTL_SECONDS = 30.0

# Origins that must keep working even when the database is unreachable, so a
# DB outage cannot also lock admins out of the dashboard that would fix it.
BOOTSTRAP_ORIGINS: frozenset[str] = frozenset(
    {
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    }
)

# Scheme + host + optional port, which is all a browser ever sends in Origin.
# No path, no trailing slash, no credentials, no wildcards: an origin with a
# wildcard would silently never match, since comparison is exact.
_ORIGIN_RE = re.compile(
    r"^https?://"
    r"(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)"
    r"(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*"
    r"(?::\d{1,5})?$"
)

_cache: frozenset[str] = frozenset()
_cache_loaded_at: float = 0.0


class InvalidOriginError(ValueError):
    """Raised when a string is not usable as a browser origin."""


def normalize_origin(raw: str) -> str:
    """Return a stored form of ``raw``, or raise InvalidOriginError.

    Browsers send the origin lowercased and without a trailing slash, and the
    comparison downstream is an exact string match, so anything else would be
    stored and never match.
    """
    origin = raw.strip().rstrip("/").lower()
    if not origin:
        raise InvalidOriginError("Origin must not be empty")
    if "*" in origin or "?" in origin:
        raise InvalidOriginError(
            "Wildcards are not supported here: origins are matched exactly"
        )
    if not _ORIGIN_RE.match(origin):
        raise InvalidOriginError(
            "Must be scheme://host with an optional port, and no path "
            "(e.g. https://portal.hotosm.org)"
        )
    return origin


async def load_origins(db: AsyncSession) -> frozenset[str]:
    """Read every enabled origin from the database."""
    result = await db.execute(
        select(AllowedOrigin.origin).where(AllowedOrigin.enabled.is_(True))
    )
    return frozenset(result.scalars().all())


async def refresh_if_stale(*, force: bool = False) -> frozenset[str]:
    """Reload the cache when it has expired, and return the current set.

    On a database error the previous set is kept rather than cleared: dropping
    every origin would turn a transient outage into every browser call failing
    CORS, which is both worse and much harder to read from the outside.
    """
    global _cache, _cache_loaded_at

    if not force and (time.monotonic() - _cache_loaded_at) < CACHE_TTL_SECONDS:
        return _cache

    try:
        async with async_session_maker() as db:
            _cache = await load_origins(db)
        _cache_loaded_at = time.monotonic()
    except Exception:
        logger.exception("Failed to reload CORS origins; keeping the previous set")
        # Back off for a full TTL so a down database is not hammered once per
        # request, and so the log does not fill with the same traceback.
        _cache_loaded_at = time.monotonic()

    return _cache


def is_allowed(origin: str) -> bool:
    """Whether ``origin`` is allowed, against the cache loaded so far."""
    return origin in _cache or origin in BOOTSTRAP_ORIGINS


def invalidate() -> None:
    """Force the next request to reload the cache (called after a write)."""
    global _cache_loaded_at
    _cache_loaded_at = 0.0


def cached_origins() -> frozenset[str]:
    """Return the cached set, for diagnostics and tests."""
    return _cache | BOOTSTRAP_ORIGINS
