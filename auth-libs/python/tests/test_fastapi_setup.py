"""Tests for FastAPI setup and Auth dependency."""

from datetime import datetime, timezone

import pytest

# Skip all tests in this module if FastAPI is not installed
fastapi = pytest.importorskip("fastapi")

from fastapi import HTTPException

from hotosm_auth.models import HankoUser, OSMConnection
from hotosm_auth_fastapi.setup import _AuthDep


class TestAuthDep:
    """Test the Auth dependency wrapper."""

    def _make_user(self) -> HankoUser:
        now = datetime.now(timezone.utc)
        return HankoUser(
            id="user-123",
            email="test@example.com",
            email_verified=True,
            created_at=now,
            updated_at=now,
        )

    def _make_osm_connection(self) -> OSMConnection:
        return OSMConnection(
            osm_user_id=12345,
            osm_username="mapper",
            osm_avatar_url=None,
            access_token="token",
            scopes=["read_prefs"],
        )

    def test_exposes_user_and_osm(self):
        user = self._make_user()
        osm = self._make_osm_connection()

        auth = _AuthDep.__new__(_AuthDep)
        auth.user = user
        auth.osm = osm

        assert auth.user.id == "user-123"
        assert auth.osm.osm_username == "mapper"

    def test_require_osm_returns_connection_when_present(self):
        auth = _AuthDep.__new__(_AuthDep)
        auth.user = self._make_user()
        auth.osm = self._make_osm_connection()

        result = auth.require_osm()

        assert result.osm_user_id == 12345

    def test_require_osm_raises_403_when_missing(self):
        auth = _AuthDep.__new__(_AuthDep)
        auth.user = self._make_user()
        auth.osm = None

        with pytest.raises(HTTPException) as exc_info:
            auth.require_osm()

        assert exc_info.value.status_code == 403
        assert "OSM connection required" in exc_info.value.detail
