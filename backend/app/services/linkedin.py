"""Minimal LinkedIn OpenID Connect client.

Not a way to sign in to HOT: the LearnWorlds linking screen uses it only to
learn which address someone's LinkedIn account has, because people who joined
the school with LinkedIn often do not remember it. Nothing from LinkedIn is
stored; the address is looked up in the school and then forgotten.

Docs: https://learn.microsoft.com/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2
"""

from urllib.parse import urlencode

import httpx

from app.core.config import settings

AUTHORIZE_URL = "https://www.linkedin.com/oauth/v2/authorization"
TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"  # noqa: S105
USERINFO_URL = "https://api.linkedin.com/v2/userinfo"

# "email" is what we came for; "openid" is required for the userinfo endpoint.
SCOPES = "openid email"


class LinkedInError(Exception):
    """LinkedIn refused the code or answered unexpectedly."""


class LinkedInClient:
    """The two calls of the authorization code flow, and nothing else."""

    def __init__(
        self,
        client_id: str | None = None,
        client_secret: str | None = None,
        timeout: float = 10.0,
    ) -> None:
        """Build a client, defaulting to the app configured for this deploy."""
        self.client_id = client_id or settings.linkedin_client_id
        self.client_secret = client_secret or settings.linkedin_client_secret
        self.timeout = timeout

    @property
    def is_configured(self) -> bool:
        """Whether the linking screen should offer the LinkedIn button."""
        return bool(self.client_id and self.client_secret)

    def authorize_url(self, redirect_uri: str, state: str) -> str:
        """Where to send the browser to ask LinkedIn for the address."""
        return f"{AUTHORIZE_URL}?" + urlencode(
            {
                "response_type": "code",
                "client_id": self.client_id,
                "redirect_uri": redirect_uri,
                "state": state,
                "scope": SCOPES,
            }
        )

    async def verified_email(self, code: str, redirect_uri: str) -> str | None:
        """Trade the code for the account's address.

        Returns None when LinkedIn does not vouch for the address: an
        unverified one proves nothing about who owns the courses behind it.
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            token_response = await client.post(
                TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                },
            )
            if token_response.is_error:
                raise LinkedInError(
                    f"Token exchange failed (HTTP {token_response.status_code})"
                )
            token = token_response.json().get("access_token")
            if not token:
                raise LinkedInError("No access_token in the LinkedIn response")

            info_response = await client.get(
                USERINFO_URL, headers={"Authorization": f"Bearer {token}"}
            )
            if info_response.is_error:
                raise LinkedInError(
                    f"Userinfo failed (HTTP {info_response.status_code})"
                )
            info = info_response.json()

        email = (info.get("email") or "").strip().lower()
        if not email or info.get("email_verified") is not True:
            return None
        return email


# Module-level instance; credentials are read from settings at import time.
linkedin_client = LinkedInClient()
