"""Django REST Framework views for managing user mappings.

This module provides admin views for CRUD operations on the
hanko_user_mappings table, designed for Django applications.
"""

import os
from contextlib import suppress

from django.conf import settings
from django.db import connection
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from hotosm_auth.logger import get_logger

logger = get_logger(__name__)


def get_admin_emails() -> list[str]:
    """Get admin emails from environment/settings."""
    admin_emails = getattr(settings, "ADMIN_EMAILS", None)
    if admin_emails is None:
        admin_emails = os.environ.get("ADMIN_EMAILS", "")
    return [e.strip().lower() for e in admin_emails.split(",") if e.strip()]


def is_admin_user(request: Request) -> bool:
    """Check if the current user is an admin based on email."""
    admin_emails = get_admin_emails()
    if not admin_emails:
        return False

    if hasattr(request, "hotosm") and request.hotosm.user:
        user_email = request.hotosm.user.email
        if user_email and user_email.lower() in admin_emails:
            return True

    return bool(
        request.user
        and hasattr(request.user, "email")
        and request.user.email
        and request.user.email.lower() in admin_emails
    )


def _get_admin_email(request: Request) -> str:
    """Extract admin email from request when available."""
    if hasattr(request, "hotosm") and request.hotosm.user:
        return request.hotosm.user.email
    return "unknown"


def _load_user_model(user_model: str | None):
    """Resolve configured user model class for enrichment."""
    if not user_model:
        return None

    from django.apps import apps

    try:
        app_label, model_name = user_model.split(".")
        return apps.get_model(app_label, model_name)
    except Exception as exc:  # noqa: BLE001
        logger.warning(f"Could not load user model {user_model}: {exc}")
        return None


class _AdminPermissionMixin:
    """Mixin to check admin permissions."""

    def check_admin(self, request: Request) -> Response | None:
        """Check if user is admin, return error response if not."""
        if not is_admin_user(request):
            return Response(
                {"detail": "Admin access required"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return None


class _MappingsListCreateView(_AdminPermissionMixin, APIView):
    """List all user mappings (GET) or create a new one (POST)."""

    authentication_classes = []
    permission_classes = []

    app_name = "default"
    user_model_cls = None
    user_id_column = "id"
    user_name_column = "username"
    user_email_column = "email"

    def get(self, request: Request) -> Response:
        """List all user mappings (paginated)."""
        error = self.check_admin(request)
        if error:
            return error

        page = int(request.query_params.get("page", 1))
        page_size = min(int(request.query_params.get("page_size", 50)), 100)
        offset = (page - 1) * page_size

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT COUNT(*) FROM hanko_user_mappings WHERE app_name = %s",
                [self.app_name],
            )
            total = cursor.fetchone()[0]

            cursor.execute(
                """
                SELECT hanko_user_id, app_user_id, app_name, created_at, updated_at
                FROM hanko_user_mappings
                WHERE app_name = %s
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
                """,
                [self.app_name, page_size, offset],
            )
            rows = cursor.fetchall()

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

            if self.user_model_cls and row[1]:
                try:
                    lookup_value = row[1]
                    with suppress(ValueError, TypeError):
                        lookup_value = int(row[1])

                    user = self.user_model_cls.objects.filter(
                        **{self.user_id_column: lookup_value}
                    ).first()
                    if user:
                        item["app_username"] = getattr(
                            user, self.user_name_column, None
                        )
                        item["app_email"] = getattr(user, self.user_email_column, None)
                except Exception as exc:  # noqa: BLE001
                    logger.debug(f"Could not enrich user {row[1]}: {exc}")

            items.append(item)

        logger.info(
            "Admin %s listed mappings (page=%s, total=%s)",
            _get_admin_email(request),
            page,
            total,
        )

        return Response(
            {
                "items": items,
                "total": total,
                "page": page,
                "page_size": page_size,
            }
        )

    def post(self, request: Request) -> Response:
        """Create a new user mapping."""
        error = self.check_admin(request)
        if error:
            return error

        hanko_user_id = request.data.get("hanko_user_id")
        app_user_id = request.data.get("app_user_id")

        if not hanko_user_id or not app_user_id:
            return Response(
                {"detail": "hanko_user_id and app_user_id are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT 1 FROM hanko_user_mappings
                WHERE hanko_user_id = %s AND app_name = %s
                """,
                [hanko_user_id, self.app_name],
            )
            if cursor.fetchone():
                return Response(
                    {
                        "detail": (
                            f"Mapping already exists for hanko_user_id: {hanko_user_id}"
                        )
                    },
                    status=status.HTTP_409_CONFLICT,
                )

            cursor.execute(
                """
                INSERT INTO hanko_user_mappings (
                    hanko_user_id, app_user_id, app_name, created_at
                )
                VALUES (%s, %s, %s, NOW())
                RETURNING
                    hanko_user_id,
                    app_user_id,
                    app_name,
                    created_at,
                    updated_at
                """,
                [hanko_user_id, app_user_id, self.app_name],
            )
            row = cursor.fetchone()

        logger.info(
            "Admin %s created mapping: %s -> %s",
            _get_admin_email(request),
            hanko_user_id,
            app_user_id,
        )

        return Response(
            {
                "hanko_user_id": row[0],
                "app_user_id": row[1],
                "app_name": row[2],
                "created_at": row[3].isoformat() if row[3] else None,
                "updated_at": row[4].isoformat() if row[4] else None,
            },
            status=status.HTTP_201_CREATED,
        )


class _MappingDetailView(_AdminPermissionMixin, APIView):
    """Get, update, or delete a single mapping."""

    authentication_classes = []
    permission_classes = []
    app_name = "default"

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
                [hanko_user_id, self.app_name],
            )
            row = cursor.fetchone()

        if not row:
            return Response(
                {"detail": f"Mapping not found for hanko_user_id: {hanko_user_id}"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "hanko_user_id": row[0],
                "app_user_id": row[1],
                "app_name": row[2],
                "created_at": row[3].isoformat() if row[3] else None,
                "updated_at": row[4].isoformat() if row[4] else None,
            }
        )

    def put(self, request: Request, hanko_user_id: str) -> Response:
        """Update an existing user mapping."""
        error = self.check_admin(request)
        if error:
            return error

        app_user_id = request.data.get("app_user_id")
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
                RETURNING
                    hanko_user_id,
                    app_user_id,
                    app_name,
                    created_at,
                    updated_at
                """,
                [app_user_id, hanko_user_id, self.app_name],
            )
            row = cursor.fetchone()

        if not row:
            return Response(
                {"detail": f"Mapping not found for hanko_user_id: {hanko_user_id}"},
                status=status.HTTP_404_NOT_FOUND,
            )

        logger.info(
            "Admin %s updated mapping: %s -> %s",
            _get_admin_email(request),
            hanko_user_id,
            app_user_id,
        )

        return Response(
            {
                "hanko_user_id": row[0],
                "app_user_id": row[1],
                "app_name": row[2],
                "created_at": row[3].isoformat() if row[3] else None,
                "updated_at": row[4].isoformat() if row[4] else None,
            }
        )

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
                [hanko_user_id, self.app_name],
            )
            row = cursor.fetchone()

        if not row:
            return Response(
                {"detail": f"Mapping not found for hanko_user_id: {hanko_user_id}"},
                status=status.HTTP_404_NOT_FOUND,
            )

        logger.info(
            "Admin %s deleted mapping: %s",
            _get_admin_email(request),
            hanko_user_id,
        )
        return Response(status=status.HTTP_204_NO_CONTENT)


def create_admin_urlpatterns(
    app_name: str = "default",
    user_model: str | None = None,
    user_id_column: str = "id",
    user_name_column: str = "username",
    user_email_column: str = "email",
) -> list:
    """Create URL patterns for admin mapping endpoints."""
    from django.urls import path

    user_model_cls = _load_user_model(user_model)

    mappings_view = type(
        "MappingsListCreateView",
        (_MappingsListCreateView,),
        {
            "app_name": app_name,
            "user_model_cls": user_model_cls,
            "user_id_column": user_id_column,
            "user_name_column": user_name_column,
            "user_email_column": user_email_column,
        },
    )

    detail_view = type(
        "MappingDetailView",
        (_MappingDetailView,),
        {"app_name": app_name},
    )

    return [
        path("mappings", mappings_view.as_view(), name="admin-mappings-list"),
        path(
            "mappings/<str:hanko_user_id>",
            detail_view.as_view(),
            name="admin-mappings-detail",
        ),
    ]
