"""Core HOTOSM authentication package shared by framework integrations."""

__version__ = "0.2.11"

# Core models and configuration
from hotosm_auth.config import AuthConfig
from hotosm_auth.crypto import CookieCrypto
from hotosm_auth.exceptions import (
    AuthenticationError,
    CookieDecryptionError,
    OSMOAuthError,
    TokenExpiredError,
    TokenInvalidError,
)
from hotosm_auth.jwt_validator import JWTValidator
from hotosm_auth.logger import get_logger, log_auth_event
from hotosm_auth.models import HankoUser, OSMConnection, OSMScope
from hotosm_auth.osm_oauth import OSMOAuthClient

# PAT resolver (used by both FastAPI and Django)
from hotosm_auth.remote_resolver import remote_pat_resolver

# Admin schemas (used by both FastAPI and Django)
from hotosm_auth.schemas.admin import (
    MappingCreate,
    MappingListResponse,
    MappingResponse,
    MappingUpdate,
)

__all__ = [
    # Version
    "__version__",
    # Models
    "HankoUser",
    "OSMConnection",
    "OSMScope",
    # Configuration
    "AuthConfig",
    # Exceptions
    "AuthenticationError",
    "TokenExpiredError",
    "TokenInvalidError",
    "CookieDecryptionError",
    "OSMOAuthError",
    # Core classes
    "JWTValidator",
    "CookieCrypto",
    "OSMOAuthClient",
    # Logging
    "get_logger",
    "log_auth_event",
    # PAT resolver
    "remote_pat_resolver",
    # Admin schemas
    "MappingResponse",
    "MappingListResponse",
    "MappingCreate",
    "MappingUpdate",
]
