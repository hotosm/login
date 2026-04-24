"""Configuration models and environment loading for HOTOSM auth."""

import os
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from hotosm_auth.logger import get_logger

logger = get_logger(__name__)
MIN_DOMAIN_PARTS = 2


def _load_dotenv_if_available() -> None:
    """Load .env from cwd when python-dotenv is installed."""
    try:
        import os as _os

        from dotenv import load_dotenv

        load_dotenv(dotenv_path=_os.path.join(_os.getcwd(), ".env"), verbose=False)
        load_dotenv(verbose=False)
    except ImportError:
        pass


def _get_required_env(var_name: str, hint: str) -> str:
    """Read required env var or raise ValueError with hint."""
    value = os.getenv(var_name)
    if value:
        return value
    raise ValueError(f"{var_name} environment variable is required. {hint}")


def _infer_cookie_domain(hanko_api_url: str, cookie_domain: str | None) -> str | None:
    """Return cookie domain from env or infer from HANKO_API_URL hostname."""
    if cookie_domain:
        return cookie_domain

    from urllib.parse import urlparse

    hostname = urlparse(hanko_api_url).hostname or "localhost"
    if hostname in ["localhost", "127.0.0.1"]:
        logger.info("COOKIE_DOMAIN not set, auto-detected: localhost")
        return "localhost"

    parts = hostname.split(".")
    if len(parts) >= MIN_DOMAIN_PARTS:
        inferred = f".{'.'.join(parts[-2:])}"
        logger.info(f"COOKIE_DOMAIN not set, auto-detected: {inferred}")
        return inferred

    logger.info("COOKIE_DOMAIN not set, using no domain restriction")
    return None


def _resolve_cookie_secure(hanko_api_url: str, cookie_secure_env: str | None) -> bool:
    """Resolve secure-cookie behavior from env or URL scheme."""
    if cookie_secure_env is not None:
        return cookie_secure_env.lower() == "true"

    detected = hanko_api_url.startswith("https://")
    logger.info(
        f"COOKIE_SECURE not set, auto-detected: {detected} (from {hanko_api_url})"
    )
    return detected


def _resolve_jwt_issuer() -> str:
    """Resolve JWT issuer env value with default to auto."""
    jwt_issuer_env = os.getenv("JWT_ISSUER")
    if jwt_issuer_env and jwt_issuer_env.strip():
        logger.info(f"JWT_ISSUER from env: {jwt_issuer_env}")
        return jwt_issuer_env
    logger.info("JWT_ISSUER not set, defaulting to 'auto'")
    return "auto"


class AuthConfig(BaseModel):
    model_config = ConfigDict(frozen=True)
    """Runtime configuration for hotosm-auth."""

    # Hanko configuration
    hanko_api_url: HttpUrl = Field(
        ...,
        description="Hanko API URL (e.g., https://login.hotosm.org)",
    )

    # Cookie configuration
    cookie_secret: str = Field(
        ...,
        min_length=32,
        description="Secret key for encrypting OSM cookies (min 32 bytes)",
    )
    cookie_domain: Optional[str] = Field(
        None,
        description="Domain for cookies (e.g., '.hotosm.org' for all subdomains)",
    )
    cookie_secure: bool = Field(
        True,
        description="Use secure cookies (HTTPS only). Set False for local dev.",
    )
    cookie_samesite: str = Field(
        "lax",
        description="SameSite cookie policy: 'lax', 'strict', or 'none'",
    )

    # OSM OAuth configuration
    osm_enabled: bool = Field(
        False,
        description="Enable OSM OAuth integration",
    )
    osm_client_id: Optional[str] = Field(
        None,
        description="OSM OAuth client ID (required if osm_enabled=True)",
    )
    osm_client_secret: Optional[str] = Field(
        None,
        description="OSM OAuth client secret (required if osm_enabled=True)",
    )
    osm_redirect_uri: Optional[str] = Field(
        None,
        description="OSM OAuth redirect URI (e.g., https://app.hotosm.org/auth/osm/callback)",
    )
    osm_scopes: list[str] = Field(
        default_factory=lambda: ["read_prefs"],
        description="Default OSM OAuth scopes to request",
    )
    osm_api_url: HttpUrl = Field(
        default="https://www.openstreetmap.org",
        description=(
            "OSM API base URL (use https://master.apis.dev.openstreetmap.org for dev)"
        ),
    )

    # JWT validation
    jwt_audience: Optional[str] = Field(
        None,
        description="Expected JWT audience claim (optional)",
    )
    jwt_issuer: Optional[str] = Field(
        "auto",
        description=(
            "Expected JWT issuer claim "
            "(optional, 'auto' defaults to hanko_api_url, None skips validation)"
        ),
    )

    # JWKS caching
    jwks_cache_ttl: int = Field(
        3600,
        description="JWKS cache TTL in seconds (default 1 hour)",
    )

    # Admin configuration
    admin_emails: str = Field(
        "",
        description="Comma-separated list of admin email addresses",
    )

    @property
    def admin_email_list(self) -> list[str]:
        """Parse admin_emails into a list of lowercase email addresses."""
        return [e.strip().lower() for e in self.admin_emails.split(",") if e.strip()]

    def model_post_init(self, __context) -> None:
        """Validate configuration after initialization."""
        # If OSM is enabled, require client credentials
        if self.osm_enabled:
            if not self.osm_client_id:
                raise ValueError("osm_client_id is required when osm_enabled=True")
            if not self.osm_client_secret:
                raise ValueError("osm_client_secret is required when osm_enabled=True")

            # Auto-generate osm_redirect_uri if not provided
            if not self.osm_redirect_uri:
                # Default pattern: {HANKO_API_URL}/auth/osm/callback
                auto_uri = f"{str(self.hanko_api_url).rstrip('/')}/auth/osm/callback"
                logger.info(f"OSM_REDIRECT_URI not set, auto-generating: {auto_uri}")
                logger.info(
                    "If this doesn't match your app's path, "
                    "set OSM_REDIRECT_URI explicitly."
                )
                object.__setattr__(self, "osm_redirect_uri", auto_uri)

        # Default JWT issuer to Hanko API URL if set to "auto"
        # Use object.__setattr__ because model is frozen
        if self.jwt_issuer == "auto":
            # Strip trailing slash from HttpUrl (Pydantic adds it automatically)
            issuer_url = str(self.hanko_api_url).rstrip("/")
            object.__setattr__(self, "jwt_issuer", issuer_url)
            logger.info(f"JWT issuer set to: {issuer_url} (from hanko_api_url)")
        elif self.jwt_issuer:
            logger.info(f"JWT issuer explicitly set to: {self.jwt_issuer}")
        else:
            logger.warning("JWT issuer validation is DISABLED (jwt_issuer=None)")
        # If None, issuer validation is skipped

    @classmethod
    def from_env(cls) -> "AuthConfig":
        """Build configuration from environment variables."""
        # Try to load .env file from current working directory
        try:
            import os as _os

            from dotenv import load_dotenv

            # Load from current directory and walk up parent directories
            load_dotenv(dotenv_path=_os.path.join(_os.getcwd(), ".env"), verbose=False)
            # Also try parent directories
            load_dotenv(verbose=False)
        except ImportError:
            # dotenv not installed, rely on environment variables being set
            pass

        # Required variables
        hanko_api_url = _get_required_env(
            "HANKO_API_URL",
            "Set it to your Hanko API URL (e.g., https://login.hotosm.org)",
        )
        cookie_secret = _get_required_env(
            "COOKIE_SECRET",
            "Generate one with: "
            'python -c "import secrets; print(secrets.token_urlsafe(32))"',
        )

        # Optional variables with smart defaults
        cookie_domain = os.getenv("COOKIE_DOMAIN")
        cookie_secure_env = os.getenv("COOKIE_SECURE")
        cookie_samesite = os.getenv("COOKIE_SAMESITE", "lax")

        cookie_domain = _infer_cookie_domain(hanko_api_url, cookie_domain)
        cookie_secure = _resolve_cookie_secure(hanko_api_url, cookie_secure_env)

        # JWT configuration
        jwt_audience = os.getenv("JWT_AUDIENCE") or None
        jwt_issuer = _resolve_jwt_issuer()

        # OSM configuration
        osm_client_id = os.getenv("OSM_CLIENT_ID")
        osm_client_secret = os.getenv("OSM_CLIENT_SECRET")
        osm_redirect_uri = os.getenv("OSM_REDIRECT_URI")
        osm_scopes_str = os.getenv("OSM_SCOPES", "read_prefs")
        osm_scopes = osm_scopes_str.split() if osm_scopes_str else ["read_prefs"]
        osm_api_url = os.getenv("OSM_API_URL", "https://www.openstreetmap.org")

        # Determine if OSM is enabled
        osm_enabled = bool(osm_client_id and osm_client_secret)

        # Admin configuration
        admin_emails = os.getenv("ADMIN_EMAILS", "")

        return cls(
            hanko_api_url=hanko_api_url,
            cookie_secret=cookie_secret,
            cookie_domain=cookie_domain,
            cookie_secure=cookie_secure,
            cookie_samesite=cookie_samesite,
            jwt_audience=jwt_audience,
            jwt_issuer=jwt_issuer,
            osm_enabled=osm_enabled,
            osm_client_id=osm_client_id if osm_enabled else None,
            osm_client_secret=osm_client_secret if osm_enabled else None,
            osm_redirect_uri=osm_redirect_uri if osm_enabled else None,
            osm_scopes=osm_scopes if osm_enabled else [],
            osm_api_url=osm_api_url,
            admin_emails=admin_emails,
        )
