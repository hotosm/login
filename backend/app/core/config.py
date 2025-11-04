from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Authentication
    hanko_api_url: str = "http://hanko:8000"
    cookie_secret: str
    cookie_domain: str | None = None

    # OSM OAuth
    osm_client_id: str | None = None
    osm_client_secret: str | None = None


settings = Settings()
