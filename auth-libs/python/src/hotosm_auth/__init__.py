"""
hotosm-auth: HOTOSM SSO Authentication Library

This library provides authentication for HOTOSM applications using:
- Hanko v2.1.0 for base SSO (Google, GitHub, Email/Password)
- OpenStreetMap OAuth 2.0 for OSM authorization

Core Package Structure:
    - hotosm_auth: Core functionality (this package)
    - hotosm_auth_fastapi: FastAPI integration
    - hotosm_auth_django: Django integration

Quick Start (FastAPI):
    from hotosm_auth_fastapi import setup_auth, Auth

    app = FastAPI()
    setup_auth(app)

    @app.get("/me")
    async def me(auth: Auth):
        return {"user": auth.user.email}

Quick Start (Django):
    # settings.py
    MIDDLEWARE = ['hotosm_auth_django.HankoAuthMiddleware']

    # views.py
    from hotosm_auth_django import login_required

    @login_required
    def my_view(request):
        return JsonResponse({"email": request.hotosm.user.email})
"""

__version__ = "0.2.0"

# Core models and configuration
from hotosm_auth.models import HankoUser, OSMConnection, OSMScope
from hotosm_auth.config import AuthConfig
from hotosm_auth.exceptions import (
    AuthenticationError,
    TokenExpiredError,
    TokenInvalidError,
    CookieDecryptionError,
    OSMOAuthError,
)
from hotosm_auth.jwt_validator import JWTValidator
from hotosm_auth.crypto import CookieCrypto
from hotosm_auth.osm_oauth import OSMOAuthClient
from hotosm_auth.logger import get_logger, log_auth_event

# Admin schemas (used by both FastAPI and Django)
from hotosm_auth.schemas.admin import (
    MappingResponse,
    MappingListResponse,
    MappingCreate,
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
    # Admin schemas
    "MappingResponse",
    "MappingListResponse",
    "MappingCreate",
    "MappingUpdate",
]
