"""
Django REST Framework views for managing user mappings.

This module provides admin views for CRUD operations on the
hanko_user_mappings table, designed for Django applications.

Usage:
    # In urls.py
    from django.urls import path, include
    from hotosm_auth_django import create_admin_urlpatterns

    urlpatterns = [
        # ... other urls
        path("api/admin/", include(create_admin_urlpatterns(
            app_name="fair",
            user_model="login.OsmUser",
            user_id_column="osm_id",
            user_name_column="username",
            user_email_column="email",
        ))),
    ]
"""

import os
from typing import Any

from django.conf import settings
from django.db import connection
from django.http import JsonResponse
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from hotosm_auth.logger import get_logger

logger = get_logger(__name__)


def get_admin_emails() -> list[str]:
    """Get admin emails from environment/settings."""
    admin_emails = getattr(settings, 'ADMIN_EMAILS', None)
    if admin_emails is None:
        admin_emails = os.environ.get('ADMIN_EMAILS', '')
    return [e.strip().lower() for e in admin_emails.split(',') if e.strip()]


def is_admin_user(request: Request) -> bool:
    """Check if the current user is an admin based on email."""
    admin_emails = get_admin_emails()
    if not admin_emails:
        return False

    # Check from Hanko user if available
    if hasattr(request, 'hotosm') and request.hotosm.user:
        user_email = request.hotosm.user.email
        if user_email and user_email.lower() in admin_emails:
            return True

    # Check from Django user
    if request.user and hasattr(request.user, 'email'):
        if request.user.email and request.user.email.lower() in admin_emails:
            return True

    return False


def create_admin_urlpatterns(
    app_name: str = "default",
    user_model: str | None = None,
    user_id_column: str = "id",
    user_name_column: str = "username",
    user_email_column: str = "email",
) -> list:
    """Create URL patterns for admin mapping endpoints.

    Args:
        app_name: Application name to filter mappings by
        user_model: Optional Django model path for user enrichment (e.g., "login.OsmUser")
        user_id_column: Column name for user ID (default: "id")
        user_name_column: Column name for username (default: "username")
        user_email_column: Column name for email (default: "email")

    Returns:
        List of URL patterns for admin endpoints
    """
    from django.urls import path

    # Get user model class if specified
    UserModel = None
    if user_model:
        from django.apps import apps
        try:
            app_label, model_name = user_model.split('.')
            UserModel = apps.get_model(app_label, model_name)
        except Exception as e:
            logger.warning(f"Could not load user model {user_model}: {e}")

    class AdminPermissionMixin:
        """Mixin to check admin permissions."""

        def check_admin(self, request: Request) -> Response | None:
            """Check if user is admin, return error response if not."""
            if not is_admin_user(request):
                return Response(
                    {"detail": "Admin access required"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            return None

    class MappingsListCreateView(AdminPermissionMixin, APIView):
        """List all user mappings (GET) or create a new one (POST)."""

        def get(self, request: Request) -> Response:
            """List all user mappings (paginated)."""
            error = self.check_admin(request)
            if error:
                return error

            page = int(request.query_params.get('page', 1))
            page_size = min(int(request.query_params.get('page_size', 50)), 100)
            offset = (page - 1) * page_size

            with connection.cursor() as cursor:
                # Get total count
                cursor.execute(
                    "SELECT COUNT(*) FROM hanko_user_mappings WHERE app_name = %s",
                    [app_name],
                )
                total = cursor.fetchone()[0]

                # Get mappings
                cursor.execute(
                    """
                    SELECT hanko_user_id, app_user_id, app_name, created_at, updated_at
                    FROM hanko_user_mappings
                    WHERE app_name = %s
                    ORDER BY created_at DESC
                    LIMIT %s OFFSET %s
                    """,
                    [app_name, page_size, offset],
                )
                rows = cursor.fetchall()

            # Build items with optional user enrichment
            items = []
            for row in rows:
                item = {
                    "hanko_user_id": row[0],
                    "app_user_id": row[1],
                    "app_name": row[2],
                    "created_at": row[3].isoformat() if row[3] else None,
                    "updated_at": row[4].isoformat() if row[4] else None,
                    "app_username": None,
                    "app_email": None,
                }

                # Enrich with user data if model available
                if UserModel and row[1]:
                    try:
                        # Handle numeric user IDs (like osm_id)
                        lookup_value = row[1]
                        try:
                            lookup_value = int(row[1])
                        except (ValueError, TypeError):
                            pass

                        user = UserModel.objects.filter(**{user_id_column: lookup_value}).first()
                        if user:
                            item["app_username"] = getattr(user, user_name_column, None)
                            item["app_email"] = getattr(user, user_email_column, None)
                    except Exception as e:
                        logger.debug(f"Could not enrich user {row[1]}: {e}")

                items.append(item)

            admin_email = "unknown"
            if hasattr(request, 'hotosm') and request.hotosm.user:
                admin_email = request.hotosm.user.email
            logger.info(f"Admin {admin_email} listed mappings (page={page}, total={total})")

            return Response({
                "items": items,
                "total": total,
                "page": page,
                "page_size": page_size,
            })

        def post(self, request: Request) -> Response:
            """Create a new user mapping."""
            error = self.check_admin(request)
            if error:
                return error

            hanko_user_id = request.data.get('hanko_user_id')
            app_user_id = request.data.get('app_user_id')

            if not hanko_user_id or not app_user_id:
                return Response(
                    {"detail": "hanko_user_id and app_user_id are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            with connection.cursor() as cursor:
                # Check if mapping already exists
                cursor.execute(
                    """
                    SELECT 1 FROM hanko_user_mappings
                    WHERE hanko_user_id = %s AND app_name = %s
                    """,
                    [hanko_user_id, app_name],
                )
                if cursor.fetchone():
                    return Response(
                        {"detail": f"Mapping already exists for hanko_user_id: {hanko_user_id}"},
                        status=status.HTTP_409_CONFLICT,
                    )

                # Create mapping
                cursor.execute(
                    """
                    INSERT INTO hanko_user_mappings (hanko_user_id, app_user_id, app_name, created_at)
                    VALUES (%s, %s, %s, NOW())
                    RETURNING hanko_user_id, app_user_id, app_name, created_at, updated_at
                    """,
                    [hanko_user_id, app_user_id, app_name],
                )
                row = cursor.fetchone()

            admin_email = "unknown"
            if hasattr(request, 'hotosm') and request.hotosm.user:
                admin_email = request.hotosm.user.email
            logger.info(f"Admin {admin_email} created mapping: {hanko_user_id} -> {app_user_id}")

            return Response({
                "hanko_user_id": row[0],
                "app_user_id": row[1],
                "app_name": row[2],
                "created_at": row[3].isoformat() if row[3] else None,
                "updated_at": row[4].isoformat() if row[4] else None,
            }, status=status.HTTP_201_CREATED)

    class MappingDetailView(AdminPermissionMixin, APIView):
        """Get (GET), update (PUT), or delete (DELETE) a single user mapping."""

        def get(self, request: Request, hanko_user_id: str) -> Response:
            """Get a single user mapping by Hanko user ID."""
            error = self.check_admin(request)
            if error:
                return error

            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT hanko_user_id, app_user_id, app_name, created_at, updated_at
                    FROM hanko_user_mappings
                    WHERE hanko_user_id = %s AND app_name = %s
                    """,
                    [hanko_user_id, app_name],
                )
                row = cursor.fetchone()

            if not row:
                return Response(
                    {"detail": f"Mapping not found for hanko_user_id: {hanko_user_id}"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response({
                "hanko_user_id": row[0],
                "app_user_id": row[1],
                "app_name": row[2],
                "created_at": row[3].isoformat() if row[3] else None,
                "updated_at": row[4].isoformat() if row[4] else None,
            })

        def put(self, request: Request, hanko_user_id: str) -> Response:
            """Update an existing user mapping."""
            error = self.check_admin(request)
            if error:
                return error

            app_user_id = request.data.get('app_user_id')

            if not app_user_id:
                return Response(
                    {"detail": "app_user_id is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE hanko_user_mappings
                    SET app_user_id = %s, updated_at = NOW()
                    WHERE hanko_user_id = %s AND app_name = %s
                    RETURNING hanko_user_id, app_user_id, app_name, created_at, updated_at
                    """,
                    [app_user_id, hanko_user_id, app_name],
                )
                row = cursor.fetchone()

            if not row:
                return Response(
                    {"detail": f"Mapping not found for hanko_user_id: {hanko_user_id}"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            admin_email = "unknown"
            if hasattr(request, 'hotosm') and request.hotosm.user:
                admin_email = request.hotosm.user.email
            logger.info(f"Admin {admin_email} updated mapping: {hanko_user_id} -> {app_user_id}")

            return Response({
                "hanko_user_id": row[0],
                "app_user_id": row[1],
                "app_name": row[2],
                "created_at": row[3].isoformat() if row[3] else None,
                "updated_at": row[4].isoformat() if row[4] else None,
            })

        def delete(self, request: Request, hanko_user_id: str) -> Response:
            """Delete a user mapping."""
            error = self.check_admin(request)
            if error:
                return error

            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    DELETE FROM hanko_user_mappings
                    WHERE hanko_user_id = %s AND app_name = %s
                    RETURNING hanko_user_id
                    """,
                    [hanko_user_id, app_name],
                )
                row = cursor.fetchone()

            if not row:
                return Response(
                    {"detail": f"Mapping not found for hanko_user_id: {hanko_user_id}"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            admin_email = "unknown"
            if hasattr(request, 'hotosm') and request.hotosm.user:
                admin_email = request.hotosm.user.email
            logger.info(f"Admin {admin_email} deleted mapping: {hanko_user_id}")

            return Response(status=status.HTTP_204_NO_CONTENT)

    return [
        path("mappings", MappingsListCreateView.as_view(), name="admin-mappings-list"),
        path("mappings/<str:hanko_user_id>", MappingDetailView.as_view(), name="admin-mapping-detail"),
    ]
