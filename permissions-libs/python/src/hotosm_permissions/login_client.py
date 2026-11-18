"""Async client for the Login endpoints that tools need for permissions.

Endpoints used:

- `GET /api/groups`: the groups the current user belongs to (forwards the
  `hanko` cookie). Cached briefly per user.
- `GET /api/users/lookup?email=`: resolve an email to a Login account
  (forwards the `hanko` cookie). Not cached.
- `GET /api/public/groups`: paginated search of public teams and
  organizations (no cookie). Not cached.

Failures are never cached and raise `LoginUnavailable`, so callers can fail
closed. The caller decides whether Login is enabled at all; this client
always calls it.
"""

import asyncio
import time
from dataclasses import dataclass
from typing import Any

import httpx

from hotosm_permissions.context import GroupRole, GroupType

# A malformed payload is treated like an unreachable Login.
_PARSE_ERRORS = (KeyError, TypeError, ValueError)


class LoginUnavailable(Exception):  # noqa: N818
    """Login couldn't be reached or answered with an error. Never cached."""


@dataclass(frozen=True)
class LoginGroup:
    """A group the user belongs to, one item of Login's `GET /api/groups`.

    `status` is the group's approval status as Login returns it; it stays
    `None` when Login doesn't send it.
    """

    id: str
    type: GroupType
    slug: str
    name: str
    role: GroupRole
    status: str | None
    avatar_url: str | None = None


@dataclass(frozen=True)
class LoginUser:
    """A Login account found by email."""

    id: str
    name: str | None


@dataclass(frozen=True)
class PublicGroup:
    """A public team or organization, one item of `GET /api/public/groups`."""

    id: str
    type: GroupType
    slug: str
    name: str
    avatar_url: str | None


@dataclass(frozen=True)
class PublicGroupPage:
    """One page of `GET /api/public/groups`."""

    items: list[PublicGroup]
    total: int
    page: int
    page_size: int


def _parse_groups(payload: Any) -> list[LoginGroup]:
    return [
        LoginGroup(
            id=g["id"],
            type=g["type"],
            slug=g["slug"],
            name=g["name"],
            role=g["role"],
            status=g.get("status"),
            avatar_url=g.get("avatar_url"),
        )
        for g in payload["groups"]
    ]


def _parse_public_groups(payload: Any) -> PublicGroupPage:
    return PublicGroupPage(
        items=[
            PublicGroup(
                id=g["id"],
                type=g["type"],
                slug=g["slug"],
                name=g["name"],
                avatar_url=g.get("avatar_url"),
            )
            for g in payload["items"]
        ],
        total=payload["total"],
        page=payload["page"],
        page_size=payload["page_size"],
    )


class LoginClient:
    """Talks to Login. Build one per process and reuse it.

    Args:
        base_url: Login's base URL, e.g. `https://login.hotosm.org`.
        timeout: Seconds to wait for each request.
        groups_ttl: Seconds a user's groups stay cached.
    """

    def __init__(
        self, base_url: str, *, timeout: float = 5.0, groups_ttl: float = 60.0
    ) -> None:
        """Create a client for the Login at `base_url`."""
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout
        self._groups_ttl = groups_ttl
        # user_id -> (expires_at on the monotonic clock, groups)
        self._groups_cache: dict[str, tuple[float, list[LoginGroup]]] = {}
        # In-flight group lookups, so concurrent misses share one call.
        self._inflight: dict[str, asyncio.Task[list[LoginGroup]]] = {}

    async def get_user_groups(
        self,
        user_id: str,
        hanko_cookie: str | None,
        *,
        force_refresh: bool = False,
    ) -> list[LoginGroup]:
        """Return the user's groups, cached for `groups_ttl` seconds.

        Concurrent cold-cache callers for the same user share one request to
        Login; it is shielded so one caller being cancelled doesn't cancel it
        for the others. `force_refresh` skips both the cache and any in-flight
        request, since that one may have started before the change the caller
        wants to see.

        Returns an empty list (not cached) when Login rejects the session
        (401/403).

        Raises:
            LoginUnavailable: Login couldn't be reached, answered with another
                error, or sent a malformed payload. Not cached.
        """
        if not force_refresh:
            cached = self._groups_cache.get(user_id)
            if cached is not None:
                expires_at, groups = cached
                if time.monotonic() < expires_at:
                    return groups
                del self._groups_cache[user_id]

        task = None if force_refresh else self._inflight.get(user_id)
        if task is None:
            task = asyncio.create_task(self._fetch_user_groups(user_id, hanko_cookie))
            self._inflight[user_id] = task
            task.add_done_callback(lambda t: self._forget_inflight(user_id, t))
        return await asyncio.shield(task)

    def _forget_inflight(self, user_id: str, task: asyncio.Task[Any]) -> None:
        if self._inflight.get(user_id) is task:
            del self._inflight[user_id]
        if not task.cancelled():
            # Mark the exception as retrieved so asyncio doesn't log it.
            task.exception()

    async def _fetch_user_groups(
        self, user_id: str, hanko_cookie: str | None
    ) -> list[LoginGroup]:
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                response = await client.get(
                    f"{self._base_url}/api/groups",
                    cookies={"hanko": hanko_cookie} if hanko_cookie else {},
                    headers={"accept": "application/json"},
                )
                if response.status_code in (401, 403):
                    return []
                response.raise_for_status()
                groups = _parse_groups(response.json())
        except (httpx.RequestError, httpx.HTTPStatusError, *_PARSE_ERRORS) as exc:
            raise LoginUnavailable(str(exc)) from exc

        # Only cache if this fetch wasn't invalidated or superseded meanwhile.
        if self._inflight.get(user_id) is asyncio.current_task():
            self._groups_cache[user_id] = (
                time.monotonic() + self._groups_ttl,
                groups,
            )
        return groups

    def invalidate(self, user_id: str) -> None:
        """Drop the user's cached groups (call after a membership change).

        Also forgets any in-flight lookup for the user without cancelling it:
        its callers still get its result, but it won't be cached, so a fetch
        that started before the change can't store stale groups.
        """
        self._groups_cache.pop(user_id, None)
        self._inflight.pop(user_id, None)

    async def lookup_user_by_email(
        self, email: str, hanko_cookie: str | None
    ) -> LoginUser | None:
        """Resolve an email to a Login account via `GET /api/users/lookup`.

        Forwards the caller's `hanko` cookie. Returns None when Login reports
        no such account. Not cached.

        Raises:
            LoginUnavailable: Login couldn't be reached, answered with an error
                (including a rejected session), or sent a malformed payload.
        """
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                response = await client.get(
                    f"{self._base_url}/api/users/lookup",
                    params={"email": email},
                    cookies={"hanko": hanko_cookie} if hanko_cookie else {},
                    headers={"accept": "application/json"},
                )
                response.raise_for_status()
                data = response.json()
            if not data["exists"] or not data.get("hanko_user_id"):
                return None
            return LoginUser(id=data["hanko_user_id"], name=data.get("name") or None)
        except (httpx.RequestError, httpx.HTTPStatusError, *_PARSE_ERRORS) as exc:
            raise LoginUnavailable(str(exc)) from exc

    async def list_public_groups(
        self,
        *,
        type: GroupType | None = None,
        q: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PublicGroupPage:
        """Search public teams and organizations via `GET /api/public/groups`.

        Public endpoint, no cookie. Not cached.

        Raises:
            LoginUnavailable: Login couldn't be reached, answered with an
                error, or sent a malformed payload.
        """
        params: dict[str, str | int] = {"page": page, "page_size": page_size}
        if type is not None:
            params["type"] = type
        if q is not None:
            params["q"] = q
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                response = await client.get(
                    f"{self._base_url}/api/public/groups",
                    params=params,
                    headers={"accept": "application/json"},
                )
                response.raise_for_status()
                return _parse_public_groups(response.json())
        except (httpx.RequestError, httpx.HTTPStatusError, *_PARSE_ERRORS) as exc:
            raise LoginUnavailable(str(exc)) from exc
