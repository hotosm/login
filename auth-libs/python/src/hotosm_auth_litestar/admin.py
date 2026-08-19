"""Litestar admin authentication helpers."""

from litestar.exceptions import HTTPException
from litestar.status_codes import HTTP_403_FORBIDDEN

from hotosm_auth.logger import get_logger
from hotosm_auth.models import HankoUser
from hotosm_auth_litestar.dependencies import get_config

logger = get_logger(__name__)

AdminUser = HankoUser


async def require_admin(current_user: HankoUser) -> HankoUser:
    """Require admin access based on email whitelist."""
    config = get_config()
    admin_emails = config.admin_email_list

    if not admin_emails:
        logger.warning("ADMIN_EMAILS is not configured - admin access denied")
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN,
            detail="Admin access not configured",
        )

    if not current_user.email:
        logger.warning(f"User {current_user.id} has no email - admin access denied")
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN,
            detail="Admin access requires verified email",
        )

    if current_user.email.lower() not in admin_emails:
        logger.warning(f"User {current_user.email} is not an admin - access denied")
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    logger.info(f"Admin access granted to {current_user.email}")
    return current_user
