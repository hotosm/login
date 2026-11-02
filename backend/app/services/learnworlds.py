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
from datetime import date
from typing import Any
from urllib.parse import quote

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# Refresh the token this many seconds before it actually expires, so a request
# that starts just before expiry does not fail mid-flight.
_TOKEN_EXPIRY_MARGIN = 60

_HTTP_BAD_REQUEST = 400
_HTTP_NOT_FOUND = 404

# The school's public pages define its sign-up questions in this JS variable.
_SIGNUP_FIELDS_MARKER = "var USER_CUSTOM_FIELDS="
# The questions change rarely; a failed read is retried sooner.
_SIGNUP_FIELDS_TTL = 3600
_SIGNUP_FIELDS_RETRY = 300
# Field types the linking screen knows how to ask.
_SIGNUP_FIELD_TYPES = ("dropdown", "text", "date")
_OLDEST_BIRTH_YEAR = 1900


class LearnWorldsError(Exception):
    """The LearnWorlds API rejected a request or answered unexpectedly."""


class SignupAnswersError(ValueError):
    """The answers to the sign-up questions do not fit their definitions."""


def _parse_signup_fields(html: str) -> list[dict[str, Any]]:
    """Pull the sign-up questions out of a school page.

    Only active fields shown on the sign-up form, of a type we can ask.
    """
    start = html.index(_SIGNUP_FIELDS_MARKER) + len(_SIGNUP_FIELDS_MARKER)
    raw, _ = json.JSONDecoder().raw_decode(html[start:])

    fields = []
    for field in raw:
        signup = next(
            (
                form.get("data") or {}
                for form in field.get("formData") or []
                if form.get("type") == "signup"
            ),
            None,
        )
        if (
            not field.get("active")
            or not signup
            or not signup.get("isVisible")
            or field.get("type") not in _SIGNUP_FIELD_TYPES
        ):
            continue
        fields.append(
            {
                "key": field["key"],
                "type": field["type"],
                "label": signup.get("label") or field.get("name") or field["key"],
                "required": bool(signup.get("required")),
                "placeholder": signup.get("placeholder") or "",
                "options": [
                    option["field_value"] for option in field.get("options") or []
                ],
                "max_length": int(field.get("maxLength") or 0) or None,
            }
        )
    return fields


def _clean_signup_value(field: dict[str, Any], value: str) -> str:
    """Check one non-empty answer against its question and normalise it."""
    if field["type"] == "dropdown" and value not in field["options"]:
        raise SignupAnswersError(f"{field['key']} is not one of the options")
    if field["type"] == "date":
        try:
            born = date.fromisoformat(value)
        except ValueError as exc:
            raise SignupAnswersError(f"{field['key']} is not a date") from exc
        if born.year < _OLDEST_BIRTH_YEAR or born > date.today():
            raise SignupAnswersError(f"{field['key']} is out of range")
        value = born.isoformat()
    if field["max_length"] and len(value) > field["max_length"]:
        raise SignupAnswersError(f"{field['key']} is too long")
    return value


def clean_signup_answers(
    fields: list[dict[str, Any]], answers: dict[str, str]
) -> dict[str, str]:
    """Check answers against the school's questions and return what to store.

    The API stores whatever it is sent, even an option the dropdown does not
    have, so this is the only place a bad value gets stopped.
    """
    unknown = set(answers) - {field["key"] for field in fields}
    if unknown:
        raise SignupAnswersError(f"Unknown fields: {', '.join(sorted(unknown))}")

    clean = {}
    for field in fields:
        value = (answers.get(field["key"]) or "").strip()
        if not value:
            if field["required"]:
                raise SignupAnswersError(f"{field['key']} is required")
            continue
        clean[field["key"]] = _clean_signup_value(field, value)
    return clean


class LearnWorldsClient:
    """Thin client over the handful of endpoints the SSO flow needs."""

    def __init__(
        self,
        school_url: str | None = None,
        client_id: str | None = None,
        client_secret: str | None = None,
        timeout: float = 10.0,
    ) -> None:
        """Build a client, defaulting to the school configured for this deploy."""
        self.school_url = (school_url or settings.learnworlds_school_url).rstrip("/")
        self.client_id = client_id or settings.learnworlds_client_id
        self.client_secret = client_secret or settings.learnworlds_client_secret
        self.timeout = timeout
        self._token: str | None = None
        self._token_expires_at: float = 0.0
        self._signup_fields: list[dict[str, Any]] = []
        self._signup_fields_expire_at: float = 0.0

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

        if response.status_code >= _HTTP_BAD_REQUEST or payload.get("success") is False:
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
            if response.status_code == _HTTP_NOT_FOUND:
                return None
            return self._payload(response)

    async def count_courses(self, user_id: str) -> int:
        """How many courses a user is enrolled in.

        Only used to reassure someone who just linked their account that their
        progress is still there, so "none" and "the school has no courses" both
        answer 0 rather than failing.
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.school_url}/admin/api/v2/users/{user_id}/courses",
                headers=await self._headers(client),
            )
            if response.status_code == _HTTP_NOT_FOUND:
                return 0
            payload = self._payload(response)
        return int((payload.get("meta") or {}).get("totalItems") or 0)

    async def signup_fields(self) -> list[dict[str, Any]]:
        """The questions the school asks on its own sign-up form.

        Accounts created through SSO skip that form, so the linking screen asks
        them instead. Read from the school's public pages, because the
        API has no endpoint for field definitions. An empty list means "ask
        nothing": a page we cannot read must not stop anyone from getting in.
        """
        if time.monotonic() < self._signup_fields_expire_at:
            return self._signup_fields

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # Every page carries them; the home page is the one sure to exist.
                response = await client.get(f"{self.school_url}/")
                response.raise_for_status()
            self._signup_fields = _parse_signup_fields(response.text)
            ttl = _SIGNUP_FIELDS_TTL
        except (httpx.HTTPError, ValueError, KeyError, TypeError):
            logger.exception("Could not read the LearnWorlds sign-up questions")
            self._signup_fields = []
            ttl = _SIGNUP_FIELDS_RETRY

        self._signup_fields_expire_at = time.monotonic() + ttl
        return self._signup_fields

    async def update_user_fields(self, user_id: str, fields: dict[str, str]) -> None:
        """Store profile fields (``cf_*`` keys) on a user.

        Unlike the SSO call, this endpoint takes a plain JSON body.
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.put(
                f"{self.school_url}/admin/api/v2/users/{user_id}",
                headers=await self._headers(client),
                json={"fields": fields},
            )
            self._payload(response)

    async def sso_login(
        self,
        *,
        user_id: str | None = None,
        email: str | None = None,
        username: str | None = None,
        first_name: str | None = None,
        last_name: str | None = None,
        avatar: str | None = None,
        redirect_url: str | None = None,
    ) -> tuple[str, str]:
        """Open a LearnWorlds session and return ``(login_url, user_id)``.

        Pass ``user_id`` for users we have already linked; it keeps the login
        working even if their email changed on either side.

        ``first_name`` and ``last_name`` only apply when LearnWorlds creates the
        account; ``username`` and ``avatar`` also refresh an existing one.

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
        data.update(
            {
                key: value
                for key, value in (
                    ("username", username),
                    ("first_name", first_name),
                    ("last_name", last_name),
                    ("avatar", avatar),
                    ("redirectUrl", redirect_url),
                )
                if value
            }
        )

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
