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
    period: str = Query("month", regex="^(all|today|week|month|year|custom)$"),
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
) -> dict[str, Any]:
    """Get daily registration counts for the selected period."""
    conn = await get_hanko_connection()
    try:
        date_to = datetime.utcnow().date()

        if period == "all":
            # For "all", get the first user registration date
            first_user = await conn.fetchval(
                "SELECT MIN(created_at::date) FROM users"
            )
            if first_user:
                date_from = first_user
            else:
                date_from = date_to - timedelta(days=30)
        else:
            date_from, date_to_calc = get_date_range(period, start_date, end_date)
            if date_to_calc:
                date_to = date_to_calc
            if not date_from:
                date_from = date_to - timedelta(days=30)

        # Use generate_series to get ALL days in range, even those with 0 registrations
        rows = await conn.fetch(
            """
            SELECT
                d.date,
                COALESCE(COUNT(u.id), 0) as count
            FROM generate_series($1::date, $2::date, '1 day'::interval) AS d(date)
            LEFT JOIN users u ON u.created_at::date = d.date
            GROUP BY d.date
            ORDER BY d.date ASC
            """,
            date_from,
            date_to
        )

        return {
            "period": period,
            "date_from": str(date_from),
            "date_to": str(date_to),
            "data": [
                {"date": str(row["date"].date() if hasattr(row["date"], 'date') else row["date"]), "count": row["count"]}
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
async def get_auth_method_stats(
    admin: AdminUser,
    period: str = Query("all", regex="^(all|today|week|month|year|custom)$"),
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
) -> dict[str, Any]:
    """Get breakdown of authentication methods used."""
    conn = await get_hanko_connection()
    try:
        date_from, date_to = get_date_range(period, start_date, end_date)

        if date_from and date_to:
            # Users with password (filtered by user creation date)
            password_users = await conn.fetchval(
                """
                SELECT COUNT(*)
                FROM password_credentials pc
                JOIN users u ON pc.user_id = u.id
                WHERE u.created_at::date >= $1 AND u.created_at::date <= $2
                """,
                date_from, date_to
            )

            # Users with Google (filtered by user creation date)
            google_users = await conn.fetchval(
                """
                SELECT COUNT(DISTINCT i.user_id)
                FROM identities i
                JOIN users u ON i.user_id = u.id
                WHERE i.provider_id = 'google'
                AND u.created_at::date >= $1 AND u.created_at::date <= $2
                """,
                date_from, date_to
            )

            # Total users in period
            total_users = await conn.fetchval(
                "SELECT COUNT(*) FROM users WHERE created_at::date >= $1 AND created_at::date <= $2",
                date_from, date_to
            )
        else:
            # All time
            password_users = await conn.fetchval(
                "SELECT COUNT(*) FROM password_credentials"
            )

            google_users = await conn.fetchval(
                """
                SELECT COUNT(DISTINCT user_id)
                FROM identities
                WHERE provider_id = 'google'
                """
            )

            total_users = await conn.fetchval("SELECT COUNT(*) FROM users")

        return {
            "password": password_users or 0,
            "google": google_users or 0,
            "total": total_users or 0,
        }
    finally:
        await conn.close()


@router.get("/stats/apps")
async def get_app_stats(
    admin: AdminUser,
    request: Request,
    period: str = Query("all", regex="^(all|today|week|month|year|custom)$"),
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
) -> dict[str, Any]:
    """Get user mapping stats per app, filtered by period."""
    date_from, date_to = get_date_range(period, start_date, end_date)

    app_stats = {}

    for app_name in settings.app_urls.keys():
        try:
            # Fetch mappings from each app
            result = await proxy_request(
                method="GET",
                app=app_name,
                path="mappings",
                request=request,
                params={"page": 1, "page_size": 100},
            )

            if result and isinstance(result, dict):
                items = result.get("items", [])
                total = result.get("total", 0)

                # Filter by date if period specified
                if date_from and date_to:
                    filtered_count = 0
                    for item in items:
                        created_at = item.get("created_at")
                        if created_at:
                            try:
                                item_date = datetime.fromisoformat(created_at.replace("Z", "+00:00")).date()
                                if date_from <= item_date <= date_to:
                                    filtered_count += 1
                            except (ValueError, AttributeError):
                                pass

                    app_stats[app_name] = {
                        "total": total,
                        "period_count": filtered_count,
                    }
                else:
                    app_stats[app_name] = {
                        "total": total,
                        "period_count": total,
                    }
            else:
                app_stats[app_name] = {"total": 0, "period_count": 0}

        except HTTPException:
            # App endpoint not implemented or returned error
            app_stats[app_name] = {"total": 0, "period_count": 0, "unavailable": True}
        except Exception:
            # App might be unavailable
            app_stats[app_name] = {"total": 0, "period_count": 0, "unavailable": True}

    return {
        "period": period,
        "date_from": str(date_from) if date_from else None,
        "date_to": str(date_to) if date_to else None,
        "apps": app_stats,
    }


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


@router.get("/stats/users/search")
async def search_users(
    admin: AdminUser,
    request: Request,
    email: str | None = Query(None, description="Search by email (partial match)"),
    date_from: str | None = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: str | None = Query(None, description="Filter to date (YYYY-MM-DD)"),
    verified: str | None = Query(None, regex="^(true|false|all)$", description="Filter by verified status"),
    auth_method: str | None = Query(None, regex="^(password|google|all)$", description="Filter by auth method"),
    app: str | None = Query(None, description="Filter by app registration"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> dict[str, Any]:
    """Search users with filters."""
    conn = await get_hanko_connection()
    try:
        # Build dynamic query
        conditions = []
        params = []
        param_idx = 1

        if email:
            conditions.append(f"e.address ILIKE ${param_idx}")
            params.append(f"%{email}%")
            param_idx += 1

        if date_from:
            conditions.append(f"u.created_at::date >= ${param_idx}")
            params.append(datetime.strptime(date_from, "%Y-%m-%d").date())
            param_idx += 1

        if date_to:
            conditions.append(f"u.created_at::date <= ${param_idx}")
            params.append(datetime.strptime(date_to, "%Y-%m-%d").date())
            param_idx += 1

        if verified and verified != "all":
            conditions.append(f"e.verified = ${param_idx}")
            params.append(verified == "true")
            param_idx += 1

        # Auth method filter requires a subquery
        auth_join = ""
        if auth_method and auth_method != "all":
            if auth_method == "google":
                auth_join = "INNER JOIN identities i ON u.id = i.user_id AND i.provider_id = 'google'"
            elif auth_method == "password":
                auth_join = "INNER JOIN password_credentials pc ON u.id = pc.user_id"

        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

        # Count total
        count_query = f"""
            SELECT COUNT(DISTINCT u.id)
            FROM users u
            LEFT JOIN emails e ON u.id = e.user_id
            {auth_join}
            {where_clause}
        """
        total = await conn.fetchval(count_query, *params)

        # Get paginated results
        offset = (page - 1) * page_size

        # Add auth method info to results
        data_query = f"""
            SELECT DISTINCT
                u.id,
                u.created_at,
                e.address as email,
                e.verified,
                EXISTS(SELECT 1 FROM password_credentials pc WHERE pc.user_id = u.id) as has_password,
                EXISTS(SELECT 1 FROM identities i WHERE i.user_id = u.id AND i.provider_id = 'google') as has_google
            FROM users u
            LEFT JOIN emails e ON u.id = e.user_id
            {auth_join}
            {where_clause}
            ORDER BY u.created_at DESC
            LIMIT ${param_idx} OFFSET ${param_idx + 1}
        """
        params.extend([page_size, offset])

        rows = await conn.fetch(data_query, *params)

        # Get app registrations for each user if needed
        user_ids = [row["id"] for row in rows]
        user_apps = {}

        if user_ids:
            # Query each app for mappings
            for app_name in settings.app_urls.keys():
                try:
                    result = await proxy_request(
                        method="GET",
                        app=app_name,
                        path="mappings",
                        request=request,
                        params={"page": 1, "page_size": 100},
                    )
                    if result and isinstance(result, dict):
                        for item in result.get("items", []):
                            hanko_id = item.get("hanko_user_id")
                            if hanko_id:
                                if hanko_id not in user_apps:
                                    user_apps[hanko_id] = []
                                user_apps[hanko_id].append(app_name)
                except Exception:
                    pass  # App unavailable, skip

        # Filter by app if specified
        users_list = []
        for row in rows:
            user_id = str(row["id"])
            apps = user_apps.get(user_id, [])

            # Skip if app filter is set and user doesn't have that app
            if app and app != "all" and app not in apps:
                continue

            auth = []
            if row["has_password"]:
                auth.append("email")
            if row["has_google"]:
                auth.append("google")

            users_list.append({
                "id": user_id,
                "email": row["email"],
                "verified": row["verified"],
                "auth_methods": auth,
                "apps": apps,
                "created_at": row["created_at"].isoformat(),
            })

        # Adjust total if filtering by app (approximate)
        if app and app != "all":
            total = len(users_list)

        return {
            "users": users_list,
            "total": total or 0,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size if total else 0,
        }
    finally:
        await conn.close()
