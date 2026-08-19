"""SMTP helper for outbound emails."""

import logging
from email.message import EmailMessage

import aiosmtplib

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailNotConfiguredError(RuntimeError):
    """Raised when SMTP settings are missing."""


async def send_email(
    *,
    to: list[str],
    subject: str,
    text_body: str,
    html_body: str | None = None,
) -> None:
    """Send an email via SMTP.

    Raises EmailNotConfiguredError if SMTP settings are incomplete.
    """
    if not (settings.smtp_host and settings.smtp_from_address):
        raise EmailNotConfiguredError("SMTP host or from-address not configured")

    if not to:
        logger.warning("send_email called with empty recipient list, skipping")
        return

    message = EmailMessage()
    message["From"] = settings.smtp_from_address
    message["To"] = ", ".join(to)
    message["Subject"] = subject
    message.set_content(text_body)
    if html_body:
        message.add_alternative(html_body, subtype="html")

    send_kwargs: dict = {
        "hostname": settings.smtp_host,
        "port": settings.smtp_port,
        "start_tls": settings.smtp_starttls,
    }
    if settings.smtp_user and settings.smtp_password:
        send_kwargs["username"] = settings.smtp_user
        send_kwargs["password"] = settings.smtp_password

    await aiosmtplib.send(message, **send_kwargs)
