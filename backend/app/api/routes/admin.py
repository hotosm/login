"""
Admin routes for managing user mappings across apps.

This module provides proxy endpoints that forward admin requests to
individual apps (portal, drone-tm, fair, oam).
"""

from typing import Annotated, Any

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from hotosm_auth_fastapi import get_current_user
from hotosm_auth.models import HankoUser

from app.core.config import settings

router = APIRouter(prefix="/api/admin", tags=["Admin"])


async def require_admin(user: HankoUser = Depends(get_current_user)) -> HankoUser:
    """Verify the current user is an admin."""
    admin_emails = settings.admin_email_list

    if not admin_emails:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access not configured",
        )

    if not user.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access requires verified email",
        )

    if user.email.lower() not in admin_emails:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return user


def get_app_url(app: str) -> str:
    """Get the backend URL for an app."""
    app_urls = settings.app_urls
    if app not in app_urls:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown app: {app}. Available: {list(app_urls.keys())}",
        )
    return app_urls[app]


# Type alias for admin user
AdminUser = Annotated[HankoUser, Depends(require_admin)]


@router.get("/check")
async def check_admin(admin: AdminUser) -> dict[str, Any]:
    """Check if current user is an admin."""
    return {
        "is_admin": True,
        "email": admin.email,
    }


@router.get("/apps")
async def list_apps(admin: AdminUser) -> dict[str, Any]:
    """List available apps for admin management."""
    return {
        "apps": list(settings.app_urls.keys()),
    }


async def proxy_request(
    method: str,
    app: str,
    path: str,
    request: Request,
    params: dict | None = None,
    json_body: dict | None = None,
) -> Any:
    """Proxy a request to an app's admin endpoint."""
    base_url = get_app_url(app)
    url = f"{base_url}/api/admin/{path}"

    # Forward the JWT token
    headers = {}
    auth_header = request.headers.get("Authorization")
    if auth_header:
        headers["Authorization"] = auth_header

    # Also check for cookie
    hanko_cookie = request.cookies.get("hanko")
    if hanko_cookie:
        headers["Cookie"] = f"hanko={hanko_cookie}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.request(
                method=method,
                url=url,
                headers=headers,
                params=params,
                json=json_body,
            )

            # Return the response as-is
            if response.status_code == 204:
                return None

            return response.json()

        except httpx.TimeoutException:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail=f"Request to {app} timed out",
            )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to connect to {app}: {str(e)}",
            )


async def enrich_with_hanko_emails(mappings_data: dict) -> dict:
    """Enrich mappings with Hanko user emails from database."""
    if not mappings_data.get("items"):
        return mappings_data

    # Get all hanko user IDs
    hanko_ids = [item.get("hanko_user_id") for item in mappings_data["items"] if item.get("hanko_user_id")]
    if not hanko_ids:
        return mappings_data

    try:
        import asyncpg

        conn = await asyncpg.connect(settings.hanko_db_url)
        try:
            # Query emails for all users at once
            rows = await conn.fetch(
                """
                SELECT u.id, e.address as email
                FROM users u
                LEFT JOIN emails e ON u.id = e.user_id
                WHERE u.id = ANY($1::uuid[])
                """,
                hanko_ids
            )

            # Build lookup dict
            email_lookup = {str(row["id"]): row["email"] for row in rows}

            # Enrich items
            for item in mappings_data["items"]:
                hanko_user_id = item.get("hanko_user_id")
                if hanko_user_id and hanko_user_id in email_lookup:
                    item["hanko_email"] = email_lookup[hanko_user_id]
        finally:
            await conn.close()
    except Exception as e:
        # Log but don't fail if enrichment fails
        import logging
        logging.warning(f"Failed to enrich with Hanko emails: {e}")

    return mappings_data


@router.get("/{app}/mappings")
async def list_mappings(
    app: str,
    request: Request,
    admin: AdminUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
) -> Any:
    """List user mappings for an app with enriched user data."""
    result = await proxy_request(
        method="GET",
        app=app,
        path="mappings",
        request=request,
        params={"page": page, "page_size": page_size},
    )

    # Enrich with Hanko emails
    if result and isinstance(result, dict):
        result = await enrich_with_hanko_emails(result)

    return result


@router.get("/{app}/mappings/{hanko_user_id}")
async def get_mapping(
    app: str,
    hanko_user_id: str,
    request: Request,
    admin: AdminUser,
) -> Any:
    """Get a specific user mapping."""
    return await proxy_request(
        method="GET",
        app=app,
        path=f"mappings/{hanko_user_id}",
        request=request,
    )


@router.post("/{app}/mappings")
async def create_mapping(
    app: str,
    request: Request,
    admin: AdminUser,
) -> Any:
    """Create a new user mapping."""
    body = await request.json()
    return await proxy_request(
        method="POST",
        app=app,
        path="mappings",
        request=request,
        json_body=body,
    )


@router.put("/{app}/mappings/{hanko_user_id}")
async def update_mapping(
    app: str,
    hanko_user_id: str,
    request: Request,
    admin: AdminUser,
) -> Any:
    """Update a user mapping."""
    body = await request.json()
    return await proxy_request(
        method="PUT",
        app=app,
        path=f"mappings/{hanko_user_id}",
        request=request,
        json_body=body,
    )


@router.delete("/{app}/mappings/{hanko_user_id}")
async def delete_mapping(
    app: str,
    hanko_user_id: str,
    request: Request,
    admin: AdminUser,
) -> None:
    """Delete a user mapping."""
    await proxy_request(
        method="DELETE",
        app=app,
        path=f"mappings/{hanko_user_id}",
        request=request,
    )
