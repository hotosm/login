"""Tests for Litestar OSM OAuth routes with mocked HTTP."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

litestar = pytest.importorskip("litestar")

from litestar import Litestar
from litestar.di import Provide
from litestar.testing import TestClient

from hotosm_auth.config import AuthConfig
from hotosm_auth.exceptions import OSMOAuthError
from hotosm_auth.models import HankoUser, OSMConnection
from hotosm_auth_litestar.dependencies import init_auth
from hotosm_auth_litestar.osm_routes import _oauth_states, osm_router


def _make_config() -> AuthConfig:
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


def _make_config_osm_disabled() -> AuthConfig:
    return AuthConfig(
        hanko_api_url="https://test.hanko.io",
        cookie_secret="x" * 40,
        cookie_domain=".test.local",
        osm_enabled=False,
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
        osm_avatar_url="https://osm.org/avatar.png",
        access_token="access-token-123",
        refresh_token="refresh-token-456",
        scopes=["read_prefs"],
    )


def _build_app(
    current_user: HankoUser, osm_connection: OSMConnection | None
) -> Litestar:
    return Litestar(
        route_handlers=[osm_router],
        dependencies={
            "current_user": Provide(lambda: current_user, sync_to_thread=False),
            "osm_connection": Provide(lambda: osm_connection, sync_to_thread=False),
        },
    )


@pytest.fixture(autouse=True)
def clear_oauth_states():
    _oauth_states.clear()
    yield
    _oauth_states.clear()


class TestOSMLogin:
    """Test OSM login endpoint."""

    def test_redirects_to_osm_authorization(self):
        init_auth(_make_config())
        app = _build_app(_make_user(), None)

        with TestClient(app=app) as client:
            response = client.get("/auth/osm/login", follow_redirects=False)

        assert response.status_code in {302, 307}
        location = response.headers["location"]
        assert "openstreetmap.org/oauth2/authorize" in location
        assert "client_id=test-client-id" in location
        assert "state=" in location

    def test_stores_oauth_state(self):
        init_auth(_make_config())
        app = _build_app(_make_user(), None)

        with TestClient(app=app) as client:
            client.get("/auth/osm/login", follow_redirects=False)

        assert len(_oauth_states) == 1
        state_data = list(_oauth_states.values())[0]
        assert state_data["user_id"] == "user-123"

    def test_returns_400_when_osm_disabled(self):
        init_auth(_make_config_osm_disabled())
        app = _build_app(_make_user(), None)

        with TestClient(app=app) as client:
            response = client.get("/auth/osm/login")

        assert response.status_code == 400
        assert "not enabled" in response.json()["detail"]


class TestOSMCallback:
    """Test OSM callback endpoint."""

    def test_exchanges_code_and_redirects(self):
        config = _make_config()
        init_auth(config)
        user = _make_user()
        app = _build_app(user, None)

        _oauth_states["valid-state"] = {
            "user_id": user.id,
            "redirect_url": "/dashboard",
        }

        osm_conn = _make_osm_connection()
        with patch(
            "hotosm_auth_litestar.osm_routes.OSMOAuthClient"
        ) as mock_client_class:
            mock_client = MagicMock()
            mock_client.exchange_code = AsyncMock(return_value=osm_conn)
            mock_client_class.return_value = mock_client

            with TestClient(app=app) as client:
                response = client.get(
                    "/auth/osm/callback?code=auth-code&state=valid-state",
                    follow_redirects=False,
                )

        assert response.status_code == 303
        assert response.headers["location"] == "/dashboard"
        mock_client.exchange_code.assert_called_once_with("auth-code")

    def test_returns_400_for_invalid_state(self):
        init_auth(_make_config())
        app = _build_app(_make_user(), None)

        with TestClient(app=app) as client:
            response = client.get(
                "/auth/osm/callback?code=auth-code&state=invalid-state"
            )

        assert response.status_code == 400
        assert "Invalid OAuth state" in response.json()["detail"]

    def test_returns_400_for_mismatched_user(self):
        init_auth(_make_config())
        app = _build_app(_make_user(), None)

        _oauth_states["valid-state"] = {"user_id": "other-user", "redirect_url": "/"}

        with TestClient(app=app) as client:
            response = client.get("/auth/osm/callback?code=auth-code&state=valid-state")

        assert response.status_code == 400
        assert "Invalid OAuth state" in response.json()["detail"]

    def test_returns_400_on_oauth_error(self):
        init_auth(_make_config())
        user = _make_user()
        app = _build_app(user, None)

        _oauth_states["valid-state"] = {"user_id": user.id, "redirect_url": "/"}

        with patch(
            "hotosm_auth_litestar.osm_routes.OSMOAuthClient"
        ) as mock_client_class:
            mock_client = MagicMock()
            mock_client.exchange_code = AsyncMock(
                side_effect=OSMOAuthError("Token exchange failed")
            )
            mock_client_class.return_value = mock_client

            with TestClient(app=app) as client:
                response = client.get(
                    "/auth/osm/callback?code=bad-code&state=valid-state"
                )

        assert response.status_code == 400
        assert "OSM OAuth failed" in response.json()["detail"]


class TestOSMStatus:
    """Test OSM status endpoint."""

    def test_returns_connected_true_with_connection(self):
        init_auth(_make_config())
        app = _build_app(_make_user(), _make_osm_connection())

        with TestClient(app=app) as client:
            response = client.get("/auth/osm/status")

        assert response.status_code == 200
        data = response.json()
        assert data["connected"] is True
        assert data["osm_user_id"] == 12345

    def test_returns_connected_false_without_connection(self):
        init_auth(_make_config())
        app = _build_app(_make_user(), None)

        with TestClient(app=app) as client:
            response = client.get("/auth/osm/status")

        assert response.status_code == 200
        assert response.json()["connected"] is False


class TestOSMDisconnect:
    """Test OSM disconnect endpoint."""

    def test_revokes_tokens_and_clears_cookie(self):
        init_auth(_make_config())
        app = _build_app(_make_user(), _make_osm_connection())

        with patch(
            "hotosm_auth_litestar.osm_routes.OSMOAuthClient"
        ) as mock_client_class:
            mock_client = MagicMock()
            mock_client.revoke_token = AsyncMock()
            mock_client_class.return_value = mock_client

            with TestClient(app=app) as client:
                response = client.post("/auth/osm/disconnect")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "disconnected"
        assert data["tokens_revoked"] is True
        assert mock_client.revoke_token.call_count == 2

    def test_clears_cookie_even_without_connection(self):
        init_auth(_make_config())
        app = _build_app(_make_user(), None)

        with TestClient(app=app) as client:
            response = client.post("/auth/osm/disconnect")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "disconnected"
        assert data["tokens_revoked"] is False
