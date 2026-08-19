"""Tests for Litestar setup and auth contexts."""

from datetime import datetime, timezone

import pytest

litestar = pytest.importorskip("litestar")

from hotosm_auth.config import AuthConfig
from hotosm_auth.models import HankoUser, OSMConnection
from hotosm_auth_litestar.dependencies import AuthContext
from hotosm_auth_litestar.setup import setup_auth


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


class TestAuthContext:
    """Test the Litestar auth context wrapper."""

    def test_require_osm_returns_connection_when_present(self):
        context = AuthContext(user=_make_user(), osm=_make_osm_connection())

        result = context.require_osm()

        assert result.osm_user_id == 12345

    def test_require_osm_raises_403_when_missing(self):
        context = AuthContext(user=_make_user(), osm=None)

        with pytest.raises(Exception) as exc_info:
            context.require_osm()

        assert getattr(exc_info.value, "status_code", None) == 403


class TestSetupAuth:
    """Test Litestar setup helper."""

    def test_setup_auth_returns_dependencies_and_routes_with_osm_enabled(self):
        config = AuthConfig(
            hanko_api_url="https://test.hanko.io",
            cookie_secret="x" * 40,
            osm_enabled=True,
            osm_client_id="id",
            osm_client_secret="secret",
            osm_redirect_uri="https://app.test/auth/osm/callback",
        )

        deps, route_handlers = setup_auth(config=config)

        assert "current_user" in deps
        assert "auth" in deps
        assert len(route_handlers) == 1

    def test_setup_auth_skips_osm_routes_when_disabled(self):
        config = AuthConfig(
            hanko_api_url="https://test.hanko.io",
            cookie_secret="x" * 40,
            osm_enabled=False,
        )

        deps, route_handlers = setup_auth(config=config)

        assert "current_user" in deps
        assert route_handlers == []
