from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database
    database_url: str = "postgresql+asyncpg://hanko:hanko@hanko-db:5432/hanko"

    # Authentication
    hanko_api_url: str = "http://hanko:8000"
    cookie_secret: str
    cookie_domain: str | None = None

    # OSM OAuth
    osm_client_id: str | None = None
    osm_client_secret: str | None = None

    # Admin configuration
    admin_emails: str = ""  # comma-separated

    @property
    def admin_email_list(self) -> list[str]:
        """Parse admin_emails into a list of lowercase email addresses."""
        return [e.strip().lower() for e in self.admin_emails.split(",") if e.strip()]

    # App URLs for admin proxy
    portal_backend_url: str = "http://portal-backend:8000"
    dronetm_backend_url: str = "http://dronetm-backend:8000"
    fair_backend_url: str = "http://fair-backend:8000"
    oam_backend_url: str = "http://oam-backend:8080"
    umap_backend_url: str = "http://umap-app:8000"
    export_tool_backend_url: str = "http://export-tool-app:8000"
    chatmap_backend_url: str = "http://chatmap-api:8000"

    # Hanko database for admin lookups
    hanko_db_url: str = "postgresql://hanko:hanko@hanko-db:5432/hanko"

    @property
    def app_urls(self) -> dict[str, str]:
        """Get app URLs as a dictionary."""
        return {
            "portal": self.portal_backend_url,
            "drone-tm": self.dronetm_backend_url,
            "fair": self.fair_backend_url,
            "oam": self.oam_backend_url,
            "umap": self.umap_backend_url,
            "osm-export-tool": self.export_tool_backend_url,
            "chatmap": self.chatmap_backend_url,
        }


settings = Settings()
