"""
Admin routes for managing user mappings across apps.

This module provides proxy endpoints that forward admin requests to
individual apps (portal, drone-tm, fair, oam), plus a dashboard
with Hanko user statistics.
"""

from datetime import datetime, timedelta
from typing import Annotated, Any

import asyncpg
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

            # Handle non-2xx responses
            if response.status_code >= 400:
                try:
                    error_data = response.json()
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=error_data.get("detail", f"Error from {app}"),
                    )
                except ValueError:
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Error from {app}: {response.text[:200]}",
                    )

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


# =============================================================================
# Dashboard Statistics Endpoints
# =============================================================================


async def get_hanko_connection() -> asyncpg.Connection:
    """Get a connection to the Hanko database."""
    return await asyncpg.connect(settings.hanko_db_url)


def get_date_range(period: str, start_date: str | None, end_date: str | None) -> tuple:
    """Calculate date range based on period or custom dates."""
    today = datetime.utcnow().date()

    if period == "today":
        return today, today
    elif period == "week":
        week_start = today - timedelta(days=today.weekday())
        return week_start, today
    elif period == "month":
        month_start = today.replace(day=1)
        return month_start, today
    elif period == "year":
        year_start = today.replace(month=1, day=1)
        return year_start, today
    elif period == "custom" and start_date and end_date:
        return datetime.strptime(start_date, "%Y-%m-%d").date(), datetime.strptime(end_date, "%Y-%m-%d").date()
    else:
        # Default: all time
        return None, None


@router.get("/stats/overview")
async def get_stats_overview(
    admin: AdminUser,
    period: str = Query("all", regex="^(all|today|week|month|year|custom)$"),
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
) -> dict[str, Any]:
    """Get overview statistics for the dashboard with optional date filtering."""
    conn = await get_hanko_connection()
    try:
        date_from, date_to = get_date_range(period, start_date, end_date)

        # Build date filter clause
        if date_from and date_to:
            date_filter = "WHERE created_at::date >= $1 AND created_at::date <= $2"
            date_params = [date_from, date_to]
        else:
            date_filter = ""
            date_params = []

        # Total users (in period)
        if date_params:
            total_users = await conn.fetchval(
                f"SELECT COUNT(*) FROM users {date_filter}",
                *date_params
            )
        else:
            total_users = await conn.fetchval("SELECT COUNT(*) FROM users")

        # For comparison, always get these fixed periods
        today = datetime.utcnow().date()
        users_today = await conn.fetchval(
            "SELECT COUNT(*) FROM users WHERE created_at::date = $1",
            today
        )

        week_start = today - timedelta(days=today.weekday())
        users_this_week = await conn.fetchval(
            "SELECT COUNT(*) FROM users WHERE created_at::date >= $1",
            week_start
        )

        month_start = today.replace(day=1)
        users_this_month = await conn.fetchval(
            "SELECT COUNT(*) FROM users WHERE created_at::date >= $1",
            month_start
        )

        # Users with verified email (in period)
        if date_params:
            verified_emails = await conn.fetchval(
                f"""
                SELECT COUNT(DISTINCT e.user_id)
                FROM emails e
                JOIN users u ON e.user_id = u.id
                WHERE e.verified = true AND u.created_at::date >= $1 AND u.created_at::date <= $2
                """,
                *date_params
            )
            google_users = await conn.fetchval(
                f"""
                SELECT COUNT(DISTINCT i.user_id)
                FROM identities i
                JOIN users u ON i.user_id = u.id
                WHERE i.provider_id = 'google' AND u.created_at::date >= $1 AND u.created_at::date <= $2
                """,
                *date_params
            )
        else:
            verified_emails = await conn.fetchval(
                "SELECT COUNT(DISTINCT user_id) FROM emails WHERE verified = true"
            )
            google_users = await conn.fetchval(
                "SELECT COUNT(DISTINCT user_id) FROM identities WHERE provider_id = 'google'"
            )

        # Total all-time for reference
        total_all_time = await conn.fetchval("SELECT COUNT(*) FROM users")

        return {
            "total_users": total_users or 0,
            "total_all_time": total_all_time or 0,
            "users_today": users_today or 0,
            "users_this_week": users_this_week or 0,
            "users_this_month": users_this_month or 0,
            "verified_emails": verified_emails or 0,
            "google_users": google_users or 0,
            "period": period,
            "date_from": str(date_from) if date_from else None,
            "date_to": str(date_to) if date_to else None,
        }
    finally:
        await conn.close()


@router.get("/stats/registrations")
async def get_registration_stats(
    admin: AdminUser,
    period: str = Query("month", regex="^(today|week|month|year|custom)$"),
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
) -> dict[str, Any]:
    """Get daily registration counts for the selected period."""
    conn = await get_hanko_connection()
    try:
        date_from, date_to = get_date_range(period, start_date, end_date)

        if not date_from or not date_to:
            # Default to last 30 days if no valid range
            date_to = datetime.utcnow().date()
            date_from = date_to - timedelta(days=30)

        rows = await conn.fetch(
            """
            SELECT
                created_at::date as date,
                COUNT(*) as count
            FROM users
            WHERE created_at::date >= $1 AND created_at::date <= $2
            GROUP BY created_at::date
            ORDER BY date ASC
            """,
            date_from,
            date_to
        )

        return {
            "period": period,
            "date_from": str(date_from),
            "date_to": str(date_to),
            "data": [
                {"date": str(row["date"]), "count": row["count"]}
                for row in rows
            ],
        }
    finally:
        await conn.close()


@router.get("/stats/registrations/monthly")
async def get_monthly_registration_stats(
    admin: AdminUser,
    months: int = Query(12, ge=1, le=24),
) -> dict[str, Any]:
    """Get monthly registration counts."""
    conn = await get_hanko_connection()
    try:
        rows = await conn.fetch(
            """
            SELECT
                DATE_TRUNC('month', created_at) as month,
                COUNT(*) as count
            FROM users
            WHERE created_at >= NOW() - INTERVAL '1 month' * $1
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month ASC
            """,
            months
        )

        return {
            "months": months,
            "data": [
                {"month": row["month"].strftime("%Y-%m"), "count": row["count"]}
                for row in rows
            ],
        }
    finally:
        await conn.close()


@router.get("/stats/auth-methods")
async def get_auth_method_stats(admin: AdminUser) -> dict[str, Any]:
    """Get breakdown of authentication methods used."""
    conn = await get_hanko_connection()
    try:
        # Users with password
        password_users = await conn.fetchval(
            "SELECT COUNT(*) FROM password_credentials"
        )

        # Users with Google
        google_users = await conn.fetchval(
            """
            SELECT COUNT(DISTINCT user_id)
            FROM identities
            WHERE provider_id = 'google'
            """
        )

        # Total users for percentage calculation
        total_users = await conn.fetchval("SELECT COUNT(*) FROM users")

        return {
            "password": password_users or 0,
            "google": google_users or 0,
            "total": total_users or 0,
        }
    finally:
        await conn.close()


@router.get("/stats/recent-users")
async def get_recent_users(
    admin: AdminUser,
    limit: int = Query(10, ge=1, le=50),
) -> dict[str, Any]:
    """Get the most recently registered users."""
    conn = await get_hanko_connection()
    try:
        rows = await conn.fetch(
            """
            SELECT
                u.id,
                u.created_at,
                e.address as email,
                e.verified
            FROM users u
            LEFT JOIN emails e ON u.id = e.user_id
            ORDER BY u.created_at DESC
            LIMIT $1
            """,
            limit
        )

        return {
            "users": [
                {
                    "id": str(row["id"]),
                    "email": row["email"],
                    "verified": row["verified"],
                    "created_at": row["created_at"].isoformat(),
                }
                for row in rows
            ],
        }
    finally:
        await conn.close()
