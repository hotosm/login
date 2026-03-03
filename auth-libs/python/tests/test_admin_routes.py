"""Tests for FastAPI admin routes with mocked database."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest

# Skip if FastAPI not installed
fastapi = pytest.importorskip("fastapi")

from fastapi import FastAPI
from fastapi.testclient import TestClient

from hotosm_auth.config import AuthConfig
from hotosm_auth.models import HankoUser
from hotosm_auth_fastapi.admin_routes import create_admin_mappings_router
from hotosm_auth_fastapi.dependencies import init_auth, get_current_user, get_config


def _make_config():
    return AuthConfig(
        hanko_api_url="https://test.hanko.io",
        cookie_secret="x" * 40,
        cookie_domain=".test.local",
        admin_emails="admin@example.com,super@example.com",
    )


def _make_admin_user():
    now = datetime.now(timezone.utc)
    return HankoUser(
        id="admin-user-123",
        email="admin@example.com",
        email_verified=True,
        created_at=now,
        updated_at=now,
    )


def _make_non_admin_user():
    now = datetime.now(timezone.utc)
    return HankoUser(
        id="regular-user-456",
        email="user@example.com",
        email_verified=True,
        created_at=now,
        updated_at=now,
    )


class MockDBRow:
    """Mock a SQLAlchemy row result."""

    def __init__(self, data):
        self._data = data

    def __getitem__(self, index):
        return self._data[index]


@pytest.fixture
def config():
    """Create and initialize auth config."""
    cfg = _make_config()
    init_auth(cfg)
    return cfg


@pytest.fixture
def mock_db():
    """Create a mock async database session."""
    return AsyncMock()


@pytest.fixture
def app_with_admin_routes(config, mock_db):
    """Create FastAPI app with admin routes."""
    app = FastAPI()

    async def mock_get_db():
        yield mock_db

    router = create_admin_mappings_router(mock_get_db)
    app.include_router(router)

    # Override get_config to return our test config
    app.dependency_overrides[get_config] = lambda: config

    return app


class TestAdminRoutesAuthorization:
    """Test that admin routes require admin privileges."""

    def test_non_admin_gets_403(self, app_with_admin_routes):
        app = app_with_admin_routes

        # Override get_current_user to return non-admin
        app.dependency_overrides[get_current_user] = lambda: _make_non_admin_user()

        client = TestClient(app, raise_server_exceptions=False)
        response = client.get("/admin/mappings")

        assert response.status_code == 403
        assert "Admin access required" in response.json()["detail"]

    def test_admin_gets_access(self, app_with_admin_routes, mock_db):
        app = app_with_admin_routes

        # Override get_current_user to return admin
        app.dependency_overrides[get_current_user] = lambda: _make_admin_user()

        # Mock count query result
        mock_count_result = MagicMock()
        mock_count_result.scalar.return_value = 0

        # Mock list query result
        mock_list_result = MagicMock()
        mock_list_result.fetchall.return_value = []

        mock_db.execute.side_effect = [mock_count_result, mock_list_result]

        client = TestClient(app)
        response = client.get("/admin/mappings")

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["items"] == []


class TestListMappings:
    """Test listing user mappings."""

    def test_returns_paginated_results(self, app_with_admin_routes, mock_db):
        app = app_with_admin_routes
        app.dependency_overrides[get_current_user] = lambda: _make_admin_user()

        now = datetime.now(timezone.utc)

        # Mock count result
        mock_count_result = MagicMock()
        mock_count_result.scalar.return_value = 2

        # Mock list result with rows
        mock_list_result = MagicMock()
        mock_list_result.fetchall.return_value = [
            MockDBRow(["hanko-1", "app-1", "default", now, None]),
            MockDBRow(["hanko-2", "app-2", "default", now, now]),
        ]

        mock_db.execute.side_effect = [mock_count_result, mock_list_result]

        client = TestClient(app)
        response = client.get("/admin/mappings?page=1&page_size=10")

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert len(data["items"]) == 2
        assert data["items"][0]["hanko_user_id"] == "hanko-1"
        assert data["items"][1]["hanko_user_id"] == "hanko-2"


class TestGetMapping:
    """Test getting a single mapping."""

    def test_returns_mapping_when_found(self, app_with_admin_routes, mock_db):
        app = app_with_admin_routes
        app.dependency_overrides[get_current_user] = lambda: _make_admin_user()

        now = datetime.now(timezone.utc)
        mock_result = MagicMock()
        mock_result.fetchone.return_value = MockDBRow(
            ["hanko-123", "app-456", "default", now, None]
        )
        mock_db.execute.return_value = mock_result

        client = TestClient(app)
        response = client.get("/admin/mappings/hanko-123")

        assert response.status_code == 200
        data = response.json()
        assert data["hanko_user_id"] == "hanko-123"
        assert data["app_user_id"] == "app-456"

    def test_returns_404_when_not_found(self, app_with_admin_routes, mock_db):
        app = app_with_admin_routes
        app.dependency_overrides[get_current_user] = lambda: _make_admin_user()

        mock_result = MagicMock()
        mock_result.fetchone.return_value = None
        mock_db.execute.return_value = mock_result

        client = TestClient(app)
        response = client.get("/admin/mappings/nonexistent")

        assert response.status_code == 404
        assert "not found" in response.json()["detail"]


class TestCreateMapping:
    """Test creating a mapping."""

    def test_creates_mapping_successfully(self, app_with_admin_routes, mock_db):
        app = app_with_admin_routes
        app.dependency_overrides[get_current_user] = lambda: _make_admin_user()

        now = datetime.now(timezone.utc)

        # First call: check if exists (returns None)
        mock_check_result = MagicMock()
        mock_check_result.fetchone.return_value = None

        # Second call: insert and return
        mock_insert_result = MagicMock()
        mock_insert_result.fetchone.return_value = MockDBRow(
            ["new-hanko", "new-app", "default", now, None]
        )

        mock_db.execute.side_effect = [mock_check_result, mock_insert_result]

        client = TestClient(app)
        response = client.post(
            "/admin/mappings",
            json={"hanko_user_id": "new-hanko", "app_user_id": "new-app"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["hanko_user_id"] == "new-hanko"
        assert data["app_user_id"] == "new-app"

    def test_returns_409_when_already_exists(self, app_with_admin_routes, mock_db):
        app = app_with_admin_routes
        app.dependency_overrides[get_current_user] = lambda: _make_admin_user()

        # Check returns existing row
        mock_check_result = MagicMock()
        mock_check_result.fetchone.return_value = MockDBRow([1])
        mock_db.execute.return_value = mock_check_result

        client = TestClient(app)
        response = client.post(
            "/admin/mappings",
            json={"hanko_user_id": "existing-hanko", "app_user_id": "app-id"},
        )

        assert response.status_code == 409
        assert "already exists" in response.json()["detail"]


class TestUpdateMapping:
    """Test updating a mapping."""

    def test_updates_mapping_successfully(self, app_with_admin_routes, mock_db):
        app = app_with_admin_routes
        app.dependency_overrides[get_current_user] = lambda: _make_admin_user()

        now = datetime.now(timezone.utc)
        mock_result = MagicMock()
        mock_result.fetchone.return_value = MockDBRow(
            ["hanko-123", "updated-app", "default", now, now]
        )
        mock_db.execute.return_value = mock_result

        client = TestClient(app)
        response = client.put(
            "/admin/mappings/hanko-123",
            json={"app_user_id": "updated-app"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["app_user_id"] == "updated-app"

    def test_returns_404_when_not_found(self, app_with_admin_routes, mock_db):
        app = app_with_admin_routes
        app.dependency_overrides[get_current_user] = lambda: _make_admin_user()

        mock_result = MagicMock()
        mock_result.fetchone.return_value = None
        mock_db.execute.return_value = mock_result

        client = TestClient(app)
        response = client.put(
            "/admin/mappings/nonexistent",
            json={"app_user_id": "new-app"},
        )

        assert response.status_code == 404


class TestDeleteMapping:
    """Test deleting a mapping."""

    def test_deletes_mapping_successfully(self, app_with_admin_routes, mock_db):
        app = app_with_admin_routes
        app.dependency_overrides[get_current_user] = lambda: _make_admin_user()

        mock_result = MagicMock()
        mock_result.fetchone.return_value = MockDBRow(["hanko-123"])
        mock_db.execute.return_value = mock_result

        client = TestClient(app)
        response = client.delete("/admin/mappings/hanko-123")

        assert response.status_code == 204

    def test_returns_404_when_not_found(self, app_with_admin_routes, mock_db):
        app = app_with_admin_routes
        app.dependency_overrides[get_current_user] = lambda: _make_admin_user()

        mock_result = MagicMock()
        mock_result.fetchone.return_value = None
        mock_db.execute.return_value = mock_result

        client = TestClient(app)
        response = client.delete("/admin/mappings/nonexistent")

        assert response.status_code == 404
