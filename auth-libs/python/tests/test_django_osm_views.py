"""Tests for Django OSM OAuth views with mocked HTTP."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# Django is configured in conftest.py
from django.test import RequestFactory

from hotosm_auth.config import AuthConfig
from hotosm_auth.models import HankoUser, OSMConnection
from hotosm_auth.crypto import CookieCrypto
from hotosm_auth.exceptions import OSMOAuthError
from hotosm_auth_django.osm_views import (
    osm_login,
    osm_callback,
    osm_status,
    osm_disconnect,
    _oauth_states,
)


def _make_config():
    return AuthConfig(
        hanko_api_url="https://test.hanko.io",
        cookie_secret="x" * 40,
        cookie_domain=".test.local",
        osm_enabled=True,
        osm_client_id="test-client-id",
        osm_client_secret="test-client-secret",
        osm_redirect_uri="https://myapp.test/callback",
        osm_scopes=["read_prefs"],
    )


def _make_config_osm_disabled():
    return AuthConfig(
        hanko_api_url="https://test.hanko.io",
        cookie_secret="x" * 40,
        cookie_domain=".test.local",
        osm_enabled=False,
    )


def _make_user():
    now = datetime.now(timezone.utc)
    return HankoUser(
        id="user-123",
        email="test@example.com",
        email_verified=True,
        created_at=now,
        updated_at=now,
    )


def _make_osm_connection():
    return OSMConnection(
        osm_user_id=12345,
        osm_username="mapper",
        osm_avatar_url="https://osm.org/avatar.png",
        access_token="access-token-123",
        refresh_token="refresh-token-456",
        scopes=["read_prefs"],
    )


class MockHotosmContext:
    """Mock request.hotosm namespace."""

    def __init__(self, user=None, osm=None):
        self.user = user
        self.osm = osm


@pytest.fixture
def rf():
    return RequestFactory()


@pytest.fixture(autouse=True)
def clear_oauth_states():
    """Clear OAuth states before each test."""
    _oauth_states.clear()
    yield
    _oauth_states.clear()


class TestOSMLogin:
    """Test Django OSM login view."""

    def test_redirects_to_osm_authorization(self, rf):
        request = rf.get("/auth/osm/login/")
        request.hotosm = MockHotosmContext(user=_make_user())

        with patch("hotosm_auth_django.osm_views.get_auth_config", return_value=_make_config()):
            response = osm_login(request)

        assert response.status_code == 302
        location = response.url
        assert "openstreetmap.org/oauth2/authorize" in location
        assert "client_id=test-client-id" in location

    def test_stores_oauth_state(self, rf):
        request = rf.get("/auth/osm/login/")
        request.hotosm = MockHotosmContext(user=_make_user())

        with patch("hotosm_auth_django.osm_views.get_auth_config", return_value=_make_config()):
            osm_login(request)

        assert len(_oauth_states) == 1
        state_data = list(_oauth_states.values())[0]
        assert state_data["user_id"] == "user-123"

    def test_returns_401_without_user(self, rf):
        request = rf.get("/auth/osm/login/")
        request.hotosm = MockHotosmContext(user=None)

        response = osm_login(request)

        assert response.status_code == 401

    def test_returns_400_when_osm_disabled(self, rf):
        request = rf.get("/auth/osm/login/")
        request.hotosm = MockHotosmContext(user=_make_user())

        with patch(
            "hotosm_auth_django.osm_views.get_auth_config",
            return_value=_make_config_osm_disabled(),
        ):
            response = osm_login(request)

        assert response.status_code == 400


class TestOSMCallback:
    """Test Django OSM callback view."""

    def test_exchanges_code_and_sets_cookie(self, rf):
        user = _make_user()
        request = rf.get("/auth/osm/callback/?code=auth-code&state=valid-state")
        request.hotosm = MockHotosmContext(user=user)

        # Pre-populate state
        _oauth_states["valid-state"] = {
            "user_id": user.id,
            "redirect_url": "/dashboard",
        }

        osm_conn = _make_osm_connection()
        config = _make_config()

        with patch("hotosm_auth_django.osm_views.get_auth_config", return_value=config):
            with patch("hotosm_auth_django.osm_views.OSMOAuthClient") as mock_client_class:
                mock_client = MagicMock()
                mock_client.exchange_code = AsyncMock(return_value=osm_conn)
                mock_client_class.return_value = mock_client

                with patch("hotosm_auth_django.osm_views.set_osm_cookie"):
                    response = osm_callback(request)

        assert response.status_code == 302
        assert response.url == "/dashboard"

    def test_returns_400_for_missing_params(self, rf):
        request = rf.get("/auth/osm/callback/")  # No code or state
        request.hotosm = MockHotosmContext(user=_make_user())

        response = osm_callback(request)

        assert response.status_code == 400

    def test_returns_400_for_invalid_state(self, rf):
        request = rf.get("/auth/osm/callback/?code=auth-code&state=invalid-state")
        request.hotosm = MockHotosmContext(user=_make_user())

        with patch("hotosm_auth_django.osm_views.get_auth_config", return_value=_make_config()):
            response = osm_callback(request)

        assert response.status_code == 400

    def test_returns_400_for_mismatched_user(self, rf):
        request = rf.get("/auth/osm/callback/?code=auth-code&state=valid-state")
        request.hotosm = MockHotosmContext(user=_make_user())

        # State belongs to different user
        _oauth_states["valid-state"] = {
            "user_id": "different-user",
            "redirect_url": "/",
        }

        with patch("hotosm_auth_django.osm_views.get_auth_config", return_value=_make_config()):
            response = osm_callback(request)

        assert response.status_code == 400

    def test_returns_400_on_oauth_error(self, rf):
        user = _make_user()
        request = rf.get("/auth/osm/callback/?code=bad-code&state=valid-state")
        request.hotosm = MockHotosmContext(user=user)

        _oauth_states["valid-state"] = {
            "user_id": user.id,
            "redirect_url": "/",
        }

        with patch("hotosm_auth_django.osm_views.get_auth_config", return_value=_make_config()):
            with patch("hotosm_auth_django.osm_views.OSMOAuthClient") as mock_client_class:
                mock_client = MagicMock()
                mock_client.exchange_code = AsyncMock(
                    side_effect=OSMOAuthError("Token exchange failed")
                )
                mock_client_class.return_value = mock_client

                response = osm_callback(request)

        assert response.status_code == 400


class TestOSMStatus:
    """Test Django OSM status view."""

    def test_returns_connected_true_with_connection(self, rf):
        import json
        request = rf.get("/auth/osm/status/")
        osm = _make_osm_connection()

        # Mock the get_osm_connection function to return our OSM connection
        with patch("hotosm_auth_django.osm_views.get_osm_connection", return_value=osm):
            response = osm_status(request)

        assert response.status_code == 200
        data = json.loads(response.content)
        assert data["connected"] is True
        assert data["osm_user_id"] == 12345
        assert data["osm_username"] == "mapper"

    def test_returns_connected_false_without_connection(self, rf):
        import json
        request = rf.get("/auth/osm/status/")

        with patch("hotosm_auth_django.osm_views.get_osm_connection", return_value=None):
            response = osm_status(request)

        assert response.status_code == 200
        data = json.loads(response.content)
        assert data["connected"] is False


class TestOSMDisconnect:
    """Test Django OSM disconnect view."""

    def test_revokes_tokens_and_clears_cookie(self, rf):
        import json
        request = rf.post("/auth/osm/disconnect/")
        osm = _make_osm_connection()
        config = _make_config()

        with patch("hotosm_auth_django.osm_views.get_auth_config", return_value=config):
            with patch("hotosm_auth_django.osm_views.get_osm_connection", return_value=osm):
                with patch("hotosm_auth_django.osm_views.OSMOAuthClient") as mock_client_class:
                    mock_client = MagicMock()
                    mock_client.revoke_token = AsyncMock()
                    mock_client_class.return_value = mock_client

                    with patch("hotosm_auth_django.osm_views.clear_osm_cookie"):
                        response = osm_disconnect(request)

        assert response.status_code == 200
        data = json.loads(response.content)
        assert data["status"] == "disconnected"
        assert data["tokens_revoked"] is True

    def test_clears_cookie_even_without_connection(self, rf):
        import json
        request = rf.post("/auth/osm/disconnect/")
        config = _make_config()

        with patch("hotosm_auth_django.osm_views.get_auth_config", return_value=config):
            with patch("hotosm_auth_django.osm_views.get_osm_connection", return_value=None):
                with patch("hotosm_auth_django.osm_views.clear_osm_cookie"):
                    response = osm_disconnect(request)

        assert response.status_code == 200
        data = json.loads(response.content)
        assert data["status"] == "disconnected"
        assert data["tokens_revoked"] is False
