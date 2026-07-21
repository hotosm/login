"""Authorization helpers for platform-level roles.

Two platform roles exist:

* **Administrator** — configured via the ``ADMIN_EMAILS`` env var (email
  allowlist). Mirrors ``require_admin`` in ``api/routes/admin.py``.
* **Account Manager** — persisted in the ``account_managers`` table, assigned by
  an administrator. Administrators implicitly hold this role.

These are distinct from group member roles (owner/manager/member), which govern
a single group rather than the whole platform.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from hotosm_auth.models import HankoUser
from hotosm_auth_fastapi import get_current_user
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.database import get_db
from app.db.models import AccountManager

CurrentUser = Annotated[HankoUser, Depends(get_current_user)]
DB = Annotated[AsyncSession, Depends(get_db)]


def is_admin(user: HankoUser) -> bool:
    """Return True if the user's email is in the admin allowlist."""
    if not user.email:
        return False
    return user.email.lower() in settings.admin_email_list


async def is_account_manager(user: HankoUser, db: AsyncSession) -> bool:
    """Return True if the user is an account manager (admins are implicit)."""
    if is_admin(user):
        return True
    result = await db.execute(
        select(AccountManager.hanko_user_id).where(
            AccountManager.hanko_user_id == user.id
        )
    )
    return result.scalar_one_or_none() is not None


async def get_roles(user: HankoUser, db: AsyncSession) -> dict[str, bool]:
    """Resolve the platform roles of a user in a single call."""
    admin = is_admin(user)
    return {
        "is_admin": admin,
        # Admin implies account manager; avoid a DB hit when already admin.
        "is_account_manager": admin or await is_account_manager(user, db),
    }


async def require_account_manager(user: CurrentUser, db: DB) -> HankoUser:
    """Require the current user to be an account manager (or admin)."""
    if not await is_account_manager(user, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account manager access required",
        )
    return user


async def require_admin(user: CurrentUser) -> HankoUser:
    """Require the current user to be an administrator (env allowlist).

    Kept here (in addition to ``api/routes/admin.py``) so group-domain routers
    can depend on it without importing the admin proxy module.
    """
    if not settings.admin_email_list:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access not configured",
        )
    if not is_admin(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user


AccountManagerUser = Annotated[HankoUser, Depends(require_account_manager)]
AdminUser = Annotated[HankoUser, Depends(require_admin)]
