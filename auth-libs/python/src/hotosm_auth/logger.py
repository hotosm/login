"""
Logging configuration for hotosm-auth library.

Provides a simple, configurable logger that respects LOG_LEVEL environment variable.
"""

import logging
import os
import sys

# Logger name for the library
LOGGER_NAME = "hotosm_auth"

# Default log level (can be overridden via LOG_LEVEL env var)
DEFAULT_LOG_LEVEL = logging.WARNING


def get_logger(name: str = LOGGER_NAME) -> logging.Logger:
    """
    Get a configured logger for hotosm-auth.

    The log level can be controlled via the LOG_LEVEL environment variable:
        LOG_LEVEL=DEBUG   - Show all debug messages
        LOG_LEVEL=INFO    - Show info and above
        LOG_LEVEL=WARNING - Show warnings and errors only (default)
        LOG_LEVEL=ERROR   - Show errors only

    Usage:
        from hotosm_auth.logger import get_logger

        logger = get_logger(__name__)
        logger.debug("Detailed debug information")
        logger.info("General information")
        logger.warning("Warning message")
        logger.error("Error message")

    Args:
        name: Logger name (defaults to "hotosm_auth")

    Returns:
        logging.Logger: Configured logger instance
    """
    logger = logging.getLogger(name)

    # Only configure if not already configured (avoid duplicate handlers)
    if not logger.handlers:
        # Get log level from environment or use default
        log_level_str = os.getenv("LOG_LEVEL", "WARNING").upper()
        log_level = getattr(logging, log_level_str, DEFAULT_LOG_LEVEL)

        # Create console handler with formatting
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(log_level)

        # Create formatter
        formatter = logging.Formatter(
            fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)

        # Add handler to logger
        logger.addHandler(handler)
        logger.setLevel(log_level)

        # Don't propagate to root logger (avoid duplicate logs)
        logger.propagate = False

    return logger


# Default logger instance for convenience
logger = get_logger()


# ===================================================================
# Auth Event Logging
# ===================================================================
# Structured logs for monitoring authentication events.
# These logs use a consistent format that can be filtered with:
#   docker logs <container> | grep "[AUTH]"
# ===================================================================

# Dedicated logger for auth events (always INFO level for visibility)
_auth_event_logger = None


def get_auth_event_logger() -> logging.Logger:
    """Get logger specifically for auth events.

    This logger is always set to INFO level regardless of LOG_LEVEL
    to ensure auth events are always visible.
    """
    global _auth_event_logger

    if _auth_event_logger is None:
        _auth_event_logger = logging.getLogger("hotosm_auth.events")

        if not _auth_event_logger.handlers:
            handler = logging.StreamHandler(sys.stdout)
            handler.setLevel(logging.INFO)

            # Simple format for auth events
            formatter = logging.Formatter(
                fmt="%(asctime)s - %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S"
            )
            handler.setFormatter(formatter)

            _auth_event_logger.addHandler(handler)
            _auth_event_logger.setLevel(logging.INFO)
            _auth_event_logger.propagate = False

    return _auth_event_logger


def log_auth_event(
    event_type: str,
    app_name: str,
    hanko_id: str,
    email: str = None,
    app_user_id: str = None,
    **kwargs
) -> None:
    """Log a structured authentication event.

    Format:
        [AUTH] EVENT_TYPE app=<app> hanko_id=<id> email=<email> app_user_id=<id> ...

    Events:
        - LOGIN: User authenticated successfully
        - MAPPING_FOUND: Existing mapping used
        - MAPPING_CREATED: New mapping created

    Usage:
        log_auth_event("LOGIN", "fair", hanko_user.id, email=hanko_user.email)
        log_auth_event("MAPPING_CREATED", "drone-tm", hanko_id, app_user_id="12345")

    Args:
        event_type: Type of event (LOGIN, MAPPING_FOUND, MAPPING_CREATED)
        app_name: Application name (fair, drone-tm, oam, etc.)
        hanko_id: Hanko user UUID
        email: User email (optional)
        app_user_id: App-specific user ID (optional)
        **kwargs: Additional key-value pairs to log
    """
    # Build log message parts
    parts = [
        f"[AUTH] {event_type}",
        f"app={app_name}",
        f"hanko_id={hanko_id[:8]}..." if len(hanko_id) > 8 else f"hanko_id={hanko_id}",
    ]

    if email:
        parts.append(f"email={email}")

    if app_user_id:
        parts.append(f"app_user_id={app_user_id}")

    # Add any extra kwargs
    for key, value in kwargs.items():
        if value is not None:
            parts.append(f"{key}={value}")

    message = " ".join(parts)

    # Try loguru first (used by drone-tm, etc.), fallback to standard logging
    try:
        from loguru import logger as loguru_logger
        loguru_logger.info(message)
    except ImportError:
        auth_logger = get_auth_event_logger()
        auth_logger.info(message)
