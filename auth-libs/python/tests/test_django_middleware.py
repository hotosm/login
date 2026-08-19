"""Tests for Django middleware and decorators."""

import pytest

# Skip if Django is not installed
django = pytest.importorskip("django")

# Django is configured in conftest.py
from unittest.mock import MagicMock

from django.http import HttpRequest, JsonResponse

from hotosm_auth_django.middleware import (
    HankoAuthMiddleware,
    get_token_from_request,
    login_required,
    osm_required,
)


class TestGetTokenFromRequest:
    """Test JWT extraction from requests."""

    def _make_request(self, cookies=None, auth_header=None):
        request = MagicMock(spec=HttpRequest)
        request.COOKIES = cookies or {}
        request.META = {}
        if auth_header:
            request.META["HTTP_AUTHORIZATION"] = auth_header
        return request

    def test_extracts_bearer_token_from_header(self):
        request = self._make_request(auth_header="Bearer my-jwt-token")

        token = get_token_from_request(request)

        assert token == "my-jwt-token"

    def test_extracts_token_from_hanko_cookie(self):
        request = self._make_request(cookies={"hanko": "cookie-jwt-token"})

        token = get_token_from_request(request)

        assert token == "cookie-jwt-token"

    def test_header_takes_priority_over_cookie(self):
        request = self._make_request(
            cookies={"hanko": "cookie-token"},
            auth_header="Bearer header-token",
        )

        token = get_token_from_request(request)

        assert token == "header-token"

    def test_returns_none_when_no_token(self):
        request = self._make_request()

        token = get_token_from_request(request)

        assert token is None

    def test_ignores_non_bearer_auth_header(self):
        request = self._make_request(auth_header="Basic dXNlcjpwYXNz")

        token = get_token_from_request(request)

        assert token is None


class TestLoginRequiredDecorator:
    """Test the @login_required decorator."""

    def test_allows_authenticated_request(self):
        @login_required
        def my_view(request):
            return JsonResponse({"ok": True})

        request = MagicMock()
        request.hanko_user = MagicMock()  # User present

        response = my_view(request)

        assert response.status_code == 200

    def test_rejects_unauthenticated_request(self):
        @login_required
        def my_view(request):
            return JsonResponse({"ok": True})

        request = MagicMock()
        request.hanko_user = None

        response = my_view(request)

        assert response.status_code == 401


class TestOsmRequiredDecorator:
    """Test the @osm_required decorator."""

    def test_allows_request_with_osm_connection(self):
        @osm_required
        def my_view(request):
            return JsonResponse({"ok": True})

        request = MagicMock()
        request.osm_connection = MagicMock()  # OSM present

        response = my_view(request)

        assert response.status_code == 200

    def test_rejects_request_without_osm_connection(self):
        @osm_required
        def my_view(request):
            return JsonResponse({"ok": True})

        request = MagicMock()
        request.osm_connection = None

        response = my_view(request)

        assert response.status_code == 403


class TestHankoAuthMiddleware:
    """Test the middleware itself."""

    def test_adds_hotosm_namespace_to_request(self):
        def get_response(request):
            # Verify the namespace is there
            assert hasattr(request, "hotosm")
            return MagicMock()

        middleware = HankoAuthMiddleware(get_response)
        request = MagicMock(spec=HttpRequest)
        request.COOKIES = {}
        request.META = {}

        middleware(request)

        assert hasattr(request, "hotosm")
        assert hasattr(request, "hanko_user")  # backwards compat
        assert hasattr(request, "osm_connection")  # backwards compat
