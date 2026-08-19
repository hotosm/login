"""Tests for Litestar admin routes with mocked database."""

from datetime import datetime, timezone

import pytest

litestar = pytest.importorskip("litestar")

from litestar import Litestar
from litestar.di import Provide
from litestar.testing import TestClient

from hotosm_auth.config import AuthConfig
from hotosm_auth.models import HankoUser
from hotosm_auth_litestar.admin_routes import create_admin_mappings_router
from hotosm_auth_litestar.dependencies import init_auth


def _make_config() -> AuthConfig:
    return AuthConfig(
        hanko_api_url="https://test.hanko.io",
        cookie_secret="x" * 40,
        cookie_domain=".test.local",
        admin_emails="admin@example.com,super@example.com",
    )


def _make_admin_user() -> HankoUser:
    now = datetime.now(timezone.utc)
    return HankoUser(
        id="admin-user-123",
        email="admin@example.com",
        email_verified=True,
        created_at=now,
        updated_at=now,
    )


def _make_non_admin_user() -> HankoUser:
    now = datetime.now(timezone.utc)
    return HankoUser(
        id="regular-user-456",
        email="user@example.com",
        email_verified=True,
        created_at=now,
        updated_at=now,
    )


class MockCursor:
    """Mock async psycopg cursor."""

    def __init__(self, fetchone_results=None, fetchall_results=None):
        self.fetchone_results = list(fetchone_results or [])
        self.fetchall_results = list(fetchall_results or [])
        self.executed = []

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def execute(self, query, params=None):
        self.executed.append((str(query), params))

    async def fetchone(self):
        if self.fetchone_results:
            return self.fetchone_results.pop(0)
        return None

    async def fetchall(self):
        if self.fetchall_results:
            return self.fetchall_results.pop(0)
        return []


class MockDB:
    """Mock async psycopg connection."""

    def __init__(self, cursor: MockCursor):
        self._cursor = cursor

    def cursor(self):
        return self._cursor


def _build_app(current_user: HankoUser, cursor: MockCursor) -> Litestar:
    async def get_db():
        return MockDB(cursor)

    admin_router = create_admin_mappings_router(get_db)
    return Litestar(
        route_handlers=[admin_router],
        dependencies={
            "current_user": Provide(lambda: current_user, sync_to_thread=False),
        },
    )


class TestAdminRoutesAuthorization:
    """Test admin route authorization."""

    def test_non_admin_gets_403(self):
        init_auth(_make_config())
        app = _build_app(_make_non_admin_user(), MockCursor())

        with TestClient(app=app) as client:
            response = client.get("/admin/mappings")

        assert response.status_code == 403
        assert "Admin access required" in response.json()["detail"]

    def test_admin_gets_access(self):
        init_auth(_make_config())
        cursor = MockCursor(fetchone_results=[(0,)], fetchall_results=[[]])
        app = _build_app(_make_admin_user(), cursor)

        with TestClient(app=app) as client:
            response = client.get("/admin/mappings")

        assert response.status_code == 200
        assert response.json()["items"] == []


class TestAdminRouteCrud:
    """Test CRUD operations."""

    def test_get_mapping_returns_404_when_not_found(self):
        init_auth(_make_config())
        cursor = MockCursor(fetchone_results=[None])
        app = _build_app(_make_admin_user(), cursor)

        with TestClient(app=app) as client:
            response = client.get("/admin/mappings/missing-user")

        assert response.status_code == 404

    def test_create_mapping_returns_409_when_already_exists(self):
        init_auth(_make_config())
        cursor = MockCursor(fetchone_results=[(1,)])
        app = _build_app(_make_admin_user(), cursor)

        with TestClient(app=app) as client:
            response = client.post(
                "/admin/mappings",
                json={"hanko_user_id": "existing-hanko", "app_user_id": "app-id"},
            )

        assert response.status_code == 409

    def test_delete_mapping_returns_204_on_success(self):
        init_auth(_make_config())
        cursor = MockCursor(fetchone_results=[("hanko-123",)])
        app = _build_app(_make_admin_user(), cursor)

        with TestClient(app=app) as client:
            response = client.delete("/admin/mappings/hanko-123")

        assert response.status_code == 204
