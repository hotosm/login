"""Tests for Litestar dependencies with mocked requests."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

litestar = pytest.importorskip("litestar")

from hotosm_auth.config import AuthConfig
from hotosm_auth.crypto import CookieCrypto
from hotosm_auth.exceptions import TokenExpiredError, TokenInvalidError
from hotosm_auth.models import HankoUser, OSMConnection
from hotosm_auth_litestar.dependencies import (
    clear_osm_cookie,
    get_config,
    get_cookie_crypto,
    get_current_user,
    get_current_user_optional,
    get_jwt_validator,
    get_osm_connection,
    init_auth,
    require_osm_connection,
    set_osm_cookie,
)


def _make_config() -> AuthConfig:
    return AuthConfig(
        hanko_api_url="https://test.hanko.io",
        cookie_secret="x" * 40,
        cookie_domain=".test.local",
        cookie_secure=True,
        cookie_samesite="lax",
    )


def _make_user() -> HankoUser:
    now = datetime.now(timezone.utc)
    return HankoUser(
        id="user-123",
        email="test@example.com",
        email_verified=True,
        created_at=now,
        updated_at=now,
    )


def _make_osm_connection() -> OSMConnection:
    return OSMConnection(
        osm_user_id=12345,
        osm_username="mapper",
        osm_avatar_url=None,
        access_token="token",
        scopes=["read_prefs"],
    )


class TestInitAuth:
    """Test auth initialization."""

    def test_init_sets_globals(self):
        config = _make_config()
        init_auth(config)

        assert get_config() == config
        assert get_jwt_validator() is not None
        assert get_cookie_crypto() is not None


class TestGetCurrentUser:
    """Test required user auth dependency."""

    @pytest.mark.asyncio
    async def test_returns_user_from_valid_token(self):
        init_auth(_make_config())
        validator = get_jwt_validator()
        user = _make_user()

        request = MagicMock()
        request.headers = {}
        request.cookies = {"hanko": "valid-jwt-token"}

        with patch.object(
            validator, "validate_token", new_callable=AsyncMock
        ) as mock_validate:
            mock_validate.return_value = user
            result = await get_current_user(request)

        assert result.id == "user-123"

    @pytest.mark.asyncio
    async def test_raises_401_when_no_token(self):
        init_auth(_make_config())

        request = MagicMock()
        request.headers = {}
        request.cookies = {}

        with pytest.raises(Exception) as exc_info:
            await get_current_user(request)

        assert getattr(exc_info.value, "status_code", None) == 401

    @pytest.mark.asyncio
    async def test_raises_401_on_expired_token(self):
        init_auth(_make_config())
        validator = get_jwt_validator()

        request = MagicMock()
        request.headers = {}
        request.cookies = {"hanko": "expired-token"}

        with patch.object(
            validator, "validate_token", new_callable=AsyncMock
        ) as mock_validate:
            mock_validate.side_effect = TokenExpiredError("Token expired")
            with pytest.raises(Exception) as exc_info:
                await get_current_user(request)

        assert getattr(exc_info.value, "status_code", None) == 401

    @pytest.mark.asyncio
    async def test_raises_401_on_invalid_token(self):
        init_auth(_make_config())
        validator = get_jwt_validator()

        request = MagicMock()
        request.headers = {}
        request.cookies = {"hanko": "bad-token"}

        with patch.object(
            validator, "validate_token", new_callable=AsyncMock
        ) as mock_validate:
            mock_validate.side_effect = TokenInvalidError("Invalid signature")
            with pytest.raises(Exception) as exc_info:
                await get_current_user(request)

        assert getattr(exc_info.value, "status_code", None) == 401


class TestGetCurrentUserOptional:
    """Test optional user authentication."""

    @pytest.mark.asyncio
    async def test_returns_user_when_valid(self):
        init_auth(_make_config())
        validator = get_jwt_validator()
        user = _make_user()

        request = MagicMock()
        request.headers = {}
        request.cookies = {"hanko": "valid-token"}

        with patch.object(
            validator, "validate_token", new_callable=AsyncMock
        ) as mock_validate:
            mock_validate.return_value = user
            result = await get_current_user_optional(request)

        assert result is not None
        assert result.id == "user-123"

    @pytest.mark.asyncio
    async def test_returns_none_when_no_token(self):
        init_auth(_make_config())

        request = MagicMock()
        request.headers = {}
        request.cookies = {}

        result = await get_current_user_optional(request)

        assert result is None

    @pytest.mark.asyncio
    async def test_returns_none_on_invalid_token(self):
        init_auth(_make_config())
        validator = get_jwt_validator()

        request = MagicMock()
        request.headers = {}
        request.cookies = {"hanko": "bad-token"}

        with patch.object(
            validator, "validate_token", new_callable=AsyncMock
        ) as mock_validate:
            mock_validate.side_effect = TokenInvalidError("Bad token")
            result = await get_current_user_optional(request)

        assert result is None


class TestOSMConnectionHelpers:
    """Test OSM cookie helper dependencies."""

    def test_get_osm_connection_returns_connection_from_valid_cookie(self):
        config = _make_config()
        init_auth(config)
        crypto = get_cookie_crypto()

        osm = _make_osm_connection()
        encrypted = crypto.encrypt_osm_connection(osm)

        request = MagicMock()
        request.cookies = {"osm_connection": encrypted}

        result = get_osm_connection(request)

        assert result is not None
        assert result.osm_user_id == 12345

    def test_get_osm_connection_returns_none_when_missing(self):
        init_auth(_make_config())

        request = MagicMock()
        request.cookies = {}

        assert get_osm_connection(request) is None

    def test_require_osm_connection_raises_403_when_missing(self):
        with pytest.raises(Exception) as exc_info:
            require_osm_connection(None)

        assert getattr(exc_info.value, "status_code", None) == 403


class TestCookieHelpers:
    """Test cookie set/clear helpers."""

    def test_sets_cookie_with_correct_attributes(self):
        config = _make_config()
        crypto = CookieCrypto(config.cookie_secret)
        osm = _make_osm_connection()

        response = MagicMock()
        set_osm_cookie(response, osm, config, crypto)

        response.set_cookie.assert_called_once()
        call_kwargs = response.set_cookie.call_args.kwargs
        assert call_kwargs["key"] == "osm_connection"
        assert call_kwargs["httponly"] is True
        assert call_kwargs["secure"] is True
        assert call_kwargs["samesite"] == "lax"

    def test_clears_cookie_with_multiple_combinations(self):
        config = _make_config()
        response = MagicMock()

        clear_osm_cookie(response, config)

        assert response.set_cookie.call_count > 1
        for call in response.set_cookie.call_args_list:
            assert call.kwargs["max_age"] == 0
