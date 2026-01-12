"""
FastAPI admin routes for managing user mappings (SQLAlchemy version).

Provides a router factory that apps can use to expose admin endpoints
for managing Hanko user mappings.

Usage:
    from fastapi import FastAPI
    from hotosm_auth import AuthConfig
    from hotosm_auth_fastapi import init_auth, create_admin_mappings_router
    from app.database import get_db

    app = FastAPI()

    # Initialize auth
    config = AuthConfig.from_env()
    init_auth(config)

    # Create and register admin router
    admin_router = create_admin_mappings_router(get_db)
    app.include_router(admin_router, prefix="/api")
"""

from typing import Callable

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import text

from hotosm_auth.schemas.admin import (
    MappingResponse,
    MappingListResponse,
    MappingCreate,
    MappingUpdate,
)
from hotosm_auth_fastapi.admin import AdminUser
from hotosm_auth.logger import get_logger

logger = get_logger(__name__)


def create_admin_mappings_router(
    get_db: Callable,
    app_name: str = "default",
) -> APIRouter:
    """Create an admin router for managing user mappings.

    This factory function creates a FastAPI router with endpoints
    for CRUD operations on the hanko_user_mappings table.

    Args:
        get_db: FastAPI dependency that yields a SQLAlchemy AsyncSession.
        app_name: Application name to filter mappings by (default: "default")

    Returns:
        APIRouter: Router with admin endpoints
    """
    router = APIRouter(prefix="/admin", tags=["Admin"])

    @router.get("/mappings", response_model=MappingListResponse)
    async def list_mappings(
        admin: AdminUser,
        db=Depends(get_db),
        page: int = Query(1, ge=1, description="Page number"),
        page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    ) -> MappingListResponse:
        """List all user mappings (paginated)."""
        offset = (page - 1) * page_size

        # Get total count
        count_result = await db.execute(
            text("SELECT COUNT(*) FROM hanko_user_mappings WHERE app_name = :app_name"),
            {"app_name": app_name},
        )
        total = count_result.scalar()

        # Get paginated results
        result = await db.execute(
            text("""
                SELECT hanko_user_id, app_user_id, app_name, created_at, updated_at
                FROM hanko_user_mappings
                WHERE app_name = :app_name
                ORDER BY created_at DESC
                LIMIT :limit OFFSET :offset
            """),
            {"app_name": app_name, "limit": page_size, "offset": offset},
        )
        rows = result.fetchall()

        items = [
            MappingResponse(
                hanko_user_id=row[0],
                app_user_id=row[1],
                app_name=row[2],
                created_at=row[3],
                updated_at=row[4],
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
        db=Depends(get_db),
    ) -> MappingResponse:
        """Get a single user mapping by Hanko user ID."""
        result = await db.execute(
            text("""
                SELECT hanko_user_id, app_user_id, app_name, created_at, updated_at
                FROM hanko_user_mappings
                WHERE hanko_user_id = :hanko_user_id AND app_name = :app_name
            """),
            {"hanko_user_id": hanko_user_id, "app_name": app_name},
        )
        row = result.fetchone()

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

    @router.post("/mappings", response_model=MappingResponse, status_code=status.HTTP_201_CREATED)
    async def create_mapping(
        data: MappingCreate,
        admin: AdminUser,
        db=Depends(get_db),
    ) -> MappingResponse:
        """Create a new user mapping."""
        # Check if mapping already exists
        check_result = await db.execute(
            text("""
                SELECT 1 FROM hanko_user_mappings
                WHERE hanko_user_id = :hanko_user_id AND app_name = :app_name
            """),
            {"hanko_user_id": data.hanko_user_id, "app_name": app_name},
        )
        if check_result.fetchone():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Mapping already exists for hanko_user_id: {data.hanko_user_id}",
            )

        # Create mapping
        result = await db.execute(
            text("""
                INSERT INTO hanko_user_mappings (hanko_user_id, app_user_id, app_name, created_at)
                VALUES (:hanko_user_id, :app_user_id, :app_name, NOW())
                RETURNING hanko_user_id, app_user_id, app_name, created_at, updated_at
            """),
            {"hanko_user_id": data.hanko_user_id, "app_user_id": data.app_user_id, "app_name": app_name},
        )
        row = result.fetchone()

        logger.info(
            f"Admin {admin.email} created mapping: {data.hanko_user_id} -> {data.app_user_id}"
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
        db=Depends(get_db),
    ) -> MappingResponse:
        """Update an existing user mapping."""
        result = await db.execute(
            text("""
                UPDATE hanko_user_mappings
                SET app_user_id = :app_user_id, updated_at = NOW()
                WHERE hanko_user_id = :hanko_user_id AND app_name = :app_name
                RETURNING hanko_user_id, app_user_id, app_name, created_at, updated_at
            """),
            {"app_user_id": data.app_user_id, "hanko_user_id": hanko_user_id, "app_name": app_name},
        )
        row = result.fetchone()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mapping not found for hanko_user_id: {hanko_user_id}",
            )

        logger.info(
            f"Admin {admin.email} updated mapping: {hanko_user_id} -> {data.app_user_id}"
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
        db=Depends(get_db),
    ) -> None:
        """Delete a user mapping."""
        result = await db.execute(
            text("""
                DELETE FROM hanko_user_mappings
                WHERE hanko_user_id = :hanko_user_id AND app_name = :app_name
                RETURNING hanko_user_id
            """),
            {"hanko_user_id": hanko_user_id, "app_name": app_name},
        )
        row = result.fetchone()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mapping not found for hanko_user_id: {hanko_user_id}",
            )

        logger.info(f"Admin {admin.email} deleted mapping: {hanko_user_id}")

    return router
