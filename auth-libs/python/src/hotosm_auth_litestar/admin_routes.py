"""Litestar admin routes for managing user mappings (psycopg version)."""

from collections.abc import Callable
from typing import Any

from litestar import Router, delete, get, post, put
from litestar.di import Provide
from litestar.exceptions import HTTPException
from litestar.params import Parameter
from litestar.status_codes import (
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
    HTTP_404_NOT_FOUND,
    HTTP_409_CONFLICT,
)
from psycopg import sql

from hotosm_auth.logger import get_logger
from hotosm_auth.schemas.admin import (
    MappingCreate,
    MappingListResponse,
    MappingResponse,
    MappingUpdate,
)
from hotosm_auth_litestar.admin import AdminUser, require_admin

logger = get_logger(__name__)
_LIST_ROW_USERNAME_INDEX = 5
_LIST_ROW_EMAIL_INDEX = 6


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


def _mapping_response_from_row(row: tuple) -> MappingResponse:
    """Convert a DB row tuple into a MappingResponse."""
    return MappingResponse(
        hanko_user_id=row[0],
        app_user_id=row[1],
        app_name=row[2],
        created_at=row[3],
        updated_at=row[4],
        app_username=(
            row[_LIST_ROW_USERNAME_INDEX]
            if len(row) > _LIST_ROW_USERNAME_INDEX
            else None
        ),
        app_email=(
            row[_LIST_ROW_EMAIL_INDEX] if len(row) > _LIST_ROW_EMAIL_INDEX else None
        ),
    )


def create_admin_mappings_router(  # noqa: C901, PLR0915
    get_db: Callable,
    app_name: str = "default",
    user_table: str | None = None,
    user_id_column: str = "id",
    user_name_column: str = "name",
    user_email_column: str = "email",
) -> Router:
    """Create a Litestar router for mapping CRUD using psycopg."""

    @get("/mappings")
    async def list_mappings(
        admin_user: AdminUser,
        db: Any,
        page: int = Parameter(ge=1, default=1),
        page_size: int = Parameter(ge=1, le=100, default=50),
    ) -> MappingListResponse:
        """List mappings for the configured application."""
        offset = (page - 1) * page_size

        async with db.cursor() as cur:
            await cur.execute(
                "SELECT COUNT(*) FROM hanko_user_mappings WHERE app_name = %s",
                (app_name,),
            )
            count_row = await cur.fetchone()
            total = count_row[0] if count_row else 0

            query = _build_list_mappings_query(
                user_table,
                user_name_column,
                user_email_column,
                user_id_column,
            )
            await cur.execute(query, (app_name, page_size, offset))
            rows = await cur.fetchall()

        logger.info(
            "Admin %s listed mappings (page=%s, total=%s)",
            admin_user.email,
            page,
            total,
        )

        return MappingListResponse(
            items=[_mapping_response_from_row(row) for row in rows],
            total=total,
            page=page,
            page_size=page_size,
        )

    @get("/mappings/{hanko_user_id:str}")
    async def get_mapping(
        hanko_user_id: str,
        admin_user: AdminUser,
        db: Any,
    ) -> MappingResponse:
        """Get a mapping by Hanko user ID."""
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
                status_code=HTTP_404_NOT_FOUND,
                detail=f"Mapping not found for hanko_user_id: {hanko_user_id}",
            )

        logger.info("Admin %s retrieved mapping %s", admin_user.email, hanko_user_id)

        return _mapping_response_from_row(row)

    @post("/mappings", status_code=HTTP_201_CREATED)
    async def create_mapping(
        data: MappingCreate,
        admin_user: AdminUser,
        db: Any,
    ) -> MappingResponse:
        """Create a new Hanko-to-app user mapping."""
        async with db.cursor() as cur:
            await cur.execute(
                """
                SELECT 1 FROM hanko_user_mappings
                WHERE hanko_user_id = %s AND app_name = %s
                """,
                (data.hanko_user_id, app_name),
            )
            if await cur.fetchone():
                raise HTTPException(
                    status_code=HTTP_409_CONFLICT,
                    detail=(
                        "Mapping already exists for "
                        f"hanko_user_id: {data.hanko_user_id}"
                    ),
                )

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
            admin_user.email,
            data.hanko_user_id,
            data.app_user_id,
        )

        return _mapping_response_from_row(row)

    @put("/mappings/{hanko_user_id:str}")
    async def update_mapping(
        hanko_user_id: str,
        data: MappingUpdate,
        admin_user: AdminUser,
        db: Any,
    ) -> MappingResponse:
        """Update an existing mapping's application user ID."""
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
                status_code=HTTP_404_NOT_FOUND,
                detail=f"Mapping not found for hanko_user_id: {hanko_user_id}",
            )

        logger.info(
            "Admin %s updated mapping: %s -> %s",
            admin_user.email,
            hanko_user_id,
            data.app_user_id,
        )

        return _mapping_response_from_row(row)

    @delete("/mappings/{hanko_user_id:str}", status_code=HTTP_204_NO_CONTENT)
    async def delete_mapping(
        hanko_user_id: str,
        admin_user: AdminUser,
        db: Any,
    ) -> None:
        """Delete a mapping for the configured application."""
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
                status_code=HTTP_404_NOT_FOUND,
                detail=f"Mapping not found for hanko_user_id: {hanko_user_id}",
            )

        logger.info("Admin %s deleted mapping: %s", admin_user.email, hanko_user_id)

    return Router(
        path="/admin",
        route_handlers=[
            list_mappings,
            get_mapping,
            create_mapping,
            update_mapping,
            delete_mapping,
        ],
        tags=["Admin"],
        dependencies={
            "admin_user": Provide(require_admin),
            "db": Provide(get_db),
        },
    )
