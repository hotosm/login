"""Client for the LearnWorlds admin API.

Used by the Custom SSO endpoint to log HOT users into the LMS without them
having a LearnWorlds password.

Two things about this API are easy to get wrong:

- The body is form-urlencoded with the whole JSON payload inside a single
  ``data`` field. Sending plain JSON fails with a confusing "Invalid object ID".
- The SSO method lives at ``/admin/api/sso``, outside the ``/admin/api/v2``
  prefix the rest of the endpoints use.

Docs: https://www.learnworlds.dev/docs/api/58052c1c3066e-single-sign-on
"""

import json
import logging
import time
from typing import Any
from urllib.parse import quote

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# Refresh the token this many seconds before it actually expires, so a request
# that starts just before expiry does not fail mid-flight.
_TOKEN_EXPIRY_MARGIN = 60


class LearnWorldsError(Exception):
    """The LearnWorlds API rejected a request or answered unexpectedly."""


class LearnWorldsClient:
    """Thin client over the handful of endpoints the SSO flow needs."""

    def __init__(
        self,
        school_url: str | None = None,
        client_id: str | None = None,
        client_secret: str | None = None,
        timeout: float = 10.0,
    ) -> None:
        self.school_url = (school_url or settings.learnworlds_school_url).rstrip("/")
        self.client_id = client_id or settings.learnworlds_client_id
        self.client_secret = client_secret or settings.learnworlds_client_secret
        self.timeout = timeout
        self._token: str | None = None
        self._token_expires_at: float = 0.0

    @property
    def is_configured(self) -> bool:
        """Whether credentials are present. Lets the route 503 instead of 500."""
        return bool(self.school_url and self.client_id and self.client_secret)

    # -- auth ---------------------------------------------------------------

    async def _get_token(self, client: httpx.AsyncClient) -> str:
        """Return a cached application token, requesting a new one if needed."""
        if self._token and time.monotonic() < self._token_expires_at:
            return self._token

        response = await client.post(
            f"{self.school_url}/admin/api/oauth2/access_token",
            headers={"Lw-Client": self.client_id},
            data={
                "data": json.dumps(
                    {
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                        "grant_type": "client_credentials",
                    }
                )
            },
        )
        payload = self._payload(response)
        token_data = payload.get("tokenData") or {}
        token = token_data.get("access_token")
        if not token:
            raise LearnWorldsError("No access_token in the LearnWorlds response")

        expires_in = int(token_data.get("expires_in") or 0)
        self._token = token
        self._token_expires_at = time.monotonic() + max(
            expires_in - _TOKEN_EXPIRY_MARGIN, 0
        )
        return token

    async def _headers(self, client: httpx.AsyncClient) -> dict[str, str]:
        return {
            "Lw-Client": self.client_id,
            "Authorization": f"Bearer {await self._get_token(client)}",
        }

    @staticmethod
    def _payload(response: httpx.Response) -> dict[str, Any]:
        """Parse a response body, raising on transport or API-level errors.

        LearnWorlds can answer 200 with ``success: false``, so the status code
        alone is not enough.
        """
        try:
            payload = response.json()
        except ValueError as exc:
            raise LearnWorldsError(
                f"Non-JSON response from LearnWorlds (HTTP {response.status_code})"
            ) from exc

        if response.status_code >= 400 or payload.get("success") is False:
            errors = payload.get("errors") or payload.get("error") or payload
            raise LearnWorldsError(
                f"LearnWorlds error (HTTP {response.status_code}): {errors}"
            )
        return payload

    # -- endpoints ----------------------------------------------------------

    async def get_user_by_email(self, email: str) -> dict[str, Any] | None:
        """Look up a user by email. Returns None if the school has no such user.

        Read-only: unlike the SSO call, this never creates an account, which is
        what makes it safe to use while resolving a user's identity.
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.school_url}/admin/api/v2/users/{quote(email, safe='')}",
                headers=await self._headers(client),
            )
            if response.status_code == 404:
                return None
            return self._payload(response)

    async def sso_login(
        self,
        *,
        user_id: str | None = None,
        email: str | None = None,
        username: str | None = None,
        redirect_url: str | None = None,
    ) -> tuple[str, str]:
        """Open a LearnWorlds session and return ``(login_url, user_id)``.

        Pass ``user_id`` for users we have already linked; it keeps the login
        working even if their email changed on either side.

        WARNING: when called with an ``email`` the school does not know,
        LearnWorlds creates the account. Resolve the user's identity before
        calling this.
        """
        if not user_id and not email:
            raise ValueError("sso_login needs either user_id or email")

        data: dict[str, Any] = {}
        if user_id:
            data["user_id"] = user_id
        else:
            data["email"] = email
        if username:
            data["username"] = username
        if redirect_url:
            data["redirectUrl"] = redirect_url

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.school_url}/admin/api/sso",
                headers=await self._headers(client),
                data={"data": json.dumps(data)},
            )
            payload = self._payload(response)

        login_url = payload.get("url")
        returned_id = payload.get("user_id")
        if not login_url or not returned_id:
            raise LearnWorldsError(f"Unexpected SSO response: {payload}")
        return login_url, returned_id


# Module-level instance; credentials are read from settings at import time.
learnworlds_client = LearnWorldsClient()
