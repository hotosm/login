"""Tests for Django admin routes with mocked database."""

import os
from datetime import datetime, timezone
from unittest.mock import patch

import pytest

# Django is configured in conftest.py

# Skip if DRF not installed
rest_framework = pytest.importorskip("rest_framework")

from rest_framework.test import APIRequestFactory

from hotosm_auth.models import HankoUser
from hotosm_auth_django.admin_routes import (
    create_admin_urlpatterns,
    get_admin_emails,
    is_admin_user,
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


class MockHotosmContext:
    """Mock request.hotosm namespace."""

    def __init__(self, user=None, osm=None):
        self.user = user
        self.osm = osm


class MockDjangoUser:
    """Mock Django user."""

    def __init__(self, email=None):
        self.email = email


class MockCursor:
    """Mock database cursor."""

    def __init__(self, results=None):
        self.results = results or []
        self.result_index = 0
        self.executed_queries = []

    def execute(self, query, params=None):
        self.executed_queries.append((query, params))

    def fetchone(self):
        if self.result_index < len(self.results):
            result = self.results[self.result_index]
            self.result_index += 1
            return result
        return None

    def fetchall(self):
        return self.results

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass


@pytest.fixture
def rf():
    return APIRequestFactory()


class TestGetAdminEmails:
    """Test admin email parsing."""

    def test_parses_comma_separated_emails(self):
        with patch.dict(os.environ, {"ADMIN_EMAILS": "a@test.com, b@test.com"}):
            emails = get_admin_emails()

        assert emails == ["a@test.com", "b@test.com"]

    def test_lowercases_emails(self):
        with patch.dict(os.environ, {"ADMIN_EMAILS": "Admin@Test.COM"}):
            emails = get_admin_emails()

        assert emails == ["admin@test.com"]


class TestIsAdminUser:
    """Test admin user check."""

    def test_returns_true_for_admin_email(self, rf):
        request = rf.get("/admin/mappings")
        request.hotosm = MockHotosmContext(user=_make_admin_user())

        with patch(
            "hotosm_auth_django.admin_routes.get_admin_emails",
            return_value=["admin@example.com"],
        ):
            result = is_admin_user(request)

        assert result is True

    def test_returns_false_for_non_admin_email(self, rf):
        request = rf.get("/admin/mappings")
        request.hotosm = MockHotosmContext(user=_make_non_admin_user())
        request.user = MockDjangoUser(email="user@example.com")

        with patch(
            "hotosm_auth_django.admin_routes.get_admin_emails",
            return_value=["admin@example.com"],
        ):
            result = is_admin_user(request)

        assert result is False

    def test_returns_false_when_no_admin_emails_configured(self, rf):
        request = rf.get("/admin/mappings")
        request.hotosm = MockHotosmContext(user=_make_admin_user())

        with patch(
            "hotosm_auth_django.admin_routes.get_admin_emails",
            return_value=[],
        ):
            result = is_admin_user(request)

        assert result is False


class TestMappingsListView:
    """Test list mappings endpoint."""

    def test_non_admin_gets_403(self, rf):
        urlpatterns = create_admin_urlpatterns()
        view = urlpatterns[0].callback

        request = rf.get("/admin/mappings")
        request.hotosm = MockHotosmContext(user=_make_non_admin_user())

        with patch(
            "hotosm_auth_django.admin_routes.get_admin_emails",
            return_value=["admin@example.com"],
        ):
            response = view(request)

        assert response.status_code == 403

    def test_admin_gets_paginated_results(self, rf):
        urlpatterns = create_admin_urlpatterns()
        view = urlpatterns[0].callback

        request = rf.get("/admin/mappings")
        request.hotosm = MockHotosmContext(user=_make_admin_user())

        now = datetime.now(timezone.utc)

        # Create a more sophisticated mock cursor
        class SmartMockCursor:
            def __init__(self):
                self.call_count = 0

            def execute(self, query, params=None):
                self.call_count += 1
                self.last_query = query

            def fetchone(self):
                if "COUNT" in self.last_query:
                    return (2,)
                return None

            def fetchall(self):
                return [
                    ("hanko-1", "app-1", "default", now, None),
                    ("hanko-2", "app-2", "default", now, now),
                ]

            def __enter__(self):
                return self

            def __exit__(self, *args):
                pass

        with (
            patch(
                "hotosm_auth_django.admin_routes.get_admin_emails",
                return_value=["admin@example.com"],
            ),
            patch("hotosm_auth_django.admin_routes.connection") as mock_conn,
        ):
            mock_conn.cursor.return_value = SmartMockCursor()
            response = view(request)

        assert response.status_code == 200
        assert response.data["total"] == 2


class TestMappingDetailView:
    """Test get/update/delete mapping endpoints."""

    def test_get_returns_mapping_when_found(self, rf):
        urlpatterns = create_admin_urlpatterns()
        view = urlpatterns[1].callback

        request = rf.get("/admin/mappings/hanko-123")
        request.hotosm = MockHotosmContext(user=_make_admin_user())

        now = datetime.now(timezone.utc)
        mock_cursor = MockCursor(
            results=[
                ("hanko-123", "app-456", "default", now, None),
            ]
        )

        with (
            patch(
                "hotosm_auth_django.admin_routes.get_admin_emails",
                return_value=["admin@example.com"],
            ),
            patch("hotosm_auth_django.admin_routes.connection") as mock_conn,
        ):
            mock_conn.cursor.return_value = mock_cursor
            response = view(request, hanko_user_id="hanko-123")

        assert response.status_code == 200
        assert response.data["hanko_user_id"] == "hanko-123"
        assert response.data["app_user_id"] == "app-456"

    def test_get_returns_404_when_not_found(self, rf):
        urlpatterns = create_admin_urlpatterns()
        view = urlpatterns[1].callback

        request = rf.get("/admin/mappings/nonexistent")
        request.hotosm = MockHotosmContext(user=_make_admin_user())

        mock_cursor = MockCursor(results=[])

        with (
            patch(
                "hotosm_auth_django.admin_routes.get_admin_emails",
                return_value=["admin@example.com"],
            ),
            patch("hotosm_auth_django.admin_routes.connection") as mock_conn,
        ):
            mock_conn.cursor.return_value = mock_cursor
            response = view(request, hanko_user_id="nonexistent")

        assert response.status_code == 404

    def test_delete_returns_204_on_success(self, rf):
        urlpatterns = create_admin_urlpatterns()
        view = urlpatterns[1].callback

        request = rf.delete("/admin/mappings/hanko-123")
        request.hotosm = MockHotosmContext(user=_make_admin_user())

        mock_cursor = MockCursor(results=[("hanko-123",)])

        with (
            patch(
                "hotosm_auth_django.admin_routes.get_admin_emails",
                return_value=["admin@example.com"],
            ),
            patch("hotosm_auth_django.admin_routes.connection") as mock_conn,
        ):
            mock_conn.cursor.return_value = mock_cursor
            response = view(request, hanko_user_id="hanko-123")

        assert response.status_code == 204

    def test_delete_returns_404_when_not_found(self, rf):
        urlpatterns = create_admin_urlpatterns()
        view = urlpatterns[1].callback

        request = rf.delete("/admin/mappings/nonexistent")
        request.hotosm = MockHotosmContext(user=_make_admin_user())

        mock_cursor = MockCursor(results=[])

        with (
            patch(
                "hotosm_auth_django.admin_routes.get_admin_emails",
                return_value=["admin@example.com"],
            ),
            patch("hotosm_auth_django.admin_routes.connection") as mock_conn,
        ):
            mock_conn.cursor.return_value = mock_cursor
            response = view(request, hanko_user_id="nonexistent")

        assert response.status_code == 404


class TestMappingCreateView:
    """Test create mapping endpoint."""

    def test_creates_mapping_successfully(self, rf):
        urlpatterns = create_admin_urlpatterns()
        view = urlpatterns[0].callback

        request = rf.post(
            "/admin/mappings",
            {"hanko_user_id": "new-hanko", "app_user_id": "new-app"},
            format="json",
        )
        request.hotosm = MockHotosmContext(user=_make_admin_user())

        now = datetime.now(timezone.utc)

        class SmartMockCursor:
            def __init__(self):
                self.call_count = 0

            def execute(self, query, params=None):
                self.call_count += 1
                self.last_query = query

            def fetchone(self):
                if "SELECT 1" in self.last_query:
                    return None  # Not exists
                elif "INSERT" in self.last_query:
                    return ("new-hanko", "new-app", "default", now, None)
                return None

            def __enter__(self):
                return self

            def __exit__(self, *args):
                pass

        with (
            patch(
                "hotosm_auth_django.admin_routes.get_admin_emails",
                return_value=["admin@example.com"],
            ),
            patch("hotosm_auth_django.admin_routes.connection") as mock_conn,
        ):
            mock_conn.cursor.return_value = SmartMockCursor()
            response = view(request)

        assert response.status_code == 201
        assert response.data["hanko_user_id"] == "new-hanko"

    def test_returns_409_when_already_exists(self, rf):
        urlpatterns = create_admin_urlpatterns()
        view = urlpatterns[0].callback

        request = rf.post(
            "/admin/mappings",
            {"hanko_user_id": "existing-hanko", "app_user_id": "app-id"},
            format="json",
        )
        request.hotosm = MockHotosmContext(user=_make_admin_user())

        mock_cursor = MockCursor(results=[(1,)])  # Exists

        with (
            patch(
                "hotosm_auth_django.admin_routes.get_admin_emails",
                return_value=["admin@example.com"],
            ),
            patch("hotosm_auth_django.admin_routes.connection") as mock_conn,
        ):
            mock_conn.cursor.return_value = mock_cursor
            response = view(request)

        assert response.status_code == 409

    def test_returns_400_when_missing_fields(self, rf):
        urlpatterns = create_admin_urlpatterns()
        view = urlpatterns[0].callback

        request = rf.post("/admin/mappings", {}, format="json")
        request.hotosm = MockHotosmContext(user=_make_admin_user())

        with patch(
            "hotosm_auth_django.admin_routes.get_admin_emails",
            return_value=["admin@example.com"],
        ):
            response = view(request)

        assert response.status_code == 400
