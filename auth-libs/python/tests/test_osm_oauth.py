"""Tests for OSM OAuth client with mocked HTTP responses."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import httpx

from hotosm_auth.config import AuthConfig
from hotosm_auth.osm_oauth import OSMOAuthClient, make_osm_api_request
from hotosm_auth.models import OSMConnection
from hotosm_auth.exceptions import OSMOAuthError, OSMAPIError


def _make_config():
    """Create a config with OSM enabled."""
    return AuthConfig(
        hanko_api_url="https://test.hanko.io",
        cookie_secret="x" * 40,
        cookie_domain="test.local",
        osm_enabled=True,
        osm_client_id="test-client-id",
        osm_client_secret="test-client-secret",
        osm_redirect_uri="https://myapp.test/callback",
        osm_scopes=["read_prefs", "write_api"],
    )


class TestOSMOAuthClientInit:
    """Test client initialization."""

    def test_requires_osm_enabled(self):
        config = AuthConfig(
            hanko_api_url="https://test.hanko.io",
            cookie_secret="x" * 40,
            cookie_domain="test.local",
            # No OSM credentials
        )

        with pytest.raises(ValueError, match="OSM OAuth not enabled"):
            OSMOAuthClient(config)

    def test_builds_correct_urls(self):
        config = _make_config()
        client = OSMOAuthClient(config)

        assert "openstreetmap.org/oauth2/authorize" in client.authorize_url
        assert "openstreetmap.org/oauth2/token" in client.token_url


class TestGetAuthorizationUrl:
    """Test authorization URL generation."""

    def test_includes_required_params(self):
        config = _make_config()
        client = OSMOAuthClient(config)

        url = client.get_authorization_url(state="random123")

        assert "client_id=test-client-id" in url
        assert "state=random123" in url
        assert "response_type=code" in url
        assert "redirect_uri=" in url

    def test_uses_default_scopes(self):
        config = _make_config()
        client = OSMOAuthClient(config)

        url = client.get_authorization_url(state="abc")

        assert "read_prefs" in url
        assert "write_api" in url

    def test_allows_custom_scopes(self):
        config = _make_config()
        client = OSMOAuthClient(config)

        url = client.get_authorization_url(state="abc", scopes=["read_gpx"])

        assert "read_gpx" in url
        assert "write_api" not in url


class TestExchangeCode:
    """Test authorization code exchange."""

    @pytest.mark.asyncio
    async def test_exchanges_code_for_token(self):
        config = _make_config()
        client = OSMOAuthClient(config)

        token_response = {
            "access_token": "new-access-token",
            "refresh_token": "new-refresh-token",
            "expires_in": 3600,
            "scope": "read_prefs write_api",
        }

        user_response = {
            "user": {
                "id": 12345,
                "display_name": "TestMapper",
                "img": {"href": "https://osm.org/avatar.png"},
            }
        }

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client_class.return_value.__aenter__.return_value = mock_client

            # First call: token exchange
            token_resp = MagicMock()
            token_resp.json.return_value = token_response
            token_resp.raise_for_status = MagicMock()

            # Second call: user details
            user_resp = MagicMock()
            user_resp.json.return_value = user_response
            user_resp.raise_for_status = MagicMock()

            mock_client.post.return_value = token_resp
            mock_client.get.return_value = user_resp

            result = await client.exchange_code("auth-code-123")

        assert result.osm_user_id == 12345
        assert result.osm_username == "TestMapper"
        assert result.access_token == "new-access-token"
        assert result.refresh_token == "new-refresh-token"
        assert "read_prefs" in result.scopes

    @pytest.mark.asyncio
    async def test_raises_on_missing_access_token(self):
        config = _make_config()
        client = OSMOAuthClient(config)

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client_class.return_value.__aenter__.return_value = mock_client

            resp = MagicMock()
            resp.json.return_value = {"error": "invalid_grant"}
            resp.raise_for_status = MagicMock()
            mock_client.post.return_value = resp

            with pytest.raises(OSMOAuthError, match="No access_token"):
                await client.exchange_code("bad-code")

    @pytest.mark.asyncio
    async def test_raises_on_http_error(self):
        config = _make_config()
        client = OSMOAuthClient(config)

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client_class.return_value.__aenter__.return_value = mock_client

            error_response = MagicMock()
            error_response.status_code = 400
            error_response.text = "Bad Request"
            mock_client.post.side_effect = httpx.HTTPStatusError(
                "Bad Request", request=MagicMock(), response=error_response
            )

            with pytest.raises(OSMOAuthError, match="Token exchange failed"):
                await client.exchange_code("bad-code")


class TestRevokeToken:
    """Test token revocation."""

    @pytest.mark.asyncio
    async def test_revokes_token_successfully(self):
        config = _make_config()
        client = OSMOAuthClient(config)

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client_class.return_value.__aenter__.return_value = mock_client

            resp = MagicMock()
            resp.raise_for_status = MagicMock()
            mock_client.post.return_value = resp

            # Should not raise
            await client.revoke_token("some-token", "access_token")

    @pytest.mark.asyncio
    async def test_handles_already_revoked_token(self):
        config = _make_config()
        client = OSMOAuthClient(config)

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client_class.return_value.__aenter__.return_value = mock_client

            error_response = MagicMock()
            error_response.status_code = 403
            mock_client.post.side_effect = httpx.HTTPStatusError(
                "Forbidden", request=MagicMock(), response=error_response
            )

            # Should not raise - 403 means token already invalid
            await client.revoke_token("already-revoked", "access_token")


class TestGetUserDetails:
    """Test user profile fetching."""

    @pytest.mark.asyncio
    async def test_fetches_user_profile(self):
        config = _make_config()
        client = OSMOAuthClient(config)

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client_class.return_value.__aenter__.return_value = mock_client

            resp = MagicMock()
            resp.json.return_value = {
                "user": {
                    "id": 99999,
                    "display_name": "Mapper99",
                }
            }
            resp.raise_for_status = MagicMock()
            mock_client.get.return_value = resp

            profile = await client.get_user_profile("valid-token")

        assert profile["id"] == 99999
        assert profile["display_name"] == "Mapper99"

    @pytest.mark.asyncio
    async def test_raises_on_missing_user_data(self):
        config = _make_config()
        client = OSMOAuthClient(config)

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client_class.return_value.__aenter__.return_value = mock_client

            resp = MagicMock()
            resp.json.return_value = {"version": "0.6"}  # No user key
            resp.raise_for_status = MagicMock()
            mock_client.get.return_value = resp

            with pytest.raises(OSMAPIError, match="No user data"):
                await client.get_user_profile("token")


class TestMakeOSMApiRequest:
    """Test the utility function for OSM API requests."""

    @pytest.mark.asyncio
    async def test_makes_authenticated_request(self):
        osm_conn = OSMConnection(
            osm_user_id=123,
            osm_username="test",
            osm_avatar_url=None,
            access_token="my-token",
            scopes=["read_prefs"],
        )

        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client_class.return_value.__aenter__.return_value = mock_client

            resp = MagicMock()
            resp.json.return_value = {"data": "ok"}
            resp.raise_for_status = MagicMock()
            mock_client.request.return_value = resp

            result = await make_osm_api_request(
                osm_conn, "GET", "/api/0.6/user/details.json"
            )

        assert result == {"data": "ok"}

        # Check that auth header was passed
        call_kwargs = mock_client.request.call_args
        assert "Bearer my-token" in str(call_kwargs)
