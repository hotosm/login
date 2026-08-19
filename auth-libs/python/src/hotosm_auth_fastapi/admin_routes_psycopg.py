"""FastAPI admin routes for managing user mappings (psycopg version).

This module provides the same functionality as admin_routes.py
but uses psycopg3 directly instead of SQLAlchemy.

Usage:
    from fastapi import FastAPI
    from hotosm_auth import AuthConfig
    from hotosm_auth_fastapi import init_auth, create_admin_mappings_router_psycopg
    from app.db.database import get_db

    app = FastAPI()

    # Initialize auth
    config = AuthConfig.from_env()
    init_auth(config)

    # Create and register admin router
    admin_router = create_admin_mappings_router_psycopg(get_db, app_name="drone-tm")
    app.include_router(admin_router)
"""

from typing import Annotated, Any, Callable

from fastapi import APIRouter, Depends, HTTPException, Query, status
from psycopg import sql

from hotosm_auth.logger import get_logger
from hotosm_auth.schemas.admin import (
    MappingCreate,
    MappingListResponse,
    MappingResponse,
    MappingUpdate,
)
from hotosm_auth_fastapi.admin import AdminUser

logger = get_logger(__name__)


def _build_list_mappings_query(
    user_table: str | None,
    user_name_column: str,
    user_email_column: str,
    user_id_column: str,
) -> str | sql.Composed:
    """Build SQL query for listing mappings with optional user enrichment."""
    if user_table:
        return sql.SQL(
            """
            SELECT
                m.hanko_user_id,
                m.app_user_id,
                m.app_name,
                m.created_at,
                m.updated_at,
                u.{user_name_column} AS app_username,
                u.{user_email_column} AS app_email
            FROM hanko_user_mappings m
            LEFT JOIN {user_table} u
                ON m.app_user_id = u.{user_id_column}::text
            WHERE m.app_name = %s
            ORDER BY m.created_at DESC
            LIMIT %s OFFSET %s
            """
        ).format(
            user_name_column=sql.Identifier(user_name_column),
            user_email_column=sql.Identifier(user_email_column),
            user_table=sql.Identifier(user_table),
            user_id_column=sql.Identifier(user_id_column),
        )

    return """
        SELECT hanko_user_id, app_user_id, app_name, created_at, updated_at,
               NULL as app_username, NULL as app_email
        FROM hanko_user_mappings
        WHERE app_name = %s
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s
    """


def create_admin_mappings_router_psycopg(  # noqa: C901, PLR0915, CCR001
    get_db: Callable,
    app_name: str = "default",
    user_table: str | None = None,
    user_id_column: str = "id",
    user_name_column: str = "name",
    user_email_column: str = "email",
) -> APIRouter:
    """Create an admin router for managing user mappings (psycopg version).

    This factory function creates a FastAPI router with endpoints
    for CRUD operations on the hanko_user_mappings table.

    Args:
        get_db: FastAPI dependency that yields a psycopg AsyncConnection.
        app_name: Application name to filter mappings by (default: "default")
        user_table: Optional table name for user enrichment (e.g., "users")
        user_id_column: Column name for user ID in user_table (default: "id")
        user_name_column: Column name for username in user_table (default: "name")
        user_email_column: Column name for email in user_table (default: "email")

    Returns:
        APIRouter: Router with admin endpoints
    """
    router = APIRouter(prefix="/admin", tags=["Admin"])
    db_dep = Annotated[Any, Depends(get_db)]

    @router.get("/mappings", response_model=MappingListResponse)
    async def list_mappings(
        admin: AdminUser,
        db: db_dep,
        page: int = Query(1, ge=1, description="Page number"),
        page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    ) -> MappingListResponse:
        """List all user mappings (paginated)."""
        offset = (page - 1) * page_size

        async with db.cursor() as cur:
            # Get total count
            await cur.execute(
                "SELECT COUNT(*) FROM hanko_user_mappings WHERE app_name = %s",
                (app_name,),
            )
            row = await cur.fetchone()
            total = row[0] if row else 0

            query = _build_list_mappings_query(
                user_table,
                user_name_column,
                user_email_column,
                user_id_column,
            )
            await cur.execute(query, (app_name, page_size, offset))
            rows = await cur.fetchall()

        items = [
            MappingResponse(
                hanko_user_id=row[0],
                app_user_id=row[1],
                app_name=row[2],
                created_at=row[3],
                updated_at=row[4],
                app_username=row[5],
                app_email=row[6],
            )
            for row in rows
        ]

        logger.info(f"Admin {admin.email} listed mappings (page={page}, total={total})")

        return MappingListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
        )

    @router.get("/mappings/{hanko_user_id}", response_model=MappingResponse)
    async def get_mapping(
        hanko_user_id: str,
        admin: AdminUser,
        db: db_dep,
    ) -> MappingResponse:
        """Get a single user mapping by Hanko user ID."""
        async with db.cursor() as cur:
            await cur.execute(
                """
                SELECT hanko_user_id, app_user_id, app_name, created_at, updated_at
                FROM hanko_user_mappings
                WHERE hanko_user_id = %s AND app_name = %s
                """,
                (hanko_user_id, app_name),
            )
            row = await cur.fetchone()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mapping not found for hanko_user_id: {hanko_user_id}",
            )

        logger.info(f"Admin {admin.email} retrieved mapping {hanko_user_id}")

        return MappingResponse(
            hanko_user_id=row[0],
            app_user_id=row[1],
            app_name=row[2],
            created_at=row[3],
            updated_at=row[4],
        )

    @router.post(
        "/mappings", response_model=MappingResponse, status_code=status.HTTP_201_CREATED
    )
    async def create_mapping(
        data: MappingCreate,
        admin: AdminUser,
        db: db_dep,
    ) -> MappingResponse:
        """Create a new user mapping."""
        async with db.cursor() as cur:
            # Check if mapping already exists
            await cur.execute(
                """
                SELECT 1 FROM hanko_user_mappings
                WHERE hanko_user_id = %s AND app_name = %s
                """,
                (data.hanko_user_id, app_name),
            )
            if await cur.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Mapping already exists for "
                        f"hanko_user_id: {data.hanko_user_id}"
                    ),
                )

            # Create mapping
            await cur.execute(
                """
                INSERT INTO hanko_user_mappings (
                    hanko_user_id, app_user_id, app_name, created_at
                )
                VALUES (%s, %s, %s, NOW())
                RETURNING hanko_user_id, app_user_id, app_name, created_at, updated_at
                """,
                (data.hanko_user_id, data.app_user_id, app_name),
            )
            row = await cur.fetchone()

        logger.info(
            "Admin %s created mapping: %s -> %s",
            admin.email,
            data.hanko_user_id,
            data.app_user_id,
        )

        return MappingResponse(
            hanko_user_id=row[0],
            app_user_id=row[1],
            app_name=row[2],
            created_at=row[3],
            updated_at=row[4],
        )

    @router.put("/mappings/{hanko_user_id}", response_model=MappingResponse)
    async def update_mapping(
        hanko_user_id: str,
        data: MappingUpdate,
        admin: AdminUser,
        db: db_dep,
    ) -> MappingResponse:
        """Update an existing user mapping."""
        async with db.cursor() as cur:
            await cur.execute(
                """
                UPDATE hanko_user_mappings
                SET app_user_id = %s, updated_at = NOW()
                WHERE hanko_user_id = %s AND app_name = %s
                RETURNING hanko_user_id, app_user_id, app_name, created_at, updated_at
                """,
                (data.app_user_id, hanko_user_id, app_name),
            )
            row = await cur.fetchone()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mapping not found for hanko_user_id: {hanko_user_id}",
            )

        logger.info(
            "Admin %s updated mapping: %s -> %s",
            admin.email,
            hanko_user_id,
            data.app_user_id,
        )

        return MappingResponse(
            hanko_user_id=row[0],
            app_user_id=row[1],
            app_name=row[2],
            created_at=row[3],
            updated_at=row[4],
        )

    @router.delete("/mappings/{hanko_user_id}", status_code=status.HTTP_204_NO_CONTENT)
    async def delete_mapping(
        hanko_user_id: str,
        admin: AdminUser,
        db: db_dep,
    ) -> None:
        """Delete a user mapping."""
        async with db.cursor() as cur:
            await cur.execute(
                """
                DELETE FROM hanko_user_mappings
                WHERE hanko_user_id = %s AND app_name = %s
                RETURNING hanko_user_id
                """,
                (hanko_user_id, app_name),
            )
            row = await cur.fetchone()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mapping not found for hanko_user_id: {hanko_user_id}",
            )

        logger.info(f"Admin {admin.email} deleted mapping: {hanko_user_id}")

    return router
