"""
FastAPI admin authentication.

Provides dependency for requiring admin access based on email whitelist.

Usage:
    from hotosm_auth_fastapi import CurrentUser, AdminUser

    @router.get("/admin/users")
    async def list_users(admin: AdminUser):
        # Only users with email in ADMIN_EMAILS can access this
        return {"admin_email": admin.email}
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status

from hotosm_auth.config import AuthConfig
from hotosm_auth.models import HankoUser
from hotosm_auth_fastapi.dependencies import get_current_user, get_config
from hotosm_auth.logger import get_logger

logger = get_logger(__name__)


async def require_admin(
    user: HankoUser = Depends(get_current_user),
    config: AuthConfig = Depends(get_config),
) -> HankoUser:
    """Require admin access based on email whitelist.

    Validates that the current user's email is in the ADMIN_EMAILS list.

    Args:
        user: Currently authenticated user
        config: Auth configuration with admin_emails

    Returns:
        HankoUser: The authenticated admin user

    Raises:
        HTTPException: 403 if user is not an admin
    """
    admin_emails = config.admin_email_list

    if not admin_emails:
        logger.warning("ADMIN_EMAILS is not configured - admin access denied")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access not configured",
        )

    if not user.email:
        logger.warning(f"User {user.id} has no email - admin access denied")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access requires verified email",
        )

    if user.email.lower() not in admin_emails:
        logger.warning(f"User {user.email} is not an admin - access denied")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    logger.info(f"Admin access granted to {user.email}")
    return user


# Type alias for cleaner dependency injection
AdminUser = Annotated[HankoUser, Depends(require_admin)]
