"""Tests for FastAPI OSM OAuth routes with mocked HTTP."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# Skip if FastAPI not installed
fastapi = pytest.importorskip("fastapi")

from fastapi import FastAPI
from fastapi.testclient import TestClient

from hotosm_auth.config import AuthConfig
from hotosm_auth.models import HankoUser, OSMConnection
from hotosm_auth.exceptions import OSMOAuthError
from hotosm_auth_fastapi.osm_routes import router, _oauth_states
from hotosm_auth_fastapi.dependencies import (
    init_auth,
    get_current_user,
    get_config,
    get_osm_connection,
    get_cookie_crypto,
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


@pytest.fixture
def config():
    cfg = _make_config()
    init_auth(cfg)
    return cfg


@pytest.fixture
def app_with_osm_routes(config):
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_config] = lambda: config
    return app


@pytest.fixture(autouse=True)
def clear_oauth_states():
    """Clear OAuth states before each test."""
    _oauth_states.clear()
    yield
    _oauth_states.clear()


class TestOSMLogin:
    """Test OSM login endpoint."""

    def test_redirects_to_osm_authorization(self, app_with_osm_routes):
        app = app_with_osm_routes
        app.dependency_overrides[get_current_user] = lambda: _make_user()

        client = TestClient(app, follow_redirects=False)
        response = client.get("/auth/osm/login")

        assert response.status_code == 307
        location = response.headers["location"]
        assert "openstreetmap.org/oauth2/authorize" in location
        assert "client_id=test-client-id" in location
        assert "state=" in location

    def test_stores_oauth_state(self, app_with_osm_routes):
        app = app_with_osm_routes
        app.dependency_overrides[get_current_user] = lambda: _make_user()

        client = TestClient(app, follow_redirects=False)
        client.get("/auth/osm/login")

        # Should have stored one state
        assert len(_oauth_states) == 1
        state_data = list(_oauth_states.values())[0]
        assert state_data["user_id"] == "user-123"

    def test_returns_400_when_osm_disabled(self):
        config = _make_config_osm_disabled()
        init_auth(config)

        app = FastAPI()
        app.include_router(router)
        app.dependency_overrides[get_config] = lambda: config
        app.dependency_overrides[get_current_user] = lambda: _make_user()

        client = TestClient(app)
        response = client.get("/auth/osm/login")

        assert response.status_code == 400
        assert "not enabled" in response.json()["detail"]


class TestOSMCallback:
    """Test OSM callback endpoint."""

    def test_exchanges_code_and_redirects(self, app_with_osm_routes, config):
        app = app_with_osm_routes
        user = _make_user()
        app.dependency_overrides[get_current_user] = lambda: user

        # Pre-populate state
        _oauth_states["valid-state"] = {
            "user_id": user.id,
            "redirect_url": "/dashboard",
        }

        osm_conn = _make_osm_connection()

        with patch(
            "hotosm_auth_fastapi.osm_routes.OSMOAuthClient"
        ) as mock_client_class:
            mock_client = MagicMock()
            mock_client.exchange_code = AsyncMock(return_value=osm_conn)
            mock_client_class.return_value = mock_client

            with patch("hotosm_auth_fastapi.osm_routes.get_cookie_crypto") as mock_crypto:
                from hotosm_auth.crypto import CookieCrypto
                mock_crypto.return_value = CookieCrypto(config.cookie_secret)

                client = TestClient(app, follow_redirects=False)
                response = client.get("/auth/osm/callback?code=auth-code&state=valid-state")

        # Verify redirect to stored URL
        assert response.status_code == 303
        assert response.headers["location"] == "/dashboard"
        # Verify exchange_code was called
        mock_client.exchange_code.assert_called_once_with("auth-code")

    def test_returns_400_for_invalid_state(self, app_with_osm_routes):
        app = app_with_osm_routes
        app.dependency_overrides[get_current_user] = lambda: _make_user()

        client = TestClient(app)
        response = client.get("/auth/osm/callback?code=auth-code&state=invalid-state")

        assert response.status_code == 400
        assert "Invalid OAuth state" in response.json()["detail"]

    def test_returns_400_for_mismatched_user(self, app_with_osm_routes):
        app = app_with_osm_routes
        app.dependency_overrides[get_current_user] = lambda: _make_user()

        # State belongs to different user
        _oauth_states["valid-state"] = {
            "user_id": "different-user",
            "redirect_url": "/",
        }

        client = TestClient(app)
        response = client.get("/auth/osm/callback?code=auth-code&state=valid-state")

        assert response.status_code == 400
        assert "Invalid OAuth state" in response.json()["detail"]

    def test_returns_400_on_oauth_error(self, app_with_osm_routes):
        app = app_with_osm_routes
        user = _make_user()
        app.dependency_overrides[get_current_user] = lambda: user

        _oauth_states["valid-state"] = {
            "user_id": user.id,
            "redirect_url": "/",
        }

        with patch(
            "hotosm_auth_fastapi.osm_routes.OSMOAuthClient"
        ) as mock_client_class:
            mock_client = MagicMock()
            mock_client.exchange_code = AsyncMock(
                side_effect=OSMOAuthError("Token exchange failed")
            )
            mock_client_class.return_value = mock_client

            client = TestClient(app)
            response = client.get("/auth/osm/callback?code=bad-code&state=valid-state")

        assert response.status_code == 400
        assert "OSM OAuth failed" in response.json()["detail"]

    def test_returns_400_when_osm_disabled(self):
        config = _make_config_osm_disabled()
        init_auth(config)

        app = FastAPI()
        app.include_router(router)
        app.dependency_overrides[get_config] = lambda: config
        app.dependency_overrides[get_current_user] = lambda: _make_user()

        client = TestClient(app)
        response = client.get("/auth/osm/callback?code=code&state=state")

        assert response.status_code == 400
        assert "not enabled" in response.json()["detail"]


class TestOSMStatus:
    """Test OSM status endpoint."""

    def test_returns_connected_true_with_connection(self, app_with_osm_routes):
        app = app_with_osm_routes
        osm = _make_osm_connection()
        app.dependency_overrides[get_osm_connection] = lambda: osm

        client = TestClient(app)
        response = client.get("/auth/osm/status")

        assert response.status_code == 200
        data = response.json()
        assert data["connected"] is True
        assert data["osm_user_id"] == 12345
        assert data["osm_username"] == "mapper"

    def test_returns_connected_false_without_connection(self, app_with_osm_routes):
        app = app_with_osm_routes
        app.dependency_overrides[get_osm_connection] = lambda: None

        client = TestClient(app)
        response = client.get("/auth/osm/status")

        assert response.status_code == 200
        data = response.json()
        assert data["connected"] is False


class TestOSMDisconnect:
    """Test OSM disconnect endpoint."""

    def test_revokes_tokens_and_clears_cookie(self, app_with_osm_routes, config):
        app = app_with_osm_routes
        osm = _make_osm_connection()
        app.dependency_overrides[get_osm_connection] = lambda: osm

        with patch(
            "hotosm_auth_fastapi.osm_routes.OSMOAuthClient"
        ) as mock_client_class:
            mock_client = MagicMock()
            mock_client.revoke_token = AsyncMock()
            mock_client_class.return_value = mock_client

            client = TestClient(app)
            response = client.post("/auth/osm/disconnect")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "disconnected"
        assert data["tokens_revoked"] is True

        # Verify revoke was called for both tokens
        assert mock_client.revoke_token.call_count == 2

    def test_clears_cookie_even_without_connection(self, app_with_osm_routes, config):
        app = app_with_osm_routes
        app.dependency_overrides[get_osm_connection] = lambda: None

        client = TestClient(app)
        response = client.post("/auth/osm/disconnect")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "disconnected"
        assert data["tokens_revoked"] is False

    def test_clears_cookie_even_on_revoke_error(self, app_with_osm_routes, config):
        app = app_with_osm_routes
        osm = _make_osm_connection()
        app.dependency_overrides[get_osm_connection] = lambda: osm

        with patch(
            "hotosm_auth_fastapi.osm_routes.OSMOAuthClient"
        ) as mock_client_class:
            mock_client = MagicMock()
            mock_client.revoke_token = AsyncMock(side_effect=Exception("Network error"))
            mock_client_class.return_value = mock_client

            client = TestClient(app)
            response = client.post("/auth/osm/disconnect")

        # Should still succeed, just with tokens_revoked=False
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "disconnected"
        assert data["tokens_revoked"] is False
