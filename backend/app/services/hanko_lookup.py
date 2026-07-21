"""Lookups against the Hanko database (users/emails live in Hanko, not here)."""

import asyncpg

from app.core.config import settings


async def email_to_user_id(email: str) -> str | None:
    """Resolve an email to its Hanko user id.

    Returns None if the email has no account or Hanko can't be reached.
    """
    try:
        conn = await asyncpg.connect(settings.hanko_db_url)
        try:
            return await conn.fetchval(
                "SELECT user_id::text FROM emails "
                "WHERE lower(address) = lower($1) LIMIT 1",
                email,
            )
        finally:
            await conn.close()
    except Exception:
        return None


async def user_id_to_email(user_id: str) -> str | None:
    """Resolve a Hanko user id to an email address, or None."""
    try:
        conn = await asyncpg.connect(settings.hanko_db_url)
        try:
            return await conn.fetchval(
                "SELECT address FROM emails WHERE user_id = $1::uuid LIMIT 1",
                user_id,
            )
        finally:
            await conn.close()
    except Exception:
        return None


async def user_ids_to_emails(user_ids: list[str]) -> dict[str, str]:
    """Map Hanko user ids to emails in one query. Missing ids are absent."""
    if not user_ids:
        return {}
    try:
        conn = await asyncpg.connect(settings.hanko_db_url)
        try:
            rows = await conn.fetch(
                "SELECT user_id::text AS uid, address FROM emails "
                "WHERE user_id = ANY($1::uuid[])",
                user_ids,
            )
            return {r["uid"]: r["address"] for r in rows}
        finally:
            await conn.close()
    except Exception:
        return {}


async def email_has_account(email: str) -> bool | None:
    """Whether an email is registered in Hanko.

    Returns None when it can't be determined (Hanko unreachable) so callers can
    degrade gracefully instead of blocking.
    """
    try:
        conn = await asyncpg.connect(settings.hanko_db_url)
        try:
            row = await conn.fetchval(
                "SELECT 1 FROM emails WHERE lower(address) = lower($1) LIMIT 1",
                email,
            )
            return row is not None
        finally:
            await conn.close()
    except Exception:
        return None
