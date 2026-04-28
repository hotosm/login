"""Built-in PAT resolver for consumer projects.

Calls the login backend's POST /internal/resolve-token endpoint
to resolve an opaque token hash into a HankoUser.

Framework-agnostic: works with both FastAPI and Django integrations.
"""

from collections.abc import Awaitable, Callable
from datetime import datetime, timezone
from typing import Optional

import httpx

from hotosm_auth.models import HankoUser


def remote_pat_resolver(
    login_url: str,
    internal_key: str,
) -> Callable[[str, str], Awaitable[Optional[HankoUser]]]:
    """Create a PAT resolver that calls the login backend.

    Usage (FastAPI)::

        from hotosm_auth.remote_resolver import remote_pat_resolver
        from hotosm_auth_fastapi import init_auth

        init_auth(
            auth_config,
            app_name="fair",
            pat_resolver=remote_pat_resolver(
                login_url="https://login.hotosm.org",
                internal_key=os.environ["LOGIN_INTERNAL_API_KEY"],
            ),
        )

    Usage (Django)::

        from hotosm_auth.remote_resolver import remote_pat_resolver
        from hotosm_auth_django import init_auth_django

        init_auth_django(
            app_name="fair",
            pat_resolver=remote_pat_resolver(
                login_url="https://login.hotosm.org",
                internal_key=os.environ["LOGIN_INTERNAL_API_KEY"],
            ),
        )
    """
    url = f"{login_url.rstrip('/')}/internal/resolve-token"
    _epoch = datetime(2000, 1, 1, tzinfo=timezone.utc)

    async def resolver(token_hash: str, app_name: str) -> Optional[HankoUser]:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                url,
                json={"token_hash": token_hash, "app": app_name},
                headers={"X-Internal-Key": internal_key},
            )
        if resp.status_code != 200:
            return None
        data = resp.json()
        return HankoUser(
            id=data["id"],
            email=data.get("email") or "",
            email_verified=True,
            created_at=_epoch,
            updated_at=_epoch,
        )

    return resolver
